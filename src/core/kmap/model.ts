import { fromGrayCode, grayString, toGrayCode } from './gray'

export type CellValue = 0 | 1 | 'X' | null

export interface KMapCell {
  /** Grid row index (0-based, gray-code order). */
  readonly row: number
  /** Grid column index (0-based, gray-code order). */
  readonly col: number
  /** Minterm (decimal) represented by this cell. */
  readonly minterm: number
  /** Gray-code value of the row label. */
  readonly grayRow: number
  /** Gray-code value of the column label. */
  readonly grayCol: number
  readonly value: CellValue
}

/**
 * The structural axes of a K-map. Each variable belongs to exactly one axis.
 * When a 'plane' axis is present the map renders as a stack of planes; row and
 * col axes always exist.
 */
export type AxisKind = 'plane' | 'row' | 'col'

export interface KMapAxis {
  readonly kind: AxisKind
  readonly variables: readonly string[]
  /** Number of positions along this axis: 2^variables.length. */
  readonly size: number
}

export interface KMapAxisAssignment {
  readonly axes: readonly KMapAxis[]
}

export interface KMapLayout {
  readonly variables: readonly string[]
  /**
   * Explicit axis assignment. This is the single source of truth for how a
   * minterm's bits map on to the grid: for each axis, `toGray(axisIndex)` is
   * written at that axis's variables' canonical bit positions.
   */
  readonly axes: readonly KMapAxis[]
  /** Variables assigned to the row axis (upper bits). */
  readonly rowVariables: readonly string[]
  /** Variables assigned to the column axis (lower bits). */
  readonly colVariables: readonly string[]
  /** Variables assigned to the plane axis (empty unless a plane is used). */
  readonly planeVariables: readonly string[]
  readonly rows: number
  readonly cols: number
  /** Number of plane-axis values (1 when no plane axis is present). */
  readonly planes: number
  /** Gray-code labels for each grid row. */
  readonly rowLabels: readonly string[]
  /** Gray-code labels for each grid column (plane-major when planes > 1). */
  readonly colLabels: readonly string[]
  readonly rowGray: readonly number[]
  readonly colGray: readonly number[]
}

export interface KMapModel {
  readonly layout: KMapLayout
  /** Grid of cells indexed [row][col]. */
  readonly cells: ReadonlyArray<ReadonlyArray<KMapCell>>
}

function makeAxis(kind: AxisKind, variables: readonly string[]): KMapAxis {
  return { kind, variables: [...variables], size: 2 ** variables.length }
}

function splitVariables(variables: readonly string[]) {
  const rowVarCount = Math.floor(variables.length / 2)
  const colVarCount = variables.length - rowVarCount
  return {
    rowVariables: variables.slice(0, rowVarCount),
    colVariables: variables.slice(rowVarCount),
    rowVarCount,
    colVarCount,
  }
}

/** Default assignment mirrors the legacy row/col split (fully backward compatible). */
function defaultAssignment(variables: readonly string[]): KMapAxisAssignment {
  const { rowVariables, colVariables } = splitVariables(variables)
  return {
    axes: [makeAxis('row', rowVariables), makeAxis('col', colVariables)],
  }
}

const VARIABLE_PATTERN = /^[A-Za-z][A-Za-z0-9]*$/

function requireValidAxisVariables(variables: readonly string[], axisName: string): void {
  for (const v of variables) {
    if (typeof v !== 'string' || !VARIABLE_PATTERN.test(v)) {
      throw new RangeError(`invalid variable name '${String(v)}' on the ${axisName} axis`)
    }
  }
}

