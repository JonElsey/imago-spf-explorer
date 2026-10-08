import type { GeoPoint } from './types';

// Haversine formula to calculate the great-circle distance between two points
// on a sphere given their longitudes and latitudes. Returns distance in km.
export function haversineKm(
  { lat: lat1, lon: lon1 }: GeoPoint,
  { lat: lat2, lon: lon2 }: GeoPoint,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Nation from a Nominatim address object, used to pick the regional quip pool.
export function parseCountry(addr: { state?: string } = {}): string {
  const state = (addr.state || '').toLowerCase();
  if (state.includes('scotland')) return 'scotland';
  if (state.includes('wales') || state.includes('cymru')) return 'wales';
  if (state.includes('northern ireland')) return 'northern_ireland';
  return 'england';
}
