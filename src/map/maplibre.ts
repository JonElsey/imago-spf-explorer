import { addProtocol, setWorkerUrl } from 'maplibre-gl';
import { Protocol } from 'pmtiles';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';


// tell maplibre-gl where to find the worker script so it can load in the tiles
setWorkerUrl(workerUrl);

// load pmtiles files - add the protocol so we can do that 
const protocol = new Protocol();
addProtocol('pmtiles', protocol.tile);
