import { checkRateLimit } from "@/lib/rateLimit";
import { getProtectedAreaPhotos } from "@/lib/stvk";

const MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

/**
 * Streams a single protected-area photo as a binary image. The STVK API only
 * serves photos as base64 in a bulk POST, so we decode the requested one here
 * and hand the browser a normal, cacheable JPEG — keeping base64 out of the
 * client payload entirely.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; photoId: string }> },
) {
  const { id, photoId } = await params;

  if (!/^\d+$/.test(id) || !/^\d+$/.test(photoId)) {
    return new Response(null, { status: 400 });
  }

  if (await checkRateLimit("protectedPhotos")) {
    return new Response(null, { status: 429 });
  }

  const photo = (await getProtectedAreaPhotos(id)).find(
    (p) => p.id === photoId,
  );
  if (!photo?.file_base64) {
    return new Response(null, { status: 404 });
  }

  const contentType =
    MIME_BY_EXT[photo.file_ext?.toLowerCase()] ?? "image/jpeg";

  return new Response(Buffer.from(photo.file_base64, "base64"), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}
