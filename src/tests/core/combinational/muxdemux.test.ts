import { describe, it, expect } from 'vitest'
import { multiplexer, demultiplexer } from '../../../core/combinational/muxdemux'
import type { Bit } from '../../../core/gates/types'

describe('multiplexer', () => {
  it('routes each data line for a 2-bit select (4 lines)', () => {
    const data: Bit[] = [1, 0, 0, 1]
    const selects: Array<[Bit, Bit]> = [
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1],
    ]
    selects.forEach((sel, i) => {
      expect(multiplexer(data, sel)).toBe(data[i]!)
    })
  })

  it('routes a 1-bit select (2 lines)', () => {
    expect(multiplexer([1, 0], [0])).toBe(1)
    expect(multiplexer([1, 0], [1])).toBe(0)
  })

  it('rejects a data width that is not 2^select', () => {
    expect(() => multiplexer([1, 1, 1], [0, 0])).toThrow(RangeError)
  })
})

describe('demultiplexer', () => {
  it('routes the input to exactly the addressed line and 0 elsewhere', () => {
    selects().forEach((sel, i) => {
      const out = demultiplexer(1, sel)
      expect(out.length).toBe(4)
      out.forEach((bit, j) => expect(bit).toBe(i === j ? 1 : 0))
    })
  })

  it('zeros every line when the input is 0', () => {
    const out = demultiplexer(0, [1, 0])
    expect([...out]).toEqual([0, 0, 0, 0])
  })

  it('supports wider selects (3-bit → 8 lines)', () => {
    const out = demultiplexer(1, [0, 1, 0])
    expect(out).toHaveLength(8)
    out.forEach((bit, j) => expect(bit).toBe(j === 2 ? 1 : 0))
  })
})

function selects(): Array<[Bit, Bit]> {
  const out: Array<[Bit, Bit]> = []
  for (let i = 0; i < 4; i++) out.push([(i >> 1) as Bit, (i & 1) as Bit])
  return out
}