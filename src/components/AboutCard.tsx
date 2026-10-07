import { useState } from 'react';

export function AboutCard() {
  const [open, setOpen] = useState(false);

  return (
    <div id="about-section">
      <button
        id="about-toggle"
        aria-expanded={open}
        aria-controls="about-content"
        onClick={() => setOpen(o => !o)}
      >
        About SPF
        <span id="about-chevron" aria-hidden="true">&#9662;</span>
      </button>
      {open && (
        <div id="about-content">
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
            Click any area on the map for its detail, find an area by name or
            code, use &ldquo;Find me a sunny place&rdquo; to search near a
            place, postcode or your location, or drag the value-range slider
            to highlight areas within a chosen band.
          </p>
        </div>
      )}
    </div>
  );
}