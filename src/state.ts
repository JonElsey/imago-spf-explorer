import { decodeURLState } from './lib/urlState.ts';
import type { Dataset, GeoPoint, ValueRange } from './lib/types.ts';

export type View =
  | { mode: 'idle' }
  | { mode: 'area'; code: string }
  | { mode: 'range'; range: ValueRange }
  | { mode: 'geo'; origin: GeoPoint; label: string };

export type State = { year: number; view: View };

// views shown in the info panel
export type PanelView = Extract<View, { mode: 'area' | 'geo' }>;

export function isPanelView(view: View): view is PanelView {
  return view.mode === 'area' || view.mode === 'geo';
}

export type Action =
  | { type: 'setYear'; year: number }
  | { type: 'clickArea'; code: string } // map click: toggles
  | { type: 'selectArea'; code: string } // search or result click: always selects
  | { type: 'setRange'; range: ValueRange }
  | { type: 'showGeo'; origin: GeoPoint; label: string }
  | { type: 'clear' };

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'setYear':
      if (action.year === state.year) return state;
      return { ...state, year: action.year };
    case 'clickArea':
      if (state.view.mode === 'area' && state.view.code === action.code) {
        return { ...state, view: { mode: 'idle' } };
      }
      return { ...state, view: { mode: 'area', code: action.code } };
    case 'selectArea':
      return { ...state, view: { mode: 'area', code: action.code } };
    case 'setRange':
      return { ...state, view: { mode: 'range', range: action.range } };
    case 'showGeo':
      return { ...state, view: { mode: 'geo', origin: action.origin, label: action.label } };
    case 'clear':
      return { ...state, view: { mode: 'idle' } };
  }
}

// load in state from a URL string so that the map is initialised and
// the correct area displayed. mostly for if a link is shared
export function restoreURLState({ meta, areas }: Dataset, search: string): State {
  const { years, value_min, value_max } = meta;
  const { year, area, range } = decodeURLState(search, {
    years,
    valueMin: value_min,
    valueMax: value_max,
  });

  const state: State = { year: year ?? years[years.length - 1], view: { mode: 'idle' } };

  if (area && Object.hasOwn(areas, area)) return { ...state, view: { mode: 'area', code: area } };
  if (range) return { ...state, view: { mode: 'range', range } };

  return state;
}
