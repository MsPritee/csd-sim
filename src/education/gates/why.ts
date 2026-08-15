import type { Bit, GateType } from '../../core/gates/types'
import { evaluateGate } from '../../core/gates/evaluate'
import type { GateExplanation } from './types'

/**
 * "Why it works" explanation engine (LG-04). Given a gate and its actual
 * inputs, it explains what happened, why, which rule applied, and what to
 * notice — reusing `evaluateGate` so the explanation always matches the engine.
 */

const INPUT_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] as const

const RULES: Readonly<Record<GateType, string>> = {
  BUFFER: 'Buffer — pass-through (Y = A)',
  NOT: "NOT — inversion (Y = A')",
  AND: 'AND — all inputs must be 1',
  NAND: "NAND — AND, then invert",
  OR: 'OR — at least one input is 1',
  NOR: "NOR — OR, then invert",
  XOR: 'XOR — odd number of 1s',
  XNOR: 'XNOR — even number of 1s',
  CON_BUF: 'Controlled Buffer — passes while control = 1',
  CON_INV: "Controlled Inverter — inverts while control = 1",
  ODD_PARITY: 'Odd Parity — 1 when the count of 1s is odd',
  EVEN_PARITY: 'Even Parity — 1 when the count of 1s is even',
}

function spelledJoin(items: readonly string[]): string {
  if (items.length === 0) return ''
  if (items.length === 1) return items[0] ?? ''
  if (items.length === 2) return `${items[0]!} and ${items[1]!}`
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`
}

function countOnes(bits: readonly Bit[]): number {
  return bits.reduce<number>((acc, b) => acc + (b === 1 ? 1 : 0), 0)
}

/** Names of the inputs that are 0. */
function zeroInputs(bits: readonly Bit[]): readonly string[] {
  const names: string[] = []
  bits.forEach((b, i) => {
    if (b === 0) names.push(INPUT_LABELS[i] ?? '?')
  })
  return names
}

function formatJoin(bits: readonly Bit[], separator: string): string {
  return bits.map(String).join(` ${separator} `)
}

const AND_SEP = '·'
const OR_SEP = '+'
const XOR_SEP = '⊕'

function explainBuffer(output: Bit): GateExplanation {
  return {
    what: `Y = A = ${output}`,
    why: `A buffer passes the signal through unchanged, so Y = A = ${output}.`,
    rule: RULES.BUFFER,
    notice: ['The triangle has no bubble, so there is no inversion.'],
  }
}

function explainNot(bits: readonly Bit[], output: Bit): GateExplanation {
  const input = bits[0]!
  return {
    what: `Y = A' = ${output}`,
    why:
      input === 1
        ? 'Input A is 1, and NOT inverts it, so Y = 0.'
        : 'Input A is 0, and NOT inverts it, so Y = 1.',
    rule: RULES.NOT,
    notice: ["The bubble at the output is what performs the inversion."],
  }
}

function explainAnd(bits: readonly Bit[], output: Bit): GateExplanation {
  const zeros = zeroInputs(bits)
  return {
    what: `Y = ${formatJoin(bits, AND_SEP)} = ${output}`,
    why:
      zeros.length === 0
        ? 'Every input is 1, so the AND condition holds — the output is 1.'
        : `Input ${spelledJoin(zeros)} ${
            zeros.length === 1 ? 'is' : 'are'
          } 0, so the "every input is 1" condition fails — the output is 0.`,
    rule: RULES.AND,
    notice: ['A single 0 anywhere forces AND to 0.'],
  }
}

function explainNand(bits: readonly Bit[], output: Bit): GateExplanation {
  return {
    what: `Y = (${formatJoin(bits, AND_SEP)})' = ${output}`,
    why:
      output === 0
        ? 'Every input is 1, so AND would output 1; the inversion bubble flips it to 0.'
        : 'At least one input is 0, so AND would output 0; the inversion bubble flips it to 1.',
    rule: RULES.NAND,
    notice: ['NAND outputs 0 exactly when all inputs are 1.'],
  }
}

function explainOr(bits: readonly Bit[], output: Bit): GateExplanation {
  return {
    what: `Y = ${formatJoin(bits, OR_SEP)} = ${output}`,
    why:
      output === 1
        ? 'At least one input is 1, so the OR condition holds — the output is 1.'
        : 'Every input is 0, so no input satisfies OR — the output is 0.',
    rule: RULES.OR,
    notice: ['OR is 1 whenever any input is 1.'],
  }
}

