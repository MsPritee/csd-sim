import { describe, it, expect } from 'vitest'
import { createKMap, withValue } from '../../../core/kmap'
import {
  requiredCells,
  uncoveredRequired,
  coversAllRequired,
} from '../../../core/kmap/coverage'

function model(variables: string[], values: Record<number, 0 | 1 | 'X'>) {
  let m = createKMap(variables)
  for (const [k, v] of Object.entries(values)) m = withValue(m, Number(k), v)
  return m
}

describe('coverage', () => {
  it('lists required cells as 1s for SOP and 0s for POS', () => {
    const kmap = model(['A', 'B'], { 0: 1, 1: 1, 2: 0, 3: 1 })
    expect(requiredCells(kmap, 'sop')).toEqual([0, 1, 3])
    expect(requiredCells(kmap, 'pos')).toEqual([2])
  })

  it('finds uncovered required cells', () => {
    const kmap = model(['A', 'B'], { 0: 1, 1: 1, 3: 1, 2: 0 })
    expect(uncoveredRequired(kmap, [[0, 1]], 'sop')).toEqual([3])
    expect(uncoveredRequired(kmap, [[0, 1], [3]], 'sop')).toEqual([])
  })

  it('reports full coverage and respects POS mode', () => {
    const kmap = model(['A', 'B'], { 0: 0, 1: 1, 2: 0, 3: 1 })
    expect(coversAllRequired(kmap, [[0], [2]], 'pos')).toBe(true)
    expect(coversAllRequired(kmap, [[0]], 'pos')).toBe(false)
    expect(uncoveredRequired(kmap, [[0]], 'pos')).toEqual([2])
  })
})