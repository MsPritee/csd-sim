import { literalToString, termForGroup } from '../boolean/terms'
import { isPowerOfTwo } from './grouping'
import type { KMapModel } from './model'

export type CellGroup = readonly number[]

export interface GroupedTerm {
  /** Minterm indices covered by this group. */
  readonly cells: readonly number[]
  /** SOP-style product literal set (negated when the constant is 0). */
  readonly product: readonly { name: string; negated: boolean }[]
  /** POS-style sum literal set (negated when the constant is 1). */
  readonly sum: readonly { name: string; negated: boolean }[]
  readonly productText: string
  readonly sumText: string
}

export interface Simplification {
  readonly sopGroups: readonly GroupedTerm[]
  readonly sop: string
  readonly posGroups: readonly GroupedTerm[]
  readonly pos: string
}

function cyclicBlocks(axis: number): number[][] {
  const blocks: number[][] = []
  const seen = new Set<string>()
  for (let size = 1; size <= axis; size *= 2) {
    for (let start = 0; start < axis; start++) {
      const block: number[] = []
      for (let i = 0; i < size; i++) block.push((start + i) % axis)
      const key = [...block].sort((a, b) => a - b).join(',')
      if (seen.has(key)) continue
      seen.add(key)
      blocks.push(block)
    }
  }
  return blocks
}

function rectangleCells(kmap: KMapModel, rows: number[], cols: number[]): number[] {
  const cells: number[] = []
  const rowSet = new Set(rows)
  const colSet = new Set(cols)
  for (const rowCells of kmap.cells) {
    for (const cell of rowCells) {
      if (rowSet.has(cell.row) && colSet.has(cell.col)) cells.push(cell.minterm)
    }
  }
  return cells
}

/** All valid rectangular groups (power-of-two dims, wrap-aware) inside `eligible`. */
function enumerateRectangles(kmap: KMapModel, eligible: ReadonlySet<number>): CellGroup[] {
  const { rows, cols } = kmap.layout
  const rowBlocks = cyclicBlocks(rows)
  const colBlocks = cyclicBlocks(cols)
  const groups: CellGroup[] = []

  for (const rowBlock of rowBlocks) {
    for (const colBlock of colBlocks) {
      const cells = rectangleCells(kmap, rowBlock, colBlock)
      if (!isPowerOfTwo(cells.length)) continue
      if (!cells.every((c) => eligible.has(c))) continue
      groups.push(cells)
    }
  }
  return groups
}

/** Product literals from a group: constant-1 variable -> literal, constant-0 -> negated. */
function productFromGroup(variables: readonly string[], group: CellGroup) {
  return termForGroup(variables, group).map((l) => ({ name: l.name, negated: l.negated }))
}

/** Sum literals (maxterm polarity): constant-1 -> negated, constant-0 -> literal. */
function sumFromGroup(variables: readonly string[], group: CellGroup) {
  return productFromGroup(variables, group).map((l) => ({ name: l.name, negated: !l.negated }))
}

function sumText(literals: readonly { name: string; negated: boolean }[]): string {
  if (literals.length === 0) return '1'
  return literals.map(literalToString).join(' + ')
}

/**
 * Exact minimum prime-implicant cover for small K-maps.
 *
 * Algorithm (Quine–McCluskey inspired):
 *  1. Enumerate all valid rectangular groups (power-of-2 dimensions, wrap-aware)
 *     that cover at least one required cell and consist entirely of eligible cells.
 *  2. Reduce to prime implicants: groups that are not properly contained in any
 *     other valid group.
 *  3. Identify essential prime implicants: PIs that are the sole cover for at
 *     least one required cell.
 *  4. For remaining uncovered required cells, brute-force all subsets of the
 *     remaining (non-essential) PIs to find the minimum-cost cover.
 *
 * Cost metric (in priority order):
 *  - Fewer product terms (groups)
 *  - Fewer total literals (larger groups eliminate more variables)
 *
 * For K-maps up to 5 variables (32 cells), the number of PIs is small enough
 * that brute-force enumeration is instantaneous.
 */
