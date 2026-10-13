import { NextResponse } from 'next/server';

/**
 * Server‑side reverse‑geocode using the public Nominatim OpenStreetMap API.
 * No API key is required, but we respect the usage policy by limiting
 * the request to a single call per user action and by providing a User‑Agent.
 *
 * Input: { latitude: number, longitude: number }
 * Output: { address: string | null }
 */
export async function POST(request: Request) {
  try {
    const { latitude, longitude } = await request.json();
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return NextResponse.json({ address: null }, { status: 400 });
    }
    const url = new URL('https://nominatim.openstreetmap.org/reverse');
    url.searchParams.set('format', 'json');
    url.searchParams.set('lat', latitude.toString());
    url.searchParams.set('lon', longitude.toString());
    url.searchParams.set('zoom', '18');
    url.searchParams.set('addressdetails', '1');
    // Provide a simple User-Agent as required by Nominatim policy
    const res = await fetch(url.toString(), {
      headers: { 'User-Agent': 'ExOwn/1.0 (https://ex-own.vercel.app)' },
    });
    if (!res.ok) return NextResponse.json({ address: null }, { status: 502 });
    const data = await res.json();
    // Build a public‑safe description (e.g., "Near Main Gate, LPU Campus")
    const { road, neighbourhood, suburb, city, town, village, state, country } = data.address || {};
    const parts = [road, neighbourhood, suburb, city || town || village, state, country].filter(Boolean);
    const address = parts.length ? parts.join(', ') : null;
    return NextResponse.json({ address });
  } catch (e) {
    return NextResponse.json({ address: null }, { status: 500 });
  }
}
