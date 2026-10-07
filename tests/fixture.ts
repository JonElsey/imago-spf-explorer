import { readFileSync } from 'node:fs';

// A 54-area subset of the real dataset spanning all four nation prefixes, with
// a 14-area sunny cluster around _test.seedCode and one area (_test.
// missingYearCode) deliberately lacking the latest year.
export const fixture = JSON.parse(
  readFileSync(new URL('./fixtures/spf-data.sample.json', import.meta.url), 'utf-8'),
);

export const areas = fixture.areas;
export const meta = fixture.meta;
export const testMeta = fixture._test;
export const latestYear = meta.years.at(-1);
