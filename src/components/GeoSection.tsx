// section for geolocation functionality

export function GeoSection() {
  return (
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
  );
}
