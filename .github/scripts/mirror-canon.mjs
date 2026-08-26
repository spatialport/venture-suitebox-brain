#!/usr/bin/env node
/**
 * mirror-canon — syncs this brain repo's 10-canon/ into the Notion database
 * "06 Canon Mirror" (data source 1e39dc2f-0f75-4f3d-ad41-a697cfd5f170), so any
 * Cowork session can READ accepted canon without GitHub access.
 *
 * One-way mirror: GitHub -> Notion. The Notion DB is read-only by convention;
 * every run upserts by (Brain slug, Repo path) and archives rows whose file no
 * longer exists in the repo. Writes to the mirror never feed back into git.
 *
 * Env:
 *  - NOTION_TOKEN       (secret) integration token connected to the warehouse page
 *  - BRAIN_SLUG         derived by the workflow from the repo name
 *  - GITHUB_REPOSITORY  owner/repo (provided by Actions)
 *  - GITHUB_SHA         commit sha  (provided by Actions)
 */

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const SLUG = process.env.BRAIN_SLUG;
const REPO = process.env.GITHUB_REPOSITORY || "";
const SHA = (process.env.GITHUB_SHA || "").slice(0, 7);
const MIRROR_DS = "1e39dc2f-0f75-4f3d-ad41-a697cfd5f170";

if (!NOTION_TOKEN || !SLUG) {
  console.error("FATAL: NOTION_TOKEN and BRAIN_SLUG are required");
  process.exit(1);
}

const NOTION = "https://api.notion.com/v1";
const H = {
  Authorization: `Bearer ${NOTION_TOKEN}`,
  "Notion-Version": "2025-09-03",
  "Content-Type": "application/json",
};

async function nj(url, opts = {}, tries = 3) {
  let last;
  for (let i = 0; i < tries; i++) {
    const res = await fetch(url, { ...opts, headers: H });
    if (res.status === 429 || res.status >= 500) {
      last = new Error(`HTTP ${res.status}`);
      await new Promise(r => setTimeout(r, 1200 * (i + 1)));
      continue;
    }
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(`Notion ${res.status}: ${JSON.stringify(body).slice(0, 250)}`);
    return body;
  }
  throw last;
}

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p);
    else if (p.endsWith(".md")) yield p;
  }
}

const frontStatus = txt => (txt.match(/^status:\s*(\w+)/m) || [])[1];

// 1. Local canon files
if (!existsSync("10-canon")) {
  console.log("No 10-canon/ directory — nothing to mirror.");
  process.exit(0);
}
const files = [...walk("10-canon")];
console.log(`Mirroring ${files.length} canon file(s) for slug "${SLUG}"`);

// 2. Existing mirror rows for this slug
const existing = new Map(); // repoPath -> page
let cursor;
do {
  const body = await nj(`${NOTION}/data_sources/${MIRROR_DS}/query`, {
    method: "POST",
    body: JSON.stringify({
      filter: { property: "Brain slug", rich_text: { equals: SLUG } },
      ...(cursor ? { start_cursor: cursor } : {}),
      page_size: 100,
    }),
  });
  for (const page of body.results) {
    const rp = (page.properties["Repo path"]?.rich_text || []).map(t => t.plain_text).join("");
    if (rp) existing.set(rp, page);
  }
  cursor = body.has_more ? body.next_cursor : undefined;
} while (cursor);

const now = new Date().toISOString();
let created = 0, updated = 0, archived = 0, failed = 0;

const chunk = (s, n = 1900) => {
  const out = [];
  for (let i = 0; i < s.length; i += n) out.push(s.slice(i, i + n));
  return out.slice(0, 50); // Notion caps ~100 blocks/request; stay far below
};

for (const file of files) {
  const content = readFileSync(file, "utf8");
  const status = ["accepted", "proposed"].includes(frontStatus(content)) ? frontStatus(content) : "unknown";
  const name = file.split("/").pop().replace(/\.md$/, "");
  const properties = {
    Name: { title: [{ type: "text", text: { content: name.slice(0, 200) } }] },
    "Brain slug": { rich_text: [{ type: "text", text: { content: SLUG } }] },
    "Repo path": { rich_text: [{ type: "text", text: { content: file } }] },
    "Record status": { select: { name: status } },
    Repo: { rich_text: [{ type: "text", text: { content: REPO } }] },
    Commit: { rich_text: [{ type: "text", text: { content: SHA } }] },
    "Synced at": { date: { start: now } },
  };
  const children = chunk(content).map(c => ({
    object: "block",
    type: "code",
    code: { language: "markdown", rich_text: [{ type: "text", text: { content: c } }] },
  }));

  try {
    const prev = existing.get(file);
    if (prev) {
      await nj(`${NOTION}/pages/${prev.id}`, { method: "PATCH", body: JSON.stringify({ properties }) });
      // replace body: archive old blocks, append fresh ones
      const kids = await nj(`${NOTION}/blocks/${prev.id}/children?page_size=100`);
      for (const b of kids.results) {
        await nj(`${NOTION}/blocks/${b.id}`, { method: "DELETE" }).catch(() => {});
      }
      await nj(`${NOTION}/blocks/${prev.id}/children`, { method: "PATCH", body: JSON.stringify({ children }) });
      existing.delete(file);
      updated++;
    } else {
      await nj(`${NOTION}/pages`, {
        method: "POST",
        body: JSON.stringify({
          parent: { type: "data_source_id", data_source_id: MIRROR_DS },
          properties,
          children,
        }),
      });
      created++;
    }
  } catch (e) {
    failed++;
    console.error(`✗ ${file}: ${e.message}`);
  }
}

// 3. Files deleted from the repo -> archive their mirror rows
for (const [path, page] of existing) {
  try {
    await nj(`${NOTION}/pages/${page.id}`, { method: "PATCH", body: JSON.stringify({ archived: true }) });
    archived++;
  } catch (e) {
    failed++;
    console.error(`✗ archive ${path}: ${e.message}`);
  }
}

console.log(`Mirror done: created=${created} updated=${updated} archived=${archived} failed=${failed}`);
if (failed > 0) process.exit(1);
