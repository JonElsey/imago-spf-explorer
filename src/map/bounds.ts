// [west, south, east, north]
type Bounds = [number, number, number, number];

// default view bounds for the map, centred on UK 
export const UK_BOUNDS: Bounds = [-8.7, 49.8, 1.8, 60.9];

// max pan/zoom distance. set so that the whole UK will show either on mobile (bounded by height)
// or on desktop (bounded by width).
export const MAX_BOUNDS: Bounds = [-30, 48, 24, 62];
