import { describe, it, expect } from 'vitest'
import { evaluateGate } from '../../../core/gates/evaluate'
import {
  inputCombinations,
  booleanFunctionsEqual,
  verifyDeMorgan,
  verifyDeMorganAnd,
  verifyDeMorganOr,
  verifyCommutative,
  verifyAssociative,
  verifyDistributive,
  verifyIdentity,
  verifyAnnihilation,
  verifyIdempotence,
  verifyComplement,
  verifyInvolution,
  nandToNot,
  nandToAnd,
  nandToOr,
  verifyNandUniversality,
  norToNot,
  norToAnd,
  norToOr,
  verifyNorUniversality,
} from '../../../core/gates/verify'

describe('inputCombinations', () => {
  it('generates MSB-first vectors', () => {
    expect(inputCombinations(2)).toEqual([
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1],
    ])
    expect(inputCombinations(1)).toEqual([[0], [1]])
    expect(inputCombinations(3)).toHaveLength(8)
  })

  it('rejects non-positive counts', () => {
    expect(() => inputCombinations(0)).toThrow(RangeError)
  })
})

describe('booleanFunctionsEqual', () => {
  it('detects equal and unequal bit-functions', () => {
    const same = booleanFunctionsEqual((v) => v[0]!, (v) => v[0]!, 1)
    const diff = booleanFunctionsEqual((v) => v[0]!, (v) => evaluateGate('NOT', [v[0]!]), 1)
    expect(same).toBe(true)
    expect(diff).toBe(false)
  })
})

describe('De Morgan', () => {
  it('holds for AND and OR over 2 and 3 inputs', () => {
    expect(verifyDeMorganAnd(2)).toBe(true)
    expect(verifyDeMorganAnd(3)).toBe(true)
    expect(verifyDeMorganOr(2)).toBe(true)
    expect(verifyDeMorganOr(3)).toBe(true)
  })

  it('dispatches by polarity', () => {
    expect(verifyDeMorgan('AND')).toBe(true)
    expect(verifyDeMorgan('NAND')).toBe(true)
    expect(verifyDeMorgan('OR')).toBe(true)
    expect(verifyDeMorgan('NOR')).toBe(true)
    expect(verifyDeMorgan('XOR')).toBe(false)
  })
})

describe('structural laws', () => {
  it('commutativity holds for the relation gates', () => {
    for (const g of ['AND', 'NAND', 'OR', 'NOR', 'XOR', 'XNOR'] as const) {
      expect(verifyCommutative(g)).toBe(true)
    }
  })

  it('associativity holds for AND/OR/XOR/XNOR but not NAND/NOR', () => {
    expect(verifyAssociative('AND')).toBe(true)
    expect(verifyAssociative('OR')).toBe(true)
    expect(verifyAssociative('XOR')).toBe(true)
    expect(verifyAssociative('XNOR')).toBe(true)
    expect(verifyAssociative('NAND')).toBe(false)
    expect(verifyAssociative('NOR')).toBe(false)
  })

  it('distribution holds in both directions', () => {
    expect(verifyDistributive()).toBe(true)
  })
})

describe('identity and annihilation', () => {
  it('identity is neutral for AND, OR, XOR and BUFFER, absent otherwise', () => {
    expect(verifyIdentity('AND')).toBe(true)
    expect(verifyIdentity('OR')).toBe(true)
    expect(verifyIdentity('XOR')).toBe(true)
    expect(verifyIdentity('BUFFER')).toBe(true)
    expect(verifyIdentity('NAND')).toBe(false)
    expect(verifyIdentity('NOR')).toBe(false)
  })

  it('annihilation holds only for AND and OR', () => {
    expect(verifyAnnihilation('AND')).toBe(true)
    expect(verifyAnnihilation('OR')).toBe(true)
    expect(verifyAnnihilation('XOR')).toBe(false)
    expect(verifyAnnihilation('NAND')).toBe(false)
  })
})

describe('idempotence, complement and involution', () => {
  it('idempotence holds for AND/OR/BUFFER, not NOT or the parity gates', () => {
    expect(verifyIdempotence('AND')).toBe(true)
    expect(verifyIdempotence('OR')).toBe(true)
    expect(verifyIdempotence('BUFFER')).toBe(true)
    expect(verifyIdempotence('NOT')).toBe(false)
    expect(verifyIdempotence('XOR')).toBe(false)
    expect(verifyIdempotence('NAND')).toBe(false)
  })

  it('complement law is satisfied by AND, OR and XOR', () => {
    expect(verifyComplement('AND')).toBe(true)
    expect(verifyComplement('OR')).toBe(true)
    expect(verifyComplement('XOR')).toBe(true)
    expect(verifyComplement('NAND')).toBe(false)
    expect(verifyComplement('NOR')).toBe(false)
  })

  it('double negation is an involution', () => {
    expect(verifyInvolution()).toBe(true)
  })
})

describe('NAND universality', () => {
  it('builds NOT from NAND', () => {
    expect(nandToNot(0)).toBe(1)
    expect(nandToNot(1)).toBe(0)
  })

  it('builds AND and OR that match the real gates', () => {
    for (const v of inputCombinations(2)) {
      const a = v[0]!
      const b = v[1]!
      expect(nandToAnd(a, b)).toBe(evaluateGate('AND', [a, b]))
      expect(nandToOr(a, b)).toBe(evaluateGate('OR', [a, b]))
    }
  })

  it('verifies the whole primitive set', () => {
    expect(verifyNandUniversality()).toBe(true)
  })
})

describe('NOR universality', () => {
  it('builds NOT from NOR', () => {
    expect(norToNot(0)).toBe(1)
    expect(norToNot(1)).toBe(0)
  })

  it('builds AND and OR that match the real gates', () => {
    for (const v of inputCombinations(2)) {
      const a = v[0]!
      const b = v[1]!
      expect(norToAnd(a, b)).toBe(evaluateGate('AND', [a, b]))
      expect(norToOr(a, b)).toBe(evaluateGate('OR', [a, b]))
    }
  })

  it('verifies the whole primitive set', () => {
    expect(verifyNorUniversality()).toBe(true)
  })
})