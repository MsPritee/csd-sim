import { describe, expect, it } from 'vitest'
import { minimizeCover, simplify } from '../../../core/kmap/simplify'
import { createKMap } from '../../../core/kmap/model'

const kmap3 = createKMap(['A', 'B', 'C'])
const kmap4 = createKMap(['A', 'B', 'C', 'D'])

type Lit = { name: string; negated: boolean }
type TermList = readonly (readonly Lit[])[]

function evalProduct(assignments: Map<string, number>, literals: readonly Lit[]): number {
  for (const l of literals) {
    const bit = assignments.get(l.name)
    if (bit === undefined) throw new Error(`missing assignment for ${l.name}`)
    const matches = l.negated ? bit === 0 : bit === 1
    if (!matches) return 0
  }
  return 1
}

function evalSop(variables: string[], productTerms: TermList): string {
  const inputs: string[] = []
  for (let m = 0; m < 2 ** variables.length; m++) {
    const assign = new Map<string, number>()
    for (let i = 0; i < variables.length; i++) {
      assign.set(variables[i]!, (m >> (variables.length - 1 - i)) & 1)
    }
    inputs.push(productTerms.some((terms) => evalProduct(assign, terms) === 1) ? '1' : '0')
  }
  return inputs.join('')
}

function evalPos(variables: string[], sums: TermList): number[] {
  const outputs: number[] = []
  for (let m = 0; m < 2 ** variables.length; m++) {
    const assign = new Map<string, number>()
    for (let i = 0; i < variables.length; i++) {
      assign.set(variables[i]!, (m >> (variables.length - 1 - i)) & 1)
    }
    // POS is conjunctive: true unless some sum term is all-false
    let result = 1
    for (const sum of sums) {
      const anyTrue = sum.some((l) => {
        const bit = assign.get(l.name)!
        return l.negated ? bit === 0 : bit === 1
      })
      if (!anyTrue) {
        result = 0
        break
      }
    }
    outputs.push(result)
  }
  return outputs
}

describe('simplify (3 variables)', () => {
  it('reduces a full minterm set to constant 1', () => {
    const ones = new Set([0, 1, 2, 3, 4, 5, 6, 7])
    const result = simplify(kmap3, ones, new Set(), new Set())
    expect(result.sop).toBe('1')
    expect(result.pos).toBe('1')
  })

  it('returns SOP 0 for a constant-zero function', () => {
    const result = simplify(kmap3, new Set(), new Set([0, 1, 2, 3, 4, 5, 6, 7]), new Set())
    expect(result.sop).toBe('0')
  })

  it('simplifies A minterm into its identity term', () => {
    // only minterm 3 A=0,B=1,C=1 -> A'BC
    const ones = new Set([3])
    const result = simplify(kmap3, ones, new Set(), new Set())
    expect(result.sop).toBe("A'BC")
  })

  it('simplifies minterms 3 and 7 to BC', () => {
    const ones = new Set([3, 7])
    const result = simplify(kmap3, ones, new Set(), new Set())
    expect(result.sop).toBe('BC')
  })

  it('SOP is logically equivalent to the truth table', () => {
    const ones = new Set([0, 2, 5, 6])
    const result = simplify(kmap3, ones, new Set(), new Set())
    const actual = result.sop
    expect(actual).not.toBe('')
    const vars = ['A', 'B', 'C']
    const products = result.sopGroups.map((g) => g.product)
    const table = evalSop(vars, products)
    let want = ''
    for (let m = 0; m < 8; m++) want += ones.has(m) ? '1' : '0'
    expect(table).toBe(want)
  })

  it('POS is logically equivalent to the truth table', () => {
    const ones = new Set([0, 2, 5, 6])
    const zeros = new Set([1, 3, 4, 7])
    const result = simplify(kmap3, ones, zeros, new Set())
    const vars = ['A', 'B', 'C']
    const outputs = evalPos(vars, result.posGroups.map((g) => g.sum))
    expect(outputs).toEqual([1, 0, 1, 0, 0, 1, 1, 0])
  })
})

describe('simplify (4 variables)', () => {
  it('SOP and POS both match the truth table with don,t-cares', () => {
    // F = minterms 4,5,6 with don't-care on 8
    const ones = new Set([4, 5, 6])
    const zeros = new Set([0, 1, 2, 3, 7, 9, 10, 11, 12, 13, 14, 15])
    const dontCares = new Set([8])
    const result = simplify(kmap4, ones, zeros, dontCares)
    const vars = ['A', 'B', 'C', 'D']

    const posOut = evalPos(vars, result.posGroups.map((g) => g.sum))
    // X can be anything, so verify only the required cells
    for (const m of ones) expect(posOut[m]).toBe(1)
    for (const m of zeros) expect(posOut[m]).toBe(0)
    // The POS expression for m8 (dontcare) may be anything
  })
})

describe('minimizeCover', () => {
  it('picks the largest groups first', () => {
    const ones = new Set([0, 1, 4, 5])
    const groups = minimizeCover(kmap4, ones, ones)
    expect(groups).toHaveLength(1)
    expect(groups[0]!.length).toBe(4)
  })
})

