/**
 * P3 — Solution analysis: canonical vs minimal, cost, comparison, minimality
 * and in-session history (Features 15–18, 26, 29).
 *
 * Correctness is decided with the shared Boolean parser's truth table and the
 * existing simplification / equivalence engines. No copy of the K-map engine.
 */

import { minterms, createKMap, type KMapModel } from './model'
import { simplify } from './simplify'
import {
  parseBooleanExpression,
  detectMode,
  sopTermLists,
  posSumLists,
  termCounts,
  expressionTruthTable,
  expressionTruthTableFromNode,
  type BoolLiteral,
} from '../boolean/expression'
import { mintermToString } from '../boolean/terms'

export interface CostReport {
  readonly terms: number
  readonly literals: number
  /** Transparent gate-count heuristic — NOT an actual hardware cost. */
  readonly estimatedGates: number
  readonly form: 'sop' | 'pos'
}

/** Cost of an existing expression string (SOP or POS). */
export function costOfExpression(expression: string, mode: 'sop' | 'pos'): CostReport {
  const tree = parseBooleanExpression(expression)
  const actualMode = mode === 'pos' ? 'pos' : detectMode(tree)
  const counts = termCounts(tree)
  return {
    terms: counts.terms,
    literals: counts.literals,
    estimatedGates: estimatedGates(counts.terms, counts.literals),
    form: actualMode,
  }
}

/** A transparent gate-count estimate (feature 18 caveat). */
export function estimatedGates(terms: number, literals: number): number {
  return literals + terms
}

/** Boolean absorption explanation for a redundant term (Feature 17). */
export function absorptionReason(reduced: string, term: string): string {
  return `${reduced} already covers every case that ${term} covers, so ${term} is absorbed (X + XY = X).`
}

/** Cost of a K-map's simplified form for the requested mode. */
export function costOfSimplification(
  variables: readonly string[],
  mode: 'sop' | 'pos',
  on: ReadonlySet<number>,
  off: ReadonlySet<number>,
  dc: ReadonlySet<number>,
): CostReport {
  const s = simplify(createKMap(variables), on, off, dc)
  const text = mode === 'sop' ? s.sop : s.pos
  return costOfExpression(text, mode)
}

/* ------------------------- student solution quality ------------------------- */

export interface SolutionQuality {
  readonly valid: boolean
  readonly equivalent: boolean
  readonly minimal: boolean
  readonly redundantTerms: readonly string[]
}

/**
 * Classify a student expression against a K-map's known minimal cover.
 * Equivalence is truth-table equality; a term is flagged redundant if the
 * rest of the expression already implies it.
 */
export function analyzeExpression(
  model: KMapModel,
  variables: readonly string[],
  mode: 'sop' | 'pos',
  expression: string,
  expected: { readonly sop: string; readonly pos: string },
): SolutionQuality {
  const tree = parseBooleanExpression(expression)
  const tt = expressionTruthTable(expression, variables)
  const valid = matchesModel(model, tt)

  const expectedTT = expressionTruthTableFromNode(
    parseBooleanExpression(mode === 'sop' ? expected.sop : expected.pos),
    variables,
  )
  const equivalent = equalArrays(tt, expectedTT)

  const myTerms = mode === 'sop' ? sopTermLists(tree) : posSumLists(tree)
  const redundant = myTerms
    .map((term) => ({ term, index: myTerms.indexOf(term) }))
    .filter(({ index }, i) => index === i)
    .filter(({ index }) => {
      const reduced = myTerms.filter((_, j) => j !== index)
      return reduced.length > 0 && equalArrays(truthTableOfTerms(reduced, variables, mode), tt)
    })
    .map(({ term }) => termString(term, mode))

  const expectedTerms = mode === 'sop' ? sopTermLists(parseBooleanExpression(expected.sop)) : posSumLists(parseBooleanExpression(expected.pos))
  const minimal = equivalent && redundant.length === 0 && myTerms.length <= expectedTerms.length

  return { valid, equivalent, minimal, redundantTerms: redundant }
}

/* ------------------------- comparisons (Feature 15, 16) ------------------------- */

export interface ComparedSolution {
  readonly expression: string
  readonly cost: CostReport
  readonly minterms: readonly number[]
}

export interface SolutionComparison {
  readonly a: ComparedSolution
  readonly b: ComparedSolution
  readonly equivalent: boolean
  readonly verdict: string
}

