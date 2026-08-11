import { describe, it, expect } from 'vitest'
import { createKMap, withValue } from '../../../core/kmap'
import {
  analyzeGroupVariables,
  groupTerm,
  groupWraps,
  termFromConstants,
  wrapEdges,
} from '../../../core/kmap/group-reasoning'
import { variableDifference, isAdjacent } from '../../../core/kmap'

function model(variables: string[], values: Record<number, 0 | 1 | 'X'>) {
  let m = createKMap(variables)
  for (const [k, v] of Object.entries(values)) m = withValue(m, Number(k), v)
  return m
}

describe('analyzeGroupVariables', () => {
  it('classifies changing and constant variables for a pair', () => {
    // m0 (000) and m2 (010): only the second variable changes.
    const kmap = model(['a', 'b', 'c'], {})
    const analysis = analyzeGroupVariables(kmap, [0, 2])
    expect(analysis.changed).toEqual(['b'])
    expect(analysis.constant).toEqual([
      { name: 'a', value: 0 },
      { name: 'c', value: 0 },
    ])
  })

  it('marks every variable changed for a full rectangle', () => {
    const kmap = model(['a', 'b'], {})
    const analysis = analyzeGroupVariables(kmap, [0, 1, 2, 3])
    expect(analysis.changed).toEqual(['a', 'b'])
    expect(analysis.constant).toEqual([])
  })
})

describe('termFromConstants / groupTerm', () => {
  it('complements 0s in SOP and keeps 0s in POS', () => {
    const constant = [
      { name: 'A', value: 0 },
      { name: 'B', value: 1 },
    ]
    expect(termFromConstants(constant, 'sop')).toBe("A'B")
    expect(termFromConstants(constant, 'pos')).toBe("A + B'")
  })

  it('collapses an empty constant set to the literal 1', () => {
    expect(termFromConstants([], 'sop')).toBe('1')
  })

  it('derives group terms from real cell data', () => {
    const kmap = model(['a', 'b'], {})
    // m0,m1 differ only in B → A survives, valued 0 → A'
    expect(groupTerm(kmap, [0, 1]).sopTerm).toBe("a'")
  })
})

describe('groupWraps / wrapEdges', () => {
  it('detects wrap-around across the seam', () => {
    const kmap = model(['a', 'b', 'c'], { 0: 1, 2: 1 })
    expect(groupWraps(kmap, [0, 2])).toBe(true)
    expect(wrapEdges(kmap, [0, 2]).length).toBeGreaterThan(0)
  })

  it('returns false for a contiguous group', () => {
    const kmap = model(['a', 'b'], {})
    expect(groupWraps(kmap, [0, 1])).toBe(false)
    expect(wrapEdges(kmap, [0, 1])).toEqual([])
  })
})

describe('variableDifference', () => {
  it('reports which variables change between two combinations', () => {
    const kmap = model(['A', 'B'], {})
    expect(variableDifference(kmap, 0, 1)).toEqual({ changing: ['B'], constant: ['A'] })
    expect(variableDifference(kmap, 0, 3)).toEqual({ changing: ['A', 'B'], constant: [] })
  })

  it('adjacency holds exactly when one variable changes', () => {
    const kmap = model(['A', 'B'], {})
    expect(isAdjacent(kmap, 0, 1)).toBe(true)
    expect(isAdjacent(kmap, 0, 3)).toBe(false)
  })
})