import type { GeoPoint, ValueRange } from './lib/types.ts';

export type View =
  | { mode: 'idle' }
  | { mode: 'area'; code: string }
  | { mode: 'range'; range: ValueRange }
  | { mode: 'geo'; origin: GeoPoint; label: string };

export type State = { year: number; view: View };

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
      return { ...state, year: action.year, view: { mode: 'idle' } };
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
