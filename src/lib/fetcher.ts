export async function fetchJson<T>(url: string | URL): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Užklausa nepavyko (${res.status})`);
  }
  return res.json();
}
