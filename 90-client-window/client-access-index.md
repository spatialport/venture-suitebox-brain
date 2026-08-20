---
id: suitebox-client-access-index
client_id: suitebox
record_type: policy
service_path: company
status: accepted
owner: alex-bellesia
authority: alex-bellesia
ip_owner: spatial-port
access_scope: internal
sensitivity: restricted
source_ref: policy://client-window
schema_version: 1.1.0
created_at: 2026-08-19
updated_at: 2026-08-19
---
# Client Access Index — INERT

Suitebox is a Spatial Port internal venture. There is no external client, so the
client window is **inert by design**: `client_window_enabled: false` in the manifest,
permanently. No record in this brain should ever carry `access_scope: client`.

This file is kept for structural parity with client brains. If the venture ever
takes on external partners with contractual access rights, reopening the window
requires an explicit decision by Alex plus passing denial tests — not an edit here.
