import { describe, expect, it } from 'vitest'
import { createKMap, withValue } from '../../../core/kmap'
import {
  analyzeFiveVariable,
  splitFive,
  isFiveVariable,
  requireFive,
  fiveVarExplanation,
  planeFourVarTerm,
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
  it('splits into two 4-variable planes', () => {
    const model = createKMap(['A', 'B', 'C', 'D', 'E'])
    const a = analyzeFiveVariable(model)
    expect(a.planeE0).toHaveLength(16)
    expect(a.planeE1).toHaveLength(16)
    // every plane cell is a valid 4-variable index
    for (const c of a.planeE0) expect(c.abcd).toBeGreaterThanOrEqual(0)
  })

  it('maps cross-plane adjacency (same position, E differs)', () => {
    const model = createKMap(['A', 'B', 'C', 'D', 'E'])
    const a = analyzeFiveVariable(model)
    expect(a.crossPlaneAdjacencies).toHaveLength(16)
    const first = a.crossPlaneAdjacencies[0]!
    // low cell minterm = abcd (E=0), high = 16 + abcd (E=1)
    expect(first.low).toBe(0)
    expect(first.high).toBe(16)
  })

  it('describe the two possible values of E', () => {
    const model = createKMap(['A', 'B', 'C', 'D', 'E'])
    const a = analyzeFiveVariable(model)
    const lines = fiveVarExplanation(a)
    expect(lines.join(' ')).toMatch(/two 4-variable maps/)
  })

  it('derives a four-variable plane term', () => {
    expect(planeFourVarTerm(['A', 'B', 'C', 'D', 'E'], 0)).toMatch(/'/)
    expect(planeFourVarTerm(['A', 'B', 'C', 'D', 'E'], 15)).not.toMatch(/'/)
  })

  it('keeps don\'t-care cells in the right plane', () => {
    let model = createKMap(['A', 'B', 'C', 'D', 'E'])
    model = withValue(model, 20, 'X') // 20 = 10100 → E=1, abcd=4
    const a = analyzeFiveVariable(model)
    const dcPlane = a.planeE1.find((c) => c.value === 'X')
    expect(dcPlane?.abcd).toBe(4)
  })
})