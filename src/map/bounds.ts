import type { PaddingOptions } from 'maplibre-gl';

// [west, south, east, north]
export type Bounds = [number, number, number, number];

// default view bounds for the map, centred on UK
export const UK_BOUNDS: Bounds = [-8.7, 49.8, 1.8, 60.9];

// matches --sidebar-w in style.css
const SIDEBAR_W = 280;

// extra room around the UK when zoomed fully out
const MARGIN = 1.1;

// convert lat/long to the projection (web mercator) used by the map
const toX = (lon: number) => (lon * Math.PI) / 180;
const toLon = (x: number) => (x * 180) / Math.PI;
const toY = (lat: number) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
const toLat = (y: number) => (360 / Math.PI) * Math.atan(Math.exp(y)) - 90;

// max bounds as a function of screen size
export function maxBoundsFor(width: number, height: number, leftInset = 0): Bounds {
  const [west, south, east, north] = UK_BOUNDS;
  const cx = (toX(west) + toX(east)) / 2;
  const cy = (toY(south) + toY(north)) / 2;
  let halfW = ((toX(east) - toX(west)) / 2) * MARGIN;
  let halfH = ((toY(north) - toY(south)) / 2) * MARGIN;
  const aspect = (width - leftInset) / height;
  if (halfW / halfH < aspect) halfW = halfH * aspect;
  else halfH = halfW / aspect;
  const inset = ((2 * halfW) / (width - leftInset)) * leftInset;
  return [toLon(cx - halfW - inset), toLat(cy - halfH), toLon(cx + halfW), toLat(cy + halfH)];
}

// above the mobile breakpoint in style.css
export function isWide() {
  return window.matchMedia('(min-width: 769px)').matches;
}

// drawer instead of sidebar for mobile
export function sidebarInset() {
  return isWide() ? SIDEBAR_W : 0;
}

// leaves room for the sidebar when it covers the left of the map
export function ukPadding(sidebarOpen: boolean): PaddingOptions {
  return { left: sidebarOpen ? sidebarInset() : 0 };
}
