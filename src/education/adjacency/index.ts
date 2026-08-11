import type { KMapModel } from '../../core/kmap'
import { valueAt, isAdjacent, variableDifference } from '../../core/kmap'
import { validateGroup, isPowerOfTwo } from '../../core/kmap/grouping'
import {
  analyzeGroupVariables,
  groupTerm,
  groupWraps,
  wrapEdges,
  termFromConstants,
} from '../../core/kmap/group-reasoning'

/**
 * Educational explanations for adjacency, group validity, and variable
 * elimination. This is the "WHY" layer: it takes core, data-only inputs
 * (numbers + a K-map model) and produces beginner-friendly reasoning. It never
 * renders React and never re-computes K-map maths itself.
 */

export interface AdjacencyExplanation {
  a: number
  b: number
  isAdjacent: boolean
  /** Variables that differ between the two input combinations. */
  changing: string[]
  /** Variables that are the same in both. */
  constant: string[]
  hamming: number
  binA: string
  binB: string
  /** Level 1 — simplest wording. */
  simple: string
  /** Level 2 — why it matters (the variable that can be eliminated). */
  conceptual: string
  /** Level 3 — the Boolean identity. */
  math?: string
}

function padBinary(minterm: number, n: number): string {
  return minterm.toString(2).padStart(n, '0')
}

/**
 * Explain why two cells are (or are not) adjacent, with progressive levels.
 * The math level shows the X + X' = 1 identity that lets the changing variable
 * cancel — generated from the real constant literals of the pair.
 */
export function explainAdjacency(kmap: KMapModel, a: number, b: number): AdjacencyExplanation {
  const n = kmap.layout.variables.length
  const { changing, constant } = variableDifference(kmap, a, b)
  const isAdj = isAdjacent(kmap, a, b)
  const binA = padBinary(a, n)
  const binB = padBinary(b, n)

  let simple: string
  let conceptual: string
  let math: string | undefined

  if (isAdj) {
    simple = `m${a} and m${b} sit next to each other on the K-map (${binA} → ${binB}).`
    conceptual = `They differ in only one variable (${changing[0]}), so that variable can be eliminated.`
    const pairAnalysis = analyzeGroupVariables(kmap, [a, b])
    const k = termFromConstants(pairAnalysis.constant, 'sop')
    math = `(${changing[0]} + ${changing[0]}') · ${k} = ${k}   (X + X' = 1)`
  } else {
    simple = `m${a} and m${b} are not neighbours on the K-map.`
    conceptual =
      `They differ in ${changing.length} variable${changing.length === 1 ? '' : 's'} ` +
      `(${changing.join(', ')}). Adjacent cells may differ in only one variable.`
    math = `Binary ${binA} and ${binB} differ in ${changing.length} bits, so they are not adjacent in a K-map.`
  }

  return {
    a,
    b,
    isAdjacent: isAdj,
    changing,
    constant,
    hamming: changing.length,
    binA,
    binB,
    simple,
    conceptual,
    math,
  }
}

export interface ReasonLine {
  ok: boolean
  text: string
}

export interface NonAdjacentDetail {
  from: number
  to: number
  changing: string[]
  binFrom: string
  binTo: string
}

export interface GroupExplanation {
  valid: boolean
  groupSize: number
  /** Checklist of why the group is or is not valid. */
  reasons: readonly ReasonLine[]
  /** Edges crossed by the group, if it wraps. */
  wrapEdges: readonly ('left-right' | 'top-bottom')[]
  wraps: boolean
  usesDontCares: boolean
  /** A representative far-apart pair, shown only when the group is invalid. */
  nonAdjacentDetail?: NonAdjacentDetail
  term: { sop: string; pos: string }
}

function modeValue(mode: 'sop' | 'pos'): 1 | 0 {
  return mode === 'sop' ? 1 : 0
}

/**
 * Explain why a manually selected group is valid or invalid, grounded in the
 * existing structural validator. Includes: required-cell check, power-of-two,
 * rectangle, wrap-around, don't-care usage, and (when invalid) a representative
 * pair that violates adjacency with its binary difference.
 */
export function explainGroup(
  kmap: KMapModel,
  group: readonly number[],
  mode: 'sop' | 'pos',
): GroupExplanation {
  const cells = [...new Set(group)].sort((a, b) => a - b)
  const size = cells.length
  const validation = validateGroup(kmap, cells)
  const desired = modeValue(mode)

  const reasons: ReasonLine[] = []
  const usesDontCares = cells.some((m) => valueAt(kmap, m) === 'X')
  const allRequiredAllowed = cells.every((m) => {
    const v = valueAt(kmap, m)
    return v === desired || v === 'X'
  })

  reasons.push({
    ok: allRequiredAllowed,
    text: allRequiredAllowed
      ? `Contains only the required ${desired} cells (don't-cares may be used).`
      : `Contains a cell that is ${1 - desired} — not allowed in a ${mode.toUpperCase()} group.`,
  })

  reasons.push({
    ok: isPowerOfTwo(size),
    text: isPowerOfTwo(size)
      ? `Group size = ${size}, which is a power of 2.`
      : `Group size = ${size}, which is not a power of 2 (allowed: 1, 2, 4, 8, 16).`,
  })

  const rectangular = validation.valid
  reasons.push({
    ok: rectangular,
    text: rectangular
      ? 'Cells form a valid rectangle of adjacent cells.'
      : 'Cells do not form a valid rectangle of adjacent cells.',
  })

  const wraps = groupWraps(kmap, cells)
  if (wraps) {
    reasons.push({ ok: true, text: 'Wrap-around adjacency is valid (the K-map edges are connected).' })
  }
  if (usesDontCares) {
    reasons.push({
      ok: true,
      text: 'X cells can be treated as 1 (SOP) or 0 (POS) when it helps form a larger group.',
    })
  }

  const term = groupTerm(kmap, cells)
  const termLabels = { sop: term.sopTerm, pos: term.posSum }

  let nonAdjacentDetail: NonAdjacentDetail | undefined
  if (!validation.valid) {
    outer: for (let i = 0; i < cells.length; i++) {
      for (let j = i + 1; j < cells.length; j++) {
        const from = cells[i]!
        const to = cells[j]!
        if (!isAdjacent(kmap, from, to)) {
          const n = kmap.layout.variables.length
          const { changing } = variableDifference(kmap, from, to)
          nonAdjacentDetail = {
            from,
            to,
            changing,
            binFrom: padBinary(from, n),
            binTo: padBinary(to, n),
          }
          break outer
        }
      }
    }
  }

  return {
    valid: validation.valid && size > 0 && allRequiredAllowed,
    groupSize: size,
    reasons,
    wrapEdges: wrapEdges(kmap, cells),
    wraps,
    usesDontCares,
    nonAdjacentDetail,
    term: termLabels,
  }
}