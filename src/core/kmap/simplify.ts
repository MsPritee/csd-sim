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
 * Greedy prime-implicant cover. Only groups containing at least one
 * `required` (real, non-dont-care) cell are candidates; ties favour larger
 * groups.
 */
export function minimizeCover(
  kmap: KMapModel,
  eligible: ReadonlySet<number>,
  required: ReadonlySet<number>,
): CellGroup[] {
  if (required.size === 0) return []
  const candidates = enumerateRectangles(kmap, eligible).filter((g) =>
    g.some((c) => required.has(c)),
  )

  const covered = new Set<number>()
  const chosen: CellGroup[] = []
  let remaining = [...required].filter((c) => !covered.has(c))

  while (remaining.length > 0) {
    let best: CellGroup | null = null
    let bestScore = -1
    for (const group of candidates) {
      const fresh = group.filter((c) => !covered.has(c)).length
      if (fresh === 0) continue
      const score = fresh * 100_000 + (8 - group.length)
      if (score > bestScore) {
        bestScore = score
        best = group
      }
    }
    if (!best) break
    chosen.push(best)
    for (const c of best) covered.add(c)
    remaining = [...required].filter((c) => !covered.has(c))
  }
  return chosen
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