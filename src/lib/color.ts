
type RGB = [number, number, number];



// Ten shades of blue (#1877CF), from pale (sunny, low value) to dark navy
// (cloudy, high value). Lightness steps evenly in OKLCH colour space
export const COLOR_STOPS = [
  '#d8eaff', '#aed4ff', '#83beff', '#52a6ff', '#398fe7',
  '#1e79ce', '#0063b3', '#004f91', '#003b70', '#002950',
];

export function hexToRgb(hex: string): RGB {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHex(rgb: RGB) {
  return '#' + rgb.map(c => Math.round(c).toString(16).padStart(2, '0')).join('');
}

// Maps a raw value to a colour along COLOR_STOPS, normalised against the
// dataset-wide min/max, so a given value renders identically in every year
// rather than shifting with that year's own distribution.
export function valueToColor(value: number, valueMin: number, valueMax: number) {
  const t = Math.min(1, Math.max(0, (value - valueMin) / (valueMax - valueMin)));
  const idx = t * (COLOR_STOPS.length - 1);
  const i0 = Math.floor(idx);
  const i1 = Math.min(i0 + 1, COLOR_STOPS.length - 1);
  const frac = idx - i0;
  const c0 = hexToRgb(COLOR_STOPS[i0]);
  const c1 = hexToRgb(COLOR_STOPS[i1]);
  return rgbToHex(c0.map((v, i) => v + (c1[i] - v) * frac) as RGB);
}
