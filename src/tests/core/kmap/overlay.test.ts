import { describe, it, expect } from 'vitest'
import { groupsToHighlight, createKMap } from '../../../core/kmap'

describe('groupsToHighlight', () => {
  const kmap = createKMap(['A', 'B', 'C'])

  it('maps each group index to its cells', () => {
    const result = groupsToHighlight(kmap, [[0, 1], [3, 7]])
    expect([...result.get(0)!]).toEqual([0])
    expect([...result.get(1)!]).toEqual([0])
    expect([...result.get(3)!]).toEqual([1])
    expect([...result.get(7)!]).toEqual([1])
  })

  it('lists multiple group indices for overlapping cells', () => {
    const result = groupsToHighlight(kmap, [[0, 1, 2, 3], [1, 3, 5, 7]])
    expect(result.get(1)).toEqual([0, 1])
    expect(result.get(3)).toEqual([0, 1])
  })

  it('omits out-of-range minterms', () => {
    const result = groupsToHighlight(kmap, [[0, 99]])
    expect(result.has(0)).toBe(true)
    expect(result.has(99)).toBe(false)
  })

  it('returns an empty map for empty groups', () => {
    expect(groupsToHighlight(kmap, []).size).toBe(0)
  })

  it('deduplicates repeated minterms within a group', () => {
    const result = groupsToHighlight(kmap, [[0, 0, 1]])
    expect([...result.get(0)!]).toEqual([0])
  })
})