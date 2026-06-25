import { describe, it, expect, vi } from "vitest";

// lib/invites imports @/lib/db (throws without DATABASE_URL); we only test pure helpers.
vi.mock("@/lib/db", () => ({ db: {} }));

import { newInviteToken, readPrefill, inviteIsClaimable, buildClaimUpdate, readImportUrl } from "@/lib/invites";

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

describe("readPrefill — bio + importUrl", () => {
  it("keeps a bio and an http(s) importUrl", () => {
    const p = readPrefill({ bio: " Warm trauma therapist. ", importUrl: "https://www.psychologytoday.com/us/therapists/jordan" });
    expect(p.bio).toBe("Warm trauma therapist.");
    expect(p.importUrl).toBe("https://www.psychologytoday.com/us/therapists/jordan");
  });
  it("rejects a non-http(s) importUrl (no javascript:/garbage/other schemes)", () => {
    expect(readPrefill({ importUrl: "javascript:alert(1)" }).importUrl).toBeUndefined();
    expect(readPrefill({ importUrl: "not a url" }).importUrl).toBeUndefined();
    expect(readPrefill({ importUrl: "ftp://x.com" }).importUrl).toBeUndefined();
  });
});

describe("buildClaimUpdate — bio fill-if-empty", () => {
  const invite = { displayName: "Jordan Lake", prefill: { bio: "Warm trauma therapist." } };
  it("fills an empty bio from the invite", () => {
    expect(buildClaimUpdate({ bio: "", fieldValues: {} }, invite).bio).toBe("Warm trauma therapist.");
  });
  it("never overwrites a bio the practitioner already wrote", () => {
    expect(buildClaimUpdate({ bio: "My own words.", fieldValues: {} }, invite).bio).toBeUndefined();
  });
});

describe("readImportUrl (reserved __importUrl key)", () => {
  it("reads the carried import link", () => {
    expect(readImportUrl({ __importUrl: "https://x.com/p" })).toBe("https://x.com/p");
  });
  it("is null when absent, blank, or wrong-shaped", () => {
    expect(readImportUrl({})).toBeNull();
    expect(readImportUrl({ __importUrl: "  " })).toBeNull();
    expect(readImportUrl(null)).toBeNull();
    expect(readImportUrl("nope")).toBeNull();
  });
});
