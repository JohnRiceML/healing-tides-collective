// A tiny in-memory stand-in for the Prisma client, so FLOW tests can run a real
// multi-step server-action sequence (create → read → update) against ONE consistent
// store, instead of stubbing each call in isolation. State carries across steps, which
// is the whole point — it catches "step B didn't see step A's write" bugs.
//
// Scope on purpose: it matches rows by the scalar/unique fields in `where` (incl.
// `NOT: { id }`), which covers every CRUD-by-key the flows need. It is NOT a SQL engine
// — complex directory `where` clauses (array_contains, JSON paths, OR) are verified by
// the pure buildPractitionerWhere unit tests + the real-DB integration layer, not here.

type Row = Record<string, any>;

function matches(row: Row, where: Row): boolean {
  for (const [k, v] of Object.entries(where)) {
    if (k === "NOT") {
      if (Object.entries(v as Row).every(([nk, nv]) => row[nk] === nv)) return false;
      continue;
    }
    // Only equality on scalars is supported; nested operator objects are out of scope.
    if (v !== null && typeof v === "object") continue;
    if (row[k] !== v) return false;
  }
  return true;
}

function collection(initial: Row[] = []) {
  let rows = initial.map((r) => ({ ...r }));
  let auto = 0;
  const api = {
    rows: () => rows,
    findUnique: async ({ where }: { where: Row }) => rows.find((r) => matches(r, where)) ?? null,
    findFirst: async ({ where = {} }: { where?: Row } = {}) => rows.find((r) => matches(r, where)) ?? null,
    findMany: async ({ where = {} }: { where?: Row } = {}) => rows.filter((r) => matches(r, where)),
    count: async ({ where = {} }: { where?: Row } = {}) => rows.filter((r) => matches(r, where)).length,
    create: async ({ data }: { data: Row }) => {
      const row = { id: data.id ?? `row_${(auto += 1)}`, ...data };
      rows.push(row);
      return { ...row };
    },
    update: async ({ where, data }: { where: Row; data: Row }) => {
      const row = rows.find((r) => matches(r, where));
      if (!row) throw Object.assign(new Error("Record to update not found."), { code: "P2025" });
      Object.assign(row, data);
      return { ...row };
    },
    upsert: async ({ where, create, update }: { where: Row; create: Row; update: Row }) => {
      const row = rows.find((r) => matches(r, where));
      if (row) {
        Object.assign(row, update);
        return { ...row };
      }
      const created = { id: create.id ?? `row_${(auto += 1)}`, ...where, ...create };
      rows.push(created);
      return { ...created };
    },
    delete: async ({ where }: { where: Row }) => {
      const i = rows.findIndex((r) => matches(r, where));
      if (i === -1) throw Object.assign(new Error("Record to delete not found."), { code: "P2025" });
      return { ...rows.splice(i, 1)[0] };
    },
  };
  return api;
}

export type MockDb = ReturnType<typeof makeMockDb>;

/** Build an in-memory db. Seed any model with starting rows. */
export function makeMockDb(
  seed: { users?: Row[]; practitioners?: Row[]; invites?: Row[]; profileViews?: Row[] } = {},
) {
  return {
    user: collection(seed.users),
    practitioner: collection(seed.practitioners),
    invite: collection(seed.invites),
    profileView: collection(seed.profileViews),
  };
}