export function minimizeCover(
  kmap: KMapModel,
  eligible: ReadonlySet<number>,
  required: ReadonlySet<number>,
): CellGroup[] {
  if (required.size === 0) return []

  const numVars = kmap.layout.variables.length

  // Step 1: all valid rectangular groups covering at least one required cell.
  const candidates = enumerateRectangles(kmap, eligible).filter((g) =>
    g.some((c) => required.has(c)),
  )

  // Step 2: extract prime implicants (not properly contained in another candidate).
  const primes = candidates.filter(
    (g) => !candidates.some((other) => other !== g && g.every((c) => other.includes(c))),
  )

  // Step 3: find essential prime implicants.
  const essential: CellGroup[] = []
  const covered = new Set<number>()
  for (const cell of required) {
    if (covered.has(cell)) continue
    const coveringPrimes = primes.filter((p) => p.includes(cell))
    if (coveringPrimes.length === 1) {
      essential.push(coveringPrimes[0]!)
      for (const c of coveringPrimes[0]!) covered.add(c)
    }
  }

  // Step 4: brute-force minimum cover for remaining uncovered required cells.
  const remaining = [...required].filter((c) => !covered.has(c))
  if (remaining.length === 0) return essential

  const remainingSet = new Set(remaining)
  const nonEssential = primes.filter((p) => !essential.includes(p))
  const additional = bruteForceMinCover(nonEssential, remainingSet, numVars)

  return [...essential, ...additional]
}

/**
 * Brute-force search over all subsets of candidates to find the minimum-cost
 * cover of `remaining` cells. Cost = (terms × multiplier) + total literals.
 */
function bruteForceMinCover(
  candidates: CellGroup[],
  remaining: ReadonlySet<number>,
  numVars: number,
): CellGroup[] {
  if (remaining.size === 0) return []

  // Pre-filter: only candidates that cover at least one remaining cell.
  const relevant = candidates.filter((g) => g.some((c) => remaining.has(c)))
  if (relevant.length === 0) return []

  // Sort by group size descending so smaller subsets are explored first for
  // early termination (subset size 1, 2, 3, …).
  relevant.sort((a, b) => b.length - a.length)

  let best: CellGroup[] | null = null
  let bestCost = Infinity

  const n = relevant.length
  // Try subsets in increasing cardinality for early termination.
  for (let size = 1; size <= n; size++) {
    for (const subset of combinations(relevant, size)) {
      const subsetCovered = new Set<number>()
      for (const g of subset) for (const c of g) subsetCovered.add(c)
      if (![...remaining].every((c) => subsetCovered.has(c))) continue

      const cost = coverCost(subset, numVars)
      if (cost < bestCost) {
        bestCost = cost
        best = Array.from(subset) as CellGroup[]
      }
    }
    // If we found a valid cover of this size, no need to try larger sizes
    // (more terms is always worse).
    if (best !== null) break
  }

  return best ?? []
}

/**
 * Cost of a cover: primary = number of terms, secondary = total literals.
 * Uses a multiplier of 1000 so fewer terms always wins.
 */
function coverCost(groups: readonly CellGroup[], numVars: number): number {
  let totalLiterals = 0
  for (const g of groups) {
    totalLiterals += literalsForGroup(g.length, numVars)
  }
  return groups.length * 1000 + totalLiterals
}

/**
 * Number of literals in the product term for a valid rectangular group.
 * A group of size 2^j eliminates j variables → term has (numVars − j) literals.
 */
function literalsForGroup(groupSize: number, numVars: number): number {
  if (groupSize <= 0) return numVars
  return numVars - Math.log2(groupSize)
}

/** Yield all k-element subsets of arr (combinations). */
function* combinations<T>(arr: readonly T[], k: number): Generator<readonly T[]> {
  if (k === 0) { yield []; return }
  if (k > arr.length) return
  for (let i = 0; i <= arr.length - k; i++) {
    for (const rest of combinations(arr.slice(i + 1), k - 1)) {
      yield [arr[i]!, ...rest]
    }
  }
}

/** Builds SOP and POS simplified forms from a K-map. */
export function simplify(
  kmap: KMapModel,
  ones: ReadonlySet<number>,
  zeros: ReadonlySet<number>,
  dontCares: ReadonlySet<number>,
): Simplification {
  const variables = [...kmap.layout.variables]
  const withDc = (base: ReadonlySet<number>) => new Set([...base, ...dontCares])

  const sopGroups = minimizeCover(kmap, withDc(ones), ones)
  const posGroups = minimizeCover(kmap, withDc(zeros), zeros)

  const build = (groups: CellGroup[]): GroupedTerm[] =>
    groups.map((g) => {
      const product = productFromGroup(variables, g)
      const sum = sumFromGroup(variables, g)
      return {
        cells: [...g],
        product,
        sum,
        productText: product.length === 0 ? '1' : product.map(literalToString).join(''),
        sumText: sumText(sum),
      }
    })

  const sopTerms = build(sopGroups)
  const posTerms = build(posGroups)

  const sop =
    sopTerms.length === 0
      ? ones.size === 0
        ? '0'
        : '1'
      : sopTerms.map((t) => t.productText).join(' + ')
  const pos =
    posTerms.length === 0
      ? zeros.size === 0
        ? '1'
        : '0'
      : posTerms.map((t) => `(${t.sumText})`).join('')

  return { sopGroups: sopTerms, sop, posGroups: posTerms, pos }
}