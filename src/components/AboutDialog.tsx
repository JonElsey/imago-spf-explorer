import { useEffect, useRef } from 'react';

// popup about the app shown on first visit, can be re-opened from the sidebar 

export function AboutDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog ref={ref} id="about-dialog" aria-labelledby="about-title" onClose={onClose}>
      <h2 id="about-title">About SPF</h2>
      <p>
        SPF (Sun Probability Framework) estimates how likely each small area in the UK is to be
        sunny rather than cloudy, based on long-run satellite cloud-cover records rather than a
        short-term forecast. Values run 0&ndash;100: low means more sun, high means more cloud.
      </p>
      <p>
        The map colours every area for the year selected at the top. Colours stay consistent across
        years because they're scaled against the sunniest and cloudiest values in the whole dataset,
        not just the selected year &mdash; so genuine year-to-year change is visible rather than
        masked by rescaling. Percentile rank shows how an area compares to every other area
        nationally, across all years.
      </p>
      <p>
        Click any area on the map for its detail, find an area by name or code, use &ldquo;Find me a
        sunny place&rdquo; to search near a place, postcode or your location, or drag the
        value-range slider to highlight areas within a chosen band.
      </p>
      <form method="dialog">
        <button className="sidebar-btn">Got it</button>
      </form>
    </dialog>
  );
}
