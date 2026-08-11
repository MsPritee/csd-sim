/**
 * P3 — Educational explanations for the advanced "connect the representations"
 * features. Pure TypeScript, no React. Where a fact needs computing it reuses
 * the core modules (parser, definition, prime implicants, simplification);
 * this file only shapes the words a student sees.
 */

import type { KMapModel } from '../../core/kmap'
import {
  parseBooleanExpression,
  detectMode,
  normalizedForm,
  sopTermLists,
  productTermString,
  expressionTruthTable,
  type BoolLiteral,
} from '../../core/boolean/expression'
import { computePrimeImplicants } from '../../core/kmap/prime-implicants'
import { minterms } from '../../core/kmap'
import { unionCoverage } from '../../core/kmap/grouping'
import { analyzeGroupVariables, termFromConstants } from '../../core/kmap/group-reasoning'

/* ------------------------- Feature 1/2/3 — input explanations ------------------------- */

export function mintermExplanation(variables: readonly string[], entered: readonly number[]): string[] {
  const comma = entered.slice(0, -1).join(', ')
  const last = entered[entered.length - 1]
  const listed = entered.length > 1 ? `${comma} and ${last}` : String(entered[0] ?? '')
  const n = variables.length
  const rows = entered.map((m) => {
    const bits = m.toString(2).padStart(n, '0')
    const term = productTermString(literalsOf(variables, m))
    return `m${m} (${bits}) is the minterm ${term}.`
  })
  return [
    `You entered the minterms ${listed}.`,
    'A minterm is an input combination for which the function output must be 1.',
    ...rows,
    'Those rows have therefore been marked as 1 on the K-map.',
  ]
}

export function maxtermExplanation(variables: readonly string[], entered: readonly number[]): string[] {
  const n = variables.length
  return [
    `You entered the maxterms ${entered.join(', ')}.`,
    'A maxterm is an input combination for which the function output must be 0.',
    `Each maxterm — e.g. M${entered[0] ?? 0}, input ${(entered[0] ?? 0).toString(2).padStart(n, '0')} — is therefore marked as 0 on the K-map.`,
    'The remaining cells are 1 (they are the ON-set of the function).',
  ]
}

export function dontCareExplanation(dc: readonly number[]): string[] {
  return [
    "You marked cell(s) " + dc.join(', ') + " as don't-care (X).",
    'Don\'t-care cells are NOT required to be 0 or 1.',
    'We may treat an X as 1 when it helps create a larger valid group, but we do not have to use it.',
    'Don\'t-care cells never become required coverage.',
  ]
}

/* ------------------------- Feature 7 — expression → truth table → K-map ------------------------- */

export interface TruthTableRow {
  readonly minterm: number
  readonly binary: string
  readonly output: number
}

export interface ExpressionChain {
  readonly expression: string
  readonly normalized: string
  readonly mode: 'sop' | 'pos'
  readonly rows: readonly TruthTableRow[]
  readonly satisfiedRows: readonly number[]
}

/** The staged transformation from a Boolean expression to its ON-set. */
export function expressionChain(variables: readonly string[], expression: string): ExpressionChain {
  const tree = parseBooleanExpression(expression)
  const mode = detectMode(tree)
  const tt = expressionTruthTable(expression, variables)
  const rows = tt.map((o, m) => ({
    minterm: m,
    binary: m.toString(2).padStart(variables.length, '0'),
    output: o,
  }))
  return {
    expression,
    normalized: normalizedForm(tree),
    mode,
    rows,
    satisfiedRows: rows.filter((r) => r.output === 1).map((r) => r.minterm),
  }
}

/* ------------------------- Feature 8 — term → input combinations ------------------------- */

export interface TermCells {
  readonly term: string
  readonly fixed: readonly { name: string; value: 0 | 1 }[]
  readonly free: readonly string[]
  readonly minterms: readonly number[]
}

/** The input combinations (minterms) a single product term covers. */
export function termToCells(
  variables: readonly string[],
  literals: readonly BoolLiteral[],
): TermCells {
  const fixed: { name: string; value: 0 | 1 }[] = literals.map((l) => ({
    name: l.name,
    value: l.negated ? 0 : 1,
  }))
  const free = variables.filter((v) => !literals.some((l) => l.name === v))
  const mintermList: number[] = []
  const total = 2 ** variables.length
  for (let m = 0; m < total; m++) {
    const ok = literals.every((l) => {
      const bit = (m >> (variables.length - 1 - variables.indexOf(l.name))) & 1
      return bit === (l.negated ? 0 : 1)
    })
    if (ok) mintermList.push(m)
  }
  return { term: productTermString(literals), fixed, free, minterms: mintermList }
}

