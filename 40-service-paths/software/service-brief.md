---
id: suitebox-brief-software
client_id: suitebox
record_type: brief
service_path: software
status: proposed
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
# Software Service Brief

## Business objective

Enable in-room sales end-to-end: guest scans QR on the box → host's product list →
in-app payment → remote drawer unlock → receipt. Plus host portal (listino, sales
history, payouts, refill alerts) and hardware checkout on the site.

## Audience and context

Hosts with P.IVA and property managers (buyers); guests (end users of the purchase
web app). Fiscal frame confirmed by the commercialista: **host = seller, distance
selling** — no on-board payment hardware; payment happens only in app.

## Accepted constraints

- Stripe Connect with host as merchant of record; Suitebox commission via `application_fee`.
- Box connectivity (SIM/4G vs host Wi-Fi) and unlock firmware↔backend integration are
  the critical path; one complete end-to-end box before replication.
- MVP scope only (order intake, unlock, receipt, stock decrement, minimal host portal);
  warehouse/staff management deferred.

## Deliverables

Guest web app · Stripe Connect setup · host onboarding (KYC) · receipts + registro
corrispettivi · host portal (minimum) · site hardware checkout (today simulated).

## Definition of done

A real pilot apartment completes purchases end-to-end (payment → unlock → receipt)
reliably. (Was targeted for ~15 September per the operating plan; venture is paused.)

## Review rule

`reviewer_type: internal` — Alex. No client gate exists for this venture.
