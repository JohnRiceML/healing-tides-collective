import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";

import {
  PROFILE_PHOTO_MAX_BYTES,
  profilePhotoContentTypeForUploadPathname,
} from "@/app/_lib/profile-photo";
import { getPractitioner } from "@/lib/auth";

class InvalidProfilePhotoPathError extends Error {}

export async function POST(request: Request): Promise<Response> {
  const result = await getPractitioner();
  if (!result) {
    return Response.json({ error: "You're not signed in." }, { status: 401 });
  }
  if (!result.practitioner) {
    return Response.json({ error: "We couldn't find your practitioner profile." }, { status: 403 });
  }
  const practitioner = result.practitioner;

  let body: HandleUploadBody;
  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return Response.json({ error: "That upload request wasn't valid." }, { status: 400 });
  }

  try {
    const response = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const contentType = profilePhotoContentTypeForUploadPathname(pathname, practitioner.id);
        if (!contentType) {
          throw new InvalidProfilePhotoPathError();
        }
        return {
          // Bind the MIME type to the requested extension as well as enforcing the overall allowlist.
          allowedContentTypes: [contentType],
          maximumSizeInBytes: PROFILE_PHOTO_MAX_BYTES,
          addRandomSuffix: true,
          validUntil: Date.now() + 5 * 60 * 1000,
        };
      },
    });
    return Response.json(response);
  } catch (error) {
    if (error instanceof InvalidProfilePhotoPathError) {
      return Response.json({ error: "That upload path wasn't valid." }, { status: 400 });
    }
    return Response.json({ error: "Couldn't prepare that upload just now." }, { status: 500 });
  }
}
