import { describe, expect, it } from 'vitest'
import {
  createKMap,
  buildAssignment,
  withValue,
  cellAt,
  mintermToCell,
  cellToMinterm,
} from '../../../core/kmap'
import { minimizeCover, simplify } from '../../../core/kmap/simplify'
import { validateGroup, validateSopGroup } from '../../../core/kmap/grouping'
import {
  isAdjacent,
  adjacencyDirection,
  adjacentMinterms,
  neighborsOf,
  differInOneVariable,
} from '../../../core/kmap/adjacency'
import { hammingDistance } from '../../../core/kmap/gray'

/**
 * 5-variable plane-first K-map (the layout the simulator renders):
 *   plane = A (MSB), rows = B,C, columns = D,E (both Gray coded).
 *
 * Ground-truth grid (plane 0 holds 0..15, plane 1 holds 16..31):
 *                 Plane 0 (A=0)              Plane 1 (A=1)
 *             DE    00  01  11  10         DE  00  01  11  10
 *        BC=00       0   1   3   2      BC=00  16  17  19  18
 *        BC=01       4   5   7   6      BC=01  20  21  23  22
 *        BC=11      12  13  15  14      BC=11  28  29  31  30
 *        BC=10       8   9  11  10      BC=10  24  25  27  26
 */
const planeModel = () =>
  createKMap(['A', 'B', 'C', 'D', 'E'], buildAssignment(['A'], ['B', 'C'], ['D', 'E']))

/** Sets the given minterms to 1 in a fresh plane model. */
function onesModel(minterms: readonly number[]) {
  let model = planeModel()
  for (const m of minterms) model = withValue(model, m, 1)
  return model
}

describe('5-variable plane grid structure', () => {
  it('lays out plane 0 as cells 0..15 and plane 1 as cells 16..31', () => {
    const model = planeModel()
    expect(model.layout.variables).toEqual(['A', 'B', 'C', 'D', 'E'])
    expect(model.layout.planes).toBe(2)
    for (const minterm of [...Array(16)].map((_, i) => i)) {
      const { row, col, plane } = mintermToCell(model, minterm)
      expect(plane).toBe(0)
      expect(cellToMinterm(model, row, col, plane)).toBe(minterm)
    }
    for (const minterm of [...Array(16)].map((_, i) => 16 + i)) {
      const { row, col, plane } = mintermToCell(model, minterm)
      expect(plane).toBe(1)
      expect(cellToMinterm(model, row, col, plane)).toBe(minterm)
    }
  })

  it('maps the exact ground-truth minterm table', () => {
    const model = planeModel()
    const expected: number[][] = [
      [0, 1, 3, 2],
      [4, 5, 7, 6],
      [12, 13, 15, 14],
      [8, 9, 11, 10],
    ]
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        expect(cellToMinterm(model, row, col, 0)).toBe(expected[row]![col])
        expect(cellToMinterm(model, row, col, 1)).toBe(expected[row]![col]! + 16)
      }
    }
  })
})

describe('5-variable adjacency', () => {
  it('reports exactly 5 neighbours per cell (4 in-plane + 1 cross-plane)', () => {
    const model = planeModel()
    for (let m = 0; m < 32; m++) {
      const neighbors = adjacentMinterms(model, m)
      expect(neighbors).toHaveLength(5)
      expect(neighbors).not.toContain(m)
      for (const n of neighbors) {
        expect(hammingDistance(m, n)).toBe(1)
        expect(isAdjacent(model, m, n)).toBe(true)
      }
    }
  })

  it('is symmetric across the whole map', () => {
    const model = planeModel()
    for (let a = 0; a < 32; a++) {
      for (let b = 0; b < 32; b++) {
        expect(isAdjacent(model, a, b)).toBe(isAdjacent(model, b, a))
      }
    }
  })

  it('classifies cross-plane, vertical and horizontal direction', () => {
    const model = planeModel()
    expect(adjacencyDirection(model, 0, 16)).toBe('plane')
    expect(adjacencyDirection(model, 0, 4)).toBe('vertical')
    expect(adjacencyDirection(model, 0, 8)).toBe('vertical')
    expect(adjacencyDirection(model, 0, 1)).toBe('horizontal')
    expect(adjacencyDirection(model, 0, 2)).toBe('horizontal')
    expect(adjacencyDirection(model, 0, 15)).toBeNull()
  })

  it('has neighbours that differ in exactly one variable', () => {
    const model = planeModel()
    for (let m = 0; m < 32; m++) {
      for (const n of adjacentMinterms(model, m)) {
        expect(differInOneVariable(model, m, n)).toBe(true)
      }
    }
  })

  it('agrees between the cube adjacency and the flattened grid API', () => {
    const model = planeModel()
    for (let row = 0; row < model.layout.rows; row++) {
      for (let col = 0; col < model.layout.cols; col++) {
        const center = cellAt(model, row, col).minterm
        const viaGrid = neighborsOf(model, row, col).map((n) => n.cell.minterm).sort((a, b) => a - b)
        const viaCube = adjacentMinterms(model, center).sort((a, b) => a - b)
        expect(viaGrid).toEqual(viaCube)
      }
    }
  })
})

