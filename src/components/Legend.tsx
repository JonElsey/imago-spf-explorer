// legend for the map, showing the color gradient and min/max values

import { COLOR_STOPS } from '../lib/color.ts';

type Props = { valueMin: number; valueMax: number };

export function Legend({ valueMin, valueMax }: Props) {
  return (
    <div id="legend-section">
      <h4>Legend</h4>
      <div
        id="legend-gradient"
        style={{ background: `linear-gradient(to right, ${COLOR_STOPS.join(', ')})` }}
      />
      <div id="legend-labels">
        <span id="legend-min">{valueMin.toFixed(1)}</span>
        <span id="legend-max">{valueMax.toFixed(1)}</span>
      </div>
      <p className="legend-caption">sunnier &nbsp;·&nbsp; cloudier</p>
    </div>
  );
}