export function expressionTermsWithCells(
  variables: readonly string[],
  expression: string,
): readonly { term: string; minterms: readonly number[] }[] {
  const tree = parseBooleanExpression(expression)
  const sop = sopTermLists(tree)
  if (sop.length === 0) return []
  return sop.map((t) => {
    const cells = termToCells(variables, t)
    return { term: cells.term, minterms: cells.minterms }
  })
}

/* ------------------------- Feature 11 — conceptual SOP/POS ------------------------- */

export interface ConceptStep {
  readonly input: string
  readonly result: string
  readonly note: string
}

export interface SopPosConcept {
  readonly sop: {
    readonly summary: string
    readonly example: string
    readonly steps: readonly ConceptStep[]
  }
  readonly pos: {
    readonly summary: string
    readonly example: string
    readonly steps: readonly ConceptStep[]
  }
}

export function sopPosConcept(): SopPosConcept {
  return {
    sop: {
      summary: 'SOP is built from minterms. Each product (AND) term marks an input combination where the output must be 1.',
      example: 'For A = 0, B = 1: minterm A\'B because A\' = 1 and B = 1, so A\'B = 1.',
      steps: [
        { input: 'A = 0, B = 1', result: 'Minterm: A\'B', note: 'Input 0 → variable complemented, Input 1 → variable normal' },
        { input: 'A\' = 1 and B = 1', result: 'A\'B = 1', note: 'An AND term is 1 only when all its inputs are 1' },
        { input: 'Sum of Products', result: 'OR of these terms', note: 'The output is 1 when any term is 1' },
      ],
    },
    pos: {
      summary: 'POS is built from maxterms. Each sum (OR) term marks an input combination where the output must be 0.',
      example: 'For A = 0, B = 1: maxterm A + B\' because A = 0 and B\' = 0, so A + B\' = 0.',
      steps: [
        { input: 'A = 0, B = 1', result: 'Maxterm: A + B\'', note: 'Input 0 → variable normal, Input 1 → variable complemented' },
        { input: 'A = 0 and B\' = 0', result: 'A + B\' = 0', note: 'An OR term is 0 only when all its inputs are 0' },
        { input: 'Product of Sums', result: 'AND of these terms', note: 'The output is 0 when any term makes it 0' },
      ],
    },
  }
}

/* ------------------------- Feature 12/14 — implicant explanations ------------------------- */

export function implicantProgression(): { intro: string; prime: string; essential: string } {
  return {
    intro:
      'An implicant is a group of one or more 1-cells that are adjacent (they can be combined into one product term).',
    prime:
      'An implicant is prime when it cannot be made bigger by absorbing another adjacent implicant — i.e. it is as large as possible.',
    essential:
      'A prime implicant is essential when it is the only prime that covers at least one required 1-cell. We must include it in every minimal cover.',
  }
}

/** For each prime implicant, a student-facing badge with its role. */
export function primeImplicantSummary(model: KMapModel): string[] {
  const primes = computePrimeImplicants(model)
  const lines: string[] = []
  primes.forEach((p, i) => {
    const label = `Prime implicant ${i + 1} (covers m${p.cells.join(', m')})`
    if (p.essential) {
      lines.push(
        `${label} — essential. It covers m${p.essentialFor.join(', m')}, a cell that no other prime covers, so it is required.`,
      )
    } else {
      lines.push(
        `${label} — non-essential. It is useful, but other primes can also cover these required cells, so including it is optional.`,
      )
    }
  })
  return lines
}

/* ------------------------- Feature 19 — grouping strategy ------------------------- */

