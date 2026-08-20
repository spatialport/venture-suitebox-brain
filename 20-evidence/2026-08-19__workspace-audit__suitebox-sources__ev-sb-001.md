---
id: ev-sb-001
client_id: suitebox
record_type: evidence
service_path: company
status: proposed
owner: alex-bellesia
authority: alex-bellesia
ip_owner: spatial-port
access_scope: internal
sensitivity: confidential
source_ref: workspace-audit://2026-08-19
schema_version: 1.1.0
created_at: 2026-08-19
updated_at: 2026-08-19
---
# Workspace Audit — Suitebox Sources

**Source:** case-insensitive search for "suitebox" across
`/Users/alexbellesia/Projects/` (excluding node_modules/brains/.git build outputs),
`/Users/alexbellesia/Documents/Claude/Projects/` and `/Users/alexbellesia/Downloads/`,
performed 2026-08-19 (workspace date 2026-08-20). Actors: automated audit for brain
creation. Redaction: no secrets encountered; none copied.

## Primary source: the project folder

`/Users/alexbellesia/Projects/SUITEBOX/` — the venture's full working folder, with
its own index at `SUITEBOX_Second_Brain_Index.md`. Key documents read for canon:

- `SUITEBOX_Second_Brain_Index.md` — content map of the whole project
- `SUITEBOX_Note_Meeting_e_Valutazione.md` — meeting notes + critical assessment (order flow, fiscal dilemma, open decisions)
- `SUITEBOX_Piano_Operativo_MetaSettembre.md` — go-live plan (~15 Sep), fiscal confirmation "host = venditore / vendita a distanza", critical path, owners
- `SUITEBOX_Termsheet_Soci.md` — partner term sheet (4 partners, ExistingCo, NewCo SRL startup innovativa, work-for-equity, split, vesting, IP)
- `SUITEBOX_Brand.md` — brand reference (logo Unbounded, Inter, Daylight v2 palette, tone)
- `elaborati-sito/SUITEBOX_Strategia_Posizionamento.md` — positioning, moats, pillars, claims, proof points
- `elaborati-sito/SUITEBOX_Buyer_Personas.md` — PM/host/cleaning-company personas, guest beneficiary
- `elaborati-sito/SUITEBOX_Offerta_Pricing.md` — pricing (€190/€490/€760), fees, discounts, payback, revenue share, assortment
- `elaborati/investitori/SUITEBOX_OnePager_Investitori.md` — market, projections, €1M SAFE ask

Present but not read line-by-line (skimmed via index; binaries skipped):
business plan (`SUITEBOX_Business_Plan.docx`, `..._Modello FINAL.xlsx`), BP critique
and change plan, fiscal report, Fratelli Desideri call recap (2026-07-24), piano
lavoro/operativo, marketing/vendita elaborati (~20 md), production site `sito/`
(14 HTML pages + img/video), `Kit_Partner_Procacciatori/`, dashboards
(Hub/Cockpit/DataRoom HTML), pitch deck (`SUITEBOX_Pitch_Deck.html`,
`MIILOO _ SUITEBOX V4.pptx`), logo/photo assets, deploy scripts
(`deploy-suitebox-it.sh`, `deploy-aws.sh`, `DEPLOY.md`).

## Secondary sources

- `/Users/alexbellesia/Projects/NXTO-SPATIALPORT/src/data/projects.ts` — slug `suitebox`, "Suitebox — Venture", kind client, category "Venture building", status **paused**, phase "Deck + sviluppo" 2025-09-01 → 2026-03-31 (done), vaultNote `30-PROGETTI/suitebox.md`. No suitebox rows in `finance.ts` or `content.ts` (checked).
- `/Users/alexbellesia/Projects/NXTO-SPATIALPORT/SPATIALPORT-OS/30-PROGETTI/suitebox.md` — vault note: "in pausa", deck+sviluppo completati, "decidere se/quando riattivare", monthly-retro review criterion.
- `/Users/alexbellesia/Projects/brains/spatialport-agency-brain/10-company-canon/company-profile.md` — lists "Suitebox — Venture … Venture building (deck + sviluppo) … paused". (Read-only; other brain not touched.)
- `/Users/alexbellesia/Projects/SITO SPATIALPORT/Investor Update - June 2026.md` (+ .html, follow-up) — describes SuiteBox as a 0→1 venture: Spatial Port led product concept, industrial design, brand, host portal and app, photorealistic 3D, go-to-market; "opening the commercialization phase".
- `/Users/alexbellesia/Projects/SITO SPATIALPORT/spatial-port-v2/` — public case-study page `work/suitebox` (site source + build output).
- `/Users/alexbellesia/Downloads/deck.html` — single match in Downloads (a deck referencing suitebox; not a distinct source of truth).
- `/Users/alexbellesia/Documents/Claude/Projects/` — search timed out on this large tree; no suitebox-named files found via filename glob. Re-run targeted search if a source is suspected there.

## Concise factual summary

Abundant material exists (100+ files): full brand system, production site, partner
kit, investor pack, business plan, partner term sheet and operating plans. The
venture is a designer smart vending machine for short-term rentals. NXTO marks it
paused (phase ended 2026-03), yet the folder contains active work dated June–August
2026 (brand v2, site strategy, fiscal confirmation, mid-September go-live plan).

## Direct implications

Canon can be filled richly but everything stays `proposed`; the paused-vs-active
tension and the ExistingCo/NewCo IP structure need Alex's ruling.

## Candidate tasks (propose to NXTO, not tracked here)

Reactivation decision · reconcile NXTO status with the Sept go-live plan · register
produced deliverables · confirm preorders and partner states.

## Candidate decisions

Formally log the fiscal model decision · IP/NewCo structure · interim GM/tech owner.

## Candidate canon

Already drafted in `10-canon/*` from this audit (all `status: proposed`).
