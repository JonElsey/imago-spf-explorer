import { describe, it, expect } from 'vitest';

import { reducer, restoreURLState, type State } from '../src/state.ts';
import { fixture } from './fixture.ts';

const idle: State = { year: 2025, view: { mode: 'idle' } };
const area: State = { year: 2025, view: { mode: 'area', code: 'E01000001' } };
const range: State = { year: 2025, view: { mode: 'range', range: { lo: 60, hi: 70 } } };
const geo: State = {
  year: 2025,
  view: { mode: 'geo', origin: { lat: 51.5, lon: -0.1 }, label: 'London' },
};

describe('setYear', () => {
  it('changes the year and keeps the view', () => {
    const next = reducer(area, { type: 'setYear', year: 2019 });
    expect(next.year).toBe(2019);
    expect(next.view).toBe(area.view);
  });

  it('returns the same state when the year is unchanged', () => {
    expect(reducer(area, { type: 'setYear', year: 2025 })).toBe(area);
  });
});

describe('clickArea', () => {
  it('selects an area', () => {
    expect(reducer(idle, { type: 'clickArea', code: 'E01000002' }).view).toEqual({
      mode: 'area',
      code: 'E01000002',
    });
  });

  it('deselects the area that is already selected', () => {
    expect(reducer(area, { type: 'clickArea', code: 'E01000001' }).view).toEqual({ mode: 'idle' });
  });

  it('switches to a different area', () => {
    expect(reducer(area, { type: 'clickArea', code: 'E01000002' }).view).toEqual({
      mode: 'area',
      code: 'E01000002',
    });
  });

  it('replaces a range highlight', () => {
    expect(reducer(range, { type: 'clickArea', code: 'E01000002' }).view).toEqual({
      mode: 'area',
      code: 'E01000002',
    });
  });
});

describe('selectArea', () => {
  it('keeps an already-selected area selected', () => {
    expect(reducer(area, { type: 'selectArea', code: 'E01000001' }).view).toEqual({
      mode: 'area',
      code: 'E01000001',
    });
  });

  it('replaces geo results', () => {
    expect(reducer(geo, { type: 'selectArea', code: 'E01000002' }).view).toEqual({
      mode: 'area',
      code: 'E01000002',
    });
  });
});

describe('setRange', () => {
  it('replaces an area selection', () => {
    expect(reducer(area, { type: 'setRange', range: { lo: 55, hi: 65 } }).view).toEqual({
      mode: 'range',
      range: { lo: 55, hi: 65 },
    });
  });
});

describe('showGeo', () => {
  it('replaces a range highlight', () => {
    const origin = { lat: 50.7, lon: -0.8 };
    expect(reducer(range, { type: 'showGeo', origin, label: 'Chichester' }).view).toEqual({
      mode: 'geo',
      origin,
      label: 'Chichester',
    });
  });
});

describe('clear', () => {
  it('returns to idle and keeps the year', () => {
    expect(reducer(geo, { type: 'clear' })).toEqual({ year: 2025, view: { mode: 'idle' } });
  });
});

describe('year', () => {
  it('is kept when the view changes', () => {
    expect(reducer(idle, { type: 'selectArea', code: 'E01000001' }).year).toBe(2025);
  });
});

describe('restoreURLState', () => {
  it('starts idle in the latest year with no query', () => {
    expect(restoreURLState(fixture, '')).toEqual({ year: 2025, view: { mode: 'idle' } });
  });

  it('restores the year, area and range the URL names', () => {
    expect(restoreURLState(fixture, '?area=E01031526&year=2020')).toEqual({
      year: 2020,
      view: { mode: 'area', code: 'E01031526' },
    });
    expect(restoreURLState(fixture, '?range=60-70').view).toEqual({
      mode: 'range',
      range: { lo: 60, hi: 70 },
    });
  });

  it('ignores area codes that are not in the data', () => {
    expect(restoreURLState(fixture, '?area=E99999999').view).toEqual({ mode: 'idle' });
    expect(restoreURLState(fixture, '?area=constructor').view).toEqual({ mode: 'idle' });
  });
});
