import type { GeoPoint } from './types.ts';

export type Place = GeoPoint & { name: string };

// find the closest point to a given area/postcode requested by the user
// only call this when the button is pressed to submit the request, as
// autocomplete is against Nominatim TOS.
export async function geocode(query: string): Promise<Place | null> {
  const params = new URLSearchParams({ q: query, format: 'json', limit: '1', countrycodes: 'gb' });
  const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`);
  if (!res.ok) throw new Error(`Place search failed (${res.status})`);
  const results: { lat: string; lon: string; display_name: string }[] = await res.json();
  if (!results.length) return null;
  const [top] = results;
  return { lat: Number(top.lat), lon: Number(top.lon), name: top.display_name.split(',')[0] };
}
