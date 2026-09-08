# Sankey Studio

Sankey Studio turns spreadsheet data into polished Sankey diagrams in the browser.

## Local development

### Prerequisites

On a fresh Windows 11 machine, install:

- [Git for Windows](https://git-scm.com/download/win)
- [Node.js 24 or newer](https://nodejs.org/)
- [Visual Studio Code](https://code.visualstudio.com/) (recommended)

PowerShell is included with Windows 11. This repository uses pnpm; do not use npm or Yarn to install dependencies.

### Clone and install dependencies

Run these commands in PowerShell:

```powershell
git clone <repository-url>
cd <repository-directory>
corepack enable
corepack install
pnpm install
```

The repository pins the pnpm version through `package.json`, so Corepack selects the same package-manager version used by Replit.

### Start the development server

```powershell
pnpm run dev
```

Open the local URL printed by Vite.

### Typecheck and production build

```powershell
pnpm run typecheck
pnpm --filter @workspace/sankey-studio run build
```

To typecheck and build every workspace package:

```powershell
pnpm run build
```