export function groupingStrategy(
  model: KMapModel,
  groups: readonly (readonly number[])[],
  mode: 'sop' | 'pos',
): string[] {
  const feedback: string[] = []
  if (groups.length === 0) return feedback
  const primes = computePrimeImplicants(model)

  groups.forEach((g, gi) => {
    const cells = [...new Set(g)]

    // "A larger group exists": a prime covering these cells is bigger than the group.
    const coveringPrime = primes
      .filter((p) => cells.every((m) => p.cells.includes(m)))
      .sort((a, b) => b.cells.length - a.cells.length)[0]
    if (coveringPrime && coveringPrime.cells.length > cells.length) {
      feedback.push(
        `Group ${gi + 1} is valid, but a larger group exists that could cover cells m${coveringPrime.cells.join(', m')}.`,
      )
    }
    feedback.push(`Group ${gi + 1} → ${termOfGroup(model, cells, mode)}`)
  })

  // Two smaller groups that one larger rectangle could cover.
  for (let i = 0; i < groups.length; i++) {
    for (let j = i + 1; j < groups.length; j++) {
      const unionCells = [...new Set([...groups[i]!, ...groups[j]!])].sort((a, b) => a - b)
      const isPower2 = unionCells.length > 0 && (unionCells.length & (unionCells.length - 1)) === 0
      if (isPower2 && unionCells.length === groups[i]!.length + groups[j]!.length) {
        feedback.push(
          `Groups ${i + 1} and ${j + 1} could be combined into a single larger group covering m${unionCells.join(', m')}.`,
        )
      }
    }
  }

  const covered = unionCoverage(groups)
  const required = new Set(minterms(model))
  const uncovered = [...required].filter((m) => !covered.has(m))
  if (uncovered.length > 0) {
    feedback.push(`Coverage: cell(s) m${uncovered.join(', m')} are not yet covered.`)
  }

  return feedback
}

/* ------------------------- Feature 29 — canonical vs minimal ------------------------- */

export function canonicalVsMinimalExplanation(): string[] {
  return [
    "Canonical form contains a separate term for each specific input combination where the output is 1 (or 0 for POS).",
    'For 3 variables a full canonical SOP has terms like A\'B\'C + A\'BC + AB\'C + ABC.',
    'K-map grouping combines adjacent combinations and eliminates the variable that changes between them.',
    'That removes variables, giving a simplified form such as the single term C.',
  ]
}

/* ------------------------- glossary (Feature 28) ------------------------- */

export interface GlossaryEntry {
  readonly term: string
  readonly text: string
}

export const GLOSSARY: readonly GlossaryEntry[] = [
  { term: 'Minterm', text: 'An input combination that makes the output 1. Often written m2, m3, …' },
  { term: 'Maxterm', text: 'An input combination that makes the output 0. Often written M2, M3, …' },
  { term: "Don't-care", text: 'A cell that may be 0 or 1; we can use it to build larger groups.' },
  { term: 'Implicant', text: 'An adjacent group of 1-cells that can be covered by one term.' },
  { term: 'Prime Implicant', text: 'An implicant that cannot be enlarged by covering more adjacent cells.' },
  { term: 'Essential Prime Implicant', text: 'A prime implicant that must appear because it uniquely covers some 1-cell.' },
  { term: 'Canonical SOP', text: 'Sum of Products with one term per ON-cell (most literal form).' },
  { term: 'Canonical POS', text: 'Product of Sums with one term per OFF-cell.' },
  { term: 'Minimal SOP', text: 'A SOP expression with as few product terms and literals as possible.' },
  { term: 'Minimal POS', text: 'A POS expression with as few sum terms and literals as possible.' },
]

export function glossaryByTerm(term: string): string | undefined {
  return GLOSSARY.find((g) => g.term.toLowerCase() === term.toLowerCase())?.text
}

/* ------------------------- tiny group helpers (reuse core reasoning) ------------------------- */
function literalsOf(variables: readonly string[], minterm: number): BoolLiteral[] {
  return variables.map((v, i) => ({
    name: v,
    negated: ((minterm >> (variables.length - 1 - i)) & 1) === 0,
  }))
}

function analyzeGroupTerm(_model: KMapModel, _cells: readonly number[], _mode: 'sop' | 'pos') {
  const { constant, changed } = analyzeGroupVariables(_model, _cells)
  return {
    sopTerm: termFromConstants(constant, 'sop'),
    posSum: termFromConstants(constant, 'pos'),
    changed,
  }
}
function termOfGroup(model: KMapModel, cells: readonly number[], mode: 'sop' | 'pos'): string {
  return analyzeGroupTerm(model, cells, mode)[mode === 'sop' ? 'sopTerm' : 'posSum']
}