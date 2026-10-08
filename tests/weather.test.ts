import { afterEach, describe, it, expect, vi } from 'vitest';
import { fetchWeather } from '../src/lib/weather.ts';

const sun = { cloud_cover: 10, is_day: 1 };
const cloud = { cloud_cover: 90, is_day: 1 };

// replace the browser's fetch with one that returns `body`
function stubFetch(body: unknown) {
  const fetch = vi.fn(async (_url: string) => new Response(JSON.stringify(body)));
  vi.stubGlobal('fetch', fetch);
  return fetch;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('fetchWeather', () => {
  it('sends every point, rounded to 2 dp, in one request', async () => {
    const fetch = stubFetch([{ current: sun }, { current: cloud }]);
    const weather = await fetchWeather([
      { lat: 51.51147, lon: -0.130783 },
      { lat: 53.478767, lon: -2.228027 },
    ]);
    expect(fetch).toHaveBeenCalledTimes(1);
    const url = new URL(fetch.mock.calls[0][0]);
    expect(url.searchParams.get('latitude')).toBe('51.51,53.48');
    expect(url.searchParams.get('longitude')).toBe('-0.13,-2.23');
    expect(weather).toEqual([sun, cloud]);
  });

  it('handles the single reply for one point', async () => {
    stubFetch({ current: sun });
    expect(await fetchWeather([{ lat: 51.5, lon: -0.1 }])).toEqual([sun]);
  });
});
