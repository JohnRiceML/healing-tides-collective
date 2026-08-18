import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getPractitioner: vi.fn(),
  handleUpload: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ getPractitioner: mocks.getPractitioner }));
vi.mock("@vercel/blob/client", () => ({ handleUpload: mocks.handleUpload }));

import { POST } from "@/app/api/profile-photo/upload/route";
import { PROFILE_PHOTO_MAX_BYTES } from "@/app/_lib/profile-photo";

function tokenRequest(pathname: string): Request {
  return new Request("https://healingtides.co/api/profile-photo/upload", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      type: "blob.generate-client-token",
      payload: { pathname, multipart: false, clientPayload: null },
    }),
  });
}

beforeEach(() => {
  mocks.getPractitioner.mockReset();
  mocks.handleUpload.mockReset();
  mocks.getPractitioner.mockResolvedValue({
    user: { id: "u1" },
    practitioner: { id: "p1" },
  });
  mocks.handleUpload.mockImplementation(async (options) => {
    const pathname = options.body.payload.pathname;
    const constraints = await options.onBeforeGenerateToken(pathname, null, false);
    return { type: "blob.generate-client-token", clientToken: "scoped-token", constraints };
  });
});

describe("POST /api/profile-photo/upload", () => {
  it("returns 401 before issuing a token when the practitioner is not signed in", async () => {
    mocks.getPractitioner.mockResolvedValue(null);

    const response = await POST(tokenRequest("practitioners/p1/avatar.jpg"));
    expect(response.status).toBe(401);
    expect(mocks.handleUpload).not.toHaveBeenCalled();
  });

  it("returns 403 without promoting an authenticated seeker who has no practitioner row", async () => {
    mocks.getPractitioner.mockResolvedValue({ user: { id: "u1" }, practitioner: null });

    const response = await POST(tokenRequest("practitioners/p1/avatar.jpg"));
    expect(response.status).toBe(403);
    expect(mocks.handleUpload).not.toHaveBeenCalled();
  });

  it("issues a short-lived token constrained to the matching allowed image type, 6 MB, and random suffixes", async () => {
    const before = Date.now();
    const response = await POST(tokenRequest("practitioners/p1/avatar.jpg"));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.clientToken).toBe("scoped-token");
    expect(json.constraints).toMatchObject({
      maximumSizeInBytes: PROFILE_PHOTO_MAX_BYTES,
      addRandomSuffix: true,
      allowedContentTypes: ["image/jpeg"],
    });
    expect(json.constraints.validUntil).toBeGreaterThanOrEqual(before + 4 * 60 * 1000);
    expect(json.constraints.validUntil).toBeLessThanOrEqual(Date.now() + 5 * 60 * 1000);
  });

  it("refuses a pathname owned by another practitioner", async () => {
    const response = await POST(tokenRequest("practitioners/p2/avatar.jpg"));

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ error: expect.stringContaining("path") });
  });
});
