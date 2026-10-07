import { describe, it, expect } from 'vitest';

import {
  findPeers,
  findInRange,
  searchAreas,
  findSunnyNear,
  SUNNY_PCT_THRESHOLD,
  GEO_RADIUS_KM,
} from '../src/lib/selectors.ts';
import { haversineKm } from '../src/lib/geo.ts';
import { areas, meta, testMeta, latestYear } from './fixture.ts';

const { seedCode, seedLat, seedLon, missingYearCode } = testMeta;
const seed = { lat: seedLat, lon: seedLon };

describe('findPeers', () => {
  it('includes the area itself', () => {
    const pct = areas[seedCode][latestYear].pct;
    expect(findPeers(areas, latestYear, pct)).toContain(seedCode);
  });

  it('returns every area within the band and nothing outside it', () => {
    const pct = areas[seedCode][latestYear].pct;
    const peers = findPeers(areas, latestYear, pct, 2.5);
    expect(peers).toHaveLength(11);
    for (const code of peers) {
      expect(Math.abs(areas[code][latestYear].pct - pct)).toBeLessThanOrEqual(2.5);
    }
  });

  it('widens with the band', () => {
    const pct = areas[seedCode][latestYear].pct;
    const narrow = findPeers(areas, latestYear, pct, 1);
    const wide = findPeers(areas, latestYear, pct, 50);
    expect(wide.length).toBeGreaterThan(narrow.length);
  });

  it('skips areas with no data for that year', () => {
    expect(findPeers(areas, latestYear, 50, 100)).not.toContain(missingYearCode);
  });
});

describe('findInRange', () => {
  it('matches every area with data when given the full dataset range', () => {
    const codes = findInRange(areas, latestYear, meta.value_min, meta.value_max);
    expect(codes).toHaveLength(53); // 54 areas, one missing the latest year
    expect(codes).not.toContain(missingYearCode);
  });

  it('is inclusive at both bounds', () => {
    const v = areas[seedCode][latestYear].value;
    expect(findInRange(areas, latestYear, v, v)).toContain(seedCode);
  });

  it('returns nothing for an empty band below the data', () => {
    expect(findInRange(areas, latestYear, 0, 1)).toEqual([]);
  });

  it('returns only areas inside the band', () => {
    const codes = findInRange(areas, latestYear, 60, 65);
    for (const code of codes) {
      const v = areas[code][latestYear].value;
      expect(v).toBeGreaterThanOrEqual(60);
      expect(v).toBeLessThanOrEqual(65);
    }
  });
});

describe('searchAreas', () => {
  it('matches on area code, case-insensitively', () => {
    expect(searchAreas(areas, seedCode).map(h => h.code)).toContain(seedCode);
    expect(searchAreas(areas, seedCode.toLowerCase()).map(h => h.code)).toContain(seedCode);
  });

  it('matches on a substring of the name', () => {
    const name = areas[seedCode].name;
    const hits = searchAreas(areas, name.slice(0, 6));
    expect(hits.length).toBeGreaterThan(0);
    for (const h of hits) {
      const hay = (h.code + ' ' + h.name).toLowerCase();
      expect(hay).toContain(name.slice(0, 6).toLowerCase());
    }
  });

  it('caps results at the limit', () => {
    expect(searchAreas(areas, '0', 8)).toHaveLength(8);
    expect(searchAreas(areas, '0', 3)).toHaveLength(3);
  });

  it('returns nothing for a blank or whitespace query', () => {
    expect(searchAreas(areas, '')).toEqual([]);
    expect(searchAreas(areas, '   ')).toEqual([]);
  });

  it('returns nothing when nothing matches', () => {
    expect(searchAreas(areas, 'zzzzzznope')).toEqual([]);
  });

  it('carries the name through with the code', () => {
    const [hit] = searchAreas(areas, seedCode);
    expect(hit).toEqual({ code: seedCode, name: areas[seedCode].name });
  });
});

describe('findSunnyNear', () => {
  it('finds the cluster around the seed point, nearest first', () => {
    const { nearest, total } = findSunnyNear(areas, latestYear, seed);
    expect(total).toBe(14);
    expect(nearest).toHaveLength(10); // capped
    expect(nearest[0].code).toBe(seedCode);
    expect(nearest[0].distKm).toBeCloseTo(0, 6);

    const dists = nearest.map(n => n.distKm);
    expect([...dists].sort((a, b) => a - b)).toEqual(dists);
  });

  it('only returns areas at or above the sunny threshold', () => {
    const { nearest } = findSunnyNear(areas, latestYear, seed);
    for (const { code } of nearest) {
      expect(areas[code][latestYear].pct).toBeGreaterThanOrEqual(SUNNY_PCT_THRESHOLD);
    }
  });

  it('only returns areas inside the radius', () => {
    const { nearest } = findSunnyNear(areas, latestYear, seed);
    for (const { area } of nearest) {
      expect(haversineKm(seed, area)).toBeLessThanOrEqual(GEO_RADIUS_KM);
    }
  });

  it('returns nothing in open water far from any area', () => {
    const { nearest, total } = findSunnyNear(areas, latestYear, { lat: 0, lon: 0 });
    expect(nearest).toEqual([]);
    expect(total).toBe(0);
  });

  it('honours a wider radius', () => {
    const tight = findSunnyNear(areas, latestYear, seed, { radiusKm: 1 });
    const loose = findSunnyNear(areas, latestYear, seed, { radiusKm: 500 });
    expect(loose.total).toBeGreaterThan(tight.total);
  });

  it('reports the true total even when the returned list is capped', () => {
    const { nearest, total } = findSunnyNear(areas, latestYear, seed, { limit: 3 });
    expect(nearest).toHaveLength(3);
    expect(total).toBe(14);
  });

  it('skips areas with no data for that year', () => {
    const { nearest } = findSunnyNear(areas, latestYear, seed, { radiusKm: 100000 });
    expect(nearest.map(n => n.code)).not.toContain(missingYearCode);
  });
});
