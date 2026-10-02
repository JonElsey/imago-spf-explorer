import { describe, it, expect } from 'vitest';

import { encodeURLState, decodeURLState } from '../app/lib/urlState.js';
import { meta, latestYear } from './fixture.js';

const opts = { years: meta.years, valueMin: meta.value_min, valueMax: meta.value_max };
const base = { selectedCode: null, rangeActive: false, rangeLo: null, rangeHi: null,
               year: latestYear, latestYear };

describe('encodeURLState', () => {
  it('is empty for the default view', () => {
    expect(encodeURLState(base)).toBe('');
  });

  it('omits the year when it is the latest', () => {
    expect(encodeURLState({ ...base, year: latestYear })).not.toContain('year=');
  });

  it('includes the year when it is not the latest', () => {
    expect(encodeURLState({ ...base, year: 2019 })).toBe('year=2019');
  });

  it('includes a selected area', () => {
    expect(encodeURLState({ ...base, selectedCode: 'E01000001' })).toBe('area=E01000001');
  });

  it('includes an active range as lo-hi', () => {
    const qs = encodeURLState({ ...base, rangeActive: true, rangeLo: 60.5, rangeHi: 70.25 });
    expect(qs).toBe('range=60.5-70.25');
  });

  it('omits the range when it is not active, even if bounds linger', () => {
    const qs = encodeURLState({ ...base, rangeActive: false, rangeLo: 60, rangeHi: 70 });
    expect(qs).toBe('');
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
    const qs = encodeURLState({ ...base, selectedCode: 'E01000001' });
    expect(decodeURLState(`?${qs}`, opts).area).toBe('E01000001');
  });

  it('survives a range on a non-latest year', () => {
    const qs = encodeURLState({ ...base, year: 2019, rangeActive: true, rangeLo: 60, rangeHi: 70 });
    const back = decodeURLState(`?${qs}`, opts);
    expect(back.year).toBe(2019);
    expect(back.range).toEqual({ lo: 60, hi: 70 });
  });

  it('restores the latest year as the default when none is encoded', () => {
    const qs = encodeURLState(base);
    expect(decodeURLState(`?${qs}`, opts).year).toBeNull(); // caller keeps the latest
  });
});
