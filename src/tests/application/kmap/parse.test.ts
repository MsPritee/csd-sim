import { describe, it, expect } from 'vitest'
import { parseMinterms, parseMaxterms, parseNumberList } from '../../../application/kmap'
import { minterms, maxterms, valueAt } from '../../../core/kmap'

describe('parseNumberList', () => {
  it('parses a comma separated list', () => {
    expect(parseNumberList('0,3,7')).toEqual([0, 3, 7])
  })

  it('parses whitespace separated values', () => {
    expect(parseNumberList('0 3 7')).toEqual([0, 3, 7])
  })

  it('expands a-b ranges', () => {
    expect(parseNumberList('0-3')).toEqual([0, 1, 2, 3])
  })

  it('supports ranges alongside single values', () => {
    expect(parseNumberList('0-2,5')).toEqual([0, 1, 2, 5])
  })

  it('deduplicates and sorts', () => {
    expect(parseNumberList('5,3,5,1')).toEqual([1, 3, 5])
  })

  it('returns empty array for empty input', () => {
    expect(parseNumberList('')).toEqual([])
    expect(parseNumberList('  ,  ')).toEqual([])
  })

  it('throws on invalid tokens', () => {
    expect(() => parseNumberList('a,b')).toThrow()
    expect(() => parseNumberList('3-1')).toThrow()
  })
})

describe('parseMinterms', () => {
  it('builds a K-map with listed cells as 1 and the rest as 0', () => {
    const kmap = parseMinterms(['A', 'B', 'C'], '3,5-7')
    expect(minterms(kmap)).toEqual([3, 5, 6, 7])
    expect(maxterms(kmap)).toEqual([0, 1, 2, 4])
  })

  it('marks don-t-care cells as X', () => {
    const kmap = parseMinterms(['A', 'B'], '0', '3')
    expect(minterms(kmap)).toEqual([0])
    expect(valueAt(kmap, 3)).toBe('X')
  })

  it('ignores out-of-range minterms', () => {
    const kmap = parseMinterms(['A', 'B'], '0, 99')
    expect(minterms(kmap)).toEqual([0])
  })
})

describe('parseMaxterms', () => {
  it('builds a K-map with listed cells as 0 and the rest as 1', () => {
    const kmap = parseMaxterms(['A', 'B'], '0,2')
    expect(maxterms(kmap)).toEqual([0, 2])
    expect(minterms(kmap)).toEqual([1, 3])
  })

  it('marks don-t-care cells as X', () => {
    const kmap = parseMaxterms(['A', 'B'], '1', '3')
    expect(maxterms(kmap)).toEqual([1])
    expect(valueAt(kmap, 3)).toBe('X')
  })
})