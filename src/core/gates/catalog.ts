import type { GateDefinition, GateType } from './types'

/**
 * Canonical registry of every gate the engine understands. Definitions are
 * static metadata; actual bit math lives in `evaluate.ts`.
 */

const BUFFER: GateDefinition = {
  id: 'BUFFER',
  name: 'Buffer',
  symbol: '▷',
  booleanExpression: 'Y = A',
  description: 'Outputs exactly what it receives — used to strengthen a signal without changing it.',
  role: 'identity',
  minInputs: 1,
  maxInputs: 1,
  commutative: false,
  complementaryOf: 'NOT',
  identity: 0,
}

const NOT: GateDefinition = {
  id: 'NOT',
  name: 'NOT (Inverter)',
  symbol: 'NOT',
  booleanExpression: "Y = A'",
  description: 'Inverts its input: outputs 1 when the input is 0, and 0 when it is 1.',
  role: 'invert',
  minInputs: 1,
  maxInputs: 1,
  commutative: false,
  complementaryOf: 'BUFFER',
  identity: null,
}

const AND: GateDefinition = {
  id: 'AND',
  name: 'AND',
  symbol: '&',
  booleanExpression: 'Y = A · B',
  description: 'Outputs 1 only when all inputs are 1.',
  role: 'relation',
  minInputs: 2,
  maxInputs: 32,
  commutative: true,
  complementaryOf: 'NAND',
  identity: 1,
}

const NAND: GateDefinition = {
  id: 'NAND',
  name: 'NAND',
  symbol: '!&',
  booleanExpression: "Y = (A · B)'",
  description: 'Outputs 0 only when all inputs are 1 — the inverse of AND.',
  role: 'relation',
  minInputs: 2,
  maxInputs: 32,
  commutative: true,
  complementaryOf: 'AND',
  identity: null,
}

const OR: GateDefinition = {
  id: 'OR',
  name: 'OR',
  symbol: '≥1',
  booleanExpression: 'Y = A + B',
  description: 'Outputs 1 when at least one input is 1.',
  role: 'relation',
  minInputs: 2,
  maxInputs: 32,
  commutative: true,
  complementaryOf: 'NOR',
  identity: 0,
}

const NOR: GateDefinition = {
  id: 'NOR',
  name: 'NOR',
  symbol: '!≥1',
  booleanExpression: "Y = (A + B)'",
  description: 'Outputs 1 only when all inputs are 0 — the inverse of OR.',
  role: 'relation',
  minInputs: 2,
  maxInputs: 32,
  commutative: true,
  complementaryOf: 'OR',
  identity: null,
}

const XOR: GateDefinition = {
  id: 'XOR',
  name: 'XOR',
  symbol: '=1',
  booleanExpression: 'Y = A ⊕ B',
  description: 'Outputs 1 when an odd number of inputs are 1.',
  role: 'relation',
  minInputs: 2,
  maxInputs: 32,
  commutative: true,
  complementaryOf: 'XNOR',
  identity: 0,
}

const XNOR: GateDefinition = {
  id: 'XNOR',
  name: 'XNOR',
  symbol: '!=1',
  booleanExpression: 'Y = (A ⊕ B)\' = A ⊙ B',
  description: 'Outputs 1 when an even number of inputs are 1 — the inverse of XOR.',
  role: 'relation',
  minInputs: 2,
  maxInputs: 32,
  commutative: true,
  complementaryOf: 'XOR',
  identity: null,
}

const CON_BUF: GateDefinition = {
  id: 'CON_BUF',
  name: 'Controlled Buffer',
  symbol: '▷>',
  booleanExpression: 'Y = A · C',
  description: 'Passes its input through only while the control input is 1; otherwise the output floats (high impedance).',
  role: 'identity',
  minInputs: 2,
  maxInputs: 2,
  commutative: false,
  complementaryOf: 'CON_INV',
  identity: null,
}

const CON_INV: GateDefinition = {
  id: 'CON_INV',
  name: 'Controlled Inverter',
  symbol: '!>',
  booleanExpression: "Y = A' · C",
  description: 'Inverts its input while the control input is 1; otherwise the output floats (high impedance).',
  role: 'invert',
  minInputs: 2,
  maxInputs: 2,
  commutative: false,
  complementaryOf: 'CON_BUF',
  identity: null,
}

const ODD_PARITY: GateDefinition = {
  id: 'ODD_PARITY',
  name: 'Odd Parity',
  symbol: '2k+1',
  booleanExpression: 'Y = 1 iff odd # of 1s',
  description: 'Outputs 1 when an odd number of inputs are 1 — a generalised XOR over any input count.',
  role: 'relation',
  minInputs: 2,
  maxInputs: 32,
  commutative: true,
  complementaryOf: 'EVEN_PARITY',
  identity: 0,
}

const EVEN_PARITY: GateDefinition = {
  id: 'EVEN_PARITY',
  name: 'Even Parity',
  symbol: '2k',
  booleanExpression: 'Y = 1 iff even # of 1s',
  description: 'Outputs 1 when an even number of inputs are 1 — the inverse of Odd Parity.',
  role: 'relation',
  minInputs: 2,
  maxInputs: 32,
  commutative: true,
  complementaryOf: 'ODD_PARITY',
  identity: 1,
}

/** Complete list of gates, in teaching order (identity → invert → relation). */
export const GATE_DEFINITIONS: readonly GateDefinition[] = [
  BUFFER,
  NOT,
  AND,
  NAND,
  OR,
  NOR,
  XOR,
  XNOR,
  CON_BUF,
  CON_INV,
  ODD_PARITY,
  EVEN_PARITY,
]

const BY_ID: ReadonlyMap<GateType, GateDefinition> = new Map(
  GATE_DEFINITIONS.map((g) => [g.id, g]),
)

/** Look up a single gate definition. Throws for unknown ids so typos surface. */
export function getGate(id: GateType): GateDefinition {
  const gate = BY_ID.get(id)
  if (!gate) throw new RangeError(`unknown gate "${id}"`)
  return gate
}