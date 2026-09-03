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
- Exported chart snapshots are stored in browser localStorage only, with stable chart IDs, optional image data, and per-entry deletion.
- The editor keeps parsing, normalization, model generation, layout, rendering and export separate; animated GIF frames are rendered locally from the same SVG model.
- Clerk authentication is optional: the editor remains public, while sign-in and account creation use Clerk's client components and session handling.
- The API service includes Clerk's production Frontend API proxy, but no application routes require authentication yet.
- Example datasets are editable starting points, not locked formats.

## Product

Users can load a sample or import spreadsheet-style data, map columns or hierarchy levels, tune the visual treatment and canvas ratio, then export the finished diagram as PNG, SVG or animated GIF with configurable reveal and hold durations.

## User preferences

- Keep the core experience focused on spreadsheet → Sankey → publishable visual.
- Do not add AI, databases, payments, cloud storage, collaboration or MP4/video timeline editing to the MVP.

## Gotchas

- The web artifact uses the managed workflow so PORT and BASE_PATH are injected automatically.
- Browser-only parsing and exporting remain local; the API service's Clerk proxy exists only to support production auth loading.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
