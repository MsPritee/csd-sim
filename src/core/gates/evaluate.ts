import type { Bit, GateType } from './types'

/**
 * Pure n-ary Boolean evaluation primitives. Every gate's output is computed
 * from these small, commutative helpers so the engine never duplicates logic.
 */

function evalAnd(bits: readonly Bit[]): Bit {
  return bits.every((b) => b === 1) ? 1 : 0
}

function evalOr(bits: readonly Bit[]): Bit {
  return bits.some((b) => b === 1) ? 1 : 0
}

/** XOR is odd-parity: 1 when an odd number of inputs are 1. */
function evalXor(bits: readonly Bit[]): Bit {
  return bits.reduce<number>((acc, b) => acc + b, 0) % 2 === 1 ? 1 : 0
}

/** Odd parity: 1 when an odd number of inputs are 1 (pure XOR over any arity). */
function evalOddParity(bits: readonly Bit[]): Bit {
  return bits.reduce<number>((acc, b) => acc + b, 0) % 2 === 1 ? 1 : 0
}

/** Even parity: 1 when an even number of inputs are 1. */
function evalEvenParity(bits: readonly Bit[]): Bit {
  return bits.reduce<number>((acc, b) => acc + b, 0) % 2 === 0 ? 1 : 0
}

/**
 * Evaluates a gate over its inputs. `inputs` is validated against the arity
 * defined in the catalog before any bit math runs.
 */
export function evaluateGate(gateId: GateType, inputs: readonly Bit[]): Bit {
  const { minInputs, maxInputs } = requireArity(gateId)
  if (inputs.length < minInputs || inputs.length > maxInputs) {
    throw new RangeError(
      `${gateId} expects between ${minInputs} and ${maxInputs} inputs, got ${inputs.length}`,
    )
  }
  const { evaluate } = requireEvaluation(gateId)
  return evaluate(inputs)
}

/** Evaluates every gate over the same inputs (useful for comparison views). */
export function evaluateAllInputs(inputs: readonly Bit[]): Record<GateType, Bit> {
  const primary = inputs[0]!
  return {
    BUFFER: evaluateGate('BUFFER', [primary]),
    NOT: evaluateGate('NOT', [primary]),
    AND: evaluateGate('AND', inputs),
    NAND: evaluateGate('NAND', inputs),
    OR: evaluateGate('OR', inputs),
    NOR: evaluateGate('NOR', inputs),
    XOR: evaluateGate('XOR', inputs),
    XNOR: evaluateGate('XNOR', inputs),
    CON_BUF: evaluateGate('CON_BUF', [primary, 1]),
    CON_INV: evaluateGate('CON_INV', [primary, 1]),
    ODD_PARITY: evaluateGate('ODD_PARITY', inputs),
    EVEN_PARITY: evaluateGate('EVEN_PARITY', inputs),
  }
}

type Evaluator = (bits: readonly Bit[]) => Bit

function requireEvaluation(gateId: GateType): { evaluate: Evaluator } {
  switch (gateId) {
    case 'BUFFER':
      return { evaluate: (bits) => bits[0]! }
    case 'NOT':
      return { evaluate: (bits) => (bits[0]! === 1 ? 0 : 1) }
    case 'AND':
      return { evaluate: evalAnd }
    case 'NAND':
      return { evaluate: (bits) => (evalAnd(bits) === 1 ? 0 : 1) }
    case 'OR':
      return { evaluate: evalOr }
    case 'NOR':
      return { evaluate: (bits) => (evalOr(bits) === 1 ? 0 : 1) }
    case 'XOR':
      return { evaluate: evalXor }
    case 'XNOR':
      return { evaluate: (bits) => (evalXor(bits) === 1 ? 0 : 1) }
    // In the bit (truth-table) model a controlled gate outputs 0 while
    // disenabled — the circuit simulator, by contrast, emits a true floating
    // (high-impedance) value via `evaluateGateVector`.
    case 'CON_BUF':
      return { evaluate: (bits) => (bits[1] === 1 ? bits[0]! : 0) }
    case 'CON_INV':
      return { evaluate: (bits) => (bits[1] === 1 ? (bits[0]! === 1 ? 0 : 1) : 0) }
    case 'ODD_PARITY':
      return { evaluate: evalOddParity }
    case 'EVEN_PARITY':
      return { evaluate: evalEvenParity }
    default: {
      const exhaustive: never = gateId
      return exhaustive
    }
  }
}

/**
 * Builds a deterministic truth table for a gate over `inputCount` inputs.
 * Rows are ordered MSB-first (input [0] toggles slowest), matching the repo
 * convention used by `truthTableFromSop`. Always contains exactly 2^inputCount rows.
 */
export function generateTruthTable(gateId: GateType, inputCount: number): readonly Bit[][] {
  const { minInputs, maxInputs } = requireArity(gateId)
  if (!Number.isInteger(inputCount) || inputCount < minInputs || inputCount > maxInputs) {
    throw new RangeError(
      `${gateId} supports between ${minInputs} and ${maxInputs} inputs, got ${inputCount}`,
    )
  }
  const rows: Bit[][] = []
  const total = 2 ** inputCount
  for (let n = 0; n < total; n++) {
    const inputs: Bit[] = []
    for (let i = 0; i < inputCount; i++) {
      const bit = (n >> (inputCount - 1 - i)) & 1
      inputs.push(bit as Bit)
    }
    rows.push([...inputs, evaluateGate(gateId, inputs)])
  }
  return rows
}

function requireArity(gateId: GateType): { minInputs: number; maxInputs: number } {
  switch (gateId) {
    case 'BUFFER':
    case 'NOT':
      return { minInputs: 1, maxInputs: 1 }
    case 'CON_BUF':
    case 'CON_INV':
      return { minInputs: 2, maxInputs: 2 }
    case 'AND':
    case 'NAND':
    case 'OR':
    case 'NOR':
    case 'XOR':
    case 'XNOR':
    case 'ODD_PARITY':
    case 'EVEN_PARITY':
      return { minInputs: 2, maxInputs: 32 }
  }
}