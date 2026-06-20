# Database operations — changes, migrations, backups

**Last updated:** 2026-06-20 · Stack: Neon Postgres + Prisma 7 (`prisma.config.ts` → `DATABASE_URL_UNPOOLED` for the CLI; the app uses pooled `DATABASE_URL` via `lib/db.ts`).

> This is the playbook for changing the database safely. The whole point: **a schema change should never make you wonder "will I lose data."** Follow the safe flow and the answer is always no.

## The five golden rules
1. **Never accept a "reset" prompt** from `prisma migrate dev`. A reset **drops all data**. It's the only operation in this whole stack that loses data, and it requires you to say yes — so never do.
2. **Apply to production with `migrate deploy`, never `migrate dev`.** `deploy` only runs the migration files you've reviewed and **can never reset**. `migrate dev` is for a throwaway/dev branch.
3. **Generate → review → apply.** Look at the SQL before it touches prod. `npm run db:migrate:safe` does the generate + review for you and refuses to apply.
4. **Snapshot before anything destructive.** A Neon branch (instant) or `npm run db:backup` (pg_dump). Additive changes don't need it; column changes/renames/drops do.
5. **Additive is safe; destructive is the only risk.** `CREATE TABLE`/`ADD COLUMN` never lose data. `DROP`/`TRUNCATE`/a column **rename** (Prisma emits it as DROP + ADD) do. The safe-migrate script flags these in red.

## The safe change → migration flow
You changed `prisma/schema.prisma` and want it in the database.

```bash
npm run db:status                      # 1. see pending migrations + any drift (read-only, always safe)
npm run db:migrate:safe -- add_xyz     # 2. GENERATE the migration + print the SQL + scan for destructive stmts
                                        #    (this never applies anything)
#   → read the SQL. If it only ADDs, you're safe. If you see DROP/TRUNCATE you didn't intend, stop.
npm run db:backup                       # 3. (optional for additive; REQUIRED if destructive) snapshot first
npm run db:migrate:deploy               # 4. apply the reviewed migration — can never reset/drop
npm run db:generate                     # 5. regenerate the Prisma client (CI/postinstall also does this)
```

That's it. The `invites` table, for example, is a pure `CREATE TABLE` — step 2 prints it, the scan says "no destructive statements," step 4 applies it, done.

## Dev / prod separation — the structural fix (⏳ post-launch major todo)
> **Decision (2026-06-20): deferred until after launch.** Pre-launch the DB holds mostly test data, so a dev branch isn't earning its keep yet. The moment we have **real prod data worth cloning to dev** (i.e. once we're live), this becomes a priority — set up the dev branch *then* (clone prod → dev), so local/Preview stops touching real user data and migrations get tested on a true copy. Tracked in [BUILD-TRACKER.md](BUILD-TRACKER.md). Until then: one shared DB, and migrations follow the safe flow above with extra care.

Today there is **one shared Neon database** for local dev, Preview, and Production. That means local experiments and migrations run against real data, and admin metrics double-count test traffic (see [the metrics-hygiene note](../README.md)). **Neon branches fix this for free** — a branch is a copy-on-write clone, instant and cheap.

Set it up once (Neon dashboard → Branches, or `neonctl`):
1. Create a long-lived **`dev`** branch off `main` (production).
2. Put the **dev** branch's connection strings in **`.env.local`** and in **Vercel → Preview** (`DATABASE_URL` + `DATABASE_URL_UNPOOLED`).
3. Leave the **`main`** branch's strings in **Vercel → Production** only.

