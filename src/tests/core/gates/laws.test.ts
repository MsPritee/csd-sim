import { describe, it, expect } from 'vitest'
import { LAWS, getLaw, lawsForGate } from '../../../core/gates/laws'
import type { LawId } from '../../../core/gates/laws'
import type { GateType } from '../../../core/gates/types'

const ids = (gate: GateType): LawId[] =>
  lawsForGate(gate).map((l) => l.id)

describe('law catalog', () => {
  it('exposes eleven laws', () => {
    expect(LAWS).toHaveLength(11)
  })

  it('has unique ids', () => {
    expect(new Set(LAWS.map((l) => l.id)).size).toBe(LAWS.length)
    for (const l of LAWS) expect(getLaw(l.id)).toBe(l)
  })

  it('throws on unknown ids', () => {
    expect(() => getLaw('NOPE' as LawId)).toThrow(RangeError)
  })
})

describe('lawsForGate', () => {
  it('AND satisfies the expected laws', () => {
    const set = new Set(ids('AND'))
    for (const id of [
      'COMMUTATIVE',
      'ASSOCIATIVE',
      'DISTRIBUTIVE',
      'IDENTITY',
      'ANNIHILATION',
      'IDEMPOTENCE',
      'COMPLEMENT',
      'DEMORGAN',
    ] as const) {
      expect(set.has(id)).toBe(true)
    }
    expect(set.has('NAND_UNIVERSAL')).toBe(false)
    expect(set.has('NOR_UNIVERSAL')).toBe(false)
  })

  it('OR satisfies the same set plus De Morgan, minus NAND universality', () => {
    const set = new Set(ids('OR'))
    for (const id of ['COMMUTATIVE', 'ASSOCIATIVE', 'IDENTITY', 'ANNIHILATION', 'IDEMPOTENCE', 'COMPLEMENT', 'DEMORGAN'] as const) {
      expect(set.has(id)).toBe(true)
    }
    expect(set.has('NAND_UNIVERSAL')).toBe(false)
  })

  it('NAND is commutative and universal but not associative or idempotent', () => {
    const set = new Set(ids('NAND'))
    expect(set.has('COMMUTATIVE')).toBe(true)
    expect(set.has('DEMORGAN')).toBe(true)
    expect(set.has('NAND_UNIVERSAL')).toBe(true)
    expect(set.has('ASSOCIATIVE')).toBe(false)
    expect(set.has('IDENTITY')).toBe(false)
    expect(set.has('IDEMPOTENCE')).toBe(false)
  })

  it('NOR is commutative and universal but not associative', () => {
    const set = new Set(ids('NOR'))
    expect(set.has('COMMUTATIVE')).toBe(true)
    expect(set.has('DEMORGAN')).toBe(true)
    expect(set.has('NOR_UNIVERSAL')).toBe(true)
    expect(set.has('ASSOCIATIVE')).toBe(false)
  })

  it('XOR has identity and complement but not annihilation', () => {
    const set = new Set(ids('XOR'))
    expect(set.has('COMMUTATIVE')).toBe(true)
    expect(set.has('ASSOCIATIVE')).toBe(true)
    expect(set.has('IDENTITY')).toBe(true)
    expect(set.has('COMPLEMENT')).toBe(true)
    expect(set.has('ANNIHILATION')).toBe(false)
    expect(set.has('DEMORGAN')).toBe(false)
  })

  it('XNOR is commutative and associative only', () => {
    const set = new Set(ids('XNOR'))
    expect(set.has('COMMUTATIVE')).toBe(true)
    expect(set.has('ASSOCIATIVE')).toBe(true)
    expect(set.has('IDENTITY')).toBe(false)
    expect(set.has('COMPLEMENT')).toBe(false)
  })

  it('NOT satisfies only involution', () => {
    expect(ids('NOT')).toEqual(['INVOLUTION'])
  })

  it('BUFFER has identity and idempotence but no complement', () => {
    const set = new Set(ids('BUFFER'))
    expect(set.has('IDENTITY')).toBe(true)
    expect(set.has('IDEMPOTENCE')).toBe(true)
    expect(set.has('COMPLEMENT')).toBe(false)
    expect(set.has('ANNIHILATION')).toBe(false)
  })
})