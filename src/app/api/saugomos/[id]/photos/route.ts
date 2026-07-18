import { getProtectedPhotoList } from "@/data/protectedPhotos";
import { checkRateLimit } from "@/lib/rateLimit";

/**
 * Returns the photo metadata list for a protected area as JSON. The client
 * gallery fetches this instead of calling a server action — a plain route
 * handler resolves reliably during hydration, whereas a server action invoked
 * from an effect on first load can be dropped and never settle.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!/^\d+$/.test(id)) {
    return Response.json([]);
  }

  if (await checkRateLimit("protectedPhotos")) {
    return new Response(null, { status: 429 });
  }

  const photos = await getProtectedPhotoList(id);
  return Response.json(photos);
}