Now: local dev + preview deploys hit `dev`; production hits `main`; and you can **test a migration on `dev` first** (`npm run db:migrate:dev` there is fine — it's disposable), then `migrate deploy` it to prod. Reset the `dev` branch from `main` anytime to get clean data.

> Verify exact `neonctl` flags against `neonctl branches --help` (the CLI evolves); the dashboard does the same thing with buttons.

## Backups & recovery
Two layers, cheap and boring on purpose:

- **Primary — Neon Point-in-Time Restore (PITR).** On the **Launch** plan Neon keeps a continuous history (~7 days by default, configurable; *verified 2026-06-20 — re-check Neon's plan + retention before launch, it evolves*). You can restore the whole DB to any second in that window from the dashboard — this is your real "undo." **Enable it:** Neon → upgrade to Launch → Project settings → History retention. Do this before launch.
- **Snapshot before risk — a Neon branch.** Instant clone you can restore from or diff against. The fastest "I'm about to do something scary" net.
- **Offsite / portable — `npm run db:backup`.** A timestamped `pg_dump` into the gitignored `backups/` dir. Belt-and-suspenders; good before a big destructive change or for an offline copy.

**Recovery playbook**
- *"I ran a bad migration / dropped data"* → Neon dashboard → **Restore** to a timestamp just before it (PITR), or restore from the pre-change branch. Don't panic-edit prod.
- *"I need yesterday's data in a sandbox"* → create a Neon branch from a past timestamp; point a local env at it.
- *"Full rebuild from a dump"* → `psql "$TARGET_DATABASE_URL" < backups/htc-<stamp>.sql` into a **fresh/empty** DB (never over live data).

## Don't do this
- ❌ `prisma migrate dev` straight against production and clicking through a reset prompt.
- ❌ `prisma db push` on prod — it syncs schema with **no migration history** and can silently drop columns.
- ❌ Editing data by hand in Studio/SQL on prod without a snapshot.
- ❌ Restoring a `pg_dump` on top of a live database.

## Command reference
| Command | What it does | Safe on prod? |
|---|---|---|
| `npm run db:status` | Show pending migrations + drift | ✅ read-only |
| `npm run db:migrate:safe -- <name>` | Generate + print + scan a migration; **applies nothing** | ✅ generates only |
| `npm run db:migrate:deploy` | Apply pending reviewed migrations | ✅ never resets |
| `npm run db:backup` | `pg_dump` → `backups/` | ✅ read-only |
| `npm run db:generate` | Regenerate the Prisma client | ✅ no DB write |
| `npm run db:migrate:dev -- <name>` | `prisma migrate dev` — **dev branch only** (can reset!) | ⚠️ dev branch only |
| `npm run db:studio` | Prisma Studio data browser | ⚠️ edits are live |

## Who runs these
Migrations + backups are **John-only** — they touch the production database, and the agent's safety classifier blocks it from running prod migrations (correctly: a reset is unrecoverable). The agent **authors** migrations (schema + the generated SQL) and reviews them; John runs `db:migrate:deploy`. See also [RUNBOOK-prelaunch.md](RUNBOOK-prelaunch.md) for the launch-config checklist.

## The DB expert team (specialist agents)
This runbook is the operating manual; the **`.claude/agents/db-*` agents** are the experts who apply it. Spin one up for DB work — each carries the prime directive (*never lose production data*) and the author-not-apply boundary:

| Agent | Use it for |
|---|---|
| **`db-architect`** (lead) | Data-model / schema shape, naming, relations; routes DB work to the right specialist. Final say on `prisma/schema.prisma`. |
| **`db-migration-engineer`** | Authoring + reviewing migrations, expand/contract zero-downtime rollouts, failed-migration recovery, testing on a Neon branch. |
| **`db-reliability`** | Backups, PITR / instant-restore, Neon branching, plan/retention, disaster recovery, env/connection provisioning. |
| **`db-integrity`** | Constraints, PII / sensitive care-data handling, audit/soft-delete, the `NOT NULL`-on-populated-column traps. |
| **`db-performance`** | Indexes, query optimization, the matching hot path, lock/scale review on DDL. |

Typical flow: **db-architect** shapes the model → **db-integrity** reviews constraints/sensitivity → **db-performance** advises indexes → **db-migration-engineer** authors the migration (tested on a **db-reliability** Neon branch) → **John** applies it with `db:migrate:deploy`.
