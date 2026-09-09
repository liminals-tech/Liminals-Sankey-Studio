import { spawn } from "node:child_process";

const pnpm = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

function runPnpm(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(pnpm, args, {
      stdio: "inherit",
      shell: false,
    });

    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(
        new Error(
          `pnpm ${args.join(" ")} exited with ${
            signal ? `signal ${signal}` : `code ${code ?? "unknown"}`
          }`,
        ),
      );
    });
  });
}

await runPnpm(["install", "--frozen-lockfile"]);