# Liminals Compliance Manifest

Product: Sankey Studio
Public URL: To be configured

## Services

Supabase: YES — Postgres storage for the public chart gallery, plus Supabase Storage for static embed-image snapshots (no Supabase Auth, no other Supabase product in use)
Supabase Auth: NO — identity for signed-in users still comes from Clerk; Supabase's Third-Party Auth feature lets Postgres verify Clerk's session tokens without using Supabase's own auth system
Umami: NO
Stripe: NO
AI provider: NO
External APIs: NO

## Data

Personal data: NO
User uploads: YES — processed ephemerally in the browser
Public user content: YES — exported charts (data, styling, optional embedded images) are stored in a shared Postgres database and publicly visible/reusable by anyone; not pre-moderated, capped per-item at 2MB, and rate-limited to 40 database writes per 5 minutes per IP (export, vote, delete, report combined). Any visitor can report a chart for manual review (recorded server-side, not auto-hidden — an anonymous report count is too easy to game into censoring legitimate content). Signed-in users (Clerk) can opt a chart out of this into a private row instead, scoped by a Postgres-verified Clerk identity and never exposed to the public gallery, its view, or its CDN embed snapshots.
Marketing email: NO
Targeted at minors: NO
Browser-persisted chart data: YES — a per-item secret is kept in the creator's browser so only they can delete that item from the public gallery later

## Commerce

Paid functionality: NO — explicitly outside the MVP boundary
B2C payments: NO
One-time payments: NO
Subscriptions: NO

## Compliance

Analytics consent: NOT REQUIRED
Privacy Policy: DRAFTED — live at /privacy, contact marco@liminals.it; pending a legal review before relying on it for anything beyond MVP
Cookie & Tracking Policy: NOT REQUIRED
Terms: DRAFTED — live at /terms, contact marco@liminals.it; no governing-law/jurisdiction clause has been chosen yet
Payment terms: NOT REQUIRED
Data retention: DEFINED — public gallery entries persist indefinitely in the shared database unless deleted by their creator
Data deletion: DEFINED — a gallery entry can be deleted by the browser that created it (a locally-held per-item secret) or, if created while signed in, by that verified identity from any device; reported content is reviewed manually by the project owner directly in Supabase, since there is no moderation queue/admin UI
Accessibility review: TO REVIEW
Security review: TO REVIEW