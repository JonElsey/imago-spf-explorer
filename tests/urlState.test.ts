import { describe, it, expect } from 'vitest';

import { encodeURLState, decodeURLState } from '../src/lib/urlState.ts';
import { meta, latestYear } from './fixture.ts';

const opts = { years: meta.years, valueMin: meta.value_min, valueMax: meta.value_max };
const base = { year: latestYear, area: null, range: null };

describe('encodeURLState', () => {
  it('always includes the year, even the latest', () => {
    expect(encodeURLState(base)).toBe(`year=${latestYear}`);
    expect(encodeURLState({ ...base, year: 2019 })).toBe('year=2019');
  });

  it('includes a selected area', () => {
    expect(encodeURLState({ ...base, area: 'E01000001' })).toBe(
      `area=E01000001&year=${latestYear}`,
    );
  });

  it('includes an active range as lo-hi', () => {
    const qs = encodeURLState({ ...base, range: { lo: 60.5, hi: 70.25 } });
    expect(qs).toBe(`range=60.5-70.25&year=${latestYear}`);
  });
});

describe('decodeURLState', () => {
  it('returns nulls for an empty query', () => {
    expect(decodeURLState('', opts)).toEqual({ year: null, area: null, range: null });
  });

  it('accepts a year in the dataset and rejects one outside it', () => {
    expect(decodeURLState('?year=2019', opts).year).toBe(2019);
    expect(decodeURLState('?year=1999', opts).year).toBeNull();
    expect(decodeURLState('?year=banana', opts).year).toBeNull();
  });

  it('passes the area code through for the caller to validate', () => {
    expect(decodeURLState('?area=E01000001', opts).area).toBe('E01000001');
  });

  it('accepts a range inside the dataset bounds', () => {
    expect(decodeURLState('?range=60-70', opts).range).toEqual({ lo: 60, hi: 70 });
  });

  it('rejects a reversed range', () => {
    expect(decodeURLState('?range=70-60', opts).range).toBeNull();
  });

  it('rejects a range outside the dataset bounds', () => {
    expect(decodeURLState('?range=0-70', opts).range).toBeNull();
    expect(decodeURLState('?range=60-9999', opts).range).toBeNull();
  });

  it('rejects a malformed range', () => {
    expect(decodeURLState('?range=', opts).range).toBeNull();
    expect(decodeURLState('?range=abc-def', opts).range).toBeNull();
    expect(decodeURLState('?range=60', opts).range).toBeNull();
  });
});

describe('round trip', () => {
  it('survives an area selection', () => {
    const qs = encodeURLState({ ...base, area: 'E01000001' });
    expect(decodeURLState(`?${qs}`, opts).area).toBe('E01000001');
  });

  it('survives a range on a non-latest year', () => {
    const qs = encodeURLState({ ...base, year: 2019, range: { lo: 60, hi: 70 } });
    const back = decodeURLState(`?${qs}`, opts);
    expect(back.year).toBe(2019);
    expect(back.range).toEqual({ lo: 60, hi: 70 });
  });

  it('keeps the latest year', () => {
    const qs = encodeURLState(base);
    expect(decodeURLState(`?${qs}`, opts).year).toBe(latestYear);
  });
});
