import { describe, expect, it } from 'vitest'
import {
  fromGrayCode,
  generateGrayCode,
  grayString,
  hammingDistance,
  isAdjacentSequence,
  toGrayCode,
} from '../../../core/kmap/gray'

describe('generateGrayCode', () => {
  it('contains exactly 2^n entries', () => {
    for (const bits of [1, 2, 3, 4, 8]) {
      expect(generateGrayCode(bits)).toHaveLength(2 ** bits)
    }
  })

  it('first entry is always zero', () => {
    for (const bits of [1, 2, 3, 4]) {
      expect(generateGrayCode(bits)[0]).toBe(0)
    }
  })

  it('consecutive entries differ by exactly one bit', () => {
    for (const bits of [1, 2, 3, 4, 5]) {
      expect(isAdjacentSequence(generateGrayCode(bits))).toBe(true)
    }
  })

  it('produces the classic 3-bit reflected sequence', () => {
    expect(generateGrayCode(3).map((g) => grayString(g, 3))).toEqual([
      '000',
      '001',
      '011',
      '010',
      '110',
      '111',
      '101',
      '100',
    ])
  })

  it('produces the classic 2-bit sequence 00 01 11 10', () => {
    expect(generateGrayCode(2).map((g) => grayString(g, 2))).toEqual([
      '00',
      '01',
      '11',
      '10',
    ])
  })

  it('rejects fractional bit counts', () => {
    expect(() => generateGrayCode(2.5)).toThrow()
  })
})

describe('toGrayCode / fromGrayCode', () => {
  it('round-trips every value in a 4-bit space', () => {
    for (let i = 0; i < 16; i++) {
      expect(fromGrayCode(toGrayCode(i))).toBe(i)
    }
  })

  it('differs by one bit between successive binary values', () => {
    for (let i = 0; i < 15; i++) {
      expect(hammingDistance(toGrayCode(i), toGrayCode(i + 1))).toBe(1)
    }
  })
})

describe('hammingDistance', () => {
  it('counts differing bits', () => {
    expect(hammingDistance(0b0000, 0b0000)).toBe(0)
    expect(hammingDistance(0b0011, 0b0010)).toBe(1)
    expect(hammingDistance(0b0000, 0b1111)).toBe(4)
  })
})

describe('isAdjacentSequence', () => {
  it('accepts the gray sequence and rejects binary order', () => {
    const gray = generateGrayCode(2)
    expect(isAdjacentSequence(gray)).toBe(true)
    expect(isAdjacentSequence([0b00, 0b01, 0b10, 0b11])).toBe(false)
  })
})