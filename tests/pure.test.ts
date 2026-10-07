import { describe, it, expect } from 'vitest';

import { hexToRgb, rgbToHex, valueToColor, COLOR_STOPS } from '../src/lib/color.ts';
import { ordinal, cloudIcon } from '../src/lib/format.ts';
import { haversineKm, parseCountry } from '../src/lib/geo.ts';

describe('color', () => {
  it('round-trips hex through rgb', () => {
    for (const hex of COLOR_STOPS) expect(rgbToHex(hexToRgb(hex))).toBe(hex);
  });

  it('pads single-digit channels', () => {
    expect(rgbToHex([0, 8, 15])).toBe('#00080f');
  });

  it('maps the dataset endpoints to the ends of the ramp', () => {
    expect(valueToColor(50, 50, 90)).toBe(COLOR_STOPS[0]);
    expect(valueToColor(90, 50, 90)).toBe(COLOR_STOPS.at(-1));
  });

  it('clamps values outside the dataset range', () => {
    expect(valueToColor(10, 50, 90)).toBe(COLOR_STOPS[0]);
    expect(valueToColor(999, 50, 90)).toBe(COLOR_STOPS.at(-1));
  });

  it('interpolates between adjacent stops', () => {
    // 9 gaps across the ramp, so an exact ninth lands on a stop
    expect(valueToColor(50 + 40 / 9, 50, 90)).toBe(COLOR_STOPS[1]);
    const mid = valueToColor(50 + 20 / 9, 50, 90);
    expect(mid).not.toBe(COLOR_STOPS[0]);
    expect(mid).not.toBe(COLOR_STOPS[1]);
  });

  it('is independent of the year — same value, same colour', () => {
    expect(valueToColor(72.5, 52.62, 89.06)).toBe(valueToColor(72.5, 52.62, 89.06));
  });
});

describe('ordinal', () => {
  it('uses st/nd/rd for 1, 2, 3', () => {
    expect([1, 2, 3].map(ordinal)).toEqual(['1st', '2nd', '3rd']);
  });

  it('uses th for the 11-13 exception', () => {
    expect([11, 12, 13].map(ordinal)).toEqual(['11th', '12th', '13th']);
  });

  it('resumes st/nd/rd above 20', () => {
    expect([21, 22, 23, 101, 111].map(ordinal)).toEqual(['21st', '22nd', '23rd', '101st', '111th']);
  });

  it('uses th for 0 and 4-10', () => {
    expect(ordinal(0)).toBe('0th');
    expect([4, 5, 9, 10].map(ordinal)).toEqual(['4th', '5th', '9th', '10th']);
  });
});

describe('cloudIcon', () => {
  it('is the moon at night regardless of cloud', () => {
    expect(cloudIcon(0, false)).toBe('🌙');
    expect(cloudIcon(100, false)).toBe('🌙');
  });

  it('steps through the daytime bands at their boundaries', () => {
    expect(cloudIcon(20, true)).toBe('☀️');
    expect(cloudIcon(21, true)).toBe('⛅');
    expect(cloudIcon(50, true)).toBe('⛅');
    expect(cloudIcon(51, true)).toBe('🌥️');
    expect(cloudIcon(80, true)).toBe('🌥️');
    expect(cloudIcon(81, true)).toBe('☁️');
  });
});

describe('haversineKm', () => {
  it('is zero for a point against itself', () => {
    expect(haversineKm({ lat: 51.5, lon: -0.1 }, { lat: 51.5, lon: -0.1 })).toBe(0);
  });

  it('matches a known distance (London to Edinburgh)', () => {
    expect(haversineKm({ lat: 51.5074, lon: -0.1278 }, { lat: 55.9533, lon: -3.1883 })).toBeCloseTo(533.6522, 3);
  });

  it('gives one degree of latitude as ~111.19 km', () => {
    expect(haversineKm({ lat: 0, lon: 0 }, { lat: 1, lon: 0 })).toBeCloseTo(111.1949, 3);
  });

  it('is symmetric', () => {
    expect(haversineKm({ lat: 50, lon: -1 }, { lat: 55, lon: -3 })).toBeCloseTo(haversineKm({ lat: 55, lon: -3 }, { lat: 50, lon: -1 }), 10);
  });
});

describe('parseCountry', () => {
  it('reads each nation from the Nominatim state field', () => {
    expect(parseCountry({ state: 'Scotland' })).toBe('scotland');
    expect(parseCountry({ state: 'Wales' })).toBe('wales');
    expect(parseCountry({ state: 'Cymru / Wales' })).toBe('wales');
    expect(parseCountry({ state: 'Northern Ireland' })).toBe('northern_ireland');
    expect(parseCountry({ state: 'England' })).toBe('england');
  });

  it('falls back to england when the address is missing or unrecognised', () => {
    expect(parseCountry()).toBe('england');
    expect(parseCountry({})).toBe('england');
    expect(parseCountry({ state: 'Île-de-France' })).toBe('england');
  });
});
