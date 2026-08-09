import { describe, expect, it } from 'vitest'
import {
  cellAt,
  cellToMinterm,
  createKMap,
  dontCares,
  maxterms,
  mintermToCell,
  minterms,
  mintermsWithValue,
  valueAt,
  withValue,
} from '../../../core/kmap/model'

describe('createKMap : 2 variables', () => {
  const kmap = createKMap(['A', 'B'])

  it('builds a 2x2 grid', () => {
    expect(kmap.layout.rows).toBe(2)
    expect(kmap.layout.cols).toBe(2)
  })

  it('labels rows and columns with gray codes', () => {
    expect(kmap.layout.rowLabels).toEqual(['0', '1'])
    expect(kmap.layout.colLabels).toEqual(['0', '1'])
  })

  it('lays out minterms in standard order', () => {
    const grid = kmap.cells.map((row) => row.map((cell) => cell.minterm))
    expect(grid).toEqual([
      [0, 1],
      [2, 3],
    ])
  })
})

describe('createKMap : 3 variables', () => {
  const kmap = createKMap(['A', 'B', 'C'])

  it('builds a 2x4 grid', () => {
    expect(kmap.layout.rows).toBe(2)
    expect(kmap.layout.cols).toBe(4)
  })

  it('splits A on rows, BC on columns', () => {
    expect(kmap.layout.rowVariables).toEqual(['A'])
    expect(kmap.layout.colVariables).toEqual(['B', 'C'])
  })

  it('uses gray column labels 00 01 11 10', () => {
    expect(kmap.layout.colLabels).toEqual(['00', '01', '11', '10'])
  })

  it('lays out minterms in standard order', () => {
    const grid = kmap.cells.map((row) => row.map((cell) => cell.minterm))
    expect(grid).toEqual([
      [0, 1, 3, 2],
      [4, 5, 7, 6],
    ])
  })
})

describe('createKMap : 4 variables', () => {
  const kmap = createKMap(['A', 'B', 'C', 'D'])

  it('builds a 4x4 grid', () => {
    expect(kmap.layout.rows).toBe(4)
    expect(kmap.layout.cols).toBe(4)
  })

  it('splits variables AB on rows, CD on columns', () => {
    expect(kmap.layout.rowVariables).toEqual(['A', 'B'])
    expect(kmap.layout.colVariables).toEqual(['C', 'D'])
  })

  it('lays out minterms in standard order', () => {
    const grid = kmap.cells.map((row) => row.map((cell) => cell.minterm))
    expect(grid).toEqual([
      [0, 1, 3, 2],
      [4, 5, 7, 6],
      [12, 13, 15, 14],
      [8, 9, 11, 10],
    ])
  })
})

describe('mintermToCell / cellToMinterm', () => {
  it('round-trips for all cells in a 4-variable map', () => {
    const kmap = createKMap(['A', 'B', 'C', 'D'])
    for (let m = 0; m < 16; m++) {
      const { row, col } = mintermToCell(kmap, m)
      expect(cellAt(kmap, row, col).minterm).toBe(m)
      expect(cellToMinterm(kmap, row, col)).toBe(m)
    }
  })

  it('round-trips for a 3-variable map', () => {
    const kmap = createKMap(['A', 'B', 'C'])
    for (let m = 0; m < 8; m++) {
      const { row, col } = mintermToCell(kmap, m)
      expect(cellToMinterm(kmap, row, col)).toBe(m)
    }
  })
})

describe('cell values', () => {
  it('defaults every cell to null', () => {
    const kmap = createKMap(['A', 'B'])
    expect(mintermsWithValue(kmap, null)).toHaveLength(4)
    expect(minterms(kmap)).toEqual([])
  })

  it('sets and reads a value by minterm', () => {
    let kmap = createKMap(['A', 'B', 'C'])
    kmap = withValue(kmap, 5, 1)
    expect(valueAt(kmap, 5)).toBe(1)
    expect(minterms(kmap)).toEqual([5])
  })

  it('keeps set values in derived sets', () => {
    let kmap = createKMap(['A', 'B'])
    kmap = withValue(kmap, 0, 1)
    kmap = withValue(kmap, 3, 1)
    kmap = withValue(kmap, 1, 0)
    kmap = withValue(kmap, 2, 'X')
    expect(minterms(kmap)).toEqual([0, 3])
    expect(maxterms(kmap)).toEqual([1])
    expect(dontCares(kmap)).toEqual([2])
  })

  it('withValue is immutable', () => {
    const kmap = createKMap(['A', 'B'])
    const next = withValue(kmap, 0, 1)
    expect(valueAt(kmap, 0)).toBeNull()
    expect(valueAt(next, 0)).toBe(1)
  })
})

describe('validation', () => {
  it('rejects fewer than 2 variables', () => {
    expect(() => createKMap(['A'])).toThrow()
  })
})