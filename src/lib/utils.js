/** Fisher-Yates shuffle. Returns a new array. */
export function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** One name per line, trimmed, blanks and duplicates removed. */
export const parseNames = (text) => [
  ...new Set(text.split('\n').map((line) => line.trim()).filter(Boolean)),
];

/** Number from form input, forced into [min, max]. Blank/NaN -> min. */
export const clamp = (value, min, max) =>
  Math.min(max, Math.max(min, Math.trunc(Number(value)) || min));

export function ordinal(n) {
  const suffix = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (suffix[(v - 20) % 10] || suffix[v] || suffix[0]);
}
