import { evaluateGate } from '../gates/evaluate'
import type { Bit } from '../gates/types'
import type { AdderResult, FullAdderResult, HalfAdderResult } from './types'

/**
 * Combinational adders built purely from gate-engine primitives (LG-09). Every
 * adder's sum/carry is derived from `XOR` / `AND` / `OR` cells via
 * `evaluateGate` — no bit arithmetic is duplicated here.
 */

/** Half adder: sum = a ⊕ b, carry = a · b. */
export function halfAdd(a: Bit, b: Bit): HalfAdderResult {
  return {
    sum: evaluateGate('XOR', [a, b]),
    carry: evaluateGate('AND', [a, b]),
  }
}

/**
 * Full adder: sums two bits plus a carry-in. Sum = XOR(a, b, cin) (odd parity);
 * carry = (a·b) + (cin · (a ⊕ b)).
 */
export function fullAdd(a: Bit, b: Bit, carryIn: Bit): FullAdderResult {
  const ab = evaluateGate('XOR', [a, b])
  const sum = evaluateGate('XOR', [a, b, carryIn])
  const abCarry = evaluateGate('AND', [a, b])
  const inCarry = evaluateGate('AND', [ab, carryIn])
  return {
    sum,
    carry: evaluateGate('OR', [abCarry, inCarry]),
  }
}

/**
 * N-bit ripple-carry adder. Inputs and output are LSB-first (a[0] is the least
 * significant bit). The carry propagates left-to-right through chained `fullAdd`
 * cells; the final carry-out is returned separately.
 */
export function rippleAdd(a: readonly Bit[], b: readonly Bit[]): AdderResult {
  if (a.length !== b.length) {
    throw new RangeError(`rippleAdd expects equal operand widths, got ${a.length} and ${b.length}`)
  }
  const sum: Bit[] = []
  let carry: Bit = 0
  for (let i = 0; i < a.length; i++) {
    const cell = fullAdd(a[i]!, b[i]!, carry)
    sum.push(cell.sum)
    carry = cell.carry
  }
  return { sum, carryOut: carry }
}