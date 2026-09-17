import { describe, expect, it } from 'vitest'
import {
  buildAssignment,
  cellAt,
  cellToMinterm,
  createKMap,
  dontCares,
  maxterms,
  mintermToCell,
  minterms,
  mintermsWithValue,
  translateMinterm,
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

describe('layout axes (default assignment)', () => {
  it('exposes the default 2-variable axes', () => {
    const kmap = createKMap(['A', 'B'])
    expect(kmap.layout.axes).toEqual([
      { kind: 'row', variables: ['A'], size: 2 },
      { kind: 'col', variables: ['B'], size: 2 },
    ])
    expect(kmap.layout.planes).toBe(1)
    expect(kmap.layout.planeVariables).toEqual([])
    expect(kmap.layout.rowVariables).toEqual(['A'])
    expect(kmap.layout.colVariables).toEqual(['B'])
  })

  it('exposes the default 3-variable axes', () => {
    const kmap = createKMap(['A', 'B', 'C'])
    expect(kmap.layout.axes).toEqual([
      { kind: 'row', variables: ['A'], size: 2 },
      { kind: 'col', variables: ['B', 'C'], size: 4 },
    ])
  })

  it('exposes the default 4-variable axes', () => {
    const kmap = createKMap(['A', 'B', 'C', 'D'])
    expect(kmap.layout.axes).toEqual([
      { kind: 'row', variables: ['A', 'B'], size: 4 },
      { kind: 'col', variables: ['C', 'D'], size: 4 },
    ])
    expect(kmap.layout.planes).toBe(1)
  })

  it('keeps the 5-variable default flat (E folded into the columns)', () => {
    const kmap = createKMap(['A', 'B', 'C', 'D', 'E'])
    expect(kmap.layout.axes).toEqual([
      { kind: 'row', variables: ['A', 'B'], size: 4 },
      { kind: 'col', variables: ['C', 'D', 'E'], size: 8 },
    ])
    expect(kmap.layout.rows).toBe(4)
    expect(kmap.layout.cols).toBe(8)
    expect(kmap.layout.planes).toBe(1)
    expect(kmap.layout.planeVariables).toEqual([])
    expect(kmap.cells.flat()).toHaveLength(32)
  })
})

describe('buildAssignment', () => {
  it('builds a valid assignment from plane/row/col variable lists', () => {
    const a = buildAssignment(['E'], ['A', 'B'], ['C', 'D'])
    expect(a.axes).toEqual([
      { kind: 'plane', variables: ['E'], size: 2 },
      { kind: 'row', variables: ['A', 'B'], size: 4 },
      { kind: 'col', variables: ['C', 'D'], size: 4 },
    ])
  })

  it('omits the plane axis when no plane variable is given', () => {
    const a = buildAssignment([], ['A', 'B'], ['C', 'D'])
    expect(a.axes.map((axis) => axis.kind)).toEqual(['row', 'col'])
  })

  it('rejects variables assigned to more than one axis', () => {
    expect(() => buildAssignment(['D'], ['A', 'D'], ['C'])).toThrow(RangeError)
  })

  it('rejects an axis holding more than 2 variables', () => {
    expect(() => buildAssignment([], ['A', 'B'], ['C', 'D', 'E'])).toThrow(RangeError)
  })

  it('rejects a missing row or column axis', () => {
    expect(() => buildAssignment([], [], ['A', 'B'])).toThrow(RangeError)
    expect(() => buildAssignment([], ['A', 'B'], [])).toThrow(RangeError)
  })

  it('rejects empty / malformed variable names', () => {
    expect(() => buildAssignment([], ['A'], [''])).toThrow(RangeError)
    expect(() => buildAssignment([], ['1A'], ['B'])).toThrow(RangeError)
  })

  it('creates a map whose cells match the assignment', () => {
    const assignment = buildAssignment(['E'], ['A', 'B'], ['C', 'D'])
    const kmap = createKMap(['A', 'B', 'C', 'D', 'E'], assignment)
    expect(kmap.cells.flat()).toHaveLength(32)
    expect(kmap.layout.rows).toBe(4)
    expect(kmap.layout.cols).toBe(8)
    expect(kmap.layout.planes).toBe(2)
    expect(kmap.layout.planeVariables).toEqual(['E'])
  })

  it('rejects a createKMap whose assignment misses a variable', () => {
    const assignment = buildAssignment([], ['A', 'B'], ['C', 'D'])
    expect(() => createKMap(['A', 'B', 'C', 'E'], assignment)).toThrow(RangeError)
  })
})

describe('5-variable plane assignment', () => {
  const kmap = createKMap(
    ['A', 'B', 'C', 'D', 'E'],
    buildAssignment(['E'], ['A', 'B'], ['C', 'D']),
  )

  it('lays out the E=0 and E=1 planes side by side', () => {
    const grid = kmap.cells.map((row) => row.map((cell) => cell.minterm))
    expect(grid).toEqual([
      [0, 2, 6, 4, 1, 3, 7, 5],
      [8, 10, 14, 12, 9, 11, 15, 13],
      [24, 26, 30, 28, 25, 27, 31, 29],
      [16, 18, 22, 20, 17, 19, 23, 21],
    ])
  })

  it('labels columns across both planes', () => {
    expect(kmap.layout.colLabels).toEqual(['000', '001', '011', '010', '100', '101', '111', '110'])
  })

  it('round-trips mintermToCell/cellToMinterm for every minterm', () => {
    for (let m = 0; m < 32; m++) {
      const { row, col, plane } = mintermToCell(kmap, m)
      expect(cellToMinterm(kmap, row, col, plane)).toBe(m)
    }
  })

  it('reports plane and column axis indices independently', () => {
    // 19 = 10011 → A,B = 10 (idx 2 → row 3), C,D = 01 (idx 1), E = 1
    expect(mintermToCell(kmap, 19)).toEqual({ row: 3, col: 1, plane: 1 })
    // 2 = 00010 → E=0, C,D = 01 (idx 1)
    expect(mintermToCell(kmap, 2)).toEqual({ row: 0, col: 1, plane: 0 })
  })

  it('sets and reads values across both planes via valueAt/withValue', () => {
    let next = withValue(kmap, 2, 1)
    next = withValue(next, 19, 0)
    next = withValue(next, 31, 'X')
    expect(valueAt(next, 2)).toBe(1)
    expect(valueAt(next, 19)).toBe(0)
    expect(valueAt(next, 31)).toBe('X')
    expect(minterms(next)).toEqual([2])
    expect(maxterms(next)).toEqual([19])
    expect(dontCares(next)).toEqual([31])
  })
})

describe('custom 4-variable assignment', () => {
  // row = A,C (bits 3,1); col = B,D (bits 2,0)
  const kmap = createKMap(['A', 'B', 'C', 'D'], buildAssignment([], ['A', 'C'], ['B', 'D']))

  it('scrambles the minterm placement per the assignment', () => {
    const grid = kmap.cells.map((row) => row.map((cell) => cell.minterm))
    expect(grid).toEqual([
      [0, 1, 5, 4],
      [2, 3, 7, 6],
      [10, 11, 15, 14],
      [8, 9, 13, 12],
    ])
  })

  it('derives row/col variables from the assignment', () => {
    expect(kmap.layout.rowVariables).toEqual(['A', 'C'])
    expect(kmap.layout.colVariables).toEqual(['B', 'D'])
    expect(kmap.layout.planeVariables).toEqual([])
  })

  it('round-trips every minterm', () => {
    for (let m = 0; m < 16; m++) {
      const { row, col, plane } = mintermToCell(kmap, m)
      expect(cellToMinterm(kmap, row, col, plane)).toBe(m)
    }
  })
})

describe('translateMinterm', () => {
  const canonical = ['A', 'B', 'C', 'D', 'E']

  it('is the identity when both orderings are identical', () => {
    for (let m = 0; m < 32; m++) {
      expect(translateMinterm(m, canonical, canonical)).toBe(m)
    }
  })

  it('moves the plane variable to the MSB (plane-first display order)', () => {
    // Plane C as MSB: display order C A B D E. The minterm keeps its value per
    // variable; only the bit slot of C changes from bit2 to bit4.
    const display = ['C', 'A', 'B', 'D', 'E']
    // 19 = 10011 (A=1, B=0, C=0, D=1, E=1) -> display 11 (C=0, A=1, B=0, D=1, E=1).
    expect(translateMinterm(19, canonical, display)).toBe(11)
    // 4 = 00100 (C=1) -> display 16 (C=1 as the MSB).
    expect(translateMinterm(4, canonical, display)).toBe(16)
  })

  it('round-trips between any two orderings of the same set', () => {
    const orderings = [
      [...canonical],
      ['E', 'A', 'B', 'C', 'D'],
      ['C', 'A', 'B', 'D', 'E'],
      ['D', 'E', 'A', 'B', 'C'],
    ]
    for (const from of orderings) {
      for (const to of orderings) {
        for (let m = 0; m < 32; m++) {
          expect(translateMinterm(translateMinterm(m, from, to), to, from)).toBe(m)
        }
      }
    }
  })

  it('throws when the orderings have different lengths', () => {
    expect(() => translateMinterm(0, canonical, ['A', 'B', 'C', 'D'])).toThrow(RangeError)
  })
})

describe('optional 4-variable plane assignment', () => {
  const kmap = createKMap(['A', 'B', 'C', 'D'], buildAssignment(['D'], ['A', 'B'], ['C']))

  it('builds a 4x2 x2-planes map with D separating planes', () => {
    expect(kmap.layout.rows).toBe(4)
    expect(kmap.layout.cols).toBe(4)
    expect(kmap.layout.planes).toBe(2)
    expect(kmap.cells.flat()).toHaveLength(16)
    const grid = kmap.cells.map((row) => row.map((cell) => cell.minterm))
    expect(grid).toEqual([
      [0, 2, 1, 3],
      [4, 6, 5, 7],
      [12, 14, 13, 15],
      [8, 10, 9, 11],
    ])
  })

  it('single cells across planes differ only in D', () => {
    // 0 (0000) and 1 (0001) sit at the same row/col-axis position.
    expect(mintermToCell(kmap, 0)).toEqual({ row: 0, col: 0, plane: 0 })
    expect(mintermToCell(kmap, 1)).toEqual({ row: 0, col: 0, plane: 1 })
  })

  it('round-trips every minterm', () => {
    for (let m = 0; m < 16; m++) {
      const { row, col, plane } = mintermToCell(kmap, m)
      expect(cellToMinterm(kmap, row, col, plane)).toBe(m)
    }
  })
})