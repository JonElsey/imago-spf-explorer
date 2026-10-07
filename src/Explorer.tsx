import { useReducer } from 'react';
import { reducer } from './state.ts';
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

export function Explorer({ data }: { data: Dataset }) {
  const { years, value_min, value_max } = data.meta;
  const [state, dispatch] = useReducer(reducer, {
    year: years[years.length - 1],
    view: { mode: 'idle' },
  });

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
                onSelect={code => dispatch({ type: 'selectArea', code })}
            />
            <RangeSlider />
            <Legend valueMin={value_min} valueMax={value_max} />
          </div>
          <button
            id="reset-btn"
            className="sidebar-btn"
            onClick={() => dispatch({ type: 'clear' })}
          >
            Reset view
          </button>
        </Sidebar>
        <div id="map" />
        {state.view.mode === 'area' && (
        <InfoPanel onClose={() => dispatch({ type: 'clear' })}>
            <AreaPanel data={data} year={state.year} code={state.view.code} />
        </InfoPanel>
        )}
        
      </div>
    </div>
  );
}
