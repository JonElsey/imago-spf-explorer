export function ordinal(n) {
  const rem100 = n % 100;
  if (rem100 >= 11 && rem100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1: return `${n}st`;
    case 2: return `${n}nd`;
    case 3: return `${n}rd`;
    default: return `${n}th`;
  }
}

export function cloudIcon(cloud, isDay) {
  if (!isDay) return '🌙';
  if (cloud <= 20) return '☀️';
  if (cloud <= 50) return '⛅';
  if (cloud <= 80) return '🌥️';
  return '☁️';
}
