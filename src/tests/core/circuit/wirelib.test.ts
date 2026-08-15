import { describe, it, expect } from 'vitest'
import {
  splitterNets,
  splitterArmWidths,
  pullNet,
  netFromNumber,
  netFromBits,
} from '../../../core/circuit'
import type { BitState } from '../../../core/circuit'

function bits(width: number, value: number): BitState[] {
  const out: BitState[] = []
  for (let i = 0; i < width; i++) out.push(((value >> (width - 1 - i)) & 1) as BitState)
  return out
}

describe('splitterArmWidths', () => {
  it('distributes a width evenly across arms with leftovers on the high side', () => {
    expect(splitterArmWidths(8, 4)).toEqual([2, 2, 2, 2])
    expect(splitterArmWidths(10, 3)).toEqual([4, 3, 3])
    expect(splitterArmWidths(1, 8)).toEqual([1, 0, 0, 0, 0, 0, 0, 0])
  })
})

describe('splitterNets — fan-out', () => {
  it('slices the stem across the arms', () => {
    // width 4, fanOut 2 -> stem 0b1010 (states [1,0,1,0]), arms of width 2
    const stem = netFromBits(bits(4, 0b1010))
    const out = splitterNets([stem, undefined, undefined], 4, 2)
    // [stemOut, arm0, arm1]
    expect(out[1]).toEqual(netFromBits([1, 0]))
    expect(out[2]).toEqual(netFromBits([1, 0]))
  })

  it('leaves arms floating when the stem is undriven', () => {
    const out = splitterNets([undefined, undefined, undefined], 4, 2)
    expect(out[1]).toBeUndefined()
    expect(out[2]).toBeUndefined()
  })

  it('flags a stem of the wrong width as an error', () => {
    const stem = netFromBits([1, 1])
    const out = splitterNets([stem, undefined, undefined], 4, 2)
    expect(out[1]).toBe('E')
  })
})

describe('splitterNets — fan-in', () => {
  it('combines driven arms back into the stem', () => {
    const out = splitterNets([undefined, netFromBits([1, 0]), netFromBits([0, 1])], 4, 2)
    expect(out[0]).toEqual(netFromBits([1, 0, 0, 1]))
  })

  it('fills undriven arms with unknown lanes', () => {
    // only arm0 driven [1,0]; arm1 undriven -> ['X','X']
    const out = splitterNets([undefined, netFromBits([1, 0]), undefined], 4, 2)
    expect(out[0]).toEqual(netFromBits([1, 0, 'X', 'X'] as BitState[]))
  })

  it('stays floating when no arm is driven', () => {
    const out = splitterNets([undefined, undefined, undefined], 4, 2)
    expect(out[0]).toBeUndefined()
  })

  it('propagates an error arm as an error stem', () => {
    const out = splitterNets([undefined, 'E', undefined], 4, 2)
    expect(out[0]).toBe('E')
  })
})

describe('pullNet', () => {
  it('passes a driven input through untouched', () => {
    const driven = netFromBits([1, 0])
    expect(pullNet(driven, 1)).toBe(driven)
    expect(pullNet(netFromNumber(1, 0), 1)).toEqual(netFromNumber(1, 0))
  })

  it('forces the pull value when the line floats', () => {
    expect(pullNet(undefined, 1)).toEqual(netFromNumber(1, 1))
    expect(pullNet(undefined, 0)).toEqual(netFromNumber(1, 0))
  })
})