export type StarCounts = { full: number; half: boolean; empty: number };

export function getStarCounts(rating: number): StarCounts {
  const clamped = Math.max(0, Math.min(5, rating));
  const rounded = Math.round(clamped * 2) / 2;
  const full = Math.floor(rounded);
  const half = rounded % 1 !== 0;
  const empty = 5 - full - (half ? 1 : 0);
  return { full, half, empty };
}
