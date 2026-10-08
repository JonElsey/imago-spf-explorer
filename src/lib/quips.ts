import type { Weather } from './types.ts';

type QuipPool = 'sunny' | 'cloudy' | 'irony' | 'noNearby';

const QUIPS: Record<QuipPool, string[]> = {
  // sunny where you searched
  sunny: [
    'Look outside! Actual sunshine.',
    "Blimey, it's sunny. Get out there.",
    'Quick — before it changes.',
    "It's sunny. Don't waste it.",
    'Would you look at that. Blue sky.',
    'Go on. Out you go.',
  ],
  // every sunny area nearby is under cloud
  cloudy: [
    'Not a patch of blue sky in sight.',
    'Overcast from coast to coast.',
    'Not exactly the Algarve, is it?',
    'Right then. Perhaps try the Canaries instead.',
    "Well. At least it isn't raining. Probably.",
    'Solid grey. Some call this summer.',
    'No sun to be found. Classic.',
  ],
  // sunny where you searched, cloudy at every sunny area nearby
  irony: [
    "You've got the sun — your top picks haven't. Swings and roundabouts.",
    "You're in the clear while the sunniest spots nearby are under cloud. SPF's just an average.",
    "Funny — you're sunny, they're not. Make of that what you will.",
  ],
  // no sunny areas within range
  noNearby: [
    'No sunniest-10% spots within 10 km. You may need to relocate.',
    'Nothing in the sunniest 10% nearby. Might be time to move.',
    'Not a sunny area in sight.',
    'No sunny spots within 10 km. The clouds are thorough today.',
    'No luck nearby. What did you expect?',
  ],
};

export type GeoMood = QuipPool | 'lookOutside' | 'plain';

function isSunny(w: Weather | null) {
  return w !== null && w.is_day === 1 && w.cloud_cover <= 30;
}

function isCloudy(w: Weather) {
  return w.is_day === 1 && w.cloud_cover >= 75;
}

// mood depending on whether the weather wherever you are is sunny or cloudy
export function geoMood(here: Weather | null, nearby: (Weather | null)[]): GeoMood {
  if (nearby.length === 0) return isSunny(here) ? 'lookOutside' : 'noNearby';
  const known = nearby.filter(w => w !== null);
  const allCloudy = known.length > 0 && known.every(isCloudy);
  if (isSunny(here)) return allCloudy ? 'irony' : 'sunny';
  return allCloudy ? 'cloudy' : 'plain';
}

// random quip
export function pickQuip(pool: QuipPool, random = Math.random): string {
  const quips = QUIPS[pool];
  return quips[Math.floor(random() * quips.length)];
}
