// types relating to geographies
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

// value range for filtering areas
export type ValueRange = { lo: number; hi: number };

// data about the dataset itself, used for validation and UI
export type Dataset = { meta: Meta; areas: AllAreas };
export type Meta = {
  years: number[];
  value_min: number;
  value_max: number;
  generated: string;
  value_col: string;
  code_col: string;
};

// current weather from open-meteo
export type Weather = { cloud_cover: number; is_day: number };
