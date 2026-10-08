// copied pretty much straight over from the original, including all the Claudlish comments 

import type { ValueRange } from './types';

// methods for encoding and decoding the URL query string that represents the current state of the app.
// This allows users to share links that open the app in a specific state, and also enables bookmarking
// and browser navigation.

export type URLState = {
  year: number | null; // The selected year, or null if the latest year is selected
  area: string | null; // The selected area code, or null if no area is selected
  range: ValueRange | null; // The selected value range, or null if no range is selected
};
// Query string for the current view. If it is the latest year, then no
// year parameter is appended as this is the default
export function encodeURLState({ year, area, range }: URLState, latestYear: number): string {
  const params = new URLSearchParams();
  if (area) params.set('area', area);
  if (range) params.set('range', `${range.lo}-${range.hi}`);
  if (year !== null && year !== latestYear) params.set('year', String(year));
  return params.toString();
}

// Parses a query string into the state it names, dropping anything that does
// not validate against the dataset. Area codes are returned as-is; the caller
// checks them against the loaded areas.
export function decodeURLState(
  search: string,
  { years, valueMin, valueMax }: { years: number[]; valueMin: number; valueMax: number },
): URLState {
  const params = new URLSearchParams(search);

  const yearParam = parseInt(params.get('year') || '', 10);
  const year = yearParam && years.includes(yearParam) ? yearParam : null;

  const area = params.get('area') || null;

  let range = null;
  const [loStr, hiStr] = (params.get('range') || '').split('-');
  const lo = parseFloat(loStr);
  const hi = parseFloat(hiStr);
  if (!Number.isNaN(lo) && !Number.isNaN(hi) && lo <= hi && lo >= valueMin && hi <= valueMax) {
    range = { lo, hi };
  }

  return { year, area, range };
}
