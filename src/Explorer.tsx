// main entry point for the app. this has the top-level state and the main layout.

import { useDeferredValue, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import type { MapRef } from 'react-map-gl/maplibre';
import { isPanelView, reducer, restoreURLState, type PanelView, type State } from './state.ts';
import { mapHighlight } from './highlight.ts';
import { encodeURLState } from './lib/urlState.ts';
import type { Dataset } from './lib/types.ts';
import { TopBar } from './components/TopBar.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { AboutDialog } from './components/AboutDialog.tsx';
import { GeoSection } from './components/GeoSection.tsx';
import { AreaSearch } from './components/AreaSearch.tsx';
import { RangeSlider } from './components/RangeSlider.tsx';
import { Legend } from './components/Legend.tsx';
import { InfoPanel } from './components/InfoPanel.tsx';
import { AreaPanel } from './components/AreaPanel.tsx';
import { GeoPanel } from './components/GeoPanel.tsx';
import { MapView } from './map/MapView.tsx';
import { UK_BOUNDS, isWide, ukPadding } from './map/bounds.ts';

// cache in local storage info about whether the user has been prompted
// with the info about how the app works
const ABOUT_SEEN_KEY = 'spf-about-seen';

function aboutSeen() {
  try {
    return localStorage.getItem(ABOUT_SEEN_KEY) !== null;
  } catch {
    return false;
  }
}

function markAboutSeen() {
  try {
    localStorage.setItem(ABOUT_SEEN_KEY, '1');
  } catch {
    // ignore
  }
}

// URL state management. i.e. as the user clicks around, it creates a shareable URL
// that will show that particular area
function writeURLState({ year, view }: State) {
  const qs = encodeURLState({
    year,
    area: view.mode === 'area' ? view.code : null,
    range: view.mode === 'range' ? view.range : null,
  });
  history.replaceState({}, '', `?${qs}`);
}

export function Explorer({ data }: { data: Dataset }) {
  const { years, value_min, value_max } = data.meta;
  const [state, dispatch] = useReducer(reducer, data, d =>
    restoreURLState(d, window.location.search),
  );

  // keep the URL in sync with the state with a short delay
  // so that we can click around without making the URL change each time
  // this can also be used to share a link and then reload the state
  // from that link
  useEffect(() => {
    const timer = setTimeout(() => writeURLState(state), 300);
    return () => clearTimeout(timer);
  }, [state]);

  // sidebar starts open on wide screens, closed on mobile
  const [sidebarOpen, setSidebarOpen] = useState(isWide);
  const [aboutOpen, setAboutOpen] = useState(() => !aboutSeen());

  // the panel's area or results, and their year. kept after the view is cleared so
  // the panel still has something to show while it slides out. updating state
  // during render is React's way of remembering a previous value: it re-renders
  // straight away, before drawing
  const [panel, setPanel] = useState<{ view: PanelView; year: number } | null>(null);
  if (isPanelView(state.view) && (state.view !== panel?.view || state.year !== panel.year)) {
    setPanel({ view: state.view, year: state.year });
  }

  const deferredState = useDeferredValue(state);
  const highlight = useMemo(
    () => mapHighlight(data.areas, deferredState),
    [data.areas, deferredState],
  );

  // ref to the map so we can fly to areas and reset the view
  const mapRef = useRef<MapRef>(null);

  function flyToArea(code: string) {
    const map = mapRef.current;
    if (!map) return;
    const { lat, lon } = data.areas[code];
    map.flyTo({ center: [lon, lat], zoom: Math.max(map.getZoom(), 12), speed: 1.4 });
  }

  // close the sidebar on mobile if the user has selected something
  // so it doesnt block the screen
  function closeDrawerOnMobile() {
    if (!isWide()) setSidebarOpen(false);
  }

  return (
    <div id="app">
      <TopBar
        years={years}
        year={state.year}
        onYearChange={year => dispatch({ type: 'setYear', year })}
        sidebarOpen={sidebarOpen}
        onMenuClick={() => setSidebarOpen(open => !open)}
      />
      <div id="main">
        <Sidebar open={sidebarOpen}>
          <button id="about-btn" className="sidebar-btn" onClick={() => setAboutOpen(true)}>
            About SPF
          </button>
          <GeoSection
            onFound={(origin, label) => {
              dispatch({ type: 'showGeo', origin, label });
              mapRef.current?.flyTo({ center: [origin.lon, origin.lat], zoom: 11, speed: 1.4 });
              closeDrawerOnMobile();
            }}
          />
          <div id="explore-section">
            <h3>Explore the data</h3>
            <AreaSearch
              areas={data.areas}
              onSelect={code => {
                dispatch({ type: 'selectArea', code });
                flyToArea(code);
                closeDrawerOnMobile();
              }}
            />
            <RangeSlider
              valueMin={value_min}
              valueMax={value_max}
              range={state.view.mode === 'range' ? state.view.range : null}
              onRangeChange={range => dispatch({ type: 'setRange', range })}
            />
            <Legend valueMin={value_min} valueMax={value_max} />
          </div>
          <button
            id="reset-btn"
            className="sidebar-btn"
            onClick={() => {
              dispatch({ type: 'clear' });
              mapRef.current?.fitBounds(UK_BOUNDS, { padding: ukPadding(sidebarOpen) });
              closeDrawerOnMobile();
            }}
          >
            Reset view
          </button>
        </Sidebar>
        <MapView
          data={data}
          year={state.year}
          highlight={highlight}
          onAreaClick={code => {
            dispatch({ type: 'clickArea', code });
            closeDrawerOnMobile();
          }}
          mapRef={mapRef}
          initialPadding={ukPadding(sidebarOpen)}
          initialArea={state.view.mode === 'area' ? data.areas[state.view.code] : null}
        />
        <InfoPanel open={isPanelView(state.view)} onClose={() => dispatch({ type: 'clear' })}>
          {panel?.view.mode === 'area' && (
            <AreaPanel data={data} year={panel.year} code={panel.view.code} />
          )}
          {panel?.view.mode === 'geo' && (
            <GeoPanel
              key={`${panel.view.origin.lat},${panel.view.origin.lon},${panel.year}`}
              areas={data.areas}
              year={panel.year}
              origin={panel.view.origin}
              label={panel.view.label}
              onSelect={code => {
                dispatch({ type: 'selectArea', code });
                flyToArea(code);
              }}
            />
          )}
        </InfoPanel>
      </div>
      <AboutDialog
        open={aboutOpen}
        onClose={() => {
          setAboutOpen(false);
          markAboutSeen();
        }}
      />
    </div>
  );
}
