import { useState } from 'react';
import { geocode } from '../lib/geocode.ts';
import type { GeoPoint } from '../lib/types.ts';
import { PRIVACY_URL } from '../links.ts';

// "find me a sunny place" part - using location or a place/postcode lookup

// error codes in case something breaks
const LOCATION_ERRORS: Record<number, string> = {
  1: 'Location access was denied.',
  2: 'Location unavailable.',
  3: 'Request timed out.',
};

export function GeoSection({ onFound }: { onFound: (origin: GeoPoint, label: string) => void }) {
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function searchPlace() {
    const q = query.trim();
    if (!q || busy) return;
    setBusy(true);
    setMessage('Searching…');
    try {
      const place = await geocode(q);
      if (!place) {
        setMessage('Place not found — try a different name or postcode.');
        return;
      }
      setMessage('');
      onFound(place, place.name);
    } catch {
      setMessage('Could not search — check your connection.');
    } finally {
      setBusy(false);
    }
  }

  function locate() {
    if (!navigator.geolocation) {
      setMessage('Location is not supported by your browser.');
      return;
    }
    setBusy(true);
    setMessage('Finding your location…');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setBusy(false);
        setMessage('');
        onFound({ lat: coords.latitude, lon: coords.longitude }, 'your location');
      },
      err => {
        setBusy(false);
        setMessage(LOCATION_ERRORS[err.code] ?? 'Could not determine your location.');
      },
      { timeout: 10000 },
    );
  }

  return (
    <div id="geo-section">
      <h3>Find me a sunny place</h3>
      <form
        id="geo-input-row"
        onSubmit={e => {
          e.preventDefault();
          searchPlace();
        }}
      >
        <input
          id="geo-place-input"
          type="text"
          placeholder="Place or postcode…"
          autoComplete="off"
          spellCheck={false}
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <button id="geo-place-btn" className="geo-go-btn" aria-label="Search" disabled={busy}>
          &#8594;
        </button>
      </form>
      <button id="geo-locate-btn" className="sidebar-btn" disabled={busy} onClick={locate}>
        &#128205; Use my location
      </button>
      {message && <p id="geo-msg">{message}</p>}
      {/* says where searches go, at the point the data is sent */}
      <p id="geo-privacy">
        <i>
          Place searches are sent to OpenStreetMap. Both options send an approximate location to
          Open-Meteo.
        </i>{' '}
        <a href={PRIVACY_URL} target="_blank" rel="noopener noreferrer">
          Privacy
        </a>
      </p>
    </div>
  );
}
