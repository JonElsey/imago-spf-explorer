export function Sidebar() {
  return (
    <aside id="sidebar">
      <div id="sidebar-handle" role="button" aria-label="Toggle sidebar" />

      <div id="about-section">
        <button id="about-toggle" aria-expanded={false} aria-controls="about-content">
          About SPF
          <span id="about-chevron" aria-hidden="true">&#9662;</span>
        </button>
        <div id="about-content" className="hidden">
          <p>
            SPF (Sun Probability Framework) estimates how likely each small area
            in the UK is to be sunny rather than cloudy, based on long-run
            satellite cloud-cover records rather than a short-term forecast.
            Values run 0&ndash;100: low means more sun, high means more cloud.
          </p>
          <p>
            The map colours every area for the year selected at the top.
            Colours stay consistent across years because they're scaled
            against the sunniest and cloudiest values in the whole dataset,
            not just the selected year &mdash; so genuine year-to-year change
            is visible rather than masked by rescaling. Percentile rank shows
            how an area compares to every other area nationally, across all
            years.
          </p>
          <p>
            Click any area on the map for its detail, search by name or
            postcode, use &ldquo;Find me a sunny place&rdquo; to search near
            your location, or drag the value-range slider to highlight areas
            within a chosen band.
          </p>
        </div>
      </div>

      <div id="geo-section">
        <h3>Find me a sunny place</h3>
        <div id="geo-input-row">
          <input
            id="geo-place-input"
            type="text"
            placeholder="Place or postcode…"
            autoComplete="off"
            spellCheck={false}
          />
          <button id="geo-place-btn" className="geo-go-btn" aria-label="Search">&#8594;</button>
        </div>
        <button id="geo-locate-btn" className="sidebar-btn">&#128205; Use my location</button>
        <p id="geo-msg" />
      </div>

      <div id="explore-section">
        <h3>Explore the data</h3>

        <div id="search-section">
          <h4>Find an area</h4>
          <div id="search-container">
            <input
              id="search-input"
              type="text"
              placeholder="Search area name or code…"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
        </div>

        <div id="range-section">
          <h4>Highlight a value range</h4>
          <div id="range-slider">
            <input id="range-lo" type="range" aria-label="Minimum cloud probability" />
            <input id="range-hi" type="range" aria-label="Maximum cloud probability" />
          </div>
          <p className="range-readout" id="range-readout" />
        </div>

        <div id="legend-section">
          <h4>Legend</h4>
          <div id="legend-gradient" />
          <div id="legend-labels">
            <span id="legend-min" />
            <span id="legend-max" />
          </div>
          <p className="legend-caption">sunnier &nbsp;·&nbsp; cloudier</p>
        </div>
      </div>

      <button id="reset-btn" className="sidebar-btn">Reset view</button>
    </aside>
  );
}
