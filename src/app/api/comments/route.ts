import { MAP_PROFILES } from "@/config/map-profiles";
import {
  listApprovedComments,
  listPendingCommentsForObject,
} from "@/lib/comments";
import { currentUserHasPermission, PERMISSIONS } from "@/lib/permissions";
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

  if (await checkRateLimit("commentList", "standard")) {
    return new Response(null, { status: 429 });
  }

  const canModerate = await currentUserHasPermission(
    PERMISSIONS.COMMENTS_MODERATE,
  );

  const [approved, pending] = await Promise.all([
    listApprovedComments(mapProfileId, objectRef),
    canModerate
      ? listPendingCommentsForObject(mapProfileId, objectRef)
      : Promise.resolve([]),
  ]);

  return Response.json({ approved, pending });
}
