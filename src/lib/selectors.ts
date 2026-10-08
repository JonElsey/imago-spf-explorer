import type { GeoPoint, AllAreas } from './types';
import { haversineKm } from './geo';

export const SUNNY_PCT_THRESHOLD = 90; // top 10% nationally across all years
export const PEER_PCT_BAND = 2.5; // clicking an area highlights peers within +/- this many percentile points
export const GEO_RADIUS_KM = 10;
export const SEARCH_LIMIT = 8;
export const GEO_RESULT_LIMIT = 10;

// Codes whose percentile in `year` sits within `band` points of `pct`.
export function findPeers(areas: AllAreas, year: number, pct: number, band = PEER_PCT_BAND) {
  const y = `${year}` as const;
  const peers = [];
  for (const [code, area] of Object.entries(areas)) {
    const yd = area[y];
    if (yd && Math.abs(yd.pct - pct) <= band) peers.push(code);
  }
  return peers;
}

// Codes whose raw value in `year` falls within [lo, hi], inclusive.
export function findInRange(areas: AllAreas, year: number, lo: number, hi: number) {
  const y = `${year}` as const;
  const codes = [];
  for (const [code, area] of Object.entries(areas)) {
    const yd = area[y];
    if (yd && yd.value >= lo && yd.value <= hi) codes.push(code);
  }
  return codes;
}

// Substring match on code or area name, capped at `limit`.
export function searchAreas(areas: AllAreas, query: string, limit = SEARCH_LIMIT) {
  const q = query.trim().toLowerCase();
  const hits: { code: string; name: string }[] = [];
  if (!q) return hits;
  for (const [code, area] of Object.entries(areas)) {
    if (code.toLowerCase().includes(q) || area.name.toLowerCase().includes(q)) {
      hits.push({ code, name: area.name });
      if (hits.length >= limit) break;
    }
  }
  return hits;
}

// Closest areas in the sunniest 10% nationally (across all years) within
// radiusKm, sorted by distance and capped at `limit`, plus how many qualified
// in total — dense sunny regions (e.g. the south coast) routinely have far
// more than the cap within range.
export function findSunnyNear(
  areas: AllAreas,
  year: number,
  point: GeoPoint,
  { radiusKm = GEO_RADIUS_KM, threshold = SUNNY_PCT_THRESHOLD, limit = GEO_RESULT_LIMIT } = {},
) {
  const y = `${year}` as const;
  const candidates = [];
  for (const [code, area] of Object.entries(areas)) {
    const yd = area[y];
    if (!yd || yd.pct < threshold) continue;
    const distKm = haversineKm(point, area);
    if (distKm <= radiusKm) candidates.push({ code, area, distKm });
  }
  candidates.sort((a, b) => a.distKm - b.distKm);
  return { nearest: candidates.slice(0, limit), total: candidates.length };
}
