// slider to select a range of values to highlight in the map
import type { ValueRange } from '../lib/types.ts';

type Props = {
  valueMin: number;
  valueMax: number;
  range: ValueRange | null;
  onRangeChange: (range: ValueRange) => void;
};

export function RangeSlider({ valueMin, valueMax, range, onRangeChange }: Props) {
  const lo = range?.lo ?? valueMin;
  const hi = range?.hi ?? valueMax;
  const min = Math.floor(valueMin * 10) / 10;
  const max = Math.ceil(valueMax * 10) / 10;
  const clamp = (value: number) => Math.min(Math.max(value, valueMin), valueMax);
  // ensure that sliders dont cross over
  return (
    <div id="range-section">
      <h4>Highlight a value range</h4>
      <div id="range-slider">
        <input
          id="range-lo"
          type="range"
          min={min}
          max={max}
          step={0.1}
          value={lo}
          onChange={e => {
            const value = clamp(Number(e.target.value));
            onRangeChange({ lo: value, hi: Math.max(hi, value) });
          }}
          aria-label="Minimum cloud probability"
        />
        <input
          id="range-hi"
          type="range"
          min={min}
          max={max}
          step={0.1}
          value={hi}
          onChange={e => {
            const value = clamp(Number(e.target.value));
            onRangeChange({ lo: Math.min(lo, value), hi: value });
          }}
          aria-label="Maximum cloud probability"
        />
      </div>
      <p className="range-readout" id="range-readout">
        {lo.toFixed(1)} - {hi.toFixed(1)}
      </p>
    </div>
  );
}
