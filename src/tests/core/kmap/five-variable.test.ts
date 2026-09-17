import { describe, expect, it } from 'vitest'
import { createKMap, buildAssignment, withValue } from '../../../core/kmap'
import {
  analyzeFiveVariable,
  splitFive,
  isFiveVariable,
  requireFive,
  fiveVarExplanation,
  planeFourVarTerm,
  planeVariableOf,
} from '../../../core/kmap/five-variable'

describe('P3 five-variable mapping', () => {
  it('builds a 32-cell model flagged as 5-variable', () => {
    const model = createKMap(['A', 'B', 'C', 'D', 'E'])
    expect(isFiveVariable(model)).toBe(true)
    expect(model.cells.flat()).toHaveLength(32)
  })

  it('splits a minterm into E and the 4-variable value', () => {
    expect(splitFive(0)).toEqual({ e: 0, abcd: 0 })
    expect(splitFive(19)).toEqual({ e: 1, abcd: 3 })
    expect(splitFive(16)).toEqual({ e: 1, abcd: 0 })
  })

  it('rejects analysis for a non-five-variable model', () => {
    const model = createKMap(['A', 'B', 'C'])
    expect(() => requireFive(model)).toThrow(RangeError)
  })
})

describe('P3 five-variable planes', () => {
  const planeModel = () => createKMap(['A', 'B', 'C', 'D', 'E'], buildAssignment(['A'], ['B', 'C'], ['D', 'E']))

  it('splits into two 4-variable planes', () => {
    const a = analyzeFiveVariable(planeModel())
    expect(a.eVar).toBe('A')
    expect(a.planeE0).toHaveLength(16)
    expect(a.planeE1).toHaveLength(16)
    // plane 0 holds cells 0..15, plane 1 holds cells 16..31
    expect(a.planeE0.map((c) => c.minterm).sort((x, y) => x - y)[0]).toBe(0)
    expect(a.planeE0.map((c) => c.minterm).sort((x, y) => x - y)[15]).toBe(15)
    expect(a.planeE1.map((c) => c.minterm).sort((x, y) => x - y)[0]).toBe(16)
    // every plane cell is a valid 4-variable index
    for (const c of a.planeE0) expect(c.abcd).toBeGreaterThanOrEqual(0)
  })

  it('maps cross-plane adjacency (same position, plane variable differs)', () => {
    const a = analyzeFiveVariable(planeModel())
    expect(a.crossPlaneAdjacencies).toHaveLength(16)
    const first = a.crossPlaneAdjacencies[0]!
    // low cell minterm = abcd (A=0), high = 16 + abcd (A=1)
    expect(first.low).toBe(0)
    expect(first.high).toBe(16)
    // each abcd position maps to exactly one cell in each plane
    for (const patch of a.crossPlaneAdjacencies) {
      expect(patch.high - patch.low).toBe(16)
    }
  })

  it('describe the two possible values of the plane variable', () => {
    const a = analyzeFiveVariable(planeModel())
    const lines = fiveVarExplanation(a)
    expect(lines.join(' ')).toMatch(/two 4-variable maps/)
    expect(lines.join(' ')).toContain('A')
  })

  it('derives a four-variable plane term from the four in-plane variables', () => {
    expect(planeFourVarTerm(['B', 'C', 'D', 'E'], 0)).toMatch(/'/)
    expect(planeFourVarTerm(['B', 'C', 'D', 'E'], 15)).not.toMatch(/'/)
    expect(planeFourVarTerm(['B', 'C', 'D', 'E'], 6)).toBe("B'CDE'")
  })

  it("keeps don't-care cells in the right plane", () => {
    let model = planeModel()
    model = withValue(model, 20, 'X') // 20 = 10100 → A=1, abcd=4
    const a = analyzeFiveVariable(model)
    const dcPlane = a.planeE1.find((c) => c.value === 'X')
    expect(dcPlane?.abcd).toBe(4)
  })

  it('also shows a legacy flat model split by its last variable', () => {
    const model = createKMap(['A', 'B', 'C', 'D', 'E'])
    expect(planeVariableOf(model)).toBe('E')
    const a = analyzeFiveVariable(model)
    expect(a.planeE0).toHaveLength(16)
    expect(a.planeE1).toHaveLength(16)
    // E is the LSB of the flat model, so E=0 cells are the even minterms
    expect(a.planeE0.map((c) => c.minterm).sort((x, y) => x - y)[0]).toBe(0)
    expect(a.planeE0.map((c) => c.minterm).sort((x, y) => x - y)[15]).toBe(30)
  })
})