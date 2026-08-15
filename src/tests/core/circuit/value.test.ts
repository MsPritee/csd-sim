import { describe, expect, it } from 'vitest'
import {
  netFromBits,
  netFromNumber,
  errorNet,
  packedValue,
  bitValue,
  eq,
  evaluateGateVector,
  netToString,
  widthOf,
  knownMask,
} from '../../../core/circuit'

describe('net construction', () => {
  it('builds a BitVector from per-bit states', () => {
    const net = netFromBits([0, 1, 'X'])
    expect(net.width).toBe(3)
    expect(net.states).toEqual([0, 1, 'X'])
    expect(widthOf(net)).toBe(3)
  })

  it('packs a number into a width', () => {
    const net = netFromNumber(3, 0b101)
    expect(net.states).toEqual([1, 0, 1])
    expect(packedValue(net)).toBe(5)
  })

  it('keeps width-1 packed value and bitValue aligned', () => {
    expect(packedValue(netFromNumber(1, 1))).toBe(1)
    expect(bitValue(netFromBits([0]))).toBe(0)
    expect(bitValue(netFromBits([1]))).toBe(1)
  })
})

describe('packedValue / bitValue', () => {
  it('returns null when any bit is unknown or error', () => {
    expect(packedValue(netFromBits([0, 'X']))).toBeNull()
    expect(bitValue(netFromBits([0, 'X']))).toBe('X')
  })
  it('propagates error through bitValue', () => {
    expect(bitValue(netFromBits(['E', 1]))).toBe('E')
  })
  it('collapses an all-agreeing multi-bit net to its bit', () => {
    expect(bitValue(netFromBits([1, 1, 1]))).toBe(1)
    expect(bitValue(netFromBits([0, 0]))).toBe(0)
  })
})

describe('eq / error / width', () => {
  it('compares structure', () => {
    expect(eq(netFromBits([1, 0]), netFromBits([1, 0]))).toBe(true)
    expect(eq(netFromBits([1, 0]), netFromBits([0, 1]))).toBe(false)
    expect(eq(undefined, undefined)).toBe(true)
    expect(eq('E', 'E')).toBe(true)
    expect(eq(undefined, 'E')).toBe(false)
  })
  it('knownMask reports known lanes', () => {
    expect(knownMask(netFromBits([0, 'X', 1]))).toBe(0b101)
  })
  it('errorNet is externally "E"', () => {
    expect(errorNet()).toBe('E')
  })
  it('formats nets to strings', () => {
    expect(netToString(undefined)).toBe('-')
    expect(netToString('E')).toBe('E')
    expect(netToString(netFromNumber(1, 1))).toBe('1')
    expect(netToString(netFromBits(['X', 1]))).toBe('x1')
  })
})

describe('evaluateGateVector', () => {
  it('ANDs elementwise across a 2-wide bus', () => {
    const out = evaluateGateVector('AND', [netFromNumber(2, 0b11), netFromNumber(2, 0b01)])
    expect(packedValue(out)).toBe(0b01)
  })

  it('propagates unknown per lane', () => {
    const out = evaluateGateVector('AND', [netFromBits([0, 'X']), netFromBits([1, 'X'])])
    expect(out !== undefined && out !== 'E' ? out.states : []).toEqual([0, 'X'])
  })

  it('propagates error over any input', () => {
    expect(evaluateGateVector('AND', [netFromBits([1]), 'E'])).toBe('E')
  })

  it('stays floating when an input is floating', () => {
    expect(evaluateGateVector('OR', [netFromBits([1]), undefined])).toBeUndefined()
  })

  it('flags width mismatch', () => {
    expect(evaluateGateVector('AND', [netFromNumber(1, 1), netFromNumber(2, 0b10)])).toBe('E')
  })

  it('NOT inverts a single lane', () => {
    expect(bitValue(evaluateGateVector('NOT', [netFromBits([1])]))).toBe(0)
  })
})