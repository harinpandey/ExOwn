

/**
 * Calls the server-side reverse‑geocode API.
 * Returns a human‑readable public location string or null on failure.
 */
export async function reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
  try {
    const res = await fetch('/api/reverseGeocode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latitude, longitude }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { address: string | null };
    return data.address ?? null;
  } catch (e) {
    // swallow errors, UI will handle null result
    return null;
  }
}
