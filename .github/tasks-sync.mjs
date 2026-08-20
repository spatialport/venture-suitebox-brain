#!/usr/bin/env node
// tasks-sync — rigenera 50-tasks/tasks.md dalla dashboard NXTO (fonte di verita').
// Gira come GitHub Action schedulata DENTRO ogni brain repo (vedi tasks-sync.yml).
// Env richieste: NXTO_API, NXTO_KEY (secrets del repo). Tenant dal nome repo.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { basename } from "node:path";

const API = process.env.NXTO_API, KEY = process.env.NXTO_KEY;
if (!API || !KEY) { console.error("x NXTO_API/NXTO_KEY mancanti"); process.exit(1); }

const repo = (process.env.GITHUB_REPOSITORY || "").split("/").pop() || basename(process.cwd());
const m = repo.match(/^(?:client|venture)-(.+)-brain$/);
if (!m) { console.error(`x tenant non deducibile da "${repo}"`); process.exit(1); }
const client = m[1];

const r = await fetch(`${API}/brain/tasks?client_id=${encodeURIComponent(client)}`, { headers: { "x-api-key": KEY } });
if (!r.ok) { console.error(`x NXTO HTTP ${r.status}`); process.exit(1); }
const { items = [] } = await r.json();

const rows = items
  .sort((a, b) => String(a.status).localeCompare(String(b.status)))
  .map((t) => `| ${t.task_id} | ${t.service_path} | ${String(t.title).replaceAll("|", "/")} | ${t.status} | ${t.owner} | ${t.reviewer_type} | ${t.due_at || ""} | dashboard://${client}/tasks/${t.task_id} |`)
  .join("\n");

const today = new Date().toISOString();
const md = `---
id: ${client}-tasks-view
client_id: ${client}
record_type: task_view
service_path: company
status: generated
owner: dashboard-sync
authority: dashboard
ip_owner: spatial-port
access_scope: internal
sensitivity: confidential
source_ref: dashboard://${client}
schema_version: 1.1.0
created_at: 2026-08-19
updated_at: ${today}
---
# Tasks (generated view)

Do not manually edit task state here. The next synchronization overwrites this page.
Source of truth: NXTO dashboard (os.spatial-port.io).

| Task ID | Service path | Task | Status | Owner | Reviewer | Due | Dashboard |
|---|---|---|---|---|---|---|---|
${rows || "| _nessun task_ | | | | | | | |"}
`;

const path = "50-tasks/tasks.md";
const prev = existsSync(path) ? readFileSync(path, "utf8") : "";
// confronto senza il timestamp per evitare commit vuoti ogni ora
const strip = (s) => s.replace(/^updated_at: .*$/m, "");
if (strip(prev) === strip(md)) { console.log("tasks-sync: nessuna variazione"); process.exit(0); }
writeFileSync(path, md);
console.log(`tasks-sync: ${items.length} task scritti per ${client}`);
