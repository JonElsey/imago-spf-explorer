import { describe, it, expect } from 'vitest';
import { maxBoundsFor, UK_BOUNDS } from '../src/map/bounds.ts';

const [ukWest, ukSouth, ukEast, ukNorth] = UK_BOUNDS;

describe('maxBoundsFor', () => {
  it('always contains the whole UK', () => {
    for (const [w, h, inset] of [
      [375, 760, 0],
      [812, 323, 280],
      [1280, 748, 280],
      [1920, 1000, 280],
    ]) {
      const [west, south, east, north] = maxBoundsFor(w, h, inset);
      expect(west).toBeLessThan(ukWest);
      expect(south).toBeLessThan(ukSouth);
      expect(east).toBeGreaterThan(ukEast);
      expect(north).toBeGreaterThan(ukNorth);
    }
  });

  it('leaves little room to pan sideways on a phone', () => {
    const [west, , east] = maxBoundsFor(375, 760);
    expect(west).toBeGreaterThan(ukWest - 1);
    expect(east).toBeLessThan(ukEast + 1);
  });

  it('adds the area under the sidebar on the west', () => {
    const withSidebar = maxBoundsFor(1280, 748, 280);
    const besideIt = maxBoundsFor(1000, 748);
    expect(withSidebar[2]).toBeCloseTo(besideIt[2]);
    expect(withSidebar[0]).toBeLessThan(besideIt[0]);
  });
});
