import { describe, it, expect, vi } from "vitest";

// lib/invites imports @/lib/db (throws without DATABASE_URL); we only test pure helpers.
vi.mock("@/lib/db", () => ({ db: {} }));

import { newInviteToken, readPrefill, inviteIsClaimable, buildClaimUpdate } from "@/lib/invites";

describe("newInviteToken", () => {
  it("produces a url-safe token (no +/= chars) of stable length", () => {
    const t = newInviteToken();
    expect(t).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(t.length).toBeGreaterThanOrEqual(20);
  });
  it("is unguessable — two tokens never collide", () => {
    const seen = new Set(Array.from({ length: 200 }, () => newInviteToken()));
    expect(seen.size).toBe(200);
  });
});

describe("readPrefill", () => {
  it("extracts known fields and ignores junk", () => {
    expect(
      readPrefill({ region: " Saint Paul ", title: "LICSW", website: "x.com", specialties: ["grief_loss", "", 7], extra: "nope" }),
    ).toEqual({ region: "Saint Paul", title: "LICSW", website: "x.com", specialties: ["grief_loss"] });
  });
  it("is safe on null / wrong-shaped input", () => {
    expect(readPrefill(null)).toEqual({ region: undefined, title: undefined, website: undefined, specialties: undefined });
    expect(readPrefill("nope")).toEqual({ region: undefined, title: undefined, website: undefined, specialties: undefined });
  });
});

describe("inviteIsClaimable", () => {
  it("claimable when unclaimed, not when already claimed or missing", () => {
    expect(inviteIsClaimable({ claimedAt: null })).toBe(true);
    expect(inviteIsClaimable({ claimedAt: new Date() })).toBe(false);
    expect(inviteIsClaimable(null)).toBe(false);
  });
});

describe("buildClaimUpdate (fill-if-empty)", () => {
  const invite = {
    displayName: "Jordan Lake",
    prefill: { region: "Saint Paul, MN", title: "LICSW", website: "jordan.com", specialties: ["grief_loss"] },
  };

  it("fills every empty field from the invite", () => {
    const out = buildClaimUpdate({ displayName: null, region: "", website: null, specialties: [], fieldValues: {} }, invite);
    expect(out).toEqual({
      displayName: "Jordan Lake",
      region: "Saint Paul, MN",
      website: "jordan.com",
      specialties: ["grief_loss"],
      title: "LICSW",
    });
  });

  it("NEVER overwrites fields the practitioner already set", () => {
    const out = buildClaimUpdate(
      { displayName: "Dr. Jordan", region: "Minneapolis", website: "mine.com", specialties: ["anxiety"], fieldValues: { title: "PhD" } },
      invite,
    );
    expect(out).toEqual({}); // everything already present → nothing to fill
  });

  it("fills only the gaps", () => {
    const out = buildClaimUpdate({ displayName: "Dr. Jordan", region: "", website: null, specialties: ["anxiety"], fieldValues: {} }, invite);
    expect(out).toEqual({ region: "Saint Paul, MN", website: "jordan.com", title: "LICSW" });
  });
});
