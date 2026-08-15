import { evaluateGate } from '../gates/evaluate'
import type { Bit } from '../gates/types'

/**
 * Multiplexer / demultiplexer built from gate-engine primitives (LG-09).
 * Selection uses MSB-first encoding (select[0] is the most significant bit),
 * matching the repo's truth-table convention. A `select` of width n addresses
 * 2^n data lines.
 */

function requireWidths(dataCount: number, selectCount: number): void {
  const expected = 2 ** selectCount
  if (dataCount !== expected) {
    throw new RangeError(
      `${selectCount}-bit select addresses ${expected} lines, got ${dataCount}`,
    )
  }
}

/** Target select bits (MSB-first) for data line `index`. */
function selectFor(index: number, width: number): Bit[] {
  const out: Bit[] = []
  for (let j = 0; j < width; j++) out.push(((index >> (width - 1 - j)) & 1) as Bit)
  return out
}

/** Gate-level equality of the live select against a target: 1 iff equal. */
function equalsSelect(select: readonly Bit[], target: readonly Bit[]): Bit {
  const terms = select.map((b, j) => (target[j] === 1 ? b : evaluateGate('NOT', [b])))
  // A single-bit select yields one term; AND needs 2+ inputs, so pass it through.
  return terms.length === 1 ? terms[0]! : evaluateGate('AND', terms)
}

/**
 * Data selector: routes one of `data` onto the single output, chosen by
 * `select`'s binary value. Each data line is AND-ed with its address match
 * (ALL high only on the addressed line) and the results OR-ed together.
 */
export function multiplexer(data: readonly Bit[], select: readonly Bit[]): Bit {
  requireWidths(data.length, select.length)
  const terms = data.map((d, i) =>
    evaluateGate('AND', [equalsSelect(select, selectFor(i, select.length)), d]),
  )
  return evaluateGate('OR', terms)
}

/**
 * Reverse selector: routes a single `input` to exactly the addressed output
 * line, placing 0 on every other line.
 */
export function demultiplexer(input: Bit, select: readonly Bit[]): Bit[] {
  requireWidths(2 ** select.length, select.length)
  return Array.from({ length: 2 ** select.length }, (_, i) =>
    evaluateGate('AND', [equalsSelect(select, selectFor(i, select.length)), input]),
  )
}