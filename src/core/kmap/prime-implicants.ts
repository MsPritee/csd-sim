/**
 * P3 — Implicant / Prime Implicant / Essential Prime Implicant analysis
 * (Features 12, 13, 14).
 *
 * A Quine–McCluskey-style computation of:
 *   - implicants (groups of adjacent 1-cells),
 *   - prime implicants (implicants not contained in any larger implicant),
 *   - essential prime implicants (prime implicants that uniquely cover a
 *     required minterm).
 *
 * This operates purely on the ON-set + don't-cares and never touches the
 * grid engine, so it composes naturally with the existing model helpers.
 */

import { minterms, dontCares, type KMapModel } from './model'
import { isPowerOfTwo } from './grouping'

export interface BinateGroup {
  readonly cells: readonly number[]
  /** One entry per variable: bit value (0|1) or null when the variable changes. */
  readonly literals: readonly (0 | 1 | null)[]
}

export interface Implicant {
  readonly id: number
  readonly cells: readonly number[]
  /** Literal pattern: 0/1 normal/complemented, null eliminated. */
  readonly pattern: readonly (0 | 1 | null)[]
  readonly prime: boolean
  readonly essential: boolean
  /** Required (ON-set) cells uniquely covered by this prime implicant. */
  readonly essentialFor: readonly number[]
}

export interface CoverageMatrix {
  readonly primes: readonly Implicant[]
  /** Prime index → set of required minterms it covers. */
  readonly coverage: ReadonlyMap<number, ReadonlySet<number>>
  /** Required minterms covered by exactly one prime (these make primes essential). */
  readonly uniquelyCovered: ReadonlyMap<number, number>
}

/** Combine two groups differing in exactly one variable position. */
function combine(a: BinateGroup, b: BinateGroup): BinateGroup | null {
  let diff = -1
  for (let i = 0; i < a.literals.length; i++) {
    if (a.literals[i] !== b.literals[i]) {
      if (diff !== -1) return null
      diff = i
    }
  }
  if (diff === -1) return null
  return {
    cells: [...new Set([...a.cells, ...b.cells])].sort((x, y) => x - y),
    literals: a.literals.map((l, i) => (i === diff ? null : l)),
  }
}

function patternToKey(literals: readonly (0 | 1 | null)[]): string {
  return literals.map((l) => (l === null ? '-' : String(l))).join('')
}

/**
 * Compute all prime implicants for a K-map's ON-set (with don't-cares as
 * flexible cells). Prime implicants only covering don't-care cells are dropped.
 */
export function computePrimeImplicants(model: KMapModel): Implicant[] {
  const vars = model.layout.variables.length
  const on = new Set(minterms(model))
  const dc = new Set(dontCares(model))
  const universe = new Set([...on, ...dc])
  const total = 2 ** vars

  // Start from single cells.
  let groups: BinateGroup[] = [...universe].map((m) => ({
    cells: [m],
    literals: Array.from({ length: vars }, (_, i) => ((m >> (vars - 1 - i)) & 1) as 0 | 1),
  }))

  const primes = new Map<string, Implicant>()
  let id = 0

  for (let size = 1; size <= total; size *= 2) {
    const used = new Set<number>()
    const next: BinateGroup[] = []
    for (let i = 0; i < groups.length; i++) {
      for (let j = i + 1; j < groups.length; j++) {
        const combined = combine(groups[i]!, groups[j]!)
        if (!combined) continue
        // Only merge groups of the same size into a twice-as-large group.
        if (combined.cells.length !== size * 2) continue
        used.add(i)
        used.add(j)
        const key = combined.cells.join(',')
        if (!next.some((g) => g.cells.join(',') === key)) next.push(combined)
      }
    }
    // Groups that could not be merged into a larger group are prime implicants.
    for (let i = 0; i < groups.length; i++) {
      if (used.has(i)) continue
      const g = groups[i]!
      if (g.cells.some((c) => on.has(c))) {
        primes.set(patternToKey(g.literals), {
          id: id++,
          cells: [...g.cells],
          pattern: [...g.literals],
          prime: true,
          essential: false,
          essentialFor: [],
        })
      }
    }
    if (next.length === 0) break
    groups = next
  }

  const list = [...primes.values()]

  // Essential analysis: for each required minterm, count the primes covering it.
  const coverage = new Map<number, Set<number>>()
  for (const p of list) {
    coverage.set(p.id, new Set(p.cells.filter((c) => on.has(c))))
  }
  const uniquelyCovered = new Map<number, number>()
  for (const m of on) {
    let count = 0
    let which = -1
    for (const p of list) {
      if (coverage.get(p.id)!.has(m)) {
        count++
        which = p.id
      }
    }
    if (count === 1) uniquelyCovered.set(m, which)
  }
  return list.map((p) => {
    const essentialOn = [...on].filter((m) => uniquelyCovered.get(m) === p.id)
    return {
      ...p,
      essential: essentialOn.length > 0,
      essentialFor: essentialOn,
    }
  })
}

export function coverageMatrix(model: KMapModel): CoverageMatrix {
  const primes = computePrimeImplicants(model)
  const on = new Set(minterms(model))
  const coverage = new Map<number, ReadonlySet<number>>()
  for (const p of primes) {
    coverage.set(p.id, new Set(p.cells.filter((c) => on.has(c))))
  }
  const uniquelyCovered = new Map<number, number>()
  for (const m of on) {
    let count = 0
    let which = -1
    for (const p of primes) {
      if (coverage.get(p.id)!.has(m)) {
        count++
        which = p.id
      }
    }
    if (count === 1) uniquelyCovered.set(m, which)
  }
  return { primes, coverage, uniquelyCovered }
}

export function isPowerOfTwoCells(g: readonly number[]): boolean {
  return isPowerOfTwo(g.length)
}