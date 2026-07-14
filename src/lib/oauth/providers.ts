export const PROVIDERS = {
  OSM: "osm",
  GOOGLE: "google",
} as const;

export type Provider = (typeof PROVIDERS)[keyof typeof PROVIDERS];

export const PROVIDER_LIST: Provider[] = Object.values(PROVIDERS);

export function isProvider(value: unknown): value is Provider {
  return (
    typeof value === "string" && (PROVIDER_LIST as string[]).includes(value)
  );
}