describe('minimizeCover — exact minimum cover (regression)', () => {
  function sopTruthTable(vars: readonly string[], groups: readonly (readonly number[])[]): string {
    let tt = ''
    for (let m = 0; m < 2 ** vars.length; m++) {
      const bits = new Map<string, number>()
      for (let i = 0; i < vars.length; i++) {
        bits.set(vars[i]!, (m >> (vars.length - 1 - i)) & 1)
      }
      const hit = groups.some((cells) => cells.includes(m))
      tt += hit ? '1' : '0'
    }
    return tt
  }

  function wantTT(ones: ReadonlySet<number>, n: number): string {
    let s = ''
    for (let m = 0; m < n; m++) s += ones.has(m) ? '1' : '0'
    return s
  }

  /** Verify truth table only at required cell positions (don't-cares are wildcards). */
  function expectTTMatches(
    vars: readonly string[],
    groups: readonly (readonly number[])[],
    required: ReadonlySet<number>,
    _n: number,
  ) {
    const tt = sopTruthTable(vars, groups)
    for (const m of required) {
      expect(tt[m]).toBe('1')
    }
  }

  it('Σm(0,4,5,6,7) → 2 groups with 6+ total cells (not singleton)', () => {
    const ones = new Set([0, 4, 5, 6, 7])
    const groups = minimizeCover(kmap3, ones, ones)
    const vars = ['A', 'B', 'C']
    expect(sopTruthTable(vars, groups)).toBe(wantTT(ones, 8))
    expect(groups.length).toBe(2)
    const totalCells = groups.reduce((s, g) => s + g.length, 0)
    expect(totalCells).toBeGreaterThanOrEqual(6)
  })

  it('Σm(0,1,4,5) → single quad (B=0)', () => {
    const ones = new Set([0, 1, 4, 5])
    const groups = minimizeCover(kmap3, ones, ones)
    expect(groups).toHaveLength(1)
    expect(groups[0]!.length).toBe(4)
  })

  it('Σm(0,2,4,6) → single quad via wrap-around columns', () => {
    const ones = new Set([0, 2, 4, 6])
    const groups = minimizeCover(kmap3, ones, ones)
    expect(groups).toHaveLength(1)
    expect(groups[0]!.length).toBe(4)
    const vars = ['A', 'B', 'C']
    expect(sopTruthTable(vars, groups)).toBe(wantTT(ones, 8))
  })

  it('Σm(4,5,6,7) → A (single quad, entire row)', () => {
    const ones = new Set([4, 5, 6, 7])
    const groups = minimizeCover(kmap3, ones, ones)
    expect(groups).toHaveLength(1)
    expect(groups[0]!.length).toBe(4)
  })

  it('essential PI: Σm(0,1,2,4) uses overlapping groups to minimize', () => {
    const ones = new Set([0, 1, 2, 4])
    const groups = minimizeCover(kmap3, ones, ones)
    const vars = ['A', 'B', 'C']
    expect(sopTruthTable(vars, groups)).toBe(wantTT(ones, 8))
    expect(groups.length).toBeLessThanOrEqual(3)
  })

  it('wrap-around corners: Σm(0,2,8,10) in 4-var', () => {
    const ones = new Set([0, 2, 8, 10])
    const groups = minimizeCover(kmap4, ones, ones)
    const vars = ['A', 'B', 'C', 'D']
    expect(sopTruthTable(vars, groups)).toBe(wantTT(ones, 16))
    expect(groups).toHaveLength(1)
    expect(groups[0]!.length).toBe(4)
  })

  it('all 1s → single group covering entire map', () => {
    const all = new Set([0, 1, 2, 3, 4, 5, 6, 7])
    const groups = minimizeCover(kmap3, all, all)
    expect(groups).toHaveLength(1)
    expect(groups[0]!.length).toBe(8)
  })

  it('single minterm → single-cell group', () => {
    const ones = new Set([3])
    const groups = minimizeCover(kmap3, ones, ones)
    expect(groups).toHaveLength(1)
    expect(groups[0]!.length).toBe(1)
  })

  it('dont-care: Σm(0,4,8,12) with dc(1,5,9,13) → single group using dc to grow', () => {
    const ones = new Set([0, 4, 8, 12])
    const dc = new Set([1, 5, 9, 13])
    const eligible = new Set([...ones, ...dc])
    const groups = minimizeCover(kmap4, eligible, ones)
    const vars = ['A', 'B', 'C', 'D']
    expectTTMatches(vars, groups, ones, 16)
    expect(groups).toHaveLength(1)
    expect(groups[0]!.length).toBeGreaterThanOrEqual(4)
  })

  it('dont-care enables larger group: Σm(0,2,8,10) with dc(1,3,9,11,14)', () => {
    const ones = new Set([0, 2, 8, 10])
    const dc = new Set([1, 3, 9, 11, 14])
    const eligible = new Set([...ones, ...dc])
    const groups = minimizeCover(kmap4, eligible, ones)
    const vars = ['A', 'B', 'C', 'D']
    expectTTMatches(vars, groups, ones, 16)
    expect(groups.length).toBeLessThanOrEqual(2)
  })

  it('overlap case: Σm(0,1,2,3,4,5,6,7) in 4-var with some zeros', () => {
    const ones = new Set([0, 1, 2, 3, 4, 5, 6])
    const groups = minimizeCover(kmap4, ones, ones)
    const vars = ['A', 'B', 'C', 'D']
    expect(sopTruthTable(vars, groups)).toBe(wantTT(ones, 16))
  })

  it('Σm(0,1,2,5,6,7) → minimal cover with overlapping groups', () => {
    const ones = new Set([0, 1, 2, 5, 6, 7])
    const groups = minimizeCover(kmap3, ones, ones)
    const vars = ['A', 'B', 'C']
    expect(sopTruthTable(vars, groups)).toBe(wantTT(ones, 8))
    expect(groups.length).toBeLessThanOrEqual(3)
  })

  it('Σm(1,3,4,5,6) → correct minimal SOP', () => {
    const ones = new Set([1, 3, 4, 5, 6])
    const groups = minimizeCover(kmap3, ones, ones)
    const vars = ['A', 'B', 'C']
    expect(sopTruthTable(vars, groups)).toBe(wantTT(ones, 8))
    expect(groups.length).toBeLessThanOrEqual(3)
  })
})