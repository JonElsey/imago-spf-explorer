import { describe, it, expect } from 'vitest';

import { mapHighlight } from '../src/highlight.ts';
import { findInRange, findPeers } from '../src/lib/selectors.ts';
import { areas, testMeta, latestYear } from './fixture.ts';

const { seedCode, seedLat, seedLon, missingYearCode } = testMeta;

describe('mapHighlight', () => {
  it('highlights nothing when idle', () => {
    expect(mapHighlight(areas, { year: latestYear, view: { mode: 'idle' } })).toEqual({
      codes: [],
      selected: null,
      dimmed: false,
    });
  });

  it('outlines the selected area and highlights its peers', () => {
    const h = mapHighlight(areas, { year: latestYear, view: { mode: 'area', code: seedCode } });
    const pct = areas[seedCode][latestYear].pct;
    expect(h.selected).toBe(seedCode);
    expect(h.codes).toEqual(findPeers(areas, latestYear, pct));
    expect(h.codes).toContain(seedCode);
    expect(h.dimmed).toBe(true);
  });

  it('still selects an area with no data for the year, but highlights no peers', () => {
    const h = mapHighlight(areas, {
      year: latestYear,
      view: { mode: 'area', code: missingYearCode },
    });
    expect(h).toEqual({ codes: [], selected: missingYearCode, dimmed: true });
  });

  it('highlights the areas inside a value range', () => {
    const range = { lo: 60, hi: 70 };
    const h = mapHighlight(areas, { year: latestYear, view: { mode: 'range', range } });
    expect(h.codes).toEqual(findInRange(areas, latestYear, 60, 70));
    expect(h.selected).toBeNull();
  });

  it('highlights the nearest sunny areas for a geo search', () => {
    const h = mapHighlight(areas, {
      year: latestYear,
      view: { mode: 'geo', origin: { lat: seedLat, lon: seedLon }, label: 'Chichester' },
    });
    expect(h.codes).toHaveLength(10);
    expect(h.codes[0]).toBe(seedCode);
    expect(h.selected).toBeNull();
  });
});
