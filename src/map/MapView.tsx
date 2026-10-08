import { useEffect, useMemo, useRef, useState, type Ref } from 'react';
import Map, {
  AttributionControl,
  Layer,
  NavigationControl,
  Source,
  useMap,
  type MapLayerMouseEvent,
  type MapRef,
} from 'react-map-gl/maplibre';
import type {
  ExpressionSpecification,
  FilterSpecification,
  Map as MaplibreMap,
  PaddingOptions,
} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './maplibre.ts';
import { COLOUR_STOPS } from '../lib/colour.ts';
import type { Dataset, GeoPoint } from '../lib/types.ts';
import type { MapHighlight } from '../highlight.ts';
import { MAX_BOUNDS, UK_BOUNDS } from './bounds.ts';

// properties for the map view component
type Props = {
  data: Dataset;
  year: number;
  highlight: MapHighlight;
  onAreaClick: (code: string) => void;
  mapRef: Ref<MapRef>;
  initialPadding: PaddingOptions;
  initialArea: GeoPoint | null;
};

// openfreemap tiles
const BASEMAP = 'https://tiles.openfreemap.org/styles/dark';
// just show town labels and above (i.e. cities, country labels)
const LABELS_FROM = 'place_town';

const TILES_URL = `pmtiles://${window.location.origin}${import.meta.env.BASE_URL}tiles/lsoa.pmtiles`;

const LSOA = { source: 'lsoa', sourceLayer: 'lsoa' } as const;

// get the fill colour for the map
function fillColour(valueMin: number, valueMax: number): ExpressionSpecification {
  const step = (valueMax - valueMin) / (COLOUR_STOPS.length - 1);
  return [
    'case',
    ['!=', ['feature-state', 'value'], null],
    [
      'interpolate',
      ['linear'],
      ['feature-state', 'value'],
      ...COLOUR_STOPS.flatMap((colour, i) => [valueMin + i * step, colour]),
    ],
    '#44445a',
  ] as ExpressionSpecification;
}

// build a filter to determine which areas to highlight
function codesFilter(codes: string[]): FilterSpecification {
  return codes.length
    ? ['match', ['get', 'data_zone_code'], codes, true, false]
    : ['==', ['get', 'data_zone_code'], ''];
}

// draw labels as white rather than dark since otherwise they dont show up on the
// map properly
function brightenLabels(map: MaplibreMap) {
  const layers = map.getStyle().layers;
  const first = layers.findIndex(layer => layer.id === LABELS_FROM);
  for (const layer of layers.slice(first)) {
    if (layer.type !== 'symbol') continue;
    map.setPaintProperty(layer.id, 'text-color', '#ffffff');
    map.setPaintProperty(layer.id, 'text-halo-color', 'rgba(0, 0, 0, 0.75)');
    map.setPaintProperty(layer.id, 'text-halo-width', 1.5);
  }
}

function YearColours({ data, year }: { data: Dataset; year: number }) {
  const { current: map } = useMap();

  useEffect(() => {
    if (!map) return;
    const y = `${year}` as const;
    for (const [code, area] of Object.entries(data.areas)) {
      map.setFeatureState({ ...LSOA, id: code }, { value: area[y]?.value ?? null });
    }
  }, [map, data, year]);

  return null;
}

export function MapView({
  data,
  year,
  highlight,
  onAreaClick,
  mapRef,
  initialPadding,
  initialArea,
}: Props) {
  const { value_min, value_max } = data.meta;
  const fill = useMemo(() => fillColour(value_min, value_max), [value_min, value_max]);
  // only rebuild the filters if the highlight changes
  const highlightFilter = useMemo(() => codesFilter(highlight.codes), [highlight.codes]);
  const selectedFilter = useMemo(
    () => codesFilter(highlight.selected ? [highlight.selected] : []),
    [highlight.selected],
  );
  const [loaded, setLoaded] = useState(false);
  // area under the cursor
  const hoveredRef = useRef<string | null>(null);
  const [hovering, setHovering] = useState(false);

  function setHovered(map: MaplibreMap, code: string | null) {
    if (code === hoveredRef.current) return;
    if (hoveredRef.current)
      map.setFeatureState({ ...LSOA, id: hoveredRef.current }, { hover: false });
    if (code) map.setFeatureState({ ...LSOA, id: code }, { hover: true });
    hoveredRef.current = code;
    setHovering(code !== null);
  }

  function areaCode(e: MapLayerMouseEvent): string | null {
    const code = e.features?.[0]?.properties?.data_zone_code;
    return typeof code === 'string' ? code : null;
  }

  return (
    <div id="map">
      <Map
        ref={mapRef}
        // start at an area restored from the URL, otherwise the whole UK
        initialViewState={
          initialArea
            ? { longitude: initialArea.lon, latitude: initialArea.lat, zoom: 12 }
            : { bounds: UK_BOUNDS, fitBoundsOptions: { padding: initialPadding } }
        }
        maxBounds={MAX_BOUNDS}
        mapStyle={BASEMAP}
        attributionControl={false}
        style={{ width: '100%', height: '100%' }}
        interactiveLayerIds={['lsoa-fill']}
        cursor={hovering ? 'pointer' : 'grab'}
        onLoad={e => {
          brightenLabels(e.target);
          setLoaded(true);
        }}
        onMouseMove={e => setHovered(e.target, areaCode(e))}
        onMouseLeave={e => setHovered(e.target, null)}
        onClick={e => {
          const code = areaCode(e);
          if (code) onAreaClick(code);
        }}
      >
        <NavigationControl position="top-right" />
        <AttributionControl
          position="bottom-right"
          customAttribution="ONS Open Geography · Imago UKRI"
        />
        <Source id="lsoa" type="vector" url={TILES_URL} promoteId="data_zone_code">
          <Layer
            id="lsoa-fill"
            type="fill"
            source-layer="lsoa"
            beforeId={LABELS_FROM}
            paint={{
              'fill-color': fill,
              'fill-opacity': highlight.dimmed ? 0.35 : 0.92,
              'fill-antialias': false,
            }}
          />
          <Layer
            id="lsoa-highlight"
            type="fill"
            source-layer="lsoa"
            beforeId={LABELS_FROM}
            filter={highlightFilter}
            paint={{ 'fill-color': fill, 'fill-opacity': 0.97, 'fill-antialias': false }}
          />
          <Layer
            id="lsoa-highlight-outline"
            type="line"
            source-layer="lsoa"
            beforeId={LABELS_FROM}
            filter={highlightFilter}
            paint={{
              'line-color': '#03CEA3',
              // no outlines at country scale, where they would hide the fill colours
              'line-width': ['interpolate', ['linear'], ['zoom'], 7, 0, 10, 1.5],
              'line-opacity': 0.9,
            }}
          />
          <Layer
            id="lsoa-selected"
            type="line"
            source-layer="lsoa"
            beforeId={LABELS_FROM}
            filter={selectedFilter}
            paint={{ 'line-color': '#FFFFFF', 'line-width': 2 }}
          />
          <Layer
            id="lsoa-hover"
            type="line"
            source-layer="lsoa"
            beforeId={LABELS_FROM}
            paint={{
              'line-color': '#FF8F42',
              'line-width': ['case', ['boolean', ['feature-state', 'hover'], false], 2, 0],
            }}
          />
        </Source>
        {loaded && <YearColours data={data} year={year} />}
      </Map>
    </div>
  );
}
