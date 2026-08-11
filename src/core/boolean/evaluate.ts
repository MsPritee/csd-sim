import { parseTerm, type Literal } from './terms'
import type { CellValue } from '../kmap/model'

/**
 * Pure Boolean evaluation used to compare an original function with its
 * simplified form. Terms are parsed with the shared `parseTerm` primitive so
 * this never re-implements expression parsing or K-map math.
 */

export interface ExpressionMetrics {
  /** Number of product terms (SOP) or sum terms (POS). */
  terms: number
  /** Total number of literals across all terms. */
  literals: number
  /** Distinct variables referenced by the expression. */
  variables: number
}

function bitsOf(minterm: number, n: number): number[] {
  const bits: number[] = []
  for (let i = 0; i < n; i++) bits.push((minterm >> (n - 1 - i)) & 1)
  return bits
}

function valueOf(variables: readonly string[], bits: readonly number[], name: string): number {
  const index = variables.indexOf(name)
  return index >= 0 ? bits[index] ?? 0 : 0
}

/**
 * A product (AND) term matches an input when every literal matches its bit:
 * an uncomplemented literal needs a 1, a complemented one needs a 0.
 */
export function productTermMatches(
  variables: readonly string[],
  bits: readonly number[],
  term: readonly Literal[],
): boolean {
  return term.every((l) => valueOf(variables, bits, l.name) === (l.negated ? 0 : 1))
}

/**
 * A sum (OR) term matches an input when at least one literal matches its bit.
 * This is the maxterm meaning: the sum is 0 only when every literal is false.
 */
export function sumTermMatches(
  variables: readonly string[],
  bits: readonly number[],
  term: readonly Literal[],
): boolean {
  if (term.length === 0) return true
  return term.some((l) => valueOf(variables, bits, l.name) === (l.negated ? 0 : 1))
}

/** Evaluate the truth table of a Sum of Products (OR of AND terms). */
export function truthTableFromSop(
  variables: readonly string[],
  productStrings: readonly string[],
): number[] {
  const terms = productStrings.map((s) => parseTerm(s))
  const n = variables.length
  const total = 2 ** n
  return Array.from({ length: total }, (_, minterm) => {
    const bits = bitsOf(minterm, n)
    return terms.some((t) => productTermMatches(variables, bits, t)) ? 1 : 0
  })
}

/** Evaluate the truth table of a Product of Sums (AND of OR terms). */
export function truthTableFromPos(
  variables: readonly string[],
  sumStrings: readonly string[],
): number[] {
  const maxterms = sumStrings.map((s) => parseTerm(s.replace(/[()]/g, '')))
  const n = variables.length
  const total = 2 ** n
  return Array.from({ length: total }, (_, minterm) => {
    const bits = bitsOf(minterm, n)
    // Output is 1 only when every maxterm is satisfied (has a true literal).
    const allSatisfied = maxterms.every((mt) => sumTermMatches(variables, bits, mt))
    return allSatisfied ? 1 : 0
  })
}

export interface ComparisonDifference {
  minterm: number
  bits: string
  original: CellValue
  simplified: number
}

export interface TruthTableComparison {
  equal: boolean
  totalRows: number
  differences: readonly ComparisonDifference[]
}

/**
 * Compare an original truth table (which may contain don't-cares, treated as
 * wildcards) with a simplified output. Returns the exact rows that differ.
 */
export function compareTruthTables(
  original: readonly CellValue[],
  simplified: readonly number[],
): TruthTableComparison {
  const nBits = Math.log2(Math.max(original.length, 2))
  const width = Math.ceil(nBits)
  const differences: ComparisonDifference[] = []
  for (let m = 0; m < original.length; m++) {
    const orig = original[m]
    const simp = simplified[m]
    if (orig === 'X') continue
    if (orig !== simp) {
      differences.push({
        minterm: m,
        bits: m.toString(2).padStart(width, '0'),
        original: orig,
        simplified: simp,
      })
    }
  }
  return { equal: differences.length === 0, totalRows: original.length, differences }
}

/** Count of terms and literals for a set of term strings. */
export function expressionMetrics(
  termStrings: readonly string[],
  variables: readonly string[],
): ExpressionMetrics {
  let literals = 0
  const used = new Set<string>()
  for (const s of termStrings) {
    const term = parseTerm(s)
    literals += term.length
    for (const l of term) used.add(l.name)
  }
  return { terms: termStrings.length, literals, variables: used.size || variables.length }
}