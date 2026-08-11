import { describe, it, expect } from 'vitest'
import { createKMap, withValue } from '../../core/kmap'
import { explainAdjacency, explainGroup } from '../../education/adjacency'

function model(variables: string[], values: Record<number, 0 | 1 | 'X'>) {
  let m = createKMap(variables)
  for (const [k, v] of Object.entries(values)) m = withValue(m, Number(k), v)
  return m
}

describe('explainAdjacency', () => {
  it('explains a valid adjacency with levels', () => {
    const kmap = model(['A', 'B'], {})
    const adj = explainAdjacency(kmap, 0, 1)
    expect(adj.isAdjacent).toBe(true)
    expect(adj.changing).toEqual(['B'])
    expect(adj.hamming).toBe(1)
    expect(adj.conceptual).toContain('one variable')
    expect(adj.math).toContain("X + X' = 1")
  })

  it('explains a diagonal, non-adjacent pair', () => {
    const kmap = model(['A', 'B'], {})
    const adj = explainAdjacency(kmap, 0, 3) // 00 vs 11
    expect(adj.isAdjacent).toBe(false)
    expect(adj.hamming).toBe(2)
    expect(adj.changing).toEqual(['A', 'B'])
    expect(adj.conceptual).toContain('only one variable')
  })
})

describe('explainGroup — valid cases', () => {
  it('a valid adjacent pair', () => {
    const kmap = model(['A', 'B'], { 0: 1, 1: 1, 2: 0, 3: 0 })
    const g = explainGroup(kmap, [0, 1], 'sop')
    expect(g.valid).toBe(true)
    expect(g.groupSize).toBe(2)
    expect(g.reasons.some((r) => r.ok && r.text.includes('power of 2'))).toBe(true)
    expect(g.reasons.some((r) => r.text.includes('rectangle'))).toBe(true)
    expect(g.term.sop).toBe("A'")
  })

  it('a full rectangle group collapses to 1', () => {
    const kmap = model(['A', 'B'], { 0: 1, 1: 1, 2: 1, 3: 1 })
    const g = explainGroup(kmap, [0, 1, 2, 3], 'sop')
    expect(g.valid).toBe(true)
    expect(g.term.sop).toBe('1')
  })

  it('flags wrap-around adjacency as valid', () => {
    const kmap = model(['a', 'b', 'c'], { 0: 1, 2: 1 })
    const g = explainGroup(kmap, [0, 2], 'sop')
    expect(g.wraps).toBe(true)
    expect(g.reasons.some((r) => r.text.includes('Wrap-around'))).toBe(true)
  })

  it('explains don\'t-care usage', () => {
    const kmap = model(['A', 'B'], { 0: 1, 1: 'X', 2: 0, 3: 0 })
    const g = explainGroup(kmap, [0, 1], 'sop')
    expect(g.usesDontCares).toBe(true)
    expect(g.valid).toBe(true)
    expect(g.reasons.some((r) => r.text.includes('X cells'))).toBe(true)
  })
})

describe('explainGroup — invalid cases', () => {
  it('explains a diagonal group (differs in two variables)', () => {
    const kmap = model(['A', 'B'], { 0: 0, 1: 1, 2: 1, 3: 0 })
    const g = explainGroup(kmap, [1, 2], 'sop')
    expect(g.valid).toBe(false)
    expect(g.nonAdjacentDetail).toBeDefined()
    expect(g.nonAdjacentDetail!.changing).toEqual(['A', 'B'])
    expect(g.nonAdjacentDetail!.binFrom).toBe('01')
    expect(g.nonAdjacentDetail!.binTo).toBe('10')
    expect(g.reasons.some((r) => !r.ok && r.text.includes('rectangle'))).toBe(true)
  })

  it('explains a non-power-of-two group', () => {
    const kmap = model(['A', 'B'], { 0: 1, 1: 1, 3: 1 })
    const g = explainGroup(kmap, [0, 1, 3], 'sop')
    expect(g.valid).toBe(false)
    expect(g.groupSize).toBe(3)
    expect(g.reasons.some((r) => !r.ok && r.text.includes('not a power of 2'))).toBe(true)
  })

  it('rejects a group containing the opposite value for the mode', () => {
    const kmap = model(['A', 'B'], { 0: 0, 1: 1, 2: 1, 3: 0 })
    const g = explainGroup(kmap, [0, 1], 'sop') // m0 holds 0, invalid in SOP
    expect(g.valid).toBe(false)
    expect(g.reasons.some((r) => !r.ok && r.text.includes('not allowed in a SOP group'))).toBe(true)
  })
})