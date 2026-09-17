import { createKMap, buildAssignment, withValue, simplify, minterms, maxterms, dontCares, type KMapModel, type CellValue, type KMapAxisAssignment } from '../../core/kmap'
import { validateGroup } from '../../core/kmap/grouping'
import { verifySolution, type SolutionVerification, type VerificationOptions } from '../../core/kmap/verification'
import type { KMapAction, KMapMode } from './actions'
import { getModeConfig } from './modes'
import type { KMapExample } from '../../simulators/kmap/examples'

/**
 * Cell value cycle order when a student clicks a cell:
 * empty → 1 → 0 → X (don't-care) → empty.
 */
const CYCLE_ORDER: readonly CellValue[] = [null, 1, 0, 'X'] as const

/**
 * Get the next cell value in the cycle.
 */
export function nextCellValue(current: CellValue): CellValue {
  const index = CYCLE_ORDER.indexOf(current)
  return CYCLE_ORDER[(index + 1) % CYCLE_ORDER.length] ?? null
}

/**
 * Validate and normalize variable names.
 * Ensures variables are single letters and limits to 2-5 variables.
 */
export function validateVariables(variables: readonly string[]): string[] {
  const validated = variables.filter((v) => /^[A-Za-z]$/.test(v)).slice(0, 5)
  if (validated.length < 2) {
    return ['A', 'B']
  }
  return [...validated].slice(0, validated.length)
}

/**
 * Create a K-map with the given variables.
 *
 * A 5-variable K-map is represented as two stacked 4×4 planes. The very first
 * variable is placed on the plane (back) axis and the remaining four on the
 * row/column axes (first two rows, last two columns) — the standard split used
 * by the simulator. Building the plane model here (instead of falling back to
 * a flat 4×8 grid) keeps simplification minimal from the moment the model is
 * created, matching what the simulator renders.
 */
export function createKMapWithVariables(variables: readonly string[]): KMapModel {
  const validated = validateVariables(variables)
  if (validated.length === 5) {
    const [plane, ...rest] = validated
    return createKMap(
      validated,
      buildAssignment([plane!], rest.slice(0, 2), rest.slice(2)),
    )
  }
  return createKMap(validated)
}

/**
 * Set a cell value in a K-map.
 */
export function setCellValue(model: KMapModel, minterm: number, value: CellValue): KMapModel {
  const validMinterms = new Set(model.cells.flat().map((c) => c.minterm))
  if (!validMinterms.has(minterm)) {
    return model
  }
  return withValue(model, minterm, value)
}

/**
 * Cycle a cell value through the standard sequence.
 */
export function cycleCellValue(model: KMapModel, minterm: number): KMapModel {
  const cells = model.cells.flat()
  const current = cells.find((c) => c.minterm === minterm)?.value
  if (current === undefined) {
    return model
  }
  return setCellValue(model, minterm, nextCellValue(current))
}

/**
 * Set K-map values from a truth table array.
 */
export function setFromTruthTable(
  model: KMapModel,
  values: readonly (CellValue | undefined)[]
): KMapModel {
  let next: KMapModel = createKMap([...model.layout.variables])
  values.forEach((value, minterm) => {
    if (value !== undefined) {
      next = withValue(next, minterm, value)
    }
  })
  return next
}

/**
 * Load an example into a K-map.
 */
export function loadExample(example: KMapExample): KMapModel {
  let kmap = createKMap(example.variables)
  example.values.forEach((value: CellValue, minterm: number) => {
    if (value !== null) {
      kmap = withValue(kmap, minterm, value)
    }
  })
  return kmap
}

/**
 * Rebuild a K-map model with a new axis assignment, preserving all existing
 * cell values (indexed by minterm).  Throws if the assignment does not cover
 * exactly the model's variable set — the same validation used by createKMap.
 */
export function applyAssignment(
  model: KMapModel,
  assignment: KMapAxisAssignment,
): KMapModel {
  const variables = [...model.layout.variables]

  // Collect minterm → value for every non-null cell in the current model.
  const values = new Map<number, CellValue>()
  for (const cell of model.cells.flat()) {
    if (cell.value !== null) {
      values.set(cell.minterm, cell.value)
    }
  }

  // createKMap validates the assignment against these variables and throws
  // a RangeError if it does not cover exactly the same variable set.
  let next = createKMap(variables, assignment)

  // Paint the preserved values onto the new layout.
  for (const [minterm, value] of values) {
    next = withValue(next, minterm, value)
  }

  return next
}

/**
 * Simplification result with group information.
 */
export interface SimplificationResult {
  sop: string
  pos: string
  sopGroups: readonly {
    cells: readonly number[]
    productText: string
    sumText: string
  }[]
  posGroups: readonly {
    cells: readonly number[]
    productText: string
    sumText: string
  }[]
}

/**
 * Perform K-map simplification.
 */
