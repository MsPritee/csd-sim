import type { Bit, GateType } from './types'
import { evaluateGate } from './evaluate'
import { getGate } from './catalog'

/**
 * Pure Boolean-law verification primitives. Every predicate here decides
 * whether a given gate (or the algebra as a whole) satisfies a law by
 * exhaustively testing the truth tables produced by `evaluateGate`. No UI
 * code depends on these — they power the educational engine later.
 */

/** Every possible input vector of length `inputCount`, MSB-first. */
export function inputCombinations(inputCount: number): readonly Bit[][] {
  if (!Number.isInteger(inputCount) || inputCount < 1) {
    throw new RangeError(`input count must be a positive integer, got ${inputCount}`)
  }
  const total = 2 ** inputCount
  const out: Bit[][] = []
  for (let n = 0; n < total; n++) {
    const row: Bit[] = []
    for (let i = 0; i < inputCount; i++) {
      row.push(((n >> (inputCount - 1 - i)) & 1) as Bit)
    }
    out.push(row)
  }
  return out
}

/** Two bit-functions produce the same output for every input vector. */
export function booleanFunctionsEqual(
  a: (v: readonly Bit[]) => Bit,
  b: (v: readonly Bit[]) => Bit,
  inputCount: number,
): boolean {
  for (const v of inputCombinations(inputCount)) {
    if (a(v) !== b(v)) return false
  }
  return true
}

const NOT = (x: Bit): Bit => evaluateGate('NOT', [x])

/**
 * De Morgan's law for AND: `(A1 · A2 · … · An)' = A1' + A2' + … + An'`.
 */
export function verifyDeMorganAnd(inputCount = 2): boolean {
  return booleanFunctionsEqual(
    (v) => evaluateGate('NAND', v),
    (v) => evaluateGate('OR', v.map(NOT)),
    inputCount,
  )
}

/**
 * De Morgan's law for OR: `(A1 + A2 + … + An)' = A1' · A2' · … · An'`.
 */
export function verifyDeMorganOr(inputCount = 2): boolean {
  return booleanFunctionsEqual(
    (v) => evaluateGate('NOR', v),
    (v) => evaluateGate('AND', v.map(NOT)),
    inputCount,
  )
}

/**
 * General dispatch: `verifyDeMorgan(gateId)` checks the variant that matches
 * the gate's polarity (AND/NAND use the AND form, OR/NOR the OR form).
 */
export function verifyDeMorgan(gateId: GateType, inputCount = 2): boolean {
  switch (gateId) {
    case 'AND':
    case 'NAND':
      return verifyDeMorganAnd(inputCount)
    case 'OR':
    case 'NOR':
      return verifyDeMorganOr(inputCount)
    default:
      return false
  }
}

/** Commutative: `op(a, b) = op(b, a)` — checked by reversing the input vector. */
export function verifyCommutative(gateId: GateType, inputCount = 2): boolean {
  return booleanFunctionsEqual(
    (v) => evaluateGate(gateId, v),
    (v) => evaluateGate(gateId, [...v].reverse()),
    inputCount,
  )
}

/** Associative: `op(op(a, b), c) = op(a, op(b, c))`. */
export function verifyAssociative(gateId: GateType): boolean {
  return booleanFunctionsEqual(
    (v) => evaluateGate(gateId, [evaluateGate(gateId, [v[0]!, v[1]!]), v[2]!]),
    (v) => evaluateGate(gateId, [v[0]!, evaluateGate(gateId, [v[1]!, v[2]!])]),
    3,
  )
}

/** Distributive: `A·(B+C) = (A·B)+(A·C)` and `A+(B·C) = (A+B)·(A+C)`. */
export function verifyDistributive(): boolean {
  const andOverOr = booleanFunctionsEqual(
    (v) => evaluateGate('AND', [v[0]!, evaluateGate('OR', [v[1]!, v[2]!])]),
    (v) => evaluateGate('OR', [evaluateGate('AND', [v[0]!, v[1]!]), evaluateGate('AND', [v[0]!, v[2]!])]),
    3,
  )
  const orOverAnd = booleanFunctionsEqual(
    (v) => evaluateGate('OR', [v[0]!, evaluateGate('AND', [v[1]!, v[2]!])]),
    (v) => evaluateGate('AND', [evaluateGate('OR', [v[0]!, v[1]!]), evaluateGate('OR', [v[0]!, v[2]!])]),
    3,
  )
  return andOverOr && orOverAnd
}

