// slider to select a range of values to highlight in the map

export function RangeSlider() {
  return (
    <div id="range-section">
      <h4>Highlight a value range</h4>
      <div id="range-slider">
        <input id="range-lo" type="range" aria-label="Minimum cloud probability" />
        <input id="range-hi" type="range" aria-label="Maximum cloud probability" />
      </div>
      <p className="range-readout" id="range-readout" />
    </div>
  );
}
