# Sankey Studio

Sankey Studio turns ordinary spreadsheet data into polished Sankey diagrams entirely in the browser.

## Run & Operate

- `pnpm --filter @workspace/sankey-studio run dev` — run the web app through the managed preview workflow
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + TypeScript + Vite
- Visualization: client-side SVG Sankey renderer
- Imports: browser-side CSV, JSON, XLSX and XLS parsing
- Output: client-side PNG, SVG and animated GIF export

## Where things live

- `artifacts/sankey-studio/src/App.tsx` — editor shell and workflow state
- `artifacts/sankey-studio/src/components/` — editor panels and visualization UI
- `artifacts/sankey-studio/src/data/` — example templates and data normalization
- `artifacts/sankey-studio/src/sankey/` — Sankey model, layout and rendering
- `artifacts/sankey-studio/src/export/` — canvas export helpers
- `artifacts/sankey-studio/src/index.css` — product theme and responsive styles

## Architecture decisions

- Uploaded files and pasted data are parsed locally and never sent to a server.
- The editor keeps parsing, normalization, model generation, layout, rendering and export separate; animated GIF frames are rendered locally from the same SVG model.
- Clerk authentication is optional: the editor remains public, while sign-in and account creation use Clerk's client components and session handling.
- There is no backend API service; the browser talks directly to Clerk's Frontend API when a publishable key is configured.
- Exporting a chart adds it to a **public, shared gallery** (Supabase Postgres) that every visitor can browse and reuse as a starting point — this is a deliberate, scoped exception to the "no databases" rule below. Access is anonymous: no login is required to add or browse, and only the browser that created an item can delete it (a random per-item secret kept in that browser's localStorage; enforced by `SECURITY DEFINER` Postgres functions, since there's no auth to hang row-level security off). No moderation, reporting, or rate-limiting exists beyond a per-item size cap.
- Sharing a gallery item's permalink also offers a "Copy embed code" `<img>` snippet, backed by a **static SVG snapshot taken once at save time** and served from Supabase Storage's own CDN — deliberately not regenerated per view. This means an embed in a high-traffic page never touches the database or the app itself, however popular it gets; it also means the embedded image won't change if the source chart is edited later, which is the correct behavior for something already published elsewhere.
- Example datasets are editable starting points, not locked formats.

## Product

Users can load a sample or import spreadsheet-style data, map columns or hierarchy levels, tune the visual treatment and canvas ratio, then export the finished diagram as PNG, SVG or animated GIF with configurable frame size, reveal speed and hold durations.

## User preferences

- Keep the core experience focused on spreadsheet → Sankey → publishable visual.
- Do not add AI, payments, collaboration or MP4/video timeline editing to the MVP. Supabase is the one deliberate exception to "no databases," added specifically to back the public gallery — don't expand its use beyond that without the same explicit sign-off.

## Gotchas

- The web artifact uses the managed workflow so PORT and BASE_PATH are injected automatically.
- Browser-only parsing and exporting remain local.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