/** Identity: `op(identity, x) = x` — the identity element is a neutral pass-through. */
export function verifyIdentity(gateId: GateType, inputCount = 2): boolean {
  const identity = getGate(gateId).identity
  if (identity === null) return false
  const isUnary = getGate(gateId).maxInputs === 1
  const count = isUnary ? 1 : inputCount
  const restCount = count - 1
  if (restCount === 0) {
    // Unary: neutral means op(id) keeps an already-idle input — only a true pass-through.
    return evaluateGate(gateId, [identity]) === identity
  }
  return booleanFunctionsEqual(
    (v) => evaluateGate(gateId, [identity, ...v]),
    (v) => v[0]!,
    restCount,
  )
}

/** Annihilation / domination: a constant forces the whole result to that constant. */
export function verifyAnnihilation(gateId: GateType, inputCount = 2): boolean {
  const constant = gateId === 'AND' ? 0 : gateId === 'OR' ? 1 : null
  if (constant === null) return false
  const restCount = Math.max(inputCount - 1, 1)
  return booleanFunctionsEqual(
    (v) => evaluateGate(gateId, [constant, ...v]),
    () => constant,
    restCount,
  )
}

/**
 * Idempotence: `op(x, x) = x`. Binary-gate property; BUFFER trivially holds,
 * NOT fails (double inversion would change the value).
 */
export function verifyIdempotence(gateId: GateType): boolean {
  if (gateId === 'BUFFER') return true
  if (gateId === 'NOT') return false
  return booleanFunctionsEqual(
    (v) => evaluateGate(gateId, [v[0]!, v[0]!]),
    (v) => v[0]!,
    1,
  )
}

/** Complement law: `AND(x, x') = 0`, `OR(x, x') = 1`, `XOR(x, x') = 1`. */
export function verifyComplement(gateId: GateType): boolean {
  const expected = gateId === 'AND' ? 0 : gateId === 'OR' || gateId === 'XOR' ? 1 : null
  if (expected === null) return false
  return booleanFunctionsEqual(
    (v) => evaluateGate(gateId, [v[0]!, evaluateGate('NOT', [v[0]!])]),
    () => expected,
    1,
  )
}

/** Involution (double negation): `(x')' = x`. */
export function verifyInvolution(): boolean {
  return booleanFunctionsEqual(
    (v) => evaluateGate('NOT', [evaluateGate('NOT', [v[0]!])]),
    (v) => v[0]!,
    1,
  )
}

/** Build NOT from NAND only. */
export function nandToNot(a: Bit): Bit {
  return evaluateGate('NAND', [a, a])
}

/** Build AND from NAND only. */
export function nandToAnd(a: Bit, b: Bit): Bit {
  const t = evaluateGate('NAND', [a, b])
  return evaluateGate('NAND', [t, t])
}

/** Build OR from NAND only. */
export function nandToOr(a: Bit, b: Bit): Bit {
  return evaluateGate('NAND', [nandToNot(a), nandToNot(b)])
}

/** Every primitive (NOT, AND, OR) built from NAND matches the real gate. */
export function verifyNandUniversality(): boolean {
  for (const v of inputCombinations(2)) {
    const a = v[0]!
    const b = v[1]!
    if (nandToAnd(a, b) !== evaluateGate('AND', [a, b])) return false
    if (nandToOr(a, b) !== evaluateGate('OR', [a, b])) return false
  }
  for (const x of [0, 1] as const) {
    if (nandToNot(x) !== evaluateGate('NOT', [x])) return false
  }
  return true
}

/** Build NOT from NOR only. */
export function norToNot(a: Bit): Bit {
  return evaluateGate('NOR', [a, a])
}

/** Build AND from NOR only. */
export function norToAnd(a: Bit, b: Bit): Bit {
  return evaluateGate('NOR', [norToNot(a), norToNot(b)])
}

/** Build OR from NOR only. */
export function norToOr(a: Bit, b: Bit): Bit {
  const t = evaluateGate('NOR', [a, b])
  return evaluateGate('NOR', [t, t])
}

/** Every primitive (NOT, AND, OR) built from NOR matches the real gate. */
export function verifyNorUniversality(): boolean {
  for (const v of inputCombinations(2)) {
    const a = v[0]!
    const b = v[1]!
    if (norToAnd(a, b) !== evaluateGate('AND', [a, b])) return false
    if (norToOr(a, b) !== evaluateGate('OR', [a, b])) return false
  }
  for (const x of [0, 1] as const) {
    if (norToNot(x) !== evaluateGate('NOT', [x])) return false
  }
  return true
}