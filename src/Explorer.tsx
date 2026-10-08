// main entry point for the app. this has the top-level state and the main layout.

import { useDeferredValue, useMemo, useReducer, useRef, useState } from 'react';
import type { MapRef } from 'react-map-gl/maplibre';
import { reducer } from './state.ts';
import { mapHighlight } from './highlight.ts';
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
    // storage blocked: nothing to remember
  }
}

export function Explorer({ data }: { data: Dataset }) {
  const { years, value_min, value_max } = data.meta;
  const [state, dispatch] = useReducer(reducer, {
    year: years[years.length - 1],
    view: { mode: 'idle' },
  });

  // sidebar starts open on wide screens, closed on mobile
  const [sidebarOpen, setSidebarOpen] = useState(isWide);
  const [aboutOpen, setAboutOpen] = useState(() => !aboutSeen());
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
            }}
          />
          <div id="explore-section">
            <h3>Explore the data</h3>
            <AreaSearch
              areas={data.areas}
              onSelect={code => {
                dispatch({ type: 'selectArea', code });
                flyToArea(code);
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
            }}
          >
            Reset view
          </button>
        </Sidebar>
        <MapView
          data={data}
          year={state.year}
          highlight={highlight}
          onAreaClick={code => dispatch({ type: 'clickArea', code })}
          mapRef={mapRef}
          initialPadding={ukPadding(sidebarOpen)}
        />
        {state.view.mode === 'area' && (
          <InfoPanel onClose={() => dispatch({ type: 'clear' })}>
            <AreaPanel data={data} year={state.year} code={state.view.code} />
          </InfoPanel>
        )}
        {state.view.mode === 'geo' && (
          <InfoPanel onClose={() => dispatch({ type: 'clear' })}>
            <GeoPanel
              key={`${state.view.origin.lat},${state.view.origin.lon}`}
              areas={data.areas}
              year={state.year}
              origin={state.view.origin}
              label={state.view.label}
              onSelect={code => {
                dispatch({ type: 'selectArea', code });
                flyToArea(code);
              }}
            />
          </InfoPanel>
        )}
      </div>
      {/* outside the sidebar, which is inert while closed */}
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