function explainNor(bits: readonly Bit[], output: Bit): GateExplanation {
  return {
    what: `Y = (${formatJoin(bits, OR_SEP)})' = ${output}`,
    why:
      output === 1
        ? 'Every input is 0, so OR would output 0; the inversion bubble flips it to 1.'
        : 'At least one input is 1, so OR would output 1; the inversion bubble flips it to 0.',
    rule: RULES.NOR,
    notice: ['NOR outputs 1 exactly when all inputs are 0.'],
  }
}

function explainXor(bits: readonly Bit[], output: Bit): GateExplanation {
  const n = countOnes(bits)
  const plural = n === 1 ? ' is' : ' are'
  return {
    what: `Y = ${formatJoin(bits, XOR_SEP)} = ${output}`,
    why:
      output === 1
        ? `${n} input${plural} 1 — an odd count — so XOR outputs 1.`
        : `${n} input${plural} 1 — an even count — so XOR outputs 0.`,
    rule: RULES.XOR,
    notice: ['Two inputs: XOR = "they differ".', 'Any count: XOR = odd number of 1s.'],
  }
}

function explainXnor(bits: readonly Bit[], output: Bit): GateExplanation {
  const n = countOnes(bits)
  const plural = n === 1 ? ' is' : ' are'
  return {
    what: `Y = (${formatJoin(bits, XOR_SEP)})' = ${output}`,
    why:
      output === 1
        ? `${n} input${plural} 1 — an even count — so XNOR (XOR inverted) outputs 1.`
        : `${n} input${plural} 1 — an odd count — so XNOR (XOR inverted) outputs 0.`,
    rule: RULES.XNOR,
    notice: ['Two inputs: XNOR = "they are equal".', 'Any count: XNOR = even number of 1s.'],
  }
}

/**
 * Produces an input-specific explanation for a gate's output. The gate is
 * evaluated through the shared engine, so the explanation always agrees with
 * the simulated result.
 */
export function explainGate(gateId: GateType, inputs: readonly Bit[]): GateExplanation {
  const output = evaluateGate(gateId, inputs)
  switch (gateId) {
    case 'BUFFER':
      return explainBuffer(output)
    case 'NOT':
      return explainNot(inputs, output)
    case 'AND':
      return explainAnd(inputs, output)
    case 'NAND':
      return explainNand(inputs, output)
    case 'OR':
      return explainOr(inputs, output)
    case 'NOR':
      return explainNor(inputs, output)
    case 'XOR':
      return explainXor(inputs, output)
    case 'XNOR':
      return explainXnor(inputs, output)
    case 'CON_BUF':
    case 'CON_INV':
    case 'ODD_PARITY':
    case 'EVEN_PARITY':
      return explainParityControlled(gateId, inputs, output)
    default: {
      const exhaustive: never = gateId
      return exhaustive
    }
  }
}

/** Explanation for the parity gates and controlled (tri-state) gates. */
function explainParityControlled(gateId: GateType, bits: readonly Bit[], output: Bit): GateExplanation {
  const n = countOnes(bits)
  const plural = n === 1 ? ' is' : ' are'
  if (gateId === 'ODD_PARITY' || gateId === 'EVEN_PARITY') {
    const even = gateId === 'EVEN_PARITY'
    return {
      what: `Y = ${output}`,
      why:
        even === (n % 2 === 0)
          ? `${n} input${plural} 1 — an ${even ? 'even' : 'odd'} count — so ${even ? 'even' : 'odd'} parity outputs 1.`
          : `${n} input${plural} 1 — an ${even ? 'odd' : 'even'} count — so ${even ? 'even' : 'odd'} parity outputs 0.`,
      rule: RULES[gateId]!,
      notice: ['Parity counts the 1s; it does not ask "any?" like OR.'],
    }
  }
  const data = bits[0]!
  const control = bits[1]!
  const inverted = gateId === 'CON_INV'
  if (control === 0) {
    return {
      what: `Y = (high impedance)`,
      why: 'The control input is 0, so the gate is disabled and its output floats (high impedance).',
      rule: RULES[gateId]!,
      notice: ['Disabled output is not 0 — it is disconnected.'],
    }
  }
  const out = inverted ? (data === 1 ? 0 : 1) : data
  return {
    what: `Y = ${inverted ? `${data}' = ` : ''}${out}`,
    why:
      control === 1
        ? `Control is 1, so the gate is enabled and ${inverted ? 'inverts' : 'passes'} the data input.`
        : 'Control is unknown, so the output cannot be determined.',
    rule: RULES[gateId]!,
    notice: ['Control = 1 opens the switch; control = 0 floats the output.'],
  }
}