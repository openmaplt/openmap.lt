import { readPhotoFile } from "@/lib/photoStorage";
import { checkRateLimit } from "@/lib/rateLimit";

/**
 * Streams a user-uploaded photo. Every stored file is a UUID-named webp (see
 * processAndSaveImage), so the filename alone never needs a status/permission
 * check — the DB is the gate for which fileNames are ever handed to a client
 * (approved photos to everyone, pending only to the uploader/a moderator via
 * /api/photos).
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string }> },
) {
  const { file } = await params;

  if (await checkRateLimit("photoFile", "frequent")) {
    return new Response(null, { status: 429 });
  }

  const buffer = await readPhotoFile(file);
  if (!buffer) {
    return new Response(null, { status: 404 });
  }

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
