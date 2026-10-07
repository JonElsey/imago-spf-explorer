import { useMemo, useReducer, useRef } from 'react';
import type { MapRef } from 'react-map-gl/maplibre';
import { reducer } from './state.ts';
import { mapHighlight } from './highlight.ts';
import type { Dataset } from './lib/types.ts';
import { TopBar } from './components/TopBar.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { AboutCard } from './components/AboutCard.tsx';
import { GeoSection } from './components/GeoSection.tsx';
import { AreaSearch } from './components/AreaSearch.tsx';
import { RangeSlider } from './components/RangeSlider.tsx';
import { Legend } from './components/Legend.tsx';
import { InfoPanel } from './components/InfoPanel.tsx';
import { AreaPanel } from './components/AreaPanel.tsx';
import { MapView } from './map/MapView.tsx';
import { UK_BOUNDS } from './map/bounds.ts';

export function Explorer({ data }: { data: Dataset }) {
  const { years, value_min, value_max } = data.meta;
  const [state, dispatch] = useReducer(reducer, {
    year: years[years.length - 1],
    view: { mode: 'idle' },
  });
  const highlight = useMemo(() => mapHighlight(data.areas, state), [data.areas, state]);

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
      />
      <div id="main">
        <Sidebar>
          <AboutCard />
          <GeoSection />
          <div id="explore-section">
            <h3>Explore the data</h3>
            <AreaSearch
              areas={data.areas}
              onSelect={code => {
                dispatch({ type: 'selectArea', code });
                flyToArea(code);
              }}
            />
            <RangeSlider />
            <Legend valueMin={value_min} valueMax={value_max} />
          </div>
          <button
            id="reset-btn"
            className="sidebar-btn"
            onClick={() => {
              dispatch({ type: 'clear' });
              mapRef.current?.fitBounds(UK_BOUNDS);
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
        />
        {state.view.mode === 'area' && (
          <InfoPanel onClose={() => dispatch({ type: 'clear' })}>
            <AreaPanel data={data} year={state.year} code={state.view.code} />
          </InfoPanel>
        )}
      </div>
    </div>
  );
}
