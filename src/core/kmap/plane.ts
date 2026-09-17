import { fromGrayCode, grayString, toGrayCode } from './gray'

/**
 * Plane-first 5-variable K-map layout (standalone reference module).
 *
 * The single rule this module implements:
 *
 *   **Whichever variable is chosen as the plane variable becomes the MSB.**
 *
 * The variable order used for minterm numbering is therefore `[planeVar, ...rows, ...cols]`
 * (plane variable first = highest bit). Consequently:
 *
 *   - plane 0 always holds plane-first minterms `0 .. 15`
 *   - plane 1 always holds plane-first minterms `16 .. 31`
 *
 * regardless of which of the five variables is the plane variable. The grid is
 * auto-derived from the layout for inspection: rows and columns come from the
 * remaining variables (first two rows, last two columns by default) labelled
 * with standard Gray codes.
 *
 * This module is intentional self-contained and does NOT depend on `model.ts`:
 * it exists so the plane shape can be verified in isolation ("create plane
 * first"). Wire it into a `KMapModel` only once the layout is approved.
 */

export interface PlaneCell {
  readonly plane: number
  readonly row: number
  readonly col: number
  /** Minterm in plane-first numbering (plane variable = MSB). */
  readonly minterm: number
}

export interface KMapPlaneLayout {
  /** The user's canonical variable ordering (e.g. `['A','B','C','D','E']`). */
  readonly variables: readonly string[]
  /** The chosen plane variable (always the MSB in `order`). */
  readonly planeVariable: string
  /** Plane-first order: `[planeVar, ...rowVars, ...colVars]`. index 0 = MSB. */
  readonly order: readonly string[]
  readonly rowVariables: readonly string[]
  readonly colVariables: readonly string[]
  readonly rows: number
  readonly cols: number
  readonly planes: number
  /** Gray-code labels for each grid row. */
  readonly rowLabels: readonly string[]
  /** Gray-code labels for each grid column. */
  readonly colLabels: readonly string[]
}

export interface PlanePosition {
  readonly plane: number
  readonly row: number
  readonly col: number
}

const PATTERN = /^[A-Za-z][A-Za-z0-9]*$/

function requireValidVariables(variables: readonly string[], planeVariable: string): void {
  const seen = new Set<string>()
  for (const v of variables) {
    if (typeof v !== 'string' || !PATTERN.test(v)) {
      throw new RangeError(`invalid variable name '${String(v)}'`)
    }
    if (seen.has(v)) {
      throw new RangeError(`duplicate variable '${v}'`)
    }
    seen.add(v)
  }
  if (variables.length < 2) {
    throw new RangeError('a plane K-map needs at least 2 variables')
  }
  if (variables.length > 5) {
    throw new RangeError('a plane K-map supports at most 5 variables')
  }
  if (!variables.includes(planeVariable)) {
    throw new RangeError(`plane variable '${planeVariable}' is not one of the map variables`)
  }
}

/**
 * Builds a plane-first layout for the given variables and plane variable.
 *
 * @param variables     canonical variable order (plane variable is re-ordered to the MSB).
 * @param planeVariable which variable separates the two planes.
 * @param options       optional `rowCount` (1..2) to override the default
 *                      `floor(remaining / 2)` row split.
 */
export function buildPlaneLayout(
  variables: readonly string[],
  planeVariable: string,
  options?: { rowCount?: number },
): KMapPlaneLayout {
  requireValidVariables(variables, planeVariable)

  const remaining = variables.filter((v) => v !== planeVariable)
  const rowCount =
    options?.rowCount ?? Math.max(1, Math.floor(remaining.length / 2))
  if (!Number.isInteger(rowCount) || rowCount < 1 || rowCount > 2) {
    throw new RangeError('rowCount must be 1 or 2')
  }
  if (rowCount >= remaining.length) {
    throw new RangeError('rowCount leaves no column variables')
  }

  const rowVariables = remaining.slice(0, rowCount)
  const colVariables = remaining.slice(rowCount)

  const order = [planeVariable, ...rowVariables, ...colVariables]
  const rows = 2 ** rowCount
  const cols = 2 ** colVariables.length

  return {
    variables: [...variables],
    planeVariable,
    order,
    rowVariables: [...rowVariables],
    colVariables: [...colVariables],
    rows,
    cols,
    planes: 2,
    rowLabels: Array.from({ length: rows }, (_, i) => grayString(toGrayCode(i), rowCount)),
    colLabels: Array.from({ length: cols }, (_, i) =>
      grayString(toGrayCode(i), colVariables.length),
    ),
  }
}

