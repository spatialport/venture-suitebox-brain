#!/usr/bin/env node
// brain-validate — CI gate for Spatial Port brain repos (internal-setup.md §6).
// Zero dependencies. Node 20+. Exit 1 on any violation.
//
// Checks (numbering follows internal-setup.md §6):
//  1  required frontmatter (14 fields) on every record file
//  2  client_id matches the repository tenant
//  3  access_scope: client requires status: accepted
//  4  controlled vocabularies
//  5  secret patterns
//  6  duplicate ids
//  7  evidence filename convention
//  8  accepted records modified without supersession link   (diff mode only)
//  9  50-tasks/ touched by a human PR                        (diff mode only)
// 10  raw-content heuristic in 20-evidence/
//
// Diff mode: set BASE_REF (e.g. origin/main) to enable checks 8-9 on changed
// files. The task-sync machine identity sets ALLOW_TASKS_SYNC=1 to bypass 9.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { execSync } from "node:child_process";
import { basename, join, relative } from "node:path";

const ROOT = process.cwd();
const repoName = basename(ROOT);

// Tenant from repo name (internal-setup.md §2.3 topology)
function tenantOf(name) {
  const m = name.match(/^client-(.+)-brain$/);
  if (m) return m[1];
  if (name === "spatialport-agency-brain") return "spatial-port";
  const v = name.match(/^venture-(.+)-brain$/);
  if (v) return v[1];
  return null;
}
const TENANT = process.env.TENANT || tenantOf(repoName);
if (!TENANT) { console.error(`brain-validate: cannot infer tenant from repo name "${repoName}" (set TENANT env)`); process.exit(2); }

