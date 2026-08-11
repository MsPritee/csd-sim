import { mintermToTerm } from '../../../../core/boolean'
import { mintermToCell, createKMap } from '../../../../core/kmap'
import type { InputState } from './types'

/**
 * Pure, testable helpers for the educational concept lesson.
 *
 * These intentionally DO NOT re-implement the K-map engine. The minterm term
 * is produced by the shared `mintermToTerm` core primitive, and K-map cell
 * placement reuses the shared `mintermToCell` mapping. Only the maxterm sum
 * form (which has no core convenience yet) is assembled here, and only as
 * simple literal string composition.
 */

/** The decimal minterm number for a given input combination. */
export function inputToMintermNumber(input: InputState): number {
  return input.bits.reduce((acc, bit) => (acc << 1) | bit, 0)
}

/**
 * The minterm product term (SOP) for an input combination.
 * A 0 bit → complemented literal (we need 1 at the AND gate); a 1 bit → kept.
 */
export function mintermFor(input: InputState): string {
  const term = mintermToTerm(input.variables, inputToMintermNumber(input))
  return term.map((literal) => (literal.negated ? `${literal.name}'` : literal.name)).join('')
}

/**
 * The maxterm sum term (POS) for an input combination.
 * The rule is REVERSED vs the minterm: a 1 bit → complemented literal (we need
 * 0 at the OR gate); a 0 bit → kept.
 */
export function maxtermFor(input: InputState): string {
  return input.variables
    .map((variable, index) => {
      const negated = input.bits[index] === 1
      return negated ? `${variable}'` : variable
    })
    .join(' + ')
}

/** All 1s needed at an AND gate to make the minterm true. */
export function andGateInputs(input: InputState): number[] {
  return input.bits.map((bit) => (bit === 0 ? 1 : 1))
}

/** Every 0s needed at an OR gate to make the maxterm false. */
export function orGateInputs(input: InputState): number[] {
  return input.bits.map((bit) => (bit === 1 ? 0 : 0))
}

/** The K-map cell (decimal index) that holds this input combination. */
export function mintermCellFor(input: InputState): number {
  return inputToMintermNumber(input)
}

/** A maxterm shares the same K-map cell index as its minterm number. */
export function maxtermCellFor(input: InputState): number {
  return inputToMintermNumber(input)
}

/** Row/column coordinates of a cell on a 2-variable K-map. */
export function cellCoordinates(minterm: number): { row: number; col: number } {
  return mintermToCell(createKMap(['A', 'B']), minterm)
}

/** Binary string (fixed to the number of variables) for an input combination. */
export function binaryString(input: InputState): string {
  return input.bits.join('')
}