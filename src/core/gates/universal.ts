import type { Bit } from './types'
import { evaluateGate } from './evaluate'
import { inputCombinations } from './verify'
import { mintermToTerm } from '../boolean/terms'
import { truthTableFromSop } from '../boolean/evaluate'

/**
 * NAND universality (LG-03): translate an arbitrary Boolean function into an
 * equivalent circuit built ONLY from NAND gates. Functional completeness means
 * every function can be realized this way; the builder below constructs the
 * canonical two-level NAND SOP and proves it equivalent by exhaustive check.
 *
 * A `Node` pairs a bit-function with a human-readable NAND label so the whole
 * circuit can be both evaluated and displayed. Constant 0/1 rails are treated
 * as free leaves (real logic is wired to supply rails).
 */

interface Node {
  readonly eval: (v: readonly Bit[]) => Bit
  readonly label: string
}

const constantNode = (c: Bit): Node => ({
  eval: () => c,
  label: String(c),
})

/** Result of translating a truth table into a NAND-only circuit. */
export interface NandOnlyCircuit {
  readonly variables: readonly string[]
  /** Number of NAND gates used (rails and literals cost nothing). */
  readonly nandCount: number
  /** Nested NAND expression using the ↑ operator. */
  readonly expression: string
  /** Evaluate the NAND-only circuit over the input bits. */
  readonly evaluate: (v: readonly Bit[]) => Bit
  /** True when evaluation matches the supplied truth table on every input. */
  readonly equivalent: boolean
}

/**
 * Builds a NAND-only circuit whose truth table equals `truthTable` (the ON-set
 * is read off the 1-entries, MSB-first, so variable[0] is the most significant).
 * Table entries must be 0 or 1.
 */
export function buildNandOnly(
  variables: readonly string[],
  truthTable: readonly number[],
): NandOnlyCircuit {
  const n = variables.length
  const expected = 2 ** n
  if (truthTable.length !== expected) {
    throw new RangeError(`truth table must have 2^${n} = ${expected} rows, got ${truthTable.length}`)
  }

  if (n === 0) {
    const root = constantNode((truthTable[0] ?? 0) as Bit)
    return {
      variables,
      nandCount: 0,
      expression: root.label,
      evaluate: root.eval,
      equivalent: true,
    }
  }

  let nandCount = 0
  const nand = (a: Node, b: Node): Node => {
    nandCount += 1
    return {
      eval: (v) => evaluateGate('NAND', [a.eval(v), b.eval(v)]),
      label: `(${a.label} ↑ ${b.label})`,
    }
  }

  /** AND of literals via NAND: return NAND(NAND(x, y), NAND(x, y)). */
  const nandProduct = (nodes: readonly Node[]): Node => {
    if (nodes.length === 0) return constantNode(1)
    let acc = nodes[0]!
    for (let i = 1; i < nodes.length; i++) {
      const t = nand(acc, nodes[i]!)
      acc = nand(t, t)
    }
    return acc
  }

  /** OR of product terms via NAND: return NAND(NOT x, NOT y) = x + y. */
  const nandSum = (nodes: readonly Node[]): Node => {
    if (nodes.length === 0) return constantNode(0)
    if (nodes.length === 1) return nodes[0]!
    let acc = nodes[0]!
    for (let i = 1; i < nodes.length; i++) {
      acc = nand(nand(acc, acc), nand(nodes[i]!, nodes[i]!))
    }
    return acc
  }

  const literalNode = (name: string, negated: boolean): Node => {
    const slot = variables.indexOf(name)
    const base: Node = { eval: (v) => v[slot]!, label: name }
    return negated ? nand(base, base) : base
  }

  // One product per ON-set row.
  const products: Node[] = []
  for (let m = 0; m < truthTable.length; m++) {
    if (truthTable[m] !== 1) continue
    const term = mintermToTerm(variables, m)
    const literals = term.map((l) => literalNode(l.name, l.negated))
    products.push(nandProduct(literals))
  }

  const root = nandSum(products)
  const evaluate = root.eval

  let equivalent = true
  for (const v of inputCombinations(n)) {
    let minterm = 0
    for (let i = 0; i < n; i++) minterm = (minterm << 1) | v[i]!
    if (evaluate(v) !== truthTable[minterm]) {
      equivalent = false
      break
    }
  }

  return { variables, nandCount, expression: root.label, evaluate, equivalent }
}

/** Convenience: build a NAND-only circuit from an SOP expression. */
export function buildNandOnlyFromSop(
  variables: readonly string[],
  sopTerms: readonly string[],
): NandOnlyCircuit {
  return buildNandOnly(variables, truthTableFromSop(variables, sopTerms))
}