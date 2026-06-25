import type { Metadata } from "next";

// Metadata-only passthrough — NO gating UI here on purpose. Each admin page runs
// requireAdmin() itself and renders the shell only on success, so a non-admin gets a clean
// 404 with no admin chrome leaking. (`noindex` applies to every /admin/* route.)
export const metadata: Metadata = {
  title: "Admin — Healing Tides Collective",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
