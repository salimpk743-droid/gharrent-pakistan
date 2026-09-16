#!/usr/bin/env node
/**
 * Nitro bundles @electric-sql/pglite into the Vercel serverless function but
 * does not copy the WASM/data files it reads at runtime. Production deploys
 * use Neon (DATABASE_URL) and never load PGLite; `vite preview` on :8081 does.
 */
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = join(root, "node_modules/@electric-sql/pglite/dist");
const destDir = join(root, ".vercel/output/functions/__server.func/_libs");

if (!existsSync(destDir) || !existsSync(srcDir)) {
  process.exit(0);
}

mkdirSync(destDir, { recursive: true });
for (const file of ["pglite.data", "pglite.wasm", "initdb.wasm"]) {
  const from = join(srcDir, file);
  if (!existsSync(from)) continue;
  copyFileSync(from, join(destDir, file));
}
