# Liminals Compliance Manifest

Product: Sankey Studio
Public URL: To be configured

## Services

Supabase: YES — Postgres storage for the public chart gallery, plus Supabase Storage for static embed-image snapshots, plus a small write-only client-error log for basic error monitoring (no Supabase Auth, no other Supabase product in use)
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
Client error logs: YES — unhandled errors send their message, stack trace, page path, and browser user-agent string to a write-only Supabase table (no external monitoring service); this is intentionally the same, already-approved Supabase infrastructure rather than a new "External API," and carries no chart content or other user data

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
Accessibility review: DONE — computed WCAG AA contrast ratios for the theme's color pairs against their actual backgrounds; fixed three real failures (primary-button text 2.58:1 → 4.57:1, several de-emphasized sidebar captions 3.25–3.95:1 → 5.54:1, footer legal-links 2.67:1 → 4.57:1) and two missing keyboard-focus indicators (chart title/subtitle inputs, one Inspector select had `outline-none` with no visible replacement). The Sankey chart itself already exposes an accessible `role="img"` summary with node/link data. Not independently re-verified with a screen reader or on a live device.
Security review: DONE — `pnpm audit` found and fixed two high-severity CVEs in `xlsx` (client-side Excel parsing) by installing from SheetJS's own CDN, since the npm registry package has been stuck on an unpatched version for years; verified the exact parsing code path still works correctly on the new version. Supabase security/performance advisors reviewed (only the already-accepted, intentional `SECURITY DEFINER` warnings remain) and one real gap fixed (missing primary key on the rate-limiter's tracking table). No secrets or service-role keys found in the repository or its history.