const REQUIRED = ["id","client_id","record_type","service_path","status","owner","authority","ip_owner","access_scope","sensitivity","source_ref","schema_version","created_at","updated_at"];
const VOCAB = {
  record_type: ["evidence","knowledge","decision","brief","approval","performance","deliverable","task_view","policy"],
  service_path: ["branding","content","paid-media","landing-pages","local-seo","crm","software","company"],
  access_scope: ["internal","client","provider","public"],
  sensitivity: ["public","internal","confidential","restricted"],
  status: ["proposed","accepted","rejected","superseded","generated"],
  ip_owner: ["client","spatial-port","videogo", TENANT],
};
const DATE_RE = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?(\.\d+)?Z?)?$/; // bare date or ISO (spec README rule)
const EVIDENCE_FILE_RE = /^\d{4}-\d{2}-\d{2}__[a-z0-9-]+__[a-z0-9-]+__[a-z0-9-]+\.md$/;
const SECRET_PATTERNS = [
  [/AKIA[0-9A-Z]{16}/, "AWS access key"],
  [/(ghp|gho|ghu|ghs)_[A-Za-z0-9]{30,}/, "GitHub token"],
  [/github_pat_[A-Za-z0-9_]{20,}/, "GitHub fine-grained token"],
  [/-----BEGIN [A-Z ]*PRIVATE KEY/, "private key"],
  [/X-Amz-Signature=/, "long-lived signed URL"],
  [/eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/, "JWT"],
  [/\b(API_KEY|SECRET_KEY|ACCESS_TOKEN|CLIENT_SECRET|AWS_SECRET)[\s]*[:=][\s]*['"`]?[A-Za-z0-9_\-\/+]{12,}/, "credential assignment"],
];
const PASSWORD_RE = /\bpassword\s*[:=]\s*[^\s`*]{6,}/i; // scanned after stripping reference URIs

const errors = [];
const err = (f, c, msg) => errors.push(`  [check ${c}] ${f}: ${msg}`);

// ── file walk ───────────────────────────────────────────────
function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    if (e === ".git" || e === ".github" || e === ".obsidian" || e === "node_modules") continue;
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (e.endsWith(".md")) out.push(p);
  }
  return out;
}
const files = walk(ROOT).map((p) => relative(ROOT, p));

// ── frontmatter parser (flat YAML) ──────────────────────────
function frontmatter(text) {
  if (!text.startsWith("---")) return null;
  const end = text.indexOf("\n---", 3);
  if (end < 0) return null;
  const fm = {};
  for (const line of text.slice(4, end).split("\n")) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*):\s*(.*)$/);
    if (m) fm[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
  }
  return fm;
}

// A "record file" = any .md inside a numbered dir (00-, 10-, …) except README.md
// and except the client manifest, which follows its own schema (client-manifest-schema.md).
const isRecord = (f) =>
  /(^|\/)\d{2}-[^/]+\//.test(f) &&
  basename(f).toLowerCase() !== "readme.md" &&
  !/(^|\/)00-manifest\//.test(f);

const seenIds = new Map();
for (const f of files) {
  const text = readFileSync(join(ROOT, f), "utf8");
  const fm = frontmatter(text);

  // 5 — secrets: every file, always
  const scanText = text.replaceAll(/password-manager:\/\/[^\s`)]*/g, "");
  for (const [re, label] of SECRET_PATTERNS) if (re.test(text)) err(f, 5, `possible secret: ${label}`);
  if (PASSWORD_RE.test(scanText)) err(f, 5, "possible plaintext password");

  if (isRecord(f)) {
    if (!fm) { err(f, 1, "record file has no YAML frontmatter"); continue; }
    for (const k of REQUIRED) if (!fm[k]) err(f, 1, `missing frontmatter field "${k}"`);
    if (fm.client_id && fm.client_id !== TENANT) err(f, 2, `client_id "${fm.client_id}" != tenant "${TENANT}"`);
    if (fm.access_scope === "client" && fm.status !== "accepted") err(f, 3, "access_scope: client requires status: accepted");
    for (const [k, allowed] of Object.entries(VOCAB))
      if (fm[k] && !allowed.includes(fm[k])) err(f, 4, `${k} "${fm[k]}" outside controlled vocabulary`);
    for (const k of ["created_at","updated_at"])
      if (fm[k] && !DATE_RE.test(fm[k])) err(f, 4, `${k} "${fm[k]}" not a bare date or ISO-8601`);
    if (fm.id) {
      if (seenIds.has(fm.id)) err(f, 6, `duplicate id "${fm.id}" (also in ${seenIds.get(fm.id)})`);
      else seenIds.set(fm.id, f);
    }
    // 7 — evidence filename
    if (/(^|\/)20-evidence\//.test(f) && !EVIDENCE_FILE_RE.test(basename(f)))
      err(f, 7, "evidence filename must be YYYY-MM-DD__source__topic__id.md");
    // 10 — raw-content heuristic in evidence
    if (/(^|\/)20-evidence\//.test(f)) {
      const lines = text.split("\n");
      const headers = lines.filter((l) => /^(From|To|Subject|Cc):\s/.test(l)).length;
      const speakers = lines.filter((l) => /^[A-Z][A-Za-z .]{1,24}:\s\S/.test(l)).length;
      if (headers >= 2) err(f, 10, "looks like raw email (From/To/Subject headers)");
      if (speakers > 12 && speakers / lines.length > 0.3) err(f, 10, "looks like a raw transcript (speaker-turn density)");
    }
  }
}

// ── diff-mode checks (8, 9) ─────────────────────────────────
const BASE = process.env.BASE_REF;
if (BASE) {
  let changed = [];
  try {
    changed = execSync(`git diff --name-only ${BASE}...HEAD -- '*.md'`, { cwd: ROOT }).toString().trim().split("\n").filter(Boolean);
  } catch { /* base unavailable: skip diff checks */ }
  for (const f of changed) {
    if (/(^|\/)50-tasks\//.test(f) && process.env.ALLOW_TASKS_SYNC !== "1")
      err(f, 9, "50-tasks/ is a generated view — task state lives in NXTO (hard rule two)");
    // 8 — accepted modified without supersession
    try {
      const old = execSync(`git show ${BASE}:"${f}"`, { cwd: ROOT }).toString();
      const oldFm = frontmatter(old);
      if (oldFm && oldFm.status === "accepted") {
        const now = readFileSync(join(ROOT, f), "utf8");
        const newFm = frontmatter(now) || {};
        const linked = newFm.superseded_by || newFm.supersedes || /superseded_by:|supersedes:/.test(now);
        if (now !== old && !linked && newFm.status === "accepted")
          err(f, 8, "accepted record modified in place — write a superseding record instead");
      }
    } catch { /* new file: fine */ }
  }
}

if (errors.length) {
  console.error(`brain-validate FAILED — ${errors.length} violation(s) in ${repoName} (tenant: ${TENANT})\n`);
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`brain-validate OK — ${files.length} files, tenant ${TENANT}`);
