---
name: Cross-platform workspace setup
description: Rules for keeping the pnpm monorepo usable on Replit/Linux and local Windows clones.
---

Use Node-based runners for repository lifecycle tasks that invoke pnpm, selecting `pnpm.cmd` on Windows and `pnpm` elsewhere. Keep Replit-provided environment variables authoritative, but give local development safe defaults when those variables are absent.

**Why:** Shell syntax and Linux-only native-package exclusions made fresh Windows clones fail before the application could start. pnpm already resolves optional native dependencies for the current platform.

**How to apply:** Do not add shell-specific package scripts or suppress platform-specific optional dependencies. Keep only trusted, genuinely required packages in `onlyBuiltDependencies`, and pin the package manager with the root `packageManager` field.