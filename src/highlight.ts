// Map highlighting logic.

import { findInRange, findPeers, findSunnyNear } from './lib/selectors.ts';
import type { AllAreas } from './lib/types.ts';
import type { State } from './state.ts';

// encode what the map should highlight for the current state
export type MapHighlight = {
  codes: string[]; // drawn at full strength with a teal outline
  selected: string | null; // drawn with a white outline
  dimmed: boolean; // whether every other area fades back
};

export function mapHighlight(areas: AllAreas, { year, view }: State): MapHighlight {
  const y = `${year}` as const;
  switch (view.mode) {
    case 'idle':
      return { codes: [], selected: null, dimmed: false };
    case 'area': {
      const yd = areas[view.code][y];
      return {
        codes: yd ? findPeers(areas, year, yd.pct) : [],
        selected: view.code,
        dimmed: true,
      };
    }
    case 'range':
      return {
        codes: findInRange(areas, year, view.range.lo, view.range.hi),
        selected: null,
        dimmed: true,
      };
    case 'geo':
      return {
        codes: findSunnyNear(areas, year, view.origin).nearest.map(n => n.code),
        selected: null,
        dimmed: true,
      };
  }
}
