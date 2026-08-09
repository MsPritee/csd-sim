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

export interface KMapLayout {
  readonly variables: readonly string[]
  /** Variables assigned to the row axis (upper bits). */
  readonly rowVariables: readonly string[]
  /** Variables assigned to the column axis (lower bits). */
  readonly colVariables: readonly string[]
  readonly rows: number
  readonly cols: number
  /** Gray-code labels for each grid row. */
  readonly rowLabels: readonly string[]
  /** Gray-code labels for each grid column. */
  readonly colLabels: readonly string[]
  readonly rowGray: readonly number[]
  readonly colGray: readonly number[]
}

export interface KMapModel {
  readonly layout: KMapLayout
  /** Grid of cells indexed [row][col]. */
  readonly cells: ReadonlyArray<ReadonlyArray<KMapCell>>
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

export function mintermToCell(model: KMapModel, minterm: number): { row: number; col: number } {
  const { colVarCount, rowVarCount } = splitVariables(model.layout.variables)
  const colMask = 2 ** colVarCount - 1
  const rowBits = (minterm >> colVarCount) & (2 ** rowVarCount - 1)
  const colBits = minterm & colMask
  return { row: fromGrayCode(rowBits), col: fromGrayCode(colBits) }
}

export function cellToMinterm(model: KMapModel, row: number, col: number): number {
  const { colVarCount } = splitVariables(model.layout.variables)
  return (toGrayCode(row) << colVarCount) | toGrayCode(col)
}

export function createKMap(variables: readonly string[]): KMapModel {
  if (variables.length < 2) {
    throw new RangeError('K-map requires at least 2 variables')
  }
  const { rowVariables, colVariables, rowVarCount, colVarCount } = splitVariables(variables)

  const rows = 2 ** rowVarCount
  const cols = 2 ** colVarCount
  const rowGray: number[] = []
  const colGray: number[] = []
  for (let i = 0; i < rows; i++) rowGray.push(toGrayCode(i))
  for (let j = 0; j < cols; j++) colGray.push(toGrayCode(j))

  const layout: KMapLayout = {
    variables: [...variables],
    rowVariables,
    colVariables,
    rows,
    cols,
    rowLabels: rowGray.map((g) => grayString(g, rowVarCount)),
    colLabels: colGray.map((g) => grayString(g, colVarCount)),
    rowGray,
    colGray,
  }

  const cells: KMapCell[][] = []
  for (let r = 0; r < rows; r++) {
    const rowCells: KMapCell[] = []
    for (let c = 0; c < cols; c++) {
      rowCells.push({
        row: r,
        col: c,
        minterm: cellToMinterm({ layout } as KMapModel, r, c),
        grayRow: rowGray[r]!,
        grayCol: colGray[c]!,
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
  const { row, col } = mintermToCell(model, minterm)
  return cellAt(model, row, col).value
}

export function withValue(model: KMapModel, minterm: number, value: CellValue): KMapModel {
  const { row, col } = mintermToCell(model, minterm)
  const cells = model.cells.map((rowCells, r) =>
    rowCells.map((cell, c) =>
      r === row && c === col ? { ...cell, value } : cell,
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