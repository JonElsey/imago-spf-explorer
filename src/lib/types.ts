export type GeoPoint = {
  lat: number;
  lon: number;
};

export type YearData = { value: number; pct: number };
export type Area = GeoPoint & {
  name: string;
  [year: `${number}`]: YearData | undefined;
};

export type AllAreas = Record<string, Area>;

export type ValueRange = { lo: number; hi: number };
