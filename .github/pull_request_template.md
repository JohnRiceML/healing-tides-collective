<!-- Healing Tides Collective — PR template. Keep the living docs alive (see AGENTS.md). -->

## What changed & why


## Docs & quality checklist
- [ ] `npx tsc --noEmit` passes
- [ ] If a subsystem / route / load-bearing file was **added, moved, renamed, or removed**, `docs/SYSTEM.md` is updated **in this PR** (and its "Last updated" date bumped)
- [ ] If an **architectural or product decision** was made, an entry was appended to `planning/decisions-log.md` (append-only — supersede, don't edit)
- [ ] Any **new env var** is added to the env contract in `docs/architecture/PHASE-2-SYSTEMS.md`; **no secrets committed**
- [ ] Backend changes went through the relevant `.claude/agents/` owner and stayed within its boundary
- [ ] No stale docs introduced — wrong info is fixed or flagged ⚠️, not left unmarked
