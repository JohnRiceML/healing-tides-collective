// Safe schema migration — the prod-friendly path that can never silently drop data.
//
//   npm run db:migrate:safe -- <migration_name>
//
// It does THREE things and then STOPS — it never applies anything to the database:
//   1. shows the current migration state (pending + drift),
//   2. GENERATES the migration SQL from your schema change (prisma migrate dev --create-only),
//   3. prints that SQL and scans it for DESTRUCTIVE statements (DROP / TRUNCATE / column rename),
// then tells you to review it and apply with `npm run db:migrate:deploy` (which can never reset).
//
// Why not `prisma migrate dev`? On a shared/prod database, `migrate dev` may detect drift and offer
// to RESET (wipe) the DB. This flow uses --create-only (generate, don't apply) + `migrate deploy`
// (apply pending files, never reset) so a reset prompt is never on the table. See docs/DB-OPERATIONS.md.

import { execSync } from "node:child_process";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const MIGRATIONS_DIR = "prisma/migrations";
const run = (cmd) => execSync(cmd, { stdio: "inherit" });

const name = process.argv[2];
if (!name || !/^[a-z0-9_]+$/i.test(name)) {
  console.error("\nUsage: npm run db:migrate:safe -- <migration_name>   (letters, numbers, underscores)\n");
  process.exit(1);
}

console.log("\n① Current migration state\n");
try {
  run("npx prisma migrate status");
} catch {
  // `migrate status` exits non-zero when migrations are pending or drift exists — that's expected here.
}

const isDir = (d) => statSync(path.join(MIGRATIONS_DIR, d)).isDirectory();
const before = new Set(readdirSync(MIGRATIONS_DIR).filter(isDir));

console.log(`\n② Generating migration "${name}" — NOT applying it\n`);
run(`npx prisma migrate dev --create-only --name ${name}`);

// Identify EXACTLY the folder we just created — not merely the newest on disk (guards against
// "nothing was generated" or a stale folder from a re-run being scanned by mistake).
const fresh = readdirSync(MIGRATIONS_DIR).filter(isDir).filter((d) => !before.has(d));
if (fresh.length === 0) {
  console.log("\n✓ No new migration was generated — your schema already matches the database. Nothing to do.\n");
  process.exit(0);
}
const newest = fresh.sort().at(-1);
const sqlPath = path.join(MIGRATIONS_DIR, newest, "migration.sql");
const sql = readFileSync(sqlPath, "utf8");

console.log(`\n③ Generated SQL — ${sqlPath}\n`);
console.log(sql.replace(/^/gm, "    "));

// Catches the statements that lose/corrupt data. Note: a column RENAME and a TYPE change both
// silently lose data, and Prisma emits NOT NULL on a populated column as `SET NOT NULL`.
const destructive =
  sql.match(
    /\b(DROP\s+TABLE|DROP\s+COLUMN|DROP\s+CONSTRAINT|DROP\s+INDEX|DROP\s+SCHEMA|DROP\s+TYPE|ALTER\s+TABLE[^;]*\bDROP\b|ALTER\s+COLUMN[^;]*\bTYPE\b|SET\s+NOT\s+NULL|RENAME\s+COLUMN|TRUNCATE)\b/gi,
  ) || [];

if (destructive.length) {
  console.log("\n⚠️  DESTRUCTIVE statements detected — these can lose data:");
  for (const d of destructive) console.log("      • " + d.replace(/\s+/g, " ").trim());
  console.log("\n   A column rename shows up as DROP + ADD (data loss). If that's NOT what you meant,");
  console.log("   delete the generated folder and fix the schema. BACK UP FIRST: npm run db:backup\n");
} else {
  console.log("\n✓ No destructive statements — this migration only ADDS. Existing data is untouched.\n");
}

console.log("Next:");
console.log("   1. review the SQL above");
console.log("   2. (optional but wise) npm run db:backup");
console.log("   3. npm run db:migrate:deploy      ← applies pending migrations; can never reset/drop\n");
