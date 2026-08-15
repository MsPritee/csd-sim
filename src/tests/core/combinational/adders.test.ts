import { describe, it, expect } from 'vitest'
import { halfAdd, fullAdd, rippleAdd } from '../../../core/combinational/adders'
import type { Bit } from '../../../core/gates/types'

describe('halfAdd', () => {
  it('covers the full two-input truth table', () => {
    const cases: Array<[Bit, Bit, Bit, Bit]> = [
      [0, 0, 0, 0],
      [0, 1, 1, 0],
      [1, 0, 1, 0],
      [1, 1, 0, 1],
    ]
    for (const [a, b, sum, carry] of cases) {
      const r = halfAdd(a, b)
      expect(r.sum).toBe(sum)
      expect(r.carry).toBe(carry)
    }
  })
})

describe('fullAdd', () => {
  it('matches a + b + carryIn for every combination', () => {
    for (let a = 0; a < 2; a++) {
      for (let b = 0; b < 2; b++) {
        for (let c = 0; c < 2; c++) {
          const total = a + b + c
          const r = fullAdd(a as Bit, b as Bit, c as Bit)
          expect(r.sum).toBe((total & 1) as Bit)
          expect(r.carry).toBe((total >> 1) as Bit)
        }
      }
    }
  })
})

describe('rippleAdd', () => {
  it('adds two 4-bit numbers LSB-first correctly', () => {
    // 4-bit LSB-first arrays.
    const toBinary = (n: number, width: number): Bit[] =>
      Array.from({ length: width }, (_, i) => ((n >> i) & 1) as Bit)

    for (let total = 0; total < 256; total++) {
      const a = (total & 0x0f) >>> 0
      const b = (total & 0xf0) >>> 4
      const r = rippleAdd(toBinary(a, 4), toBinary(b, 4))
      const sumValue = r.sum.reduce<number>((acc, bit, i) => acc + bit * 2 ** i, 0)
      const carryValue = r.carryOut * 16
      expect(sumValue + carryValue).toBe(a + b)
    }
  })

  it('handles a carry that overflows the width', () => {
    // 7 + 1 = 8 (carry out, sum 0000)
    const r = rippleAdd([1, 1, 1], [1, 0, 0])
    expect([...r.sum]).toEqual([0, 0, 0])
    expect(r.carryOut).toBe(1)
  })

  it('rejects unequal operand widths', () => {
    expect(() => rippleAdd([1, 1], [1])).toThrow(RangeError)
  })
})