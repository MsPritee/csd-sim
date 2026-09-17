import { cellAt, mintermToCell, type KMapCell, type KMapModel } from './model'
import { hammingDistance } from './gray'

/**
 * Adjacency for a K-map is defined by the Boolean cube, not by the drawing:
 * two cells are adjacent when their minterms differ in exactly one variable
 * (hamming distance 1). On a 2-4 variable flat map this coincides exactly
 * with orthogonally-adjacent grid cells (including the wrap-around edges).
 *
 * For a 5-variable plane model (two stacked 4×4 maps) the grid alone cannot
 * express the topology, since:
 *   - the cell at the same position in the other plane is adjacent (only the
 *     plane variable changes) — this is a third "plane" direction;
 *   - the horizontal wrap-around of each plane is over that plane's 4-column
 *     ring, not over the flattened 8-column grid that joins both planes.
 *
 * All four public functions below therefore operate on the axis indices
 * (row, column-within-plane, plane) derived from the model layout instead of
 * on the flattened grid, keeping every variable count consistent.
 */

export type AdjacencyDirection = 'horizontal' | 'vertical' | 'plane'

export interface Neighbor {
  readonly cell: KMapCell
  readonly direction: AdjacencyDirection
}

function checkBounds(kmap: KMapModel, row: number, col: number): void {
  const { rows, cols } = kmap.layout
  if (row < 0 || row >= rows || col < 0 || col >= cols) {
    throw new RangeError(`cell (${row}, ${col}) is out of bounds`)
  }
}

/** Number of grid columns inside a single plane (the col-axis ring size). */
function planeColCount(kmap: KMapModel): number {
  const { cols, planes } = kmap.layout
  return planes > 1 ? cols / planes : cols
}

interface AxisPosition {
  readonly row: number
  readonly col: number
  readonly plane: number
}

function positionOf(kmap: KMapModel, minterm: number): AxisPosition {
  const { row, col, plane } = mintermToCell(kmap, minterm)
  return { row, col, plane: plane ?? 0 }
}

/**
 * Classifies the adjacency between two minterms by which axis changed.
 * Returns null unless the pair differs in exactly one variable (Gray
 * adjacency invariant). A single flipped variable changes exactly one axis,
 * so the axis comparison is unambiguous.
 */
function directionBetween(
  kmap: KMapModel,
  a: number,
  b: number,
): AdjacencyDirection | null {
  if (hammingDistance(a, b) !== 1) return null
  const pa = positionOf(kmap, a)
  const pb = positionOf(kmap, b)
  if (pa.plane !== pb.plane) return 'plane'
  if (pa.row !== pb.row) return 'vertical'
  return 'horizontal'
}

/**
 * Returns the adjacent cells for the grid position (row, col), including the
 * wrap-around neighbours of each axis and, on plane models, the mirrored cell
 * in the other plane. The position is addressed on the flattened grid (column =
 * plane × plane-width + in-plane column) so it stays compatible with the
 * previous grid-based API, but adjacency itself is derived from the bit cube.
 */
export function neighborsOf(
  kmap: KMapModel,
  row: number,
  col: number,
): Neighbor[] {
  const { rows, cols } = kmap.layout
  checkBounds(kmap, row, col)

  const center = cellAt(kmap, row, col).minterm
  const n = kmap.layout.variables.length
  const colCount = planeColCount(kmap)

  const neighbors: Neighbor[] = []
  for (let bit = 0; bit < n; bit++) {
    const other = center ^ (1 << bit)
    const { row: r, col: c, plane } = positionOf(kmap, other)
    const flatCol = plane * colCount + c
    if (r >= rows || flatCol < 0 || flatCol >= cols) continue
    neighbors.push({
      cell: cellAt(kmap, r, flatCol),
      direction: directionBetween(kmap, center, other)!,
    })
  }
  return neighbors
}

/** True when the two minterms occupy adjacent cells (wrap and cross-plane allowed). */
export function isAdjacent(kmap: KMapModel, a: number, b: number): boolean {
  return adjacencyDirection(kmap, a, b) !== null
}

/**
 * Classifies the adjacency between two minterms as horizontal, vertical, or
 * plane (cross-plane mirror). Returns null when the cells are not adjacent.
 */
export function adjacencyDirection(
  kmap: KMapModel,
  a: number,
  b: number,
): AdjacencyDirection | null {
  return directionBetween(kmap, a, b)
}

/** Adjacent cells (as minterms) for a given minterm. */
export function adjacentMinterms(kmap: KMapModel, minterm: number): number[] {
  const { row, col, plane } = positionOf(kmap, minterm)
  const colCount = planeColCount(kmap)
  return neighborsOf(kmap, row, plane * colCount + col).map((n) => n.cell.minterm)
}

/** Two cells must differ in exactly one variable (Gray adjacency invariant). */
export function differInOneVariable(kmap: KMapModel, a: number, b: number): boolean {
  const variables = kmap.layout.variables.length
  return hammingDistance(a, b) === 1 && a < 2 ** variables && b < 2 ** variables
}

/**
 * Which variables differ (and which stay the same) between two input
 * combinations. This is the educational basis for adjacency: adjacent cells
 * differ in exactly one variable.
 */
export function variableDifference(
  kmap: KMapModel,
  a: number,
  b: number,
): { changing: string[]; constant: string[] } {
  const variables = kmap.layout.variables
  const n = variables.length
  const changing: string[] = []
  const constant: string[] = []
  for (let i = 0; i < n; i++) {
    const shift = n - 1 - i
    const abit = (a >> shift) & 1
    const bbit = (b >> shift) & 1
    ;(abit === bbit ? constant : changing).push(variables[i]!)
  }
  return { changing, constant }
}