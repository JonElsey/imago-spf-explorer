import type { GeoPoint, Weather } from './types.ts';

// get current cloud/daylight from open-meteo, rounded for privacy reasons
export async function fetchWeather(points: GeoPoint[]): Promise<Weather[]> {
  const params = new URLSearchParams({
    latitude: points.map(p => p.lat.toFixed(2)).join(','),
    longitude: points.map(p => p.lon.toFixed(2)).join(','),
    current: 'cloud_cover,is_day',
  });
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!res.ok) throw new Error(`Weather request failed (${res.status})`);
  const data: { current: Weather } | { current: Weather }[] = await res.json();
  // data can be submitted and returned as either one point or an array,
  // need to handle both cases
  return (Array.isArray(data) ? data : [data]).map(d => d.current);
}
