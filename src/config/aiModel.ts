// "provider:model-id" — resolved via createProviderRegistry
// (src/lib/aiSearchClient.ts), not a raw provider SDK call. To switch
// providers: install that provider's @ai-sdk/* package, register it in
// aiSearchClient.ts's registry, and change this one string — no other file
// needs to change.
//
// Deliberately NOT a bare model string passed straight to generateText/
// streamText — the "ai" package resolves unregistered bare strings through
// the Vercel AI Gateway by default, which needs its own Vercel-side
// credentials and doesn't fit this self-hosted Docker app (billed directly
// against our own GEMINI_API_KEY).
//
// Free tier note: the full "flash" tier (non-lite) is capped at only 20
// RPD on the free tier, same across generations (2.5/3/3.5/3.6 all showed
// 20 RPD in AI Studio) — not something a different Flash model avoids.
// "-lite" has a much higher free RPD (500) but is less reliable at
// combining "types" + "tagFilterIds" in one group (see aiSearchClient.ts
// buildFirstCallSystemPrompt rules 5-7). Back on "-lite" for now to
// conserve quota; revisit after enabling billing or trying Mistral.
export const AI_MODEL_ID = "google:gemini-3.5-flash-lite";