export function compareSolutions(
  variables: readonly string[],
  mode: 'sop' | 'pos',
  expressionA: string,
  expressionB: string,
): SolutionComparison {
  const ttA = expressionTruthTable(expressionA, variables)
  const ttB = expressionTruthTable(expressionB, variables)
  const mintermsOf = (tt: readonly number[]) =>
    tt.map((o, m) => (o === 1 ? m : -1)).filter((m) => m >= 0)

  const equivalent = equalArrays(ttA, ttB)
  const costA = costOfExpression(expressionA, mode)
  const costB = costOfExpression(expressionB, mode)

  let verdict: string
  if (!equivalent) {
    verdict = 'These solutions are NOT equivalent — they produce different outputs for some input.'
  } else if (costA.literals === costB.literals) {
    verdict = 'Both solutions are equivalent and use the same number of literals.'
  } else if (costA.literals < costB.literals) {
    verdict = 'Both are logically equivalent, but Solution A uses fewer literals.'
  } else {
    verdict = 'Both are logically equivalent, but Solution B uses fewer literals.'
  }

  return {
    a: { expression: expressionA, cost: costA, minterms: mintermsOf(ttA) },
    b: { expression: expressionB, cost: costB, minterms: mintermsOf(ttB) },
    equivalent,
    verdict,
  }
}

/* ------------------------- canonical forms (Feature 29) ------------------------- */

export interface CanonicalForms {
  readonly canonicalSop: string
  readonly canonicalPos: string
  readonly simplifiedSop: string
  readonly simplifiedPos: string
}

export function canonicalForms(
  variables: readonly string[],
  on: ReadonlySet<number>,
  off: ReadonlySet<number>,
  dc: ReadonlySet<number>,
): CanonicalForms {
  const ones = [...on].sort((a, b) => a - b)
  const zeros = [...off].sort((a, b) => a - b)
  const canonicalSop = ones.map((m) => mintermToString(variables, m)).join(' + ') || '0'
  const max = zeros.map((m) => `(${maxtermString(variables, m)})`).join('') || '1'

  const s = simplify(createKMap(variables), on, off, dc)
  return {
    canonicalSop,
    canonicalPos: max,
    simplifiedSop: s.sop,
    simplifiedPos: s.pos,
  }
}

function maxtermString(variables: readonly string[], m: number): string {
  const n = variables.length
  const literals: string[] = []
  for (let i = 0; i < n; i++) {
    const bit = (m >> (n - 1 - i)) & 1
    literals.push(bit === 1 ? `${variables[i]}'` : variables[i]!)
  }
  return literals.join(' + ')
}

/* ------------------------- history (Feature 26) ------------------------- */

export interface HistoryEntry {
  readonly id: number
  readonly expression: string
  readonly mode: 'sop' | 'pos'
  readonly terms: number
  readonly literals: number
  readonly timestamp: number
}

/** Keep history within the current session (no persistence). */
export function recordHistory(
  prev: readonly HistoryEntry[],
  entry: HistoryEntry,
): readonly HistoryEntry[] {
  return [...prev, entry].slice(-10)
}

export function historyComment(a: HistoryEntry, b: HistoryEntry): string {
  if (b.literals < a.literals) return 'Your second solution is simpler (fewer literals).'
  if (b.literals > a.literals) return 'Your earlier solution used fewer literals.'
  return 'Both solutions cost the same.'
}

/* ------------------------- internal helpers ------------------------- */

function termString(term: readonly BoolLiteral[], mode: 'sop' | 'pos'): string {
  const names = term.map((l) => (l.negated ? `${l.name}'` : l.name))
  if (names.length === 0) return mode === 'sop' ? '1' : '0'
  return mode === 'sop' ? names.join('') : names.join(' + ')
}

function truthTableOfTerms(
  terms: readonly (readonly BoolLiteral[])[],
  variables: readonly string[],
  mode: 'sop' | 'pos',
): number[] {
  const total = 2 ** variables.length
  const tt: number[] = []
  for (let m = 0; m < total; m++) {
    const bits = new Map<string, number>()
    variables.forEach((v, i) => bits.set(v, (m >> (variables.length - 1 - i)) & 1))
    if (mode === 'sop') {
      tt.push(terms.some((t) => t.length === 0 || t.every((l) => (bits.get(l.name) ?? 0) === (l.negated ? 0 : 1))) ? 1 : 0)
    } else {
      tt.push(terms.every((t) => t.some((l) => (bits.get(l.name) ?? 0) === (l.negated ? 0 : 1))) ? 1 : 0)
    }
  }
  return tt
}

function matchesModel(model: KMapModel, tt: readonly number[]): boolean {
  const on = new Set(minterms(model))
  for (let m = 0; m < tt.length; m++) {
    if (tt[m] !== (on.has(m) ? 1 : 0)) return false
  }
  return true
}

function equalArrays(a: readonly number[], b: readonly number[]): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false
  return true
}