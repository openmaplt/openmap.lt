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
//
// Cost constraint: the project is donation-funded, so the key must stay on
// Mistral's Free plan (no payment method). Free serves only some models —
// verified against the API: ministral-14b/8b/3b-2512, open-mistral-nemo and
// codestral answer; mistral-small/medium/magistral return 429 with a 0
// requests-per-minute limit and mistral-large returns 403 (tier not allowed).
// ministral-14b-2512 is the strongest of those (30 requests/min).
export const AI_MODEL_ID = "mistral:ministral-14b-2512";
