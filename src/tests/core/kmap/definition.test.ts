import { describe, expect, it } from 'vitest'
import { createKMap, withValue } from '../../../core/kmap'
import {
  defineFunction,
  expressionToDefinition,
  kmapToDefinition,
  definitionToKMap,
  DefinitionError,
  parseValidatedIndices,
  unwrapIndexList,
} from '../../../core/kmap/definition'

describe('P3 minterm/maxterm input — notation parsing', () => {
  it('unwraps Σm(...) and ΠM(...) wrappers', () => {
    expect(unwrapIndexList('Σm(0,1,2,5,7,8)')).toBe('0,1,2,5,7,8')
    expect(unwrapIndexList('ΠM(0,2,4,7)')).toBe('0,2,4,7')
    expect(unwrapIndexList('d(0,2)')).toBe('0,2')
  })

  it('parses a validated index list', () => {
    const r = parseValidatedIndices('Σm(0,1,2)', 8, false)
    expect(r.values).toEqual([0, 1, 2])
  })

  it('supports ranges', () => {
    const r = parseValidatedIndices('0-3,7', 8, false)
    expect(r.values).toEqual([0, 1, 2, 3, 7])
  })

  it('detects duplicates', () => {
    const r = parseValidatedIndices('1,1,4', 8, false)
    expect(r.duplicates).toEqual([1])
  })

  it('detects out-of-range values without crashing', () => {
    const r = parseValidatedIndices('Σm(1,2,8)', 8, false)
    expect(r.values).toEqual([1, 2])
    expect(r.outOfRange).toEqual([8])
  })

  it('rejects malformed tokens', () => {
    expect(() => parseValidatedIndices('one,two', 8, false)).toThrow(DefinitionError)
  })
})

describe('P3 validateFunction — validation', () => {
  it('rejects duplicates', () => {
    expect(() => defineFunction(['A', 'B', 'C'], [1, 1], [], [])).toThrow(DefinitionError)
  })

  it('rejects an out-of-range minterm with an explanation', () => {
    try {
      defineFunction(['A', 'B', 'C'], [8], [], [])
      expect.fail('should have thrown')
    } catch (e) {
      const err = e as DefinitionError
      expect(err.error.code).toBe('OUT_OF_RANGE')
      expect(err.error.message).toMatch(/8 is invalid/)
    }
  })

  it('rejects conflicting minterm/maxterm', () => {
    expect(() => defineFunction(['A', 'B'], [1], [1], [])).toThrow(/cannot be listed/)
  })

  it('rejects a minterm also listed as a don\'t-care', () => {
    expect(() => defineFunction(['A', 'B'], [0], [], [0])).toThrow(/cannot be listed/)
  })

  it('accepts a valid function', () => {
    const f = defineFunction(['A', 'B', 'C'], [0, 1, 2, 5, 7, 8].filter((m) => m < 8), [3, 4, 6], [])
    expect(f.minterms).toEqual([0, 1, 2, 5, 7])
    expect(f.maxterms).toEqual([3, 4, 6])
  })
})

describe('P3 expression → definition → K-map', () => {
  it('derives minterms from an expression', () => {
    const { definition } = expressionToDefinition(['A', 'B', 'C'], "A'B + BC")
    expect(definition.minterms).toEqual([2, 3, 7])
    expect(definition.maxterms).toEqual([0, 1, 4, 5, 6])
  })

  it('round-trips between K-map and definition', () => {
    let model = createKMap(['A', 'B', 'C'])
    model = withValue(model, 1, 1)
    model = withValue(model, 3, 1)
    model = withValue(model, 7, 1)
    model = withValue(model, 2, 'X')
    const def = kmapToDefinition(model)
    expect(def.minterms).toEqual([1, 3, 7])
    expect(def.dontCares).toEqual([2])
    const rebuilt = definitionToKMap(def)
    expect([...rebuilt.cells.flat()].map((c) => c.minterm).includes(1)).toBe(true)
    expect(def.minterms.length).toBe(3)
  })
})