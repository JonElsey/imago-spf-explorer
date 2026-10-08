import { useEffect, useMemo, useState } from 'react';
import { findSunnyNear, GEO_RADIUS_KM } from '../lib/selectors.ts';
import { fetchWeather } from '../lib/weather.ts';
import { geoMood, pickQuip } from '../lib/quips.ts';
import { cloudIcon } from '../lib/format.ts';
import type { AllAreas, GeoPoint, Weather } from '../lib/types.ts';

// results of "find me a sunny place": the nearest sunny areas with live cloud cover

type Props = {
  areas: AllAreas;
  year: number;
  origin: GeoPoint;
  label: string;
  onSelect: (code: string) => void;
};

// weather where you searched and at each result; null where it didn't load
type LiveWeather = { here: Weather | null; nearby: (Weather | null)[] };

export function GeoPanel({ areas, year, origin, label, onSelect }: Props) {
  const { nearest, total } = useMemo(
    () => findSunnyNear(areas, year, origin),
    [areas, year, origin],
  );
  const [weather, setWeather] = useState<LiveWeather | null>(null);
  // one random number per search, so the quip doesn't change on every render
  const [random] = useState(Math.random);

  useEffect(() => {
    let cancelled = false;
    fetchWeather([origin, ...nearest.map(n => n.area)])
      .then(([here, ...nearby]) => {
        if (!cancelled) setWeather({ here, nearby });
      })
      .catch(() => {
        if (!cancelled) setWeather({ here: null, nearby: nearest.map(() => null) });
      });
    return () => {
      cancelled = true;
    };
  }, [origin, nearest]);

  const n = nearest.length;
  const mood = weather && geoMood(weather.here, weather.nearby);

  let caption: string;
  if (!mood) caption = 'Fetching live cloud cover…';
  else if (mood === 'lookOutside')
    caption = `No sunniest-10% areas within ${GEO_RADIUS_KM} km — but look outside:`;
  else if (mood === 'plain')
    caption =
      total > n
        ? `Closest ${n} of ${total} sunniest-10% areas · live cloud cover`
        : `${n} closest sunniest-10% area${n === 1 ? '' : 's'} · live cloud cover`;
  else caption = pickQuip(mood, () => random);

  return (
    <div id="info-geo">
      <h2 id="info-geo-title">
        {n ? `Sunny places near ${label}` : `No sunniest-10% areas near ${label}`}
      </h2>
      <p id="info-geo-sub" className="info-code">
        {caption}
      </p>
      <div id="geo-results">
        {mood === 'lookOutside' && weather?.here && (
          <div className="geo-result-item">
            <span className="geo-result-icon">{cloudIcon(weather.here.cloud_cover, true)}</span>
            <span className="geo-result-info">
              <span className="geo-result-name">It's actually sunny right now</span>
              <span className="geo-result-meta">
                {weather.here.cloud_cover}% cloud · SPF reflects long-run probability, not today's
                forecast
              </span>
            </span>
          </div>
        )}
        {nearest.map(({ code, area, distKm }, i) => {
          const w = weather?.nearby[i];
          const cloud = w
            ? ` · ${w.cloud_cover}% cloud`
            : weather
              ? ' · the meteorologist appears to have lost their way'
              : '';
          return (
            <button key={code} className="geo-result-item" onClick={() => onSelect(code)}>
              <span className="geo-result-icon">
                {w ? cloudIcon(w.cloud_cover, w.is_day === 1) : '—'}
              </span>
              <span className="geo-result-info">
                <span className="geo-result-name">{area.name || code}</span>
                <span className="geo-result-meta">
                  {distKm.toFixed(1)} km{cloud}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
