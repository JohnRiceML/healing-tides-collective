import { describe, expect, it } from "vitest";

import {
  isOwnedProfilePhotoUploadPathname,
  PROFILE_PHOTO_MAX_BYTES,
  profilePhotoContentTypeForUploadPathname,
  profilePhotoUploadPathname,
  validateProfilePhotoFile,
  validateUploadedProfilePhoto,
} from "@/app/_lib/profile-photo";

const blobUrl =
  "https://healing-tides.public.blob.vercel-storage.com/practitioners/p1/avatar-AbCd1234.jpg";

describe("profile photo upload validation", () => {
  it.each([
    ["image/jpeg", "jpg"],
    ["image/png", "png"],
    ["image/webp", "webp"],
    ["image/avif", "avif"],
    ["image/gif", "gif"],
  ])("accepts %s at the 6 MB boundary", (type, extension) => {
    expect(validateProfilePhotoFile({ type, size: PROFILE_PHOTO_MAX_BYTES })).toEqual({
      ok: true,
      extension,
    });
  });

  it("rejects empty, oversized, and unsupported files with friendly errors", () => {
    expect(validateProfilePhotoFile({ type: "image/png", size: 0 })).toMatchObject({ ok: false });
    expect(
      validateProfilePhotoFile({ type: "image/png", size: PROFILE_PHOTO_MAX_BYTES + 1024 * 1024 }),
    ).toEqual({
      ok: false,
      error: "That image is 7 MB. The maximum is 6 MB — try a smaller one.",
    });
    expect(
      validateProfilePhotoFile({ type: "image/png", size: PROFILE_PHOTO_MAX_BYTES + 1 }),
    ).toMatchObject({ ok: false, error: expect.stringContaining("6.01 MB") });
    expect(validateProfilePhotoFile({ type: "image/svg+xml", size: 100 })).toMatchObject({
      ok: false,
      error: expect.stringContaining("JPG"),
    });
  });

  it("builds and recognizes only the authenticated practitioner's token pathname", () => {
    expect(profilePhotoUploadPathname("p1", "image/jpeg")).toBe("practitioners/p1/avatar.jpg");
    expect(isOwnedProfilePhotoUploadPathname("practitioners/p1/avatar.jpg", "p1")).toBe(true);
    expect(isOwnedProfilePhotoUploadPathname("practitioners/p2/avatar.jpg", "p1")).toBe(false);
    expect(isOwnedProfilePhotoUploadPathname("practitioners/p1/../p2/avatar.jpg", "p1")).toBe(false);
    expect(isOwnedProfilePhotoUploadPathname("practitioners/p1/private.pdf", "p1")).toBe(false);
    expect(profilePhotoContentTypeForUploadPathname("practitioners/p1/avatar.jpg", "p1")).toBe("image/jpeg");
    expect(profilePhotoContentTypeForUploadPathname("practitioners/p1/avatar.gif", "p1")).toBe("image/gif");
  });

  it("accepts trusted Blob metadata for the practitioner's randomized avatar", () => {
    expect(
      validateUploadedProfilePhoto(
        blobUrl,
        { url: blobUrl, pathname: "practitioners/p1/avatar-AbCd1234.jpg", contentType: "image/jpeg", size: 100 },
        "p1",
      ),
    ).toEqual({ ok: true, extension: "jpg" });
  });

  it("rejects another practitioner's blob, URL mismatch, missing random suffix, and bad metadata", () => {
    const valid = { url: blobUrl, pathname: "practitioners/p1/avatar-AbCd1234.jpg", contentType: "image/jpeg", size: 100 };

    expect(validateUploadedProfilePhoto(blobUrl, valid, "p2")).toMatchObject({ ok: false });
    expect(validateUploadedProfilePhoto(blobUrl, { ...valid, url: `${blobUrl}?other=1` }, "p1")).toMatchObject({ ok: false });
    expect(validateUploadedProfilePhoto(blobUrl, { ...valid, pathname: "practitioners/p1/avatar.jpg" }, "p1")).toMatchObject({ ok: false });
    expect(validateUploadedProfilePhoto(blobUrl, { ...valid, contentType: "image/svg+xml" }, "p1")).toMatchObject({ ok: false });
    expect(validateUploadedProfilePhoto(blobUrl, { ...valid, size: PROFILE_PHOTO_MAX_BYTES + 1 }, "p1")).toMatchObject({ ok: false });
    expect(
      validateUploadedProfilePhoto(
        "https://example.com/practitioners/p1/avatar-AbCd1234.jpg",
        { ...valid, url: "https://example.com/practitioners/p1/avatar-AbCd1234.jpg" },
        "p1",
      ),
    ).toMatchObject({ ok: false });
  });
});
