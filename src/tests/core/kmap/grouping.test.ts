import { describe, expect, it } from 'vitest'
import {
  groupSize,
  groupsOverlap,
  isPowerOfTwo,
  isRedundant,
  unionCoverage,
  validateGroup,
  validateSopGroup,
} from '../../../core/kmap/grouping'
import { createKMap, withValue } from '../../../core/kmap/model'

const kmap3 = createKMap(['A', 'B', 'C']) // 2x4 grid
const kmap4 = createKMap(['A', 'B', 'C', 'D']) // 4x4 grid

describe('isPowerOfTwo', () => {
  it('accepts 1, 2, 4, 8, 16', () => {
    for (const n of [1, 2, 4, 8, 16]) expect(isPowerOfTwo(n)).toBe(true)
  })

  it('rejects 0, 3, 6, 12', () => {
    for (const n of [0, 3, 6, 12]) expect(isPowerOfTwo(n)).toBe(false)
  })
})

describe('groupSize', () => {
  it('counts unique cells', () => {
    expect(groupSize([3, 5, 3, 7])).toBe(3)
  })
})

describe('validateGroup', () => {
  it('accepts a single cell', () => {
    expect(validateGroup(kmap3, [5]).valid).toBe(true)
  })

  it('accepts two adjacent cells in a row', () => {
    // 3-var: 1 (0,1), 0 (0,0) are horizontally adjacent
    expect(validateGroup(kmap3, [0, 1]).valid).toBe(true)
  })

  it('accepts two adjacent cells in a column', () => {
    expect(validateGroup(kmap3, [0, 4]).valid).toBe(true)
  })

  it('accepts a 2x2 rectangle', () => {
    // 0,1,3,2 -> row 0; and their vertical neighbours 4,5,7,6
    expect(validateGroup(kmap4, [0, 1, 4, 5]).valid).toBe(true)
  })

  it('accepts a 4-cell wrapped row (entire top row)', () => {
    expect(validateGroup(kmap4, [0, 1, 3, 2]).valid).toBe(true)
  })

  it('accepts wrap-around adjacency (left/right edges)', () => {
    // columns 0 and 3 wrap: cells 0 and 2 in the top row
    expect(validateGroup(kmap4, [0, 2]).valid).toBe(true)
  })

  it('accepts wrap-around corners group', () => {
    // 4 corners of a 4-var map: 0, 2, 8, 10
    expect(validateGroup(kmap4, [0, 2, 8, 10]).valid).toBe(true)
  })

  it('rejects a group of 6 cells', () => {
    const result = validateGroup(kmap4, [0, 1, 3, 4, 5, 7])
    expect(result.valid).toBe(false)
    expect(result.issues[0]?.kind).toBe('not-power-of-two')
  })

  it('rejects a diagonal pair', () => {
    const result = validateGroup(kmap4, [0, 5])
    expect(result.valid).toBe(false)
    expect(result.issues.some((i) => i.kind === 'non-rectangular')).toBe(true)
  })

  it('rejects an L-shape of four cells', () => {
    const result = validateGroup(kmap4, [0, 1, 4, 12])
    expect(result.valid).toBe(false)
  })

  it('rejects an empty group', () => {
    expect(validateGroup(kmap4, []).valid).toBe(false)
  })

  it('rejects out-of-range cells', () => {
    expect(validateGroup(kmap3, [0, 8]).valid).toBe(false)
  })
})

describe('validateSopGroup', () => {
  it('accepts a group containing only 1s and Xs', () => {
    let kmap = createKMap(['A', 'B'])
    kmap = withValue(kmap, 0, 1)
    kmap = withValue(kmap, 1, 'X')
    expect(validateSopGroup(kmap, [0, 1]).valid).toBe(true)
  })

  it('rejects a group containing a 0', () => {
    let kmap = createKMap(['A', 'B'])
    kmap = withValue(kmap, 0, 1)
    kmap = withValue(kmap, 1, 0)
    const result = validateSopGroup(kmap, [0, 1])
    expect(result.valid).toBe(false)
    expect(result.issues.some((i) => i.kind === 'contains-zero')).toBe(true)
  })

  it('folds structural errors through', () => {
    expect(validateSopGroup(kmap4, [0, 5]).issues[0]?.kind).toBe('non-rectangular')
  })
})

describe('groupsOverlap', () => {
  it('detects shared cells', () => {
    expect(groupsOverlap([0, 1], [1, 4])).toBe(true)
    expect(groupsOverlap([0, 1], [4, 5])).toBe(false)
  })
})

describe('unionCoverage', () => {
  it('merges cells from all groups', () => {
    const coverage = unionCoverage([[0, 1], [1, 4]])
    expect(coverage).toEqual(new Set([0, 1, 4]))
  })
})

describe('isRedundant', () => {
  it('flags a group fully covered by others', () => {
    expect(isRedundant([[0, 1], [4]], [0, 1])).toBe(true)
  })

  it('keeps a group that adds an uncovered cell', () => {
    expect(isRedundant([[0, 1], [4]], [1, 5])).toBe(false)
  })

  it('treats an empty group as redundant', () => {
    expect(isRedundant([], [])).toBe(true)
  })
})