/**
 * Shared K-map highlight overlay palette (indexed).
 * Kept out of component files so React fast-refresh stays clean.
 */
export const KMAP_HIGHLIGHT_COLORS: readonly string[] = [
  'rgba(167,139,250,0.45)', // violet
  'rgba(96,165,250,0.45)', // blue
  'rgba(74,222,128,0.45)', // green
  'rgba(251,146,60,0.45)', // amber
  'rgba(244,114,182,0.45)', // pink
]

/** Per-group overlay colour: faint fill + neon/dark border. */
export interface KMapGroupColor {
  /** Faint translucent fill for the group's background. */
  readonly fill: string
  /** Neon/dark border colour for the group outline. */
  readonly border: string
}

/**
 * Shared K-map group overlay palette (indexed by group).
 * Each group is drawn with a light pastel fill and a dark neon border,
 * so each group is visually distinct. 8 well-separated hues ensure
 * distinct groups rarely share a colour on a standard 2-6 variable K-map.
 */
export const KMAP_GROUP_COLORS: readonly KMapGroupColor[] = [
  { fill: 'rgba(250,204,21,0.25)', border: '#eab308' },   // yellow
  { fill: 'rgba(244,114,182,0.25)', border: '#ec4899' },   // pink
  { fill: 'rgba(168,139,250,0.25)', border: '#8b5cf6' },   // violet
  { fill: 'rgba(251,146,60,0.25)', border: '#f97316' },    // orange
  { fill: 'rgba(96,165,250,0.25)', border: '#3b82f6' },    // blue
  { fill: 'rgba(74,222,128,0.25)', border: '#22c55e' },    // green
  { fill: 'rgba(248,113,113,0.25)', border: '#ef4444' },   // red
  { fill: 'rgba(34,211,238,0.25)', border: '#06b6d4' },    // cyan
]

/**
 * Split an ascending array of occupied grid indices into maximal contiguous
 * runs. Used to render K-map groups as solid rectangles: a flat contiguous
 * run is a single solid piece, so a group that wraps around a seam (e.g. rows
 * [0,3] or cols [0,3]) yields two solid rectangles — the same style as a
 * regular one-piece group, just split where the map folds.
 * @param sorted ascending unique indices (an empty array returns [])
 * @returns runs such as [1,2,3] => [[1,2,3]] and [0,3] => [[0],[3]]
 */
export function contiguousRuns(sorted: readonly number[]): number[][] {
  if (sorted.length === 0) return []
  const runs: number[][] = []
  let run = [sorted[0]!]
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === sorted[i - 1]! + 1) {
      run.push(sorted[i]!)
    } else {
      runs.push(run)
      run = [sorted[i]!]
    }
  }
  runs.push(run)
  return runs
}