function validateAssignment(
  axes: readonly KMapAxis[],
  variables: readonly string[],
  origin: 'buildAssignment' | 'createKMap',
): void {
  if (axes.length === 0) throw new RangeError('a K-map axis assignment needs at least one axis')
  if (axes.length > 3) throw new RangeError('a K-map axis assignment can have at most three axes')

  const seen = new Set<string>()
  const kindCount = { plane: 0, row: 0, col: 0 }

  for (const axis of axes) {
    kindCount[axis.kind] += 1
    if (axis.variables.length === 0) {
      throw new RangeError(`the ${axis.kind} axis must contain at least one variable`)
    }
    if (axis.variables.length > 2) {
      throw new RangeError(`the ${axis.kind} axis cannot hold more than 2 variables`)
    }
    for (const v of axis.variables) {
      if (seen.has(v)) {
        throw new RangeError(`variable '${v}' is assigned to more than one axis`)
      }
      seen.add(v)
    }
  }

  if (kindCount.row !== 1 || kindCount.col !== 1) {
    throw new RangeError('a K-map axis assignment needs exactly one row axis and one column axis')
  }
  if (kindCount.plane > 1) {
    throw new RangeError('a K-map axis assignment can have at most one plane axis')
  }

  const totalVars = seen.size
  if (totalVars < 2 || totalVars > 5) {
    throw new RangeError('a K-map axis assignment must cover between 2 and 5 variables')
  }

  for (const axis of axes) {
    requireValidAxisVariables(axis.variables, axis.kind)
  }

  if (origin === 'createKMap') {
    for (const v of variables) {
      if (!seen.has(v)) throw new RangeError(`variable '${v}' is not assigned to any axis`)
    }
    if (seen.size !== variables.length) {
      throw new RangeError('every map variable must be assigned to exactly one axis')
    }
    for (const v of seen) {
      if (!variables.includes(v)) {
        throw new RangeError(`axis variable '${v}' is not one of the map variables`)
      }
    }
  }
}

/**
 * Builds an explicit axis assignment for a K-map.
 *
 * @param planeVars variables stacked into separate planes (input alto/orthogonal
 *   dimension). For 5 variables that is `['E']` (E-plane); optional for 4.
 * @param rowVars  variables laid out along the vertical row axis (upper bits).
 * @param colVars  variables laid out along the horizontal column axis (lower bits).
 * @throws RangeError when a variable appears on more than one axis, an axis
 *   holds more than 2 variables, or no row/col axis is present.
 */
export function buildAssignment(
  planeVars: readonly string[],
  rowVars: readonly string[],
  colVars: readonly string[],
): KMapAxisAssignment {
  if (rowVars.length === 0 || colVars.length === 0) {
    throw new RangeError('a K-map axis assignment needs at least one row and one column variable')
  }
  const axes = [
    ...(planeVars.length > 0 ? [makeAxis('plane', planeVars)] : []),
    makeAxis('row', rowVars),
    makeAxis('col', colVars),
  ]
  validateAssignment(axes, [...planeVars, ...rowVars, ...colVars], 'buildAssignment')
  return { axes }
}

/**
 * Canonical bit position (0 = LSB of the minterm) of a variable in a list.
 * Variables read MSB-first (= variables[0] occupies the highest bit), matching
 * the `variableDifference` convention used elsewhere.
 */
function bitPosition(allVariables: readonly string[], variable: string): number {
  return allVariables.length - 1 - allVariables.indexOf(variable)
}

/**
 * Re-express a minterm under a different variable ordering (a permutation of
 * the same variable set). Both orderings are MSB-first: variables[0] owns the
 * highest bit and variables[last] the lowest. The value of each variable is
 * preserved; only the bit slot assigned to each variable changes. Used to
 * render a canonical model through a plane-first numbering (plane variable as
 * the MSB) without mutating the model itself.
 */
export function translateMinterm(
  minterm: number,
  fromOrder: readonly string[],
  toOrder: readonly string[],
): number {
  if (fromOrder.length !== toOrder.length) {
    throw new RangeError('translateMinterm requires two variable orderings of equal length')
  }
  let translated = 0
  const n = toOrder.length
  for (let i = 0; i < n; i++) {
    const name = toOrder[i]!
    const sourceBit = n - 1 - fromOrder.indexOf(name)
    if (((minterm >> sourceBit) & 1) === 1) {
      translated |= 1 << (n - 1 - i)
    }
  }
  return translated
}

