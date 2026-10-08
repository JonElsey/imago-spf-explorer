import type { PaddingOptions } from 'maplibre-gl';

// [west, south, east, north]
type Bounds = [number, number, number, number];

// default view bounds for the map, centred on UK
export const UK_BOUNDS: Bounds = [-8.7, 49.8, 1.8, 60.9];

// max pan/zoom distance. set so that the whole UK will show either on mobile (bounded by height)
// or on desktop (bounded by width).
export const MAX_BOUNDS: Bounds = [-30, 48, 24, 62];

// matches --sidebar-w in style.css
const SIDEBAR_W = 280;

// above the mobile breakpoint in style.css
export function isWide() {
  return window.matchMedia('(min-width: 769px)').matches;
}

// leaves room for the sidebar when it covers the left of the map
export function ukPadding(sidebarOpen: boolean): PaddingOptions {
  return { left: sidebarOpen && isWide() ? SIDEBAR_W : 0 };
}
