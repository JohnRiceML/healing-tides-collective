import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getPractitioner: vi.fn(),
  update: vi.fn(),
  head: vi.fn(),
  put: vi.fn(),
  del: vi.fn(),
  guardPublicUrl: vi.fn(),
  fetchGuarded: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ getPractitioner: mocks.getPractitioner }));
vi.mock("@/lib/db", () => ({ db: { practitioner: { update: mocks.update } } }));
vi.mock("@vercel/blob", () => ({ head: mocks.head, put: mocks.put, del: mocks.del }));
vi.mock("@/lib/ssrf", () => ({
  guardPublicUrl: mocks.guardPublicUrl,
  fetchGuarded: mocks.fetchGuarded,
}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));

import {
  adoptImportedPhoto,
  finalizeProfilePhoto,
  removeProfilePhoto,
} from "@/app/practitioner/photo-actions";

const oldUrl = "https://healing-tides.public.blob.vercel-storage.com/practitioners/p1/avatar-Old12345.jpg";
const newUrl = "https://healing-tides.public.blob.vercel-storage.com/practitioners/p1/avatar-New12345.jpg";

function session(photoUrl: string | null = oldUrl) {
  return { user: { id: "u1" }, practitioner: { id: "p1", photoUrl } };
}

beforeEach(() => {
  for (const mock of Object.values(mocks)) mock.mockReset();
  mocks.getPractitioner.mockResolvedValue(session());
  mocks.update.mockResolvedValue({});
  mocks.del.mockResolvedValue(undefined);
  mocks.head.mockResolvedValue({
    url: newUrl,
    pathname: "practitioners/p1/avatar-New12345.jpg",
    contentType: "image/jpeg",
    size: 1024,
  });
});

describe("finalizeProfilePhoto", () => {
  it("requires authentication before reading Blob metadata", async () => {
    mocks.getPractitioner.mockResolvedValue(null);

    expect(await finalizeProfilePhoto(newUrl)).toMatchObject({ ok: false });
    expect(mocks.head).not.toHaveBeenCalled();
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it("persists only the session practitioner's verified Blob and cleans up the old photo", async () => {
    expect(await finalizeProfilePhoto(newUrl)).toEqual({ ok: true, photoUrl: newUrl });
    expect(mocks.head).toHaveBeenCalledWith(newUrl);
    expect(mocks.update).toHaveBeenCalledWith({ where: { id: "p1" }, data: { photoUrl: newUrl } });
    expect(mocks.del).toHaveBeenCalledWith(oldUrl);
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/practitioner");
  });

  it("rejects a valid Blob owned by another practitioner without writing or deleting it", async () => {
    const otherUrl = "https://healing-tides.public.blob.vercel-storage.com/practitioners/p2/avatar-New12345.jpg";
    mocks.head.mockResolvedValue({
      url: otherUrl,
      pathname: "practitioners/p2/avatar-New12345.jpg",
      contentType: "image/jpeg",
      size: 1024,
    });

    expect(await finalizeProfilePhoto(otherUrl)).toMatchObject({ ok: false });
    expect(mocks.update).not.toHaveBeenCalled();
    expect(mocks.del).not.toHaveBeenCalled();
  });

  it("keeps its verified Blob if the database save is ambiguous", async () => {
    mocks.update.mockRejectedValue(new Error("db unavailable"));

    expect(await finalizeProfilePhoto(newUrl)).toMatchObject({ ok: false });
    // The update may have committed before the connection failed. Deleting here could leave
    // the stored photoUrl pointing at a missing object; a possible orphan is safer.
    expect(mocks.del).not.toHaveBeenCalledWith(newUrl);
    expect(mocks.del).not.toHaveBeenCalledWith(oldUrl);
  });
});

describe("the existing imported-photo and remove paths", () => {
  it("still adopts a guarded imported image under the session practitioner's randomized path", async () => {
    mocks.guardPublicUrl.mockResolvedValue({ ok: true, url: new URL("https://photos.example.com/nora.jpg") });
    mocks.fetchGuarded.mockResolvedValue({
      ok: true,
      response: new Response(new Uint8Array([1, 2, 3]), {
        status: 200,
        headers: { "content-type": "image/jpeg" },
      }),
    });
    mocks.put.mockResolvedValue({ url: newUrl });

    expect(await adoptImportedPhoto("https://photos.example.com/nora.jpg")).toEqual({
      ok: true,
      photoUrl: newUrl,
    });
    expect(mocks.put).toHaveBeenCalledWith(
      "practitioners/p1/avatar.jpg",
      expect.any(Buffer),
      expect.objectContaining({ access: "public", contentType: "image/jpeg", addRandomSuffix: true }),
    );
    expect(mocks.update).toHaveBeenCalledWith({ where: { id: "p1" }, data: { photoUrl: newUrl } });
  });

  it("still removes the current photo from the session practitioner's row and Blob", async () => {
    expect(await removeProfilePhoto()).toEqual({ ok: true });
    expect(mocks.update).toHaveBeenCalledWith({ where: { id: "p1" }, data: { photoUrl: null } });
    expect(mocks.del).toHaveBeenCalledWith(oldUrl);
  });
});
