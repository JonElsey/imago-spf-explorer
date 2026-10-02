// Query string for the current view. The latest year is the default, so it is
// omitted — a bare URL opens on the newest data.
export function encodeURLState({ selectedCode, rangeActive, rangeLo, rangeHi, year, latestYear }) {
  const params = new URLSearchParams();
  if (selectedCode) params.set('area', selectedCode);
  if (rangeActive) params.set('range', `${rangeLo}-${rangeHi}`);
  if (year !== latestYear) params.set('year', year);
  return params.toString();
}

// Parses a query string into the state it names, dropping anything that does
// not validate against the dataset. Area codes are returned as-is; the caller
// checks them against the loaded areas.
export function decodeURLState(search, { years, valueMin, valueMax }) {
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
