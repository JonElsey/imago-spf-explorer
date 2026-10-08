// search input for filtering areas by name or code

import { useEffect, useRef, useState } from 'react';
import { searchAreas } from '../lib/selectors.ts';
import type { AllAreas } from '../lib/types.ts';

type Props = {
  areas: AllAreas;
  onSelect: (code: string) => void;
};

export function AreaSearch({ areas, onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  // ref to the container so we can detect clicks outside of it
  const containerRef = useRef<HTMLDivElement>(null);

  // close if user clicks outside the search box
  useEffect(() => {
    function onDocumentClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('click', onDocumentClick);
    return () => document.removeEventListener('click', onDocumentClick);
  }, []);

  // compute the search results based on the query and whether the search box is open
  const hits = open ? searchAreas(areas, query) : [];

  function select(code: string, name: string) {
    setQuery(name);
    setOpen(false);
    onSelect(code);
  }

  return (
    <div id="search-section">
      <h4>Find an area</h4>
      <div id="search-container" ref={containerRef}>
        {/* show a clear button if there's a query, otherwise show a search icon */}
        <input
          id="search-input"
          type="text"
          placeholder="Search area name or code…"
          autoComplete="off"
          spellCheck={false}
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onKeyDown={e => {
            if (e.key === 'Escape') setOpen(false);
          }}
        />
        {hits.length > 0 && (
          <div id="search-results">
            {hits.map(hit => (
              <button
                key={hit.code}
                type="button"
                className="search-result"
                onClick={() => select(hit.code, hit.name)}
              >
                <span className="search-result-name">{hit.name}</span>
                <span className="search-result-code">{hit.code}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
