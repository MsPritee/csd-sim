import { describe, expect, it } from 'vitest'
import { createKMap, withValue } from '../../../core/kmap'
import {
  computePrimeImplicants,
  coverageMatrix,
} from '../../../core/kmap/prime-implicants'

function modelFor(variables: readonly string[], ones: readonly number[], dc: readonly number[] = []) {
  let m = createKMap(variables)
  for (const o of ones) m = withValue(m, o, 1)
  for (const d of dc) m = withValue(m, d, 'X')
  return m
}

describe('P3 prime implicants — essential case', () => {
  it('finds A\' and C as the primes for Σm(0,1,2,3,5,7)', () => {
    const model = modelFor(['A', 'B', 'C'], [0, 1, 2, 3, 5, 7])
    const primes = computePrimeImplicants(model)
    // A' covers {0,1,2,3}, C covers {1,3,5,7}
    expect(primes).toHaveLength(2)
    for (const p of primes) expect(p.essential).toBe(true)
    const cellCounts = primes.map((p) => p.cells.length).sort((a, b) => a - b)
    expect(cellCounts).toEqual([4, 4])
  })
})

describe('P3 prime implicants — mixed essential and non-essential', () => {
  it('Σm(1,3,4,5) has one non-essential prime', () => {
    const model = modelFor(['A', 'B', 'C'], [1, 3, 4, 5])
    const primes = computePrimeImplicants(model)
    expect(primes).toHaveLength(3)
    const essential = primes.filter((p) => p.essential)
    const nonEssential = primes.filter((p) => !p.essential)
    // {1,3} and {4,5} essential; {1,5} non-essential
    expect(essential).toHaveLength(2)
    expect(nonEssential).toHaveLength(1)
  })
})

describe('P3 prime implicants — no essential (checkerboard)', () => {
  it('Σm(0,1,2,5,6,7) has six non-essential primes', () => {
    const model = modelFor(['A', 'B', 'C'], [0, 1, 2, 5, 6, 7])
    const primes = computePrimeImplicants(model)
    expect(primes).toHaveLength(6)
    for (const p of primes) expect(p.essential).toBe(false)
  })
})

describe('P3 don\'t-care in implicants', () => {
  it('uses a don\'t-care cell to form a larger prime', () => {
    // 1s at m0,m2 and a don't-care at m4,m6 lets C' {0,2,4,6}... but explicit:
    const model = modelFor(['A', 'B', 'C'], [0, 2], [4, 6])
    const primes = computePrimeImplicants(model)
    // With dc 4,6 the cells 0,2,4,6 can combine into C' (0--) -- 4 cells.
    expect(primes.some((p) => p.cells.length === 4)).toBe(true)
  })

  it('does not treat a don\'t-care-only implicant as required', () => {
    const model = modelFor(['A', 'B', 'C'], [5], [0, 1, 2])
    const primes = computePrimeImplicants(model)
    // Prime {0,1,2,5} would include two don't-cares but must contain m5 (required).
    const covering = primes.filter((p) => p.cells.includes(5))
    for (const p of covering) expect(p.essential).toBe(true)
  })
})

describe('P3 coverage matrix', () => {
  it('reports unique vs multiple coverage', () => {
    const model = modelFor(['A', 'B', 'C'], [1, 3, 4, 5])
    const matrix = coverageMatrix(model)
    expect(matrix.primes).toHaveLength(3)
    // m3 uniquely covered by one prime
    expect(matrix.uniquelyCovered.has(3)).toBe(true)
    // m1 covered by more than one prime
    const covering1 = matrix.primes.filter((p) => matrix.coverage.get(p.id)!.has(1))
    expect(covering1.length).toBeGreaterThan(1)
  })
})