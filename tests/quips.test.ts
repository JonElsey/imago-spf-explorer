import { describe, it, expect } from 'vitest';
import { geoMood, pickQuip } from '../src/lib/quips.ts';

const sun = { cloud_cover: 10, is_day: 1 };
const cloud = { cloud_cover: 90, is_day: 1 };
const night = { cloud_cover: 90, is_day: 0 };

describe('geoMood', () => {
  it('compares the weather here with the sunny areas nearby', () => {
    expect(geoMood(sun, [cloud, cloud])).toBe('irony');
    expect(geoMood(sun, [cloud, sun])).toBe('sunny');
    expect(geoMood(cloud, [cloud, cloud])).toBe('cloudy');
    expect(geoMood(cloud, [cloud, sun])).toBe('plain');
  });

  it('ignores missing weather and counts night as neither sunny nor cloudy', () => {
    expect(geoMood(sun, [cloud, null])).toBe('irony');
    expect(geoMood(null, [null, null])).toBe('plain');
    expect(geoMood(night, [night])).toBe('plain');
  });

  it('handles nothing sunny nearby', () => {
    expect(geoMood(sun, [])).toBe('lookOutside');
    expect(geoMood(cloud, [])).toBe('noNearby');
  });
});

describe('pickQuip', () => {
  it('picks from the pool', () => {
    expect(pickQuip('cloudy', () => 0)).toBe('Not a patch of blue sky in sight.');
  });
});
