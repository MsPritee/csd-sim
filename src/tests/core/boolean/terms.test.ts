import { describe, expect, it } from 'vitest'
import {
  groupToTermString,
  literalToString,
  mintermToTerm,
  mintermToString,
  parseTerm,
  sortTerm,
  termForGroup,
  termToString,
  termsEqual,
  type Term,
} from '../../../core/boolean/terms'

const V3 = ['A', 'B', 'C']
const V4 = ['A', 'B', 'C', 'D']

describe('literalToString / termToString', () => {
  it('formats literals and terms', () => {
    expect(literalToString({ name: 'A', negated: false })).toBe('A')
    expect(literalToString({ name: 'A', negated: true })).toBe("A'")
    expect(termToString([{ name: 'A', negated: true }, { name: 'B', negated: false }])).toBe("A'B")
  })

  it('renders an empty term as an empty string', () => {
    expect(termToString([])).toBe('')
  })
})

describe('parseTerm', () => {
  it('parses a plain product term', () => {
    expect(parseTerm("A'BC").map((l) => l.name)).toEqual(['A', 'B', 'C'])
    expect(parseTerm("A'BC")[0]!.negated).toBe(true)
  })

  it('handles alternate negation marks', () => {
    expect(parseTerm('A\u2032B\u00afC!D').map((l) => l.negated)).toEqual([
      true,
      true,
      true,
      false,
    ])
  })

  it('rejects duplicate literals', () => {
    expect(() => parseTerm('AAB')).toThrow()
  })
})

describe('sortTerm / termsEqual', () => {
  it('equal regardless of order', () => {
    const a = parseTerm("BA'C")
    const b = parseTerm("A'BC")
    expect(termsEqual(a, b)).toBe(true)
  })

  it('distinguishes negation', () => {
    expect(termsEqual(parseTerm('AB'), parseTerm("A'B"))).toBe(false)
  })

  it('distinguishes different lengths', () => {
    expect(termsEqual(parseTerm('AB'), parseTerm('ABC'))).toBe(false)
  })

  it('sorts terms by name', () => {
    expect(sortTerm(parseTerm("CD'AB")).map((l) => l.name)).toEqual(['A', 'B', 'C', 'D'])
  })
})

describe('mintermToTerm', () => {
  it('converts minterm 6 with [A,B,C] to A B C-bar', () => {
    const term = mintermToTerm(V3, 6)
    expect(termToString(term)).toBe("ABC'")
  })

  it('bars literals whose bit is 0', () => {
    expect(termToString(mintermToTerm(V3, 0))).toBe("A'B'C'")
    expect(termToString(mintermToTerm(V3, 3))).toBe("A'BC")
  })

  it('rejects out-of-range minterms', () => {
    expect(() => mintermToTerm(V3, 8)).toThrow()
  })

  it('maps 4-variable minterms', () => {
    expect(mintermToString(V4, 13)).toBe("ABC'D")
    expect(mintermToString(V4, 11)).toBe("AB'CD")
  })
})

describe('termForGroup', () => {
  it('eliminates the variable that changes across the group', () => {
    // A'B'C (0) and A'B'C' (1)? Use real adjacent pair: 0 (A'B'C') and 1 (A'B'C)
    const term = termForGroup(V3, [0, 1])
    expect(termToString(sortTerm(term))).toBe("A'B'")
  })

  it("extracts from A'BC + ABC as BC", () => {
    // minterm 3 = A'BC, minterm 7 = ABC
    const term = termForGroup(V3, [3, 7])
    expect(termToString(sortTerm(term))).toBe('BC')
  })

  it('extracts a full literal from a 4-cell group', () => {
    // 4 corners group in 4-var: 0, 2, 8, 10 -> B'D'
    const term = termForGroup(V4, [0, 2, 8, 10])
    expect(termToString(sortTerm(term))).toBe("B'D'")
  })

  it('returns a whole literal for a single minterm', () => {
    expect(termToString(sortTerm(termForGroup(V4, [13])))).toBe("ABC'D")
  })

  it('ignores dont-cares when deciding eliminated variables', () => {
    // 4 = 0100, 6 = 0110: share A=0, B=1, D=0; C varies -> A'BD'
    const term = termForGroup(V4, [4, 6])
    expect(termToString(sortTerm(term))).toBe("A'BD'")
  })
})

describe('groupToTermString', () => {
  it('renders group as a formatted product string', () => {
    expect(groupToTermString(V3, [3, 7])).toBe('BC')
    expect(groupToTermString(V4, [0, 2, 8, 10])).toBe("B'D'")
  })
})

describe('termToString round-trip', () => {
  it('round-trips through parseTerm', () => {
    const original: Term = parseTerm("A'BC'D")
    expect(parseTerm(termToString(original))).toEqual(original)
  })
})