import { mintermToCell, type KMapModel } from './model'

/**
 * Pure, reusable variable/grouplevel reasoning on top of the existing K-map
 * model. This is the educational "WHY" companion to the structural validator:
 * it answers what changes, what stays constant, and how a term is derived —
 * without re-implementing the K-map engine.
 */

export interface GroupVariableRow {
  readonly minterm: number
  /** One bit per variable, most-significant bit first. */
  readonly bits: readonly number[]
}

export interface GroupVariableAnalysis {
  readonly variables: readonly string[]
  /** Variables that stay at one value across every cell in the group. */
  readonly constant: readonly { name: string; value: number }[]
  /** Variables that flip somewhere inside the group (they are eliminated). */
  readonly changed: readonly string[]
  readonly rows: readonly GroupVariableRow[]
}

function bitsOf(minterm: number, n: number): number[] {
  const bits: number[] = []
  for (let i = 0; i < n; i++) bits.push((minterm >> (n - 1 - i)) & 1)
  return bits
}

/**
 * Compare every cell in a group per variable. A variable is "constant" when it
 * holds the same value in all cells; otherwise it "changes" and will be
 * eliminated from the simplified term.
 */
export function analyzeGroupVariables(
  kmap: KMapModel,
  group: readonly number[],
): GroupVariableAnalysis {
  const variables = [...kmap.layout.variables]
  const n = variables.length
  const cells = [...new Set(group)]
  const rows = cells.map((m) => ({ minterm: m, bits: bitsOf(m, n) }))

  const constant: { name: string; value: number }[] = []
  const changed: string[] = []
  for (let i = 0; i < n; i++) {
    const values = new Set(rows.map((r) => r.bits[i]))
    if (values.size === 1) {
      constant.push({ name: variables[i]!, value: [...values][0]! })
    } else {
      changed.push(variables[i]!)
    }
  }

  return { variables, constant, changed, rows }
}

/**
 * Build the Boolean term from a group's constant variables.
 * SOP complements the constants that are 0 (product of literals); POS
 * complements the constants that are 1 (sum of literals). An empty result
 * (every variable changed / all cells) collapses to the constant 1.
 */
export function termFromConstants(
  constant: readonly { name: string; value: number }[],
  mode: 'sop' | 'pos',
): string {
  const joined = constant
    .map((c) => {
      const negated = mode === 'sop' ? c.value === 0 : c.value === 1
      return negated ? `${c.name}'` : c.name
    })
    .join(mode === 'sop' ? '' : ' + ')
  return joined === '' ? '1' : joined
}

export interface GroupTermResult {
  readonly sopTerm: string
  readonly posSum: string
}

/** Derive both the SOP product term and POS sum term for a group. */
export function groupTerm(
  kmap: KMapModel,
  group: readonly number[],
): GroupTermResult {
  const { constant } = analyzeGroupVariables(kmap, group)
  return {
    sopTerm: termFromConstants(constant, 'sop'),
    posSum: termFromConstants(constant, 'pos'),
  }
}

/** True when a group crosses a K-map seam (its occupied axis is non-contiguous). */
export function groupWraps(kmap: KMapModel, group: readonly number[]): boolean {
  const rows = new Set<number>()
  const cols = new Set<number>()
  for (const m of new Set(group)) {
    const { row, col } = mintermToCell(kmap, m)
    rows.add(row)
    cols.add(col)
  }
  const interval = (indices: Set<number>): boolean => {
    const sorted = [...indices].sort((a, b) => a - b)
    if (sorted.length <= 1) return false
    const span = sorted[sorted.length - 1]! - sorted[0]! + 1
    return span !== sorted.length
  }
  return interval(rows) || interval(cols)
}

/**
 * Which edges a wrapping group crosses, described as left/right or top/bottom.
 * Returns only the axes that actually wrap.
 */
export function wrapEdges(
  kmap: KMapModel,
  group: readonly number[],
): readonly ('left-right' | 'top-bottom')[] {
  const rows = new Set<number>()
  const cols = new Set<number>()
  for (const m of new Set(group)) {
    const { row, col } = mintermToCell(kmap, m)
    rows.add(row)
    cols.add(col)
  }
  const interval = (indices: Set<number>): boolean => {
    const sorted = [...indices].sort((a, b) => a - b)
    if (sorted.length <= 1) return false
    const span = sorted[sorted.length - 1]! - sorted[0]! + 1
    return span !== sorted.length
  }
  const edges: ('left-right' | 'top-bottom')[] = []
  if (interval(cols)) edges.push('left-right')
  if (interval(rows)) edges.push('top-bottom')
  return edges
}