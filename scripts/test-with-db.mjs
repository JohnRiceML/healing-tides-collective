// Run a command against a REAL, throwaway Postgres — no system install, no Docker.
// embedded-postgres drops a Postgres binary into node_modules and runs it on a spare port.
// We push the Prisma schema, set TEST_DATABASE_URL, run the command, then tear it all down.
//
//   node scripts/test-with-db.mjs npm run test:integration
//   node scripts/test-with-db.mjs npm run test:e2e
//
// SAFETY: only ever touches a fresh local datadir + TEST_DATABASE_URL — never prod.
import EmbeddedPostgres from "embedded-postgres";
import { spawnSync } from "node:child_process";
import { rmSync } from "node:fs";

const PORT = Number(process.env.PG_TEST_PORT ?? 5433);
const DATA_DIR = "./.pgtest-data";
const DB = "htc_test";
const url = `postgresql://postgres:postgres@127.0.0.1:${PORT}/${DB}`;

const cmd = process.argv.slice(2);
if (cmd.length === 0) {
  console.error("usage: node scripts/test-with-db.mjs <command...>");
  process.exit(2);
}

rmSync(DATA_DIR, { recursive: true, force: true }); // always start clean

const pg = new EmbeddedPostgres({
  databaseDir: DATA_DIR,
  user: "postgres",
  password: "postgres",
  port: PORT,
  persistent: false,
});

let code = 1;
try {
  console.log(`[test-db] starting embedded Postgres on :${PORT}`);
  await pg.initialise();
  await pg.start();
  await pg.createDatabase(DB);

  const env = { ...process.env, DATABASE_URL: url, DATABASE_URL_UNPOOLED: url, TEST_DATABASE_URL: url };

  console.log("[test-db] prisma db push");
  // --url EXPLICITLY targets the embedded DB, so the push can never reach the prod URL in
  // .env.local no matter how prisma.config.ts resolves it. Belt and suspenders.
  const push = spawnSync(
    "npx",
    ["prisma", "db", "push", "--schema", "prisma/schema.prisma", "--url", url, "--accept-data-loss"],
    { stdio: "inherit", env },
  );
  if (push.status !== 0) throw new Error("prisma db push failed");

  console.log(`[test-db] running: ${cmd.join(" ")}`);
  const run = spawnSync(cmd[0], cmd.slice(1), { stdio: "inherit", env });
  code = run.status ?? 1;
} finally {
  console.log("[test-db] stopping embedded Postgres");
  try {
    await pg.stop();
  } catch {
    /* already down */
  }
  rmSync(DATA_DIR, { recursive: true, force: true });
}
process.exit(code);
