import { describe, expect, it } from 'vitest'
import {
  adjacentMinterms,
  adjacencyDirection,
  differInOneVariable,
  isAdjacent,
  neighborsOf,
} from '../../../core/kmap/adjacency'
import { createKMap, type KMapModel } from '../../../core/kmap/model'

const kmap3 = createKMap(['A', 'B', 'C'])
const kmap4 = createKMap(['A', 'B', 'C', 'D'])

function mintermAt(kmap: KMapModel, row: number, col: number): number {
  return kmap.cells[row]![col]!.minterm
}

const numAsc = (a: number, b: number) => a - b

describe('neighborsOf', () => {
  it('returns four neighbors for an interior 4-variable cell', () => {
    const neighbors = neighborsOf(kmap4, 1, 1)
    expect(neighbors.map((n) => n.cell.minterm).sort(numAsc)).toEqual([1, 4, 7, 13])
  })

  it('wraps horizontally (right of the last column)', () => {
    const neighbors = neighborsOf(kmap4, 0, 2)
    const cols = neighbors.filter((n) => n.direction === 'horizontal').map((n) => n.cell.col)
    expect(cols.sort()).toEqual([1, 3])
  })

  it('wraps vertically around (bottom row to top)', () => {
    const neighbors = neighborsOf(kmap4, 3, 0)
    expect(neighbors.map((n) => n.cell.minterm)).toContain(0)
  })

  it('throws on out-of-bounds coordinates', () => {
    expect(() => neighborsOf(kmap4, 4, 0)).toThrow()
  })
})

describe('adjacencyDirection', () => {
  it('classifies row neighbours as horizontal', () => {
    expect(adjacencyDirection(kmap3, 0, 1)).toBe('horizontal')
    expect(adjacencyDirection(kmap3, 2, 3)).toBe('horizontal')
  })

  it('classifies column neighbours as vertical', () => {
    expect(adjacencyDirection(kmap3, 0, 4)).toBe('vertical')
    expect(adjacencyDirection(kmap3, 3, 7)).toBe('vertical')
  })

  it('returns null for diagonal, distant, or identical cells', () => {
    expect(adjacencyDirection(kmap4, 0, 15)).toBeNull()
    expect(adjacencyDirection(kmap4, 1, 6)).toBeNull() // diagonal
    expect(adjacencyDirection(kmap4, 5, 5)).toBeNull()
  })
})

describe('isAdjacent', () => {
  it('accepts left/right and top/bottom adjacency', () => {
    expect(isAdjacent(kmap3, 0, 1)).toBe(true)
    expect(isAdjacent(kmap3, 0, 4)).toBe(true)
  })

  it('accepts wrap-around adjacency', () => {
    // 0 at (0,0) and 2 at (0,3) are horizontally wrapped
    expect(isAdjacent(kmap4, 0, 2)).toBe(true)
    // 0 at (0,0) and 8 at (3,0) are vertically wrapped
    expect(isAdjacent(kmap4, 0, 8)).toBe(true)
  })

  it('rejects non-adjacent cells', () => {
    expect(isAdjacent(kmap4, 0, 6)).toBe(false)
    expect(isAdjacent(kmap4, 4, 4)).toBe(false)
  })
})

describe('adjacentMinterms', () => {
  it('returns the same set as neighborsOf', () => {
    const row = 2
    const col = 1
    const expected = neighborsOf(kmap4, row, col)
      .map((n) => n.cell.minterm)
      .sort(numAsc)
    const actual = adjacentMinterms(kmap4, mintermAt(kmap4, row, col)).sort(numAsc)
    expect(actual).toEqual(expected)
  })

  it('includes wrap-around neighbours', () => {
    const actual = adjacentMinterms(kmap4, mintermAt(kmap4, 0, 0))
    expect(actual.sort(numAsc)).toEqual([1, 2, 4, 8])
  })
})

describe('differInOneVariable', () => {
  it('holds for every adjacent pair in a 4-variable map', () => {
    const cells = kmap4.cells.flat()
    for (const cell of cells) {
      for (const neighbor of adjacentMinterms(kmap4, cell.minterm)) {
        expect(differInOneVariable(kmap4, cell.minterm, neighbor)).toBe(true)
      }
    }
  })

  it('rejects identical cells', () => {
    expect(differInOneVariable(kmap4, 5, 5)).toBe(false)
  })

  it('rejects pairs differing in two bits', () => {
    expect(differInOneVariable(kmap4, 0, 15)).toBe(false)
  })
})