import { MAP_PROFILES } from "@/config/map-profiles";
import { currentUserHasPermission, PERMISSIONS } from "@/lib/permissions";
import { listApprovedPhotos, listPendingPhotosForObject } from "@/lib/photos";
import { checkRateLimit } from "@/lib/rateLimit";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mapProfileId = searchParams.get("profile");
  const objectRef = searchParams.get("ref");

  if (
    !mapProfileId ||
    !objectRef ||
    !MAP_PROFILES.some((profile) => profile.id === mapProfileId)
  ) {
    return Response.json({ approved: [], pending: [] });
  }

  if (await checkRateLimit("photoList", "standard")) {
    return new Response(null, { status: 429 });
  }

  const canModerate = await currentUserHasPermission(
    PERMISSIONS.PHOTOS_MODERATE,
  );

  const [approved, pending] = await Promise.all([
    listApprovedPhotos(mapProfileId, objectRef),
    canModerate
      ? listPendingPhotosForObject(mapProfileId, objectRef)
      : Promise.resolve([]),
  ]);

  return Response.json({ approved, pending });
}
