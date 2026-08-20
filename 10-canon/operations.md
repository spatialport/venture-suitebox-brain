---
id: suitebox-canon-operations
client_id: suitebox
record_type: knowledge
service_path: company
status: accepted
owner: alex-bellesia
authority: alex-bellesia
ip_owner: spatial-port
access_scope: internal
sensitivity: confidential
source_ref: file:///Users/alexbellesia/Projects/SUITEBOX/SUITEBOX_Piano_Operativo_MetaSettembre.md
schema_version: 1.1.0
created_at: 2026-08-19
updated_at: 2026-08-19
---
# Operations

Purpose: How the venture actually works — supply, logistics, order flow, fiscal
frame, constraints.

## Accepted knowledge

None accepted yet. Proposed below.

## Proposed knowledge

**Fiscal frame (the decision that unblocked everything).** Confirmed by the
commercialista: **host = seller**, transactions treated as **distance selling**
(vendita a distanza), not vending machine. Consequences: no payment hardware on the
box (payment only in app), receipts and registro corrispettivi under host identity,
Stripe Connect with host as merchant of record and Suitebox commission via
`application_fee`. An AdE interpello was recommended in parallel (optional).
This superseded the earlier open dilemma "Glovo model vs card debit" in the meeting
notes.

**Supply and logistics.** Hardware supplier: **Boxotto** — 400 units ordered/in
arrival · storage at **Varedo** · assembly by Luca (single assembler = key-person
risk; capacity in pieces/week never measured, and it underpins delivery promises).
Delivery promises: +15 days with stock, +45 without; "urgency" orders up to 10
pieces; order auto-approval up to 10 pieces, manual above.

**Order flow (design).** Agent presents A4 (physical+PDF) with QR and agent code →
customer form + sales conditions + payment → total and delivery estimate shown →
approval → mail to logistics → order confirmation → host portal login. Agent
commissions: agent invoices by month-end, paid by the 15th of the following month
(requires agents to have P.IVA).

**Critical path at pause time (mid-Sept plan).** Box connectivity (SIM 4G vs host
Wi-Fi) · unlock firmware↔backend · guest web app · Stripe Connect · receipts/
registro · host onboarding (KYC, P.IVA) · one complete end-to-end box by end of
August, then a real-apartment pilot. Main risks listed: box↔software integration,
connectivity, Stripe KYC lead times, assembly capacity, dispensing reliability.

**Customer eligibility.** Hosts with P.IVA or cleaning companies only; private
individuals excluded (VAT).

**Known open operational gaps (from sources).** Sales contract (host↔guest
conditions incl. food-related withdrawal exceptions, GDPR) not done · admin order
dashboard owner unresolved · refill process semi-manual at first · warranty/returns
and insolvency handling not covered.

## Open questions

- Current state of the 400 units, Varedo stock, and any assembled/installed boxes.
- Did the end-to-end box and the apartment pilot ever happen?
- Assembly capacity (pieces/week) — still unmeasured?
- Sales contract and GDPR pack — drafted after the plan or still missing?