/** Bits of `toGray(axisIndex)` placed at the canonical positions of an axis's variables. */
function axisBitsForIndex(
  axisVars: readonly string[],
  allVariables: readonly string[],
  axisIndex: number,
): number {
  const gray = toGrayCode(axisIndex)
  let bits = 0
  const k = axisVars.length
  for (let j = 0; j < k; j++) {
    if (((gray >> (k - 1 - j)) & 1) === 1) {
      bits |= 1 << bitPosition(allVariables, axisVars[j]!)
    }
  }
  return bits
}

/** Reads an axis's bit-field out of a minterm and returns its (non-gray) index. */
function axisIndexFromMinterm(
  axisVars: readonly string[],
  allVariables: readonly string[],
  minterm: number,
): number {
  let value = 0
  const k = axisVars.length
  for (let j = 0; j < k; j++) {
    const pos = bitPosition(allVariables, axisVars[j]!)
    if (((minterm >> pos) & 1) === 1) value |= 1 << (k - 1 - j)
  }
  return fromGrayCode(value)
}

/** Per-axis indices for a minterm; absent axes stay 0. */
function axesIndicesOf(
  axes: readonly KMapAxis[],
  variables: readonly string[],
  minterm: number,
): { plane: number; row: number; col: number } {
  const out: { plane: number; row: number; col: number } = { plane: 0, row: 0, col: 0 }
  for (const axis of axes) {
    out[axis.kind] = axisIndexFromMinterm(axis.variables, variables, minterm)
  }
  return out
}

/** Composes a minterm by placing every axis's gray-coded index at its variables' bits. */
function mintermFromAxisIndices(
  axes: readonly KMapAxis[],
  variables: readonly string[],
  row: number,
  col: number,
  plane: number,
): number {
  let minterm = 0
  for (const axis of axes) {
    const index = axis.kind === 'row' ? row : axis.kind === 'col' ? col : plane
    minterm |= axisBitsForIndex(axis.variables, variables, index)
  }
  return minterm
}

/** Column size of the col axis (number of grid columns within a single plane). */
function colAxisSize(layout: KMapLayout): number {
  const colAxis = layout.axes.find((axis) => axis.kind === 'col')
  return colAxis?.size ?? layout.cols
}

/**
 * Maps a per-axis column index plus plane index to the flattened grid column
 * used by the `cells` grid (plane-major: higher plane values sit to the right).
 */
function gridColOf(layout: KMapLayout, col: number, plane: number): number {
  if (layout.planes <= 1) return col
  return plane * colAxisSize(layout) + col
}

/**
 * Returns the axis indices for a minterm (single source of truth).
 * `plane` is present only when the layout has a plane axis (planes > 1);
 * single-plane layouts return the plain `{ row, col }` shape.
 */
export function mintermToCell(
  model: KMapModel,
  minterm: number,
): { row: number; col: number; plane?: number } {
  const { plane, row, col } = axesIndicesOf(model.layout.axes, model.layout.variables, minterm)
  if (model.layout.planes <= 1) return { row, col }
  return { row, col, plane }
}

/** Inverse of `mintermToCell`: builds a minterm from grid/axis indices. */
export function cellToMinterm(
  model: KMapModel,
  row: number,
  col: number,
  planeIndex = 0,
): number {
  return mintermFromAxisIndices(model.layout.axes, model.layout.variables, row, col, planeIndex)
}

