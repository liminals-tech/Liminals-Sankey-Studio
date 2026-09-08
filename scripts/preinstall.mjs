import { existsSync, unlinkSync } from "node:fs";
import { resolve } from "node:path";

const userAgent = process.env.npm_config_user_agent ?? "";

if (!userAgent.startsWith("pnpm/")) {
  console.error("This repository must be installed with pnpm.");
  console.error("Run `corepack enable` and then `pnpm install`.");
  process.exit(1);
}

for (const lockfile of ["package-lock.json", "yarn.lock"]) {
  const path = resolve(process.cwd(), lockfile);
  if (existsSync(path)) {
    unlinkSync(path);
  }
}