export function performSimplification(model: KMapModel): SimplificationResult {
  const ones = new Set(minterms(model))
  const zeros = new Set(maxterms(model))
  const dontCareSet = new Set(dontCares(model))

  const simplification = simplify(model, ones, zeros, dontCareSet)

  return {
    sop: simplification.sop,
    pos: simplification.pos,
    sopGroups: simplification.sopGroups.map((g) => ({
      cells: g.cells,
      productText: g.productText,
      sumText: g.sumText,
    })),
    posGroups: simplification.posGroups.map((g) => ({
      cells: g.cells,
      productText: g.productText,
      sumText: g.sumText,
    })),
  }
}

/**
 * Validate a group of cells.
 */
export function validateCellGroup(model: KMapModel, group: number[]) {
  if (group.length === 0) {
    return null
  }
  return validateGroup(model, group)
}

/**
 * Check if an action is allowed in the current mode.
 */
export function isActionAllowed(action: KMapAction, mode: KMapMode): boolean {
  const config = getModeConfig(mode)

  switch (action.type) {
    case 'HINT_REQUESTED':
      return config.hintsAvailable
    case 'SOLUTION_REVEALED':
      return config.showSolution
    default:
      return true
  }
}

/**
 * Verify a K-map solution for educational purposes.
 * This is the application layer wrapper around the core verification logic.
 */
export function verifyKMapSolution(
  model: KMapModel,
  groups: readonly number[][],
  options?: VerificationOptions
): SolutionVerification {
  return verifySolution(model, groups, options)
}

/**
 * Derive computed values from a K-map model.
 */
export interface KMapDerived {
  ones: readonly number[]
  zeros: readonly number[]
  dontcares: readonly number[]
  unset: readonly number[]
}

export function deriveKMapValues(model: KMapModel): KMapDerived {
  const assigned = new Set<number>()
  for (const cell of model.cells.flat()) {
    if (cell.value !== null) {
      assigned.add(cell.minterm)
    }
  }
  return {
    ones: minterms(model),
    zeros: maxterms(model),
    dontcares: dontCares(model),
    unset: model.cells.flat().map((c) => c.minterm).filter((m) => !assigned.has(m)),
  }
}

/**
 * Parse a comma/space separated list of minterm numbers with `a-b` ranges.
 * Examples: "0,3,7", "0-3, 5", "0 2 4 6". Invalid tokens throw so a wrong
 * map is never silently produced.
 */
export function parseNumberList(text: string): number[] {
  const cleaned = text
    .replace(/[,\s]+/g, ',')
    .replace(/^,|,$/g, '')
  if (cleaned === '') return []

  const out: number[] = []
  for (const token of cleaned.split(',')) {
    const range = /^(\d+)-(\d+)$/.exec(token)
    if (range) {
      const start = Number(range[1])
      const end = Number(range[2])
      if (start > end) {
        throw new RangeError(`invalid range "${token}" (start > end)`)
      }
      for (let m = start; m <= end; m++) out.push(m)
    } else if (/^\d+$/.test(token)) {
      out.push(Number(token))
    } else {
      throw new RangeError(`invalid minterm token "${token}" (expected numbers or a-b ranges)`)
    }
  }
  return [...new Set(out)].sort((a, b) => a - b)
}

function coerceMinterms(variables: readonly string[], mintermsList: number[]): number[] {
  const max = 2 ** variables.length
  const clamped = mintermsList.filter((m) => m >= 0 && m < max)
  return [...new Set(clamped)].sort((a, b) => a - b)
}

/**
 * Build a K-map from a minterm list string. List entries become 1, all other
 * cells become 0, and optional don't-cares become X.
 * Example: parseMinterms(['A','B','C'], "3,5-7") → m3,m5,m6,m7 = 1.
 */
export function parseMinterms(
  variables: readonly string[],
  text: string,
  dontCareText?: string,
): KMapModel {
  const ones = coerceMinterms(variables, parseNumberList(text))
  const dcSet = new Set(coerceMinterms(variables, parseNumberList(dontCareText ?? '')))
  const total = 2 ** variables.length
  const outputs: (CellValue | undefined)[] = Array(total).fill(0)
  for (const m of ones) outputs[m] = 1
  for (const m of dcSet) outputs[m] = 'X'
  return setFromTruthTable(createKMap([...variables]), outputs)
}

/**
 * Build a K-map from a maxterm list string. List entries become 0, all other
 * cells become 1, and optional don't-cares become X.
 * Example: parseMaxterms(['A','B','C'], "0,2") → m0,m2 = 0.
 */
export function parseMaxterms(
  variables: readonly string[],
  text: string,
  dontCareText?: string,
): KMapModel {
  const zeros = coerceMinterms(variables, parseNumberList(text))
  const dcSet = new Set(coerceMinterms(variables, parseNumberList(dontCareText ?? '')))
  const total = 2 ** variables.length
  const outputs: (CellValue | undefined)[] = Array(total).fill(1)
  for (const m of zeros) outputs[m] = 0
  for (const m of dcSet) outputs[m] = 'X'
  return setFromTruthTable(createKMap([...variables]), outputs)
}