export function createKMap(
  variables: readonly string[],
  assignment?: KMapAxisAssignment,
): KMapModel {
  if (variables.length < 2) {
    throw new RangeError('K-map requires at least 2 variables')
  }
  if (variables.length > 5) {
    throw new RangeError('K-map supports at most 5 variables')
  }

  const axes = assignment ? [...assignment.axes] : defaultAssignment(variables).axes
  if (assignment) {
    validateAssignment(axes, variables, 'createKMap')
  }

  const rowAxis = axes.find((axis) => axis.kind === 'row')!
  const colAxis = axes.find((axis) => axis.kind === 'col')!
  const planeAxis = axes.find((axis) => axis.kind === 'plane')

  const rowVarCount = rowAxis.variables.length
  const colVarCount = colAxis.variables.length
  const planeVarCount = planeAxis?.variables.length ?? 0

  const rows = 2 ** rowVarCount
  const colSize = 2 ** colVarCount
  const planes = 2 ** planeVarCount
  const cols = colSize * planes

  const rowGray: number[] = []
  const colGray: number[] = []
  for (let i = 0; i < rows; i++) rowGray.push(toGrayCode(i))
  for (let d = 0; d < cols; d++) {
    const plane = planes > 1 ? Math.floor(d / colSize) : 0
    const c = d % colSize
    colGray.push(((toGrayCode(plane) << colVarCount) | toGrayCode(c)) >>> 0)
  }

  const rowVariables = axes.filter((a) => a.kind === 'row').flatMap((a) => a.variables)
  const colVariables = axes.filter((a) => a.kind === 'col').flatMap((a) => a.variables)
  const planeVariables = axes.filter((a) => a.kind === 'plane').flatMap((a) => a.variables)

  const layout: KMapLayout = {
    variables: [...variables],
    axes,
    rowVariables,
    colVariables,
    planeVariables,
    rows,
    cols,
    planes,
    rowLabels: rowGray.map((g) => grayString(g, rowVarCount)),
    colLabels: colGray.map((g) => grayString(g, colVarCount + planeVarCount)),
    rowGray,
    colGray,
  }

  const cells: KMapCell[][] = []
  for (let r = 0; r < rows; r++) {
    const rowCells: KMapCell[] = []
    for (let d = 0; d < cols; d++) {
      const plane = planes > 1 ? Math.floor(d / colSize) : 0
      const c = d % colSize
      rowCells.push({
        row: r,
        col: d,
        minterm: mintermFromAxisIndices(axes, variables, r, c, plane),
        grayRow: rowGray[r]!,
        grayCol: colGray[d]!,
        value: null,
      })
    }
    cells.push(rowCells)
  }

  return { layout, cells }
}

export function cellAt(model: KMapModel, row: number, col: number): KMapCell {
  const cell = model.cells[row]?.[col]
  if (!cell) throw new RangeError(`cell (${row}, ${col}) is out of bounds`)
  return cell
}

export function valueAt(model: KMapModel, minterm: number): CellValue {
  const { row, col, plane } = axesIndicesOf(model.layout.axes, model.layout.variables, minterm)
  return cellAt(model, row, gridColOf(model.layout, col, plane)).value
}

export function withValue(model: KMapModel, minterm: number, value: CellValue): KMapModel {
  const { row, col, plane } = axesIndicesOf(model.layout.axes, model.layout.variables, minterm)
  const d = gridColOf(model.layout, col, plane)
  const cells = model.cells.map((rowCells, r) =>
    rowCells.map((cell, c) =>
      r === row && c === d ? { ...cell, value } : cell,
    ),
  )
  return { layout: model.layout, cells }
}

/** All minterms whose cell currently holds the given value. */
export function mintermsWithValue(model: KMapModel, value: CellValue): number[] {
  const result: number[] = []
  for (const rowCells of model.cells) {
    for (const cell of rowCells) {
      if (cell.value === value) result.push(cell.minterm)
    }
  }
  return result.sort((a, b) => a - b)
}

export function minterms(model: KMapModel): number[] {
  return mintermsWithValue(model, 1)
}

export function maxterms(model: KMapModel): number[] {
  return mintermsWithValue(model, 0)
}

export function dontCares(model: KMapModel): number[] {
  return mintermsWithValue(model, 'X')
}