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
export const AI_MODEL_ID = "google:gemini-3.5-flash";
