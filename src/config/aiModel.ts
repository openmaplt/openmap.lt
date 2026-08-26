// "provider:model-id" — resolved via createProviderRegistry
// (src/lib/aiSearchClient.ts), not a raw provider SDK call. To switch
// providers: install that provider's @ai-sdk/* package, register it in
// aiSearchClient.ts's registry, and change this one string — no other file
// needs to change. All registered providers share one generic
// AI_MODEL_API_KEY env var; see aiSearchClient.ts for why that's safe.
//
// Deliberately NOT a bare model string passed straight to generateText/
// streamText — the "ai" package resolves unregistered bare strings through
// the Vercel AI Gateway by default, which needs its own Vercel-side
// credentials and doesn't fit this self-hosted Docker app (billed directly
// against our own AI_MODEL_API_KEY).
export const AI_MODEL_ID = "mistral:mistral-small-latest";