/** Largest bit index (0 = LSB) occupied by `variable` in `order`. */
function bitOf(order: readonly string[], variable: string): number {
  return order.length - 1 - order.indexOf(variable)
}

/** Places `toGray(axisIndex)` across `axisVariables` as a minterm bitmask. */
function grayBitsAt(
  axisVariables: readonly string[],
  order: readonly string[],
  axisIndex: number,
): number {
  const gray = toGrayCode(axisIndex)
  let bits = 0
  const k = axisVariables.length
  for (let j = 0; j < k; j++) {
    const bit = bitOf(order, axisVariables[j]!)
    if (((gray >> (k - 1 - j)) & 1) === 1) bits |= 1 << bit
  }
  return bits
}

/** Reads an axis's gray-coded field out of a plane-first minterm. */
function axisIndexFrom(
  axisVariables: readonly string[],
  order: readonly string[],
  minterm: number,
): number {
  let value = 0
  const k = axisVariables.length
  for (let j = 0; j < k; j++) {
    const bit = bitOf(order, axisVariables[j]!)
    if (((minterm >> bit) & 1) === 1) value |= 1 << (k - 1 - j)
  }
  return fromGrayCode(value)
}

/**
 * Minterm (plane-first) of the cell at `(row, col)` in `plane`.
 * The plane variable is the MSB, so plane 1 cells are += `1 << (n - 1)`.
 */
export function planeCellMinterm(
  layout: KMapPlaneLayout,
  row: number,
  col: number,
  plane: number,
): number {
  return (
    grayBitsAt([layout.planeVariable], layout.order, plane) |
    grayBitsAt(layout.rowVariables, layout.order, row) |
    grayBitsAt(layout.colVariables, layout.order, col)
  )
}

/** Inverse of `planeCellMinterm`: locates a plane-first minterm on the grid. */
export function planePosition(layout: KMapPlaneLayout, minterm: number): PlanePosition {
  const plane = axisIndexFrom([layout.planeVariable], layout.order, minterm)
  const row = axisIndexFrom(layout.rowVariables, layout.order, minterm)
  const col = axisIndexFrom(layout.colVariables, layout.order, minterm)
  return { plane, row, col }
}

/**
 * The full minterm grid of one plane (`0` or `1`), indexed `[row][col]`,
 * in plane-first numbering — useful to eyeball the plane shape directly.
 */
export function planeGrid(
  layout: KMapPlaneLayout,
  plane: number,
): number[][] {
  return Array.from({ length: layout.rows }, (_, row) =>
    Array.from({ length: layout.cols }, (_, col) =>
      planeCellMinterm(layout, row, col, plane),
    ),
  )
}

/** All grid cells of the layout (plane-major), in plane-first numbering. */
export function planeCells(layout: KMapPlaneLayout): readonly PlaneCell[] {
  const cells: PlaneCell[] = []
  for (let plane = 0; plane < layout.planes; plane++) {
    for (let row = 0; row < layout.rows; row++) {
      for (let col = 0; col < layout.cols; col++) {
        cells.push({ plane, row, col, minterm: planeCellMinterm(layout, row, col, plane) })
      }
    }
  }
  return cells
}

/**
 * Re-expresses a minterm under the plane-first order (plane variable = MSB).
 * Values are preserved per variable; only the bit slots change.
 */
export function canonicalToPlaneSpace(layout: KMapPlaneLayout, minterm: number): number {
  const n = layout.order.length
  let out = 0
  for (let i = 0; i < n; i++) {
    const name = layout.order[i]!
    const canonicalBit = bitOf(layout.variables, name)
    if (((minterm >> canonicalBit) & 1) === 1) out |= 1 << (n - 1 - i)
  }
  return out
}

/** Inverse of `canonicalToPlaneSpace`: back to the user's canonical ordering. */
export function planeSpaceToCanonical(layout: KMapPlaneLayout, minterm: number): number {
  const n = layout.variables.length
  let out = 0
  for (let i = 0; i < n; i++) {
    const name = layout.variables[i]!
    const planeBit = bitOf(layout.order, name)
    if (((minterm >> planeBit) & 1) === 1) out |= 1 << (n - 1 - i)
  }
  return out
}