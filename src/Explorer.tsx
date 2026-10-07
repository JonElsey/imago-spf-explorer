import { useReducer } from 'react';
import { reducer } from './state.ts';
import type { Dataset } from './lib/types.ts';
import { TopBar } from './components/TopBar.tsx';
import { Sidebar } from './components/Sidebar.tsx';

export function Explorer({ data }: { data: Dataset }) {
  const { years } = data.meta;
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
        <Sidebar />
        <div id="map" />
      </div>
    </div>
  );
}