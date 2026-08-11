/**
 * P3 — 5-variable educational representation (Features 22, 23).
 *
 * A 5-variable function A B C D E is shown as two 4-variable planes (E=0 and
 * E=1). This module derives that conceptual breakdown from a 5-variable
 * `KMapModel` (which the existing engine already models as a 2×8 grid),
 * without a second grid algorithm.
 *
 * Interesting five-variable adjacency (a cell in the E=0 plane is adjacent to
 * the mirrored cell in the E=1 plane, plus wrap-around within each plane) is
 * computed here and explained. The interactive single-grid editor UI remains
 * 4-variable (see report limitation); this provides the educational view.
 */

import { minterms, maxterms, dontCares, valueAt, type KMapModel } from './model'
import { mintermToString } from '../boolean/terms'

export const FIVE_VARIABLES = ['A', 'B', 'C', 'D', 'E'] as const

export interface FiveVarCell {
  readonly minterm: number
  readonly e: 0 | 1
  readonly abcd: number
  readonly binary: string
  readonly value: 0 | 1 | 'X' | null
}

export interface FiveVarAnalysis {
  readonly variables: readonly string[]
  readonly eVar: string
  readonly totalCells: number
  /** Cells grouped by E plane, ordered by their 4-variable minterm. */
  readonly planeE0: readonly FiveVarCell[]
  readonly planeE1: readonly FiveVarCell[]
  /** Pairs of cells that sit in the same position across planes. */
  readonly crossPlaneAdjacencies: readonly { readonly low: number; readonly high: number }[]
  readonly ones: readonly number[]
  readonly zeros: readonly number[]
  readonly dontCares: readonly number[]
  /** Four-variable plane labels. */
  readonly planeLabel: string
}

export function isFiveVariable(model: KMapModel): boolean {
  return model.layout.variables.length === 5
}

/** Assert that a model actually uses 4+1 variables; else a clear error. */
export function requireFive(model: KMapModel): void {
  if (!isFiveVariable(model)) {
    throw new RangeError(
      `Five-variable analysis needs 5 variables, got ${model.layout.variables.length}.`,
    )
  }
}

/** Split a 5-variable minterm into the E bit and the 4-variable value. */
export function splitFive(minterm: number): { e: 0 | 1; abcd: number } {
  const e = ((minterm >> 4) & 1) as 0 | 1
  const abcd = minterm & 0x0f
  return { e, abcd }
}

export function analyzeFiveVariable(model: KMapModel): FiveVarAnalysis {
  requireFive(model)
  const total = 32
  const cells: FiveVarCell[] = Array.from({ length: total }, (_, m) => {
    const { e, abcd } = splitFive(m)
    return {
      minterm: m,
      e,
      abcd,
      binary: m.toString(2).padStart(5, '0'),
      value: valueAt(model, m),
    }
  })

  const planeOf = (e: 0 | 1) =>
    cells.filter((c) => c.e === e).sort((a, b) => a.abcd - b.abcd)

  // Corresponding cells (same abcd) across the two planes become adjacent.
  const crossPlaneAdjacencies = Array.from({ length: 16 }, (_, abcd) => ({
    low: abcd,
    high: 16 + abcd,
  }))

  const ones = minterms(model).sort((a, b) => a - b)
  const zeros = maxterms(model).sort((a, b) => a - b)
  const dc = dontCares(model).sort((a, b) => a - b)

  return {
    variables: [...model.layout.variables],
    eVar: model.layout.variables[4] ?? 'E',
    totalCells: total,
    planeE0: planeOf(0),
    planeE1: planeOf(1),
    crossPlaneAdjacencies,
    ones,
    zeros,
    dontCares: dc,
    planeLabel: `(the two possible values of ${model.layout.variables[4] ?? 'E'})`,
  }
}

/** Describe an E=0 / E=1 cell breakdown for the education view. */
export function fiveVarExplanation(analysis: FiveVarAnalysis): string[] {
  const ones0 = analysis.planeE0.filter((c) => c.value === 1).length
  const ones1 = analysis.planeE1.filter((c) => c.value === 1).length
  return [
    `A 5-variable K-map is shown as two 4-variable maps — one for each value of ${analysis.eVar}.`,
    `${analysis.eVar} = 0 map: ${ones0} cell${ones0 === 1 ? '' : 's'} hold 1.`,
    `${analysis.eVar} = 1 map: ${ones1} cell${ones1 === 1 ? '' : 's'} hold 1.`,
    'A cell in the top map is adjacent to the cell in the same grid position in the bottom map, because only E changes between them.',
    'Adjacency within each map (including wrap-around across its edges) works exactly as in a 4-variable K-map.',
  ]
}

/** The 4-variable product term label for a plane (ABCD), used for grouping. */
export function planeFourVarTerm(variables: readonly string[], abcd: number): string {
  const base = ['A', 'B', 'C', 'D'].slice(0, Math.min(variables.length, 4))
  const term = Array.from({ length: 4 }, (_, i) => {
    const bit = (abcd >> (3 - i)) & 1
    const name = base[i] ?? `X${i}`
    return bit === 0 ? `${name}'` : name
  })
  return term.join('')
}

export function fiveVarOnMinterms(variables: readonly string[], ones: readonly number[]): string {
  return ones.map((m) => mintermToString(variables, m)).join(' + ') || '0'
}

export { mintermToString }