import { describe, it, expect } from 'vitest'
import {
  detectGateMisconception,
  GATE_MISCONCEPTIONS,
  getGateMisconception,
} from '../../../education/gates/misconceptions'

describe('detectGateMisconception', () => {
  it('returns null when the same gate is chosen', () => {
    expect(detectGateMisconception('AND', 'AND')).toBeNull()
  })

  it('detects AND vs OR confusion', () => {
    const m = detectGateMisconception('AND', 'OR')
    expect(m?.id).toBe('and-or')
    expect(m?.explanation).toMatch(/strict/)
  })

  it('is symmetric regardless of argument order', () => {
    expect(detectGateMisconception('OR', 'AND')?.id).toBe('and-or')
  })

  it('detects forgotten inversion bubbles', () => {
    expect(detectGateMisconception('NAND', 'AND')?.id).toBe('nand-and')
    expect(detectGateMisconception('NOR', 'OR')?.id).toBe('nor-or')
    expect(detectGateMisconception('XNOR', 'XOR')?.id).toBe('xor-xnor')
    expect(detectGateMisconception('NOT', 'BUFFER')?.id).toBe('not-buffer')
  })

  it('detects NAND/NOR and OR/XOR swaps', () => {
    expect(detectGateMisconception('NAND', 'NOR')?.id).toBe('nand-nor')
    expect(detectGateMisconception('OR', 'XOR')?.id).toBe('or-xor')
  })

  it('falls back to a generic misconception for unrelated pairs', () => {
    const m = detectGateMisconception('AND', 'XNOR')
    expect(m?.id).toBe('generic')
    expect(m?.hint.length).toBeGreaterThan(0)
  })
})

describe('GATE_MISCONCEPTIONS catalogue', () => {
  it('is non-empty and has unique ids', () => {
    expect(GATE_MISCONCEPTIONS.length).toBeGreaterThan(0)
    expect(new Set(GATE_MISCONCEPTIONS.map((m) => m.id)).size).toBe(GATE_MISCONCEPTIONS.length)
  })

  it('every entry is complete', () => {
    for (const m of GATE_MISCONCEPTIONS) {
      expect(m.pattern.length).toBeGreaterThan(0)
      expect(m.explanation.length).toBeGreaterThan(0)
      expect(m.hint.length).toBeGreaterThan(0)
    }
  })

  it('looks up by id', () => {
    expect(getGateMisconception('and-or')?.pattern).toContain('AND')
    expect(getGateMisconception('nope')).toBeUndefined()
  })
})