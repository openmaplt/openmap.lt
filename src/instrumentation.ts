export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { scheduleModerationDigest } = await import("@/lib/moderationDigest");
    scheduleModerationDigest();
  }
}
