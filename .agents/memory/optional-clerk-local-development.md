---
name: Optional Clerk local development
description: How the Sankey Studio behaves when Clerk configuration is absent locally.
---

The Sankey editor must remain public when no client Clerk publishable key is configured locally; authentication routes and controls are enabled only when the configured key resolves successfully. Production keeps the existing Clerk provider and proxy wiring.

**Why:** The core editor is browser-only and does not require an account, while forcing Clerk during local development makes unrelated Sankey work depend on production auth configuration.

**How to apply:** Keep the authenticated and keyless shells separate. Do not render Clerk context consumers such as `Show`, `UserButton`, `SignIn`, or `SignUp` in the keyless path, and preserve the existing provider props and routes in the configured path.