describe('5-variable grouping validation', () => {
  it('accepts in-plane groups of every power-of-two size', () => {
    const model = planeModel()
    expect(validateGroup(model, [0]).valid).toBe(true)
    expect(validateGroup(model, [0, 1]).valid).toBe(true)
    expect(validateGroup(model, [0, 1, 2, 3]).valid).toBe(true)
    expect(validateGroup(model, [0, 1, 2, 3, 4, 5, 7, 6]).valid).toBe(true)
    expect(validateGroup(model, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]).valid).toBe(true)
  })

  it('accepts wrap-around pairs inside a plane (old flat validator rejected these)', () => {
    const model = planeModel()
    expect(validateGroup(model, [0, 2]).valid).toBe(true)
    expect(validateGroup(model, [0, 8]).valid).toBe(true)
  })

  it('accepts cross-plane groups (same position mirrored across the fold)', () => {
    const model = planeModel()
    expect(validateGroup(model, [0, 16]).valid).toBe(true)
    expect(validateGroup(model, [0, 1, 16, 17]).valid).toBe(true)
    expect(validateGroup(model, [0, 1, 2, 3, 16, 17, 19, 18]).valid).toBe(true)
  })

  it('accepts the full-map group', () => {
    const model = planeModel()
    expect(validateGroup(model, [...Array(32)].map((_, i) => i)).valid).toBe(true)
  })

  it('rejects non-rectangular, non-power-of-two and out-of-range groups', () => {
    const model = planeModel()
    expect(validateGroup(model, [0, 5]).valid).toBe(false)
    expect(validateGroup(model, [0, 1, 16]).valid).toBe(false)
    expect(validateGroup(model, [0, 1, 4, 12]).valid).toBe(false)
    expect(validateGroup(model, []).valid).toBe(false)
    expect(validateGroup(model, [0, 32]).valid).toBe(false)
  })

  it('rejects SOP groups containing a 0 cell but allows don\'t-cares', () => {
    let model = planeModel()
    model = withValue(model, 5, 0)
    model = withValue(model, 16, 'X')
    expect(validateSopGroup(model, [0, 16]).valid).toBe(true)
    expect(validateSopGroup(model, [0, 5]).valid).toBe(false)
  })
})

describe('5-variable simplification (minimal covers)', () => {
  it('single cell → 5-literal product', () => {
    const model = onesModel([0])
    expect(minimizeCover(model, new Set([0]), new Set([0]))).toEqual([[0]])
    expect(simplify(model, new Set([0]), new Set(), new Set()).sop).toBe("A'B'C'D'E'")
  })

  it('2-cell in-plane pair → 4-literal product', () => {
    const model = onesModel([0, 1])
    expect(simplify(model, new Set([0, 1]), new Set(), new Set()).sop).toBe("A'B'C'D'")
  })

  it('4-cell in-plane block → 3-literal product', () => {
    const model = onesModel([0, 1, 2, 3])
    expect(simplify(model, new Set([0, 1, 2, 3]), new Set(), new Set()).sop).toBe("A'B'C'")
  })

  it('8-cell in-plane block → 2-literal product', () => {
    const model = onesModel([0, 1, 2, 3, 4, 5, 7, 6])
    expect(simplify(model, new Set([0, 1, 2, 3, 4, 5, 7, 6]), new Set(), new Set()).sop).toBe("A'B'")
  })

  it('16-cell whole plane → single literal', () => {
    const model = onesModel([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15])
    expect(simplify(model, new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]), new Set(), new Set()).sop).toBe("A'")
  })

  it('32-cell full map → constant 1', () => {
    const model = onesModel([...Array(32)].map((_, i) => i))
    expect(simplify(model, new Set([...Array(32)].map((_, i) => i)), new Set(), new Set()).sop).toBe('1')
  })

  it('wraps horizontally inside a plane (DE ring)', () => {
    const model = onesModel([0, 2])
    expect(simplify(model, new Set([0, 2]), new Set(), new Set()).sop).toBe("A'B'C'E'")
  })

  it('wraps vertically inside a plane (BC ring)', () => {
    const model = onesModel([0, 8])
    expect(simplify(model, new Set([0, 8]), new Set(), new Set()).sop).toBe("A'C'D'E'")
  })

  it('merges a cross-plane pair into a single term (A eliminated)', () => {
    const model = onesModel([0, 16])
    const result = simplify(model, new Set([0, 16]), new Set(), new Set())
    expect(result.sop).toBe("B'C'D'E'")
    expect(result.sopGroups).toHaveLength(1)
    expect(result.sopGroups[0]!.cells).toEqual(expect.arrayContaining([0, 16]))
  })

  it('merges a cross-plane block of four (A and E eliminated)', () => {
    const model = onesModel([0, 1, 16, 17])
    expect(simplify(model, new Set([0, 1, 16, 17]), new Set(), new Set()).sop).toBe("B'C'D'")
  })

  it('merges a mirrored octet across the fold (A, D, E eliminated)', () => {
    const model = onesModel([0, 1, 2, 3, 16, 17, 19, 18])
    expect(simplify(model, new Set([0, 1, 2, 3, 16, 17, 19, 18]), new Set(), new Set()).sop).toBe("B'C'")
  })

  it('uses don\'t-cares to enlarge groups without emitting them', () => {
    const model = onesModel([0, 1])
    let dcModel = withValue(model, 16, 'X')
    dcModel = withValue(dcModel, 17, 'X')
    const result = simplify(dcModel, new Set([0, 1]), new Set(), new Set([16, 17]))
    expect(result.sop).toBe("B'C'D'")
    expect(result.sopGroups[0]!.cells).toEqual(expect.arrayContaining([0, 1, 16, 17]))
    expect(JSON.stringify(result.sop)).not.toContain('A')
  })

  it('finds a minimal two-term cover when no large group exists', () => {
    // two far-apart cells on opposite corners of the 5-cube
    const model = onesModel([0, 31])
    const result = simplify(model, new Set([0, 31]), new Set(), new Set())
    expect(result.sopGroups).toHaveLength(2)
  })
})