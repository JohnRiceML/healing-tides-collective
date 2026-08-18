export const PROFILE_PHOTO_MAX_BYTES = 6 * 1024 * 1024;

export const PROFILE_PHOTO_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
] as const;

const EXTENSION_BY_CONTENT_TYPE: Readonly<Record<string, string>> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};

const UNSUPPORTED_IMAGE_ERROR = "Use a JPG, PNG, WebP, AVIF, or GIF image.";
const UNVERIFIED_UPLOAD_ERROR = "Couldn't verify that upload — please try again.";

type FileLike = { size: number; type: string };
type BlobMetadata = { size: number; contentType: string; pathname: string; url: string };

export type ProfilePhotoValidation =
  | { ok: true; extension: string }
  | { ok: false; error: string };

function displayMegabytes(bytes: number): string {
  // Round upward so a file just one byte over the limit never reads as an apparently-valid 6 MB.
  const megabytes = Math.ceil((bytes / (1024 * 1024)) * 100) / 100;
  return Number.isInteger(megabytes) ? String(megabytes) : megabytes.toFixed(2).replace(/0$/, "");
}

/** Browser-side convenience; Blob enforces the same constraints from its server-issued token. */
export function validateProfilePhotoFile(file: FileLike): ProfilePhotoValidation {
  if (!Number.isFinite(file.size) || file.size <= 0) {
    return { ok: false, error: "Pick an image file to upload." };
  }
  const extension = EXTENSION_BY_CONTENT_TYPE[file.type];
  if (!extension) return { ok: false, error: UNSUPPORTED_IMAGE_ERROR };
  if (file.size > PROFILE_PHOTO_MAX_BYTES) {
    return {
      ok: false,
      error: `That image is ${displayMegabytes(file.size)} MB. The maximum is 6 MB — try a smaller one.`,
    };
  }
  return { ok: true, extension };
}

export function profilePhotoUploadPathname(practitionerId: string, contentType: string): string | null {
  const extension = EXTENSION_BY_CONTENT_TYPE[contentType];
  return extension ? `practitioners/${practitionerId}/avatar.${extension}` : null;
}

/** The pathname requested before Blob appends its random suffix. */
export function isOwnedProfilePhotoUploadPathname(pathname: string, practitionerId: string): boolean {
  return profilePhotoContentTypeForUploadPathname(pathname, practitionerId) !== null;
}

export function profilePhotoContentTypeForUploadPathname(
  pathname: string,
  practitionerId: string,
): (typeof PROFILE_PHOTO_CONTENT_TYPES)[number] | null {
  return (
    PROFILE_PHOTO_CONTENT_TYPES.find(
      (contentType) => pathname === profilePhotoUploadPathname(practitionerId, contentType),
    ) ?? null
  );
}

function isVercelBlobUrl(rawUrl: string): boolean {
  try {
    const url = new URL(rawUrl);
    return (
      url.protocol === "https:" &&
      url.hostname.endsWith(".blob.vercel-storage.com") &&
      !url.username &&
      !url.password &&
      !url.port &&
      !url.search &&
      !url.hash
    );
  } catch {
    return false;
  }
}

/** Verify server-read Blob metadata before saving a client-uploaded URL to the practitioner row. */
export function validateUploadedProfilePhoto(
  submittedUrl: string,
  metadata: BlobMetadata,
  practitionerId: string,
): ProfilePhotoValidation {
  if (!isVercelBlobUrl(submittedUrl) || metadata.url !== submittedUrl) {
    return { ok: false, error: UNVERIFIED_UPLOAD_ERROR };
  }

  const file = validateProfilePhotoFile({ size: metadata.size, type: metadata.contentType });
  if (!file.ok) return file;

  // Client tokens add a random alphanumeric suffix. Requiring it here prevents a fixed-name
  // object or an unrelated path in the store from being finalized by this flow.
  const prefix = `practitioners/${practitionerId}/avatar-`;
  const suffixAndExtension = metadata.pathname.slice(prefix.length);
  const expectedExtension = `.${file.extension}`;
  const randomSuffix = suffixAndExtension.slice(0, -expectedExtension.length);
  if (
    !metadata.pathname.startsWith(prefix) ||
    !suffixAndExtension.endsWith(expectedExtension) ||
    !/^[A-Za-z0-9]{6,}$/.test(randomSuffix)
  ) {
    return { ok: false, error: UNVERIFIED_UPLOAD_ERROR };
  }

  return file;
}

export function isVercelBlobPhotoUrl(rawUrl: string): boolean {
  return isVercelBlobUrl(rawUrl);
}
