import { MAP_PROFILES } from "@/config/map-profiles";
import { listApprovedComments } from "@/lib/comments";
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
    return Response.json([]);
  }

  if (await checkRateLimit("commentList", "standard")) {
    return new Response(null, { status: 429 });
  }

  const comments = await listApprovedComments(mapProfileId, objectRef);
  return Response.json(comments);
}
