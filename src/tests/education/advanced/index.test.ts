import { describe, expect, it } from 'vitest'
import { createKMap, withValue, minterms, type KMapModel } from '../../../core/kmap'
import {
  mintermExplanation,
  maxtermExplanation,
  dontCareExplanation,
  expressionChain,
  termToCells,
  expressionTermsWithCells,
  sopPosConcept,
  implicantProgression,
  primeImplicantSummary,
  groupingStrategy,
  canonicalVsMinimalExplanation,
  GLOSSARY,
  glossaryByTerm,
} from '../../../education/advanced'

const three = ['A', 'B', 'C']
const threeKMap = (mts: number[], dcs: number[] = []): KMapModel => {
  let kmap = createKMap(three)
  for (const m of mts) kmap = withValue(kmap, m, 1)
  for (const m of dcs) kmap = withValue(kmap, m, 'X')
  return kmap
}

describe('advanced input explanations', () => {
  it('mintermExplanation lists the entered minterms and their product terms', () => {
    const lines = mintermExplanation(three, [0, 7])
    expect(lines[0]).toContain('0 and 7')
    expect(lines.some((l) => l.includes("m0 (000) is the minterm A'B'C'."))).toBe(true)
    expect(lines.some((l) => l.includes('m7 (111) is the minterm ABC.'))).toBe(true)
    expect(lines.some((l) => l.includes('marked as 1 on the K-map'))).toBe(true)
  })

  it('mintermExplanation handles a single entry without "and"', () => {
    const lines = mintermExplanation(three, [5])
    expect(lines[0]).toContain('the minterms 5')
    expect(lines).not.toContain('and')
  })

  it('maxtermExplanation explains OFF-set cells', () => {
    const lines = maxtermExplanation(three, [2])
    expect(lines[0]).toContain('maxterms 2')
    expect(lines.some((l) => l.includes('marked as 0 on the K-map'))).toBe(true)
    expect(lines.some((l) => l.includes('ON-set'))).toBe(true)
  })

  it('dontCareExplanation explains flexible cells are never required', () => {
    const lines = dontCareExplanation([3])
    expect(lines.some((l) => l.includes("don't-care (X)"))).toBe(true)
    expect(lines.some((l) => l.includes('never become required coverage'))).toBe(true)
  })
})

describe('expression chain (Feature 7) and term coverage (Feature 8)', () => {
  it('expressionChain turns an expression into rows + satisfied minterms', () => {
    const chain = expressionChain(three, 'A+B')
    expect(chain.satisfiedRows).toEqual([2, 3, 4, 5, 6, 7])
    expect(chain.rows).toHaveLength(8)
    expect(chain.mode).toBe('sop')
  })

  it('termToCells lists fixed, free and covered minterms', () => {
    const cells = termToCells(three, [{ name: 'A', negated: false }, { name: 'B', negated: true }])
    expect(cells.fixed).toEqual([
      { name: 'A', value: 1 },
      { name: 'B', value: 0 },
    ])
    expect(cells.free).toEqual(['C'])
    expect(cells.minterms).toEqual([4, 5])
  })

  it('expressionTermsWithCells splits an SOP into per-term coverage', () => {
    const rows = expressionTermsWithCells(three, 'AB + C')
    expect(rows).toHaveLength(2)
    expect(rows[0]?.minterms).toEqual([6, 7])
  })
})

describe('SOP/POS concept and implicant progression', () => {
  it('sopPosConcept exposes SOP and POS summaries', () => {
    const c = sopPosConcept()
    expect(c.sop.summary).toContain('SOP is built from minterms')
    expect(c.pos.summary).toContain('POS is built from maxterms')
    expect(c.sop.steps.length).toBeGreaterThan(0)
    expect(c.pos.steps.length).toBeGreaterThan(0)
  })

  it('implicantProgression explains prime and essential implicants', () => {
    const p = implicantProgression()
    expect(p.intro).toContain('implicant')
    expect(p.prime).toContain('prime')
    expect(p.essential).toContain('essential')
  })

  it('primeImplicantSummary reports essential vs non-essential primes', () => {
    const kmap = threeKMap([0, 1, 3, 7])
    const lines = primeImplicantSummary(kmap)
    expect(lines.length).toBeGreaterThan(0)
    expect(lines.some((l) => l.includes('essential'))).toBe(true)
  })
})

describe('grouping strategy (Feature 19)', () => {
  it('suggests a larger prime group when a bigger cover exists', () => {
    const kmap = threeKMap([0, 1])
    const groups: readonly (readonly number[])[] = [[0], [1]]
    const feedback = groupingStrategy(kmap, groups, 'sop')
    expect(feedback.some((l) => l.includes('larger group exists'))).toBe(true)
  })

  it('warns about uncovered required cells', () => {
    const kmap = threeKMap([0, 5])
    const feedback = groupingStrategy(kmap, [] as readonly (readonly number[])[], 'sop')
    expect(feedback.some((l) => l.includes('not yet covered'))).toBe(false)
  })

  it('reports remaining strategy only when groups are present', () => {
    const kmap = threeKMap([0, 1])
    const uncovered = groupingStrategy(kmap, [[0]], 'sop')
    expect(uncovered.some((l) => l.includes('m1') && l.includes('not yet covered'))).toBe(true)
  })

  it('returns the term for each group', () => {
    const kmap = threeKMap([6, 7])
    const feedback = groupingStrategy(kmap, [[6, 7]], 'sop')
    expect(feedback.some((l) => l.includes('AB'))).toBe(true)
  })
})

describe('canonical vs minimal and glossary', () => {
  it('canonicalVsMinimalExplanation explains grouping removes variables', () => {
    const lines = canonicalVsMinimalExplanation()
    expect(lines.some((l) => l.includes('eliminates the variable'))).toBe(true)
  })

  it('GLOSSARY contains the core terms', () => {
    for (const term of ['Minterm', 'Maxterm', "Don't-care", 'Prime Implicant', 'Minimal SOP', 'Minimal POS']) {
      expect(glossaryByTerm(term)).toBeDefined()
    }
    expect(GLOSSARY.length).toBeGreaterThanOrEqual(10)
  })

  it('glossary lookup is case-insensitive', () => {
    expect(glossaryByTerm('minterm')).toBe(glossaryByTerm('Minterm'))
  })

  it('unknown glossary term returns undefined', () => {
    expect(glossaryByTerm('nope')).toBeUndefined()
  })

  it('groupingStrategy helper is consistent with the ON-set', () => {
    const kmap = threeKMap([1, 5])
    expect(minterms(kmap)).toEqual([1, 5])
  })
})