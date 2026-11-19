#!/usr/bin/env bash
set -e

# Run from the repo root with relative paths: tippecanoe records its command line
# in the tiles' metadata, which is published with the site, so absolute paths
# would expose the builder's home directory
cd "$(dirname "${BASH_SOURCE[0]}")/.."
GPKG="data/SPF_LSOA_2023.gpkg"
OUT="tiles/lsoa.pmtiles"

TMP="/tmp/lsoa_boundaries.geojson"

echo "Source: $GPKG"
echo "Output: $OUT"
echo ""

rm -f "$OUT" "$TMP"

echo "Step 1: Reprojecting to WGS84..."
ogr2ogr -f GeoJSON "$TMP" "$GPKG" \
  -t_srs EPSG:4326 \
  -select data_zone_code \
  -nln lsoa

echo "Step 2: Building PMTiles with tippecanoe..."
tippecanoe \
  -o "$OUT" \
  -l lsoa \
  -n lsoa \
  -N "UK small-area boundaries: LSOAs 2021 (England and Wales), Data Zones 2022 (Scotland), Data Zones 2021 (Northern Ireland)" \
  --maximum-zoom=14 \
  --coalesce-densest-as-needed \
  --extend-zooms-if-still-dropping \
  --detect-shared-borders \
  --simplification=10 \
  --include=data_zone_code \
  --force \
  "$TMP"

rm -f "$TMP"
echo ""
echo "Done: $OUT"
ls -lh "$OUT"
