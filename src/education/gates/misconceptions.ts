import type { GateType } from '../../core/gates/types'

/**
 * Gate misconception catalogue + detection (LG-06). Each misconception links
 * a confusing gate pair to an explanation and a targeted hint, so the practice
 * engine can tell a student exactly why their choice was wrong.
 */

export interface GateMisconception {
  readonly id: string
  readonly pattern: string
  readonly explanation: string
  readonly hint: string
}

/** The likely conceptual confusion when `correct` and `chosen` are compared. */
export function detectGateMisconception(
  correct: GateType,
  chosen: GateType,
): GateMisconception | null {
  if (correct === chosen) return null
  const pair = [correct, chosen].sort().join(':')
  switch (pair) {
    case 'AND:OR':
      return {
        id: 'and-or',
        pattern: 'Confused AND with OR.',
        explanation:
          'AND is strict — it is 1 only when every input is 1 — while OR is 1 whenever any input is 1. Remember: AND needs everything, OR needs only one.',
        hint: 'Ask: is the output 1 only on the all-ones row? That is AND, not OR.',
      }
    case 'AND:NAND':
      return {
        id: 'nand-and',
        pattern: 'Forgot the inversion bubble on NAND.',
        explanation:
          'NAND is AND followed by inversion, so it outputs 0 exactly on the all-ones row. Dropping the NAND bubble gives AND, which outputs 1 there.',
        hint: 'Look for the bubble — NAND is exactly AND with its result flipped.',
      }
    case 'AND:NOR':
      return {
        id: 'and-nor',
        pattern: 'Confused AND with NOR.',
        explanation:
          'They rarely share output rows. AND is 1 only on all-ones; NOR is 1 only on all-zeros. Compare the single 1-row vs the single 0-row.',
        hint: 'NOR is 1 only when every input is 0; AND is 1 only when every input is 1.',
      }
    case 'NAND:NOR':
      return {
        id: 'nand-nor',
        pattern: 'Swapped the NAND and NOR rules.',
        explanation:
          'NAND inverts an AND: 0 only on all-ones. NOR inverts an OR: 1 only on all-zeros. They are the two "inverted" relation gates and are easy to swap.',
        hint: 'NAND = AND + bubble (fails only at 11); NOR = OR + bubble (fires only at 00).',
      }
    case 'NAND:OR':
      return {
        id: 'nand-or',
        pattern: 'Confused NAND with OR.',
        explanation:
          'OR is 1 except on all-zeros; NAND is 1 except on all-ones. The rows flip exactly: a NAND row is the complement of an OR row.',
        hint: 'NAND differs from OR only on the all-ones row.',
      }
    case 'NOR:OR':
      return {
        id: 'nor-or',
        pattern: 'Forgot the inversion bubble on NOR.',
        explanation:
          'NOR is OR followed by inversion, so it is 1 only when every input is 0. The OR gate, without the bubble, is 1 whenever any input is 1.',
        hint: 'The bubble flips OR: NOR is 1 only when everything is 0.',
      }
    case 'OR:XOR':
      return {
        id: 'or-xor',
        pattern: 'Confused OR with XOR.',
        explanation:
          'OR includes the both-on row: OR(1,1) = 1. XOR excludes it: XOR(1,1) = 0, because it fires only when the inputs differ (odd number of 1s).',
        hint: 'Set both inputs to 1: OR says 1, XOR says 0 — that is the difference.',
      }
    case 'NOR:XOR':
      return {
        id: 'nor-xor',
        pattern: 'Confused NOR with XOR.',
        explanation:
          'Widely different behavior. XOR is 1 for an odd count of 1s; NOR is 1 only when every input is 0.',
        hint: 'Count the 1s for XOR; look for all-zeros for NOR.',
      }
    case 'XNOR:XOR':
      return {
        id: 'xor-xnor',
        pattern: 'Forgot the inversion bubble on XNOR.',
        explanation:
          'XNOR is XOR inverted — with two inputs it outputs 1 when the inputs are equal (even number of 1s). XOR outputs 1 when they differ (odd number of 1s).',
        hint: 'XnOR = XOR + bubble: equal inputs → 1.',
      }
    case 'NAND:XNOR':
      return {
        id: 'xnor-nand',
        pattern: 'Confused XNOR with NAND.',
        explanation:
          'XNOR is "even number of 1s" and NAND is "not all inputs 1". They agree in places but are not the same function.',
        hint: 'XNOR is about parity; NAND is about the all-ones row.',
      }
    case 'NOR:XNOR':
      return {
        id: 'xnor-nor',
        pattern: 'Confused XNOR with NOR.',
        explanation:
          'XNOR is 1 for an even number of 1s; NOR is 1 only when every input is 0. Only one output row is shared.',
        hint: 'XNOR checks parity — not whether everything is 0.',
      }
    case 'BUFFER:NOT':
      return {
        id: 'not-buffer',
        pattern: 'Confused NOT with a buffer.',
        explanation:
          'A buffer passes the signal through (Y = A); NOT inverts it (Y = A\'). The only visual difference is the inversion bubble.',
        hint: 'The triangle with a bubble inverts; the plain triangle passes through.',
      }
    default:
      return {
        id: 'generic',
        pattern: 'Chose a gate without recognizing the behavior.',
        explanation:
          'Compare the given table, expression, or description against the choices row by row, and check each gate for an inversion bubble.',
        hint: 'Re-read the prompt, then compare truth tables: which rows match exactly?',
      }
  }
}

/** The full misconception catalogue used for feedback. */
export const GATE_MISCONCEPTIONS: readonly GateMisconception[] = (
  [
    ['AND', 'OR'],
    ['AND', 'NAND'],
    ['AND', 'NOR'],
    ['NAND', 'NOR'],
    ['NAND', 'OR'],
    ['OR', 'NOR'],
    ['OR', 'XOR'],
    ['NOR', 'XOR'],
    ['XOR', 'XNOR'],
    ['XNOR', 'NAND'],
    ['XNOR', 'NOR'],
    ['BUFFER', 'NOT'],
  ] as const
).map(([a, b]) => detectGateMisconception(a, b)! )

export function getGateMisconception(id: string): GateMisconception | undefined {
  return GATE_MISCONCEPTIONS.find((m) => m.id === id)
}