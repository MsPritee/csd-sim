import {
  createKMap,
  mintermToCell,
  type CellValue,
  type KMapModel,
  withValue,
} from './model'

export interface TruthTable {
  readonly variables: readonly string[]
  /** Outputs indexed by row/minterm (0..2^n - 1). */
  readonly outputs: readonly CellValue[]
}

export interface MintermSpec {
  readonly variables: readonly string[]
  /** Minterms whose cell should be 1. */
  readonly minterms: readonly number[]
  /** Minterms whose cell should be 0. */
  readonly maxterms?: readonly number[]
  /** Minterms that are don't-cares in a given row. */
  readonly dontCares?: readonly number[]
}

export function createTruthTable(
  variables: readonly string[],
  outputs: readonly CellValue[],
): TruthTable {
  const expected = 2 ** variables.length
  if (outputs.length !== expected) {
    throw new RangeError(
      `truth table for ${variables.length} variables needs ${expected} rows, got ${outputs.length}`,
    )
  }
  return { variables: [...variables], outputs: [...outputs] }
}

/**
 * Maps a truth table onto a K-map. The mapping is deterministic:
 * row index (minterm number) → (row, col) cell via the model layout.
 */
export function truthTableToKMap(table: TruthTable): KMapModel {
  let model = createKMap(table.variables)
  table.outputs.forEach((value, minterm) => {
    if (value !== null) model = withValue(model, minterm, value)
  })
  return model
}

export function mintermsToKMap(spec: MintermSpec): KMapModel {
  const { variables, minterms, maxterms, dontCares } = spec
  let model = createKMap(variables)
  for (const m of minterms) model = withValue(model, m, 1)
  for (const m of maxterms ?? []) {
    if (!minterms.includes(m)) model = withValue(model, m, 0)
  }
  for (const m of dontCares ?? []) model = withValue(model, m, 'X')
  return model
}

export function kmapToTruthTable(model: KMapModel): TruthTable {
  const variables = [...model.layout.variables]
  const outputs: CellValue[] = []
  for (const rowCells of model.cells) {
    for (const cell of rowCells) {
      outputs[cell.minterm] = cell.value
    }
  }
  return { variables, outputs }
}

export { mintermToCell }
export type { KMapModel }