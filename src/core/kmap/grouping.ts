import { cellAt, cellToMinterm, mintermToCell, type KMapModel } from './model'

export type Group = readonly number[]

export type GroupIssueKind =
  | 'not-power-of-two'
  | 'non-rectangular'
  | 'non-adjacent'
  | 'contains-zero'
  | 'empty'
  | 'out-of-bounds'

export interface GroupIssue {
  readonly kind: GroupIssueKind
  readonly message: string
}

export interface GroupValidation {
  readonly valid: boolean
  readonly issues: readonly GroupIssue[]
}

export function isPowerOfTwo(n: number): boolean {
  return Number.isInteger(n) && n > 0 && (n & (n - 1)) === 0
}

export function groupSize(cells: Group): number {
  return new Set(cells).size
}

function uniqueSorted(values: readonly number[]): number[] {
  return [...new Set(values)].sort((a, b) => a - b)
}

/** True when the set of indices forms a contiguous block on a ring of `size`. */
function isCyclicContiguous(indices: readonly number[], size: number): boolean {
  const sorted = uniqueSorted(indices)
  if (sorted.length === 1 || sorted.length === size) return true
  const gaps: number[] = []
  for (let i = 0; i < sorted.length - 1; i++) {
    gaps.push(sorted[i + 1]! - sorted[i]!)
  }
  gaps.push(sorted[0]! + size - sorted[sorted.length - 1]!)
  return gaps.filter((gap) => gap > 1).length === 1
}

/** Rows and columns occupied by a group (axis indices within a single plane). */
export function occupiedAxes(
  kmap: KMapModel,
  cells: Group,
): { rows: number[]; cols: number[] } {
  const { rows, cols } = occupiedAxesIncludingPlanes(kmap, cells)
  return { rows, cols }
}

/** Per-axis index sets of a group: row, column-within-plane, and plane. */
function occupiedAxesIncludingPlanes(
  kmap: KMapModel,
  cells: Group,
): { rows: number[]; cols: number[]; planes: number[] } {
  const rows = new Set<number>()
  const cols = new Set<number>()
  const planes = new Set<number>()
  for (const m of cells) {
    const { row, col, plane } = mintermToCell(kmap, m)
    rows.add(row)
    cols.add(col)
    planes.add(plane ?? 0)
  }
  return {
    rows: [...rows].sort((a, b) => a - b),
    cols: [...cols].sort((a, b) => a - b),
    planes: [...planes].sort((a, b) => a - b),
  }
}

/** Number of columns within a single plane (the col-axis ring size). */
function planeColCount(kmap: KMapModel): number {
  const { cols, planes } = kmap.layout
  return planes > 1 ? cols / planes : cols
}

/**
 * True when the group is exactly the Cartesian product of a cyclic-contiguous
 * power-of-two block on each axis: rows × columns(within plane) × planes.
 * This is the uniform definition of a valid K-map group for every topology:
 * on a flat map the plane block is the single plane; on a 5-variable plane map
 * it also accepts groups that mirror across the two 4×4 maps (the plane
 * variable is eliminated) as well as groups wrapping inside one plane.
 */
function isSubcube(kmap: KMapModel, group: Group): boolean {
  const seen = new Set(group)
  const { rows, cols, planes } = occupiedAxesIncludingPlanes(kmap, group)

  const rowOk =
    isPowerOfTwo(rows.length) && isCyclicContiguous(rows, kmap.layout.rows)
  const colOk =
    isPowerOfTwo(cols.length) && isCyclicContiguous(cols, planeColCount(kmap))
  const planeOk =
    isPowerOfTwo(planes.length) && isCyclicContiguous(planes, kmap.layout.planes)
  if (!rowOk || !colOk || !planeOk) return false

  // The group must be the FULL cube of these axis blocks (no missing cells).
  for (const p of planes) {
    for (const r of rows) {
      for (const c of cols) {
        if (!seen.has(cellToMinterm(kmap, r, c, p))) return false
      }
    }
  }
  return true
}

/**
 * Structural validation of a K-map group:
 * - every cell must exist in the map,
 * - the group must be a power of two (1, 2, 4, 8, 16...),
 * - the group must be rectangular with power-of-two sides,
 * - the rectangle must be contiguous including wrap-around edges.
 */
export function validateGroup(kmap: KMapModel, group: Group): GroupValidation {
  const issues: GroupIssue[] = []
  const seen = new Set(group)

  if (group.length === 0) {
    return {
      valid: false,
      issues: [{ kind: 'empty', message: 'Groups must contain at least one cell.' }],
    }
  }

  const totalCells = kmap.layout.rows * kmap.layout.cols
  for (const m of seen) {
    if (m < 0 || m >= totalCells) {
      issues.push({ kind: 'out-of-bounds', message: `Cell ${m} is outside this K-map.` })
    }
  }
  if (issues.length > 0) return { valid: false, issues }

  const size = seen.size
  if (!isPowerOfTwo(size)) {
    issues.push({
      kind: 'not-power-of-two',
      message: `A group of ${size} cells is not allowed. Groups must contain a power of 2: 1, 2, 4, 8, 16...`,
    })
  }

  if (seen.size > 0 && !isSubcube(kmap, group)) {
    issues.push({
      kind: 'non-rectangular',
      message:
        'Cells must form a rectangle — including wrap-around edges and, in a 5-variable map, mirrored cells across the two 4×4 maps — with power-of-2 sides.',
    })
  }

  return { valid: issues.length === 0, issues }
}

/** Validates that none of the grouped cells holds a 0 (SOP grouping rule). */
export function validateSopGroup(kmap: KMapModel, group: Group): GroupValidation {
  const base = validateGroup(kmap, group)
  if (!base.valid) return base

  const issues = [...base.issues]
  for (const m of new Set(group)) {
    const { row, col } = mintermToCell(kmap, m)
    if (cellAt(kmap, row, col).value === 0) {
      issues.push({
        kind: 'contains-zero',
        message: `Cell ${m} holds 0 and cannot be part of a 1-group.`,
      })
    }
  }
  return { valid: issues.length === 0, issues }
}

/** True when the two groups share at least one cell. */
export function groupsOverlap(a: Group, b: Group): boolean {
  const set = new Set(a)
  return b.some((m) => set.has(m))
}

/** Set of all minterms covered by a list of groups. */
export function unionCoverage(groups: readonly Group[]): ReadonlySet<number> {
  const covered = new Set<number>()
  for (const group of groups) for (const m of group) covered.add(m)
  return covered
}

/**
 * A group is redundant if every one of its cells is already covered by the
 * union of the other groups.
 */
export function isRedundant(others: readonly Group[], group: Group): boolean {
  if (group.length === 0) return true
  const covered = unionCoverage(others)
  return [...new Set(group)].every((m) => covered.has(m))
}