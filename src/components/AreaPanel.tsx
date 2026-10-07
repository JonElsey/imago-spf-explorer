import { useMemo } from 'react';
import { findPeers, PEER_PCT_BAND } from '../lib/selectors.ts';
import { ordinal } from '../lib/format.ts';
import { valueToColor } from '../lib/color.ts';
import type { Dataset } from '../lib/types.ts';

type Props = {
  data: Dataset;
  year: number;
  code: string;
};

export function AreaPanel({ data, year, code }: Props) {
  const { areas, meta } = data;
  const area = areas[code];
  const yd = area[`${year}`];

  // only compute the peer count if we have a valid year data object and the inputs change
  const peerCount = useMemo(
    () => (yd ? findPeers(areas, year, yd.pct).length : 0),
    [areas, year, yd],
  );

  return (
    <div id="info-area">
      <h2 id="info-name">{area.name}</h2>
      <p id="info-code" className="info-code">{code}</p>
      <div className="info-stat">
        <span className="info-stat-label">Cloud probability</span>
        <span id="info-value" className="info-stat-value">
          {yd ? yd.value.toFixed(1) : '—'}
        </span>
      </div>
      <div className="info-stat">
        <span className="info-stat-label" id="info-pct-label">
          Percentile rank (UK, {meta.years[0]}–{meta.years[meta.years.length - 1]})
        </span>
        <span
          id="info-pct"
          className="info-stat-value"
          style={yd ? { color: valueToColor(yd.value, meta.value_min, meta.value_max) } : undefined}
        >
          {yd ? `${ordinal(yd.pct)} percentile` : '—'}
        </span>
      </div>
      {yd && (
        <p className="info-peers-note" id="info-peers-note">
          {peerCount.toLocaleString()} areas within ±{PEER_PCT_BAND} percentile nationally
        </p>
      )}
    </div>
  );
}