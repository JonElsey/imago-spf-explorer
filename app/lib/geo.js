export function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Nation from a Nominatim address object, used to pick the regional quip pool.
export function parseCountry(addr = {}) {
  const state = (addr.state || '').toLowerCase();
  if (state.includes('scotland'))         return 'scotland';
  if (state.includes('wales') || state.includes('cymru')) return 'wales';
  if (state.includes('northern ireland')) return 'northern_ireland';
  return 'england';
}
