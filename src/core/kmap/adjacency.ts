import { cellAt, mintermToCell, type KMapCell, type KMapModel } from './model'
import { hammingDistance } from './gray'

export type AdjacencyDirection = 'horizontal' | 'vertical'

export interface Neighbor {
  readonly cell: KMapCell
  readonly direction: AdjacencyDirection
}

function cellOf(kmap: KMapModel, minterm: number): { row: number; col: number } {
  return mintermToCell(kmap, minterm)
}

function checkBounds(kmap: KMapModel, row: number, col: number): void {
  const { rows, cols } = kmap.layout
  if (row < 0 || row >= rows || col < 0 || col >= cols) {
    throw new RangeError(`cell (${row}, ${col}) is out of bounds`)
  }
}

/**
 * Returns the adjacent cells for grid position (row, col), including
 * wrap-around neighbors (last row ↔ first row, last col ↔ first col).
 */
export function neighborsOf(
  kmap: KMapModel,
  row: number,
  col: number,
): Neighbor[] {
  const { rows, cols } = kmap.layout
  checkBounds(kmap, row, col)

  const left: Neighbor = { cell: cellAt(kmap, row, (col - 1 + cols) % cols), direction: 'horizontal' }
  const right: Neighbor = { cell: cellAt(kmap, row, (col + 1) % cols), direction: 'horizontal' }
  const up: Neighbor = { cell: cellAt(kmap, (row - 1 + rows) % rows, col), direction: 'vertical' }
  const down: Neighbor = { cell: cellAt(kmap, (row + 1) % rows, col), direction: 'vertical' }
  return [left, right, up, down]
}

/** True when the two minterms occupy adjacent grid cells (wrap allowed). */
export function isAdjacent(kmap: KMapModel, a: number, b: number): boolean {
  return adjacencyDirection(kmap, a, b) !== null
}

/**
 * Classifies the adjacency between two minterms as horizontal or vertical.
 * Returns null when the cells are not adjacent.
 */
export function adjacencyDirection(
  kmap: KMapModel,
  a: number,
  b: number,
): AdjacencyDirection | null {
  const { row: ra, col: ca } = cellOf(kmap, a)
  const { row: rb, col: cb } = cellOf(kmap, b)

  if (ra === rb) {
    const diff = Math.abs(ca - cb)
    const isAdjacent = diff === 1 || (kmap.layout.cols > 2 && diff === kmap.layout.cols - 1)
    return isAdjacent ? 'horizontal' : null
  }
  if (ca === cb) {
    const diff = Math.abs(ra - rb)
    const isAdjacent = diff === 1 || (kmap.layout.rows > 2 && diff === kmap.layout.rows - 1)
    return isAdjacent ? 'vertical' : null
  }
  return null
}

/** Adjacent cells (as minterms) for a given minterm. */
export function adjacentMinterms(kmap: KMapModel, minterm: number): number[] {
  const { row, col } = cellOf(kmap, minterm)
  return neighborsOf(kmap, row, col).map((n) => n.cell.minterm)
}

/** Two cells must differ in exactly one variable (Gray adjacency invariant). */
export function differInOneVariable(kmap: KMapModel, a: number, b: number): boolean {
  const variables = kmap.layout.variables.length
  return hammingDistance(a, b) === 1 && a < 2 ** variables && b < 2 ** variables
}