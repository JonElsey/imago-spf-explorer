// cache in local storage whether the user has asked not to be shown the info
// about how the app works again. only written when they tick "Don't show this
// again", and removed when they untick it
const ABOUT_SEEN_KEY = 'spf-about-seen';

export function aboutSeen() {
  try {
    return localStorage.getItem(ABOUT_SEEN_KEY) !== null;
  } catch {
    return false;
  }
}

export function saveAboutSeen(seen: boolean) {
  try {
    if (seen) localStorage.setItem(ABOUT_SEEN_KEY, '1');
    else localStorage.removeItem(ABOUT_SEEN_KEY);
  } catch {
    // ignore
  }
}
