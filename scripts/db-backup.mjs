// On-demand database backup → a timestamped SQL dump in the gitignored backups/ dir.
//
//   npm run db:backup
//
// This is the "before I do something risky" safety net. It uses pg_dump against the DIRECT
// (unpooled) Neon connection — the pooled endpoint can drop a long dump mid-stream and leave you
// with a SILENT partial backup, so we refuse to fall back to it. For routine recovery prefer Neon's
// own point-in-time restore + branches (instant, no big files) — see docs/DB-OPERATIONS.md. This
// dump is the portable, offline, paranoid copy.
//
// Requires: pg_dump on PATH (PostgreSQL client tools) + DATABASE_URL_UNPOOLED in .env.local.

import { execSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });
loadEnv();

// REQUIRE the unpooled (direct) URL — do NOT silently fall back to the pooled DATABASE_URL,
// which can yield an incomplete dump you'd wrongly trust.
const url = process.env.DATABASE_URL_UNPOOLED;
if (!url) {
  console.error("\n✗ DATABASE_URL_UNPOOLED is not set in .env.local.");
  console.error("  pg_dump needs the DIRECT (unpooled) Neon string — the pooled DATABASE_URL can");
  console.error("  drop mid-dump and silently produce a partial backup. Copy the 'direct connection'");
  console.error("  string from the Neon dashboard into .env.local as DATABASE_URL_UNPOOLED.\n");
  process.exit(1);
}

let pgVersion = "";
try {
  pgVersion = execSync("pg_dump --version", { encoding: "utf8" }).trim();
} catch {
  console.error("\n✗ pg_dump not found. Install PostgreSQL client tools (macOS: `brew install libpq`,");
  console.error("  then add it to PATH), or just take a Neon branch/snapshot in the dashboard — see");
  console.error("  docs/DB-OPERATIONS.md.\n");
  process.exit(1);
}

const stamp = new Date().toISOString().replace(/[:.]/g, "-").replace("T", "_").slice(0, 19);
const out = `backups/htc-${stamp}.sql`;
mkdirSync("backups", { recursive: true });

console.log(`\n${pgVersion}`);
console.log("  (ensure its major version matches your Neon Postgres — a mismatch can skip features)");
console.log(`\nBacking up → ${out} …`);

// Pass the connection string via the child ENV (not argv) so the secret isn't visible in `ps`.
// --no-owner / --no-privileges keep the dump portable for restore into a fresh DB.
execSync(`pg_dump --no-owner --no-privileges "$DB_URL" > "${out}"`, {
  stdio: "inherit",
  shell: "/bin/bash",
  env: { ...process.env, DB_URL: url },
});

console.log(`\n✓ Backup written to ${out}`);
console.log(`  Restore (into a FRESH/empty DB only) with:  psql "$TARGET_DATABASE_URL" < "${out}"\n`);
