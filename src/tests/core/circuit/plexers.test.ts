import { describe, it, expect } from 'vitest'
import {
  addComponent,
  toCircuit,
  evaluateCircuit,
  netFromBits,
  netFromNumber,
  selectBits,
  muxOutputs,
  demuxOutputs,
  decoderOutputs,
  encoderOutputs,
  priorityEncoderOutputs,
  bitSelectorOutputs,
} from '../../../core/circuit'
import type { BitState, NetValue } from '../../../core/circuit'

function constant(id: string, width: number, value: number) {
  return addComponent(id, 'constant', { width, value })
}

function sel(width: number, value: number): NetValue {
  const s: BitState[] = []
  for (let i = 0; i < width; i++) s.push(((value >> i) & 1) as BitState)
  return netFromBits(s)
}

describe('selectBits', () => {
  it('returns the smallest select width covering the option count', () => {
    expect(selectBits(1)).toBe(0)
    expect(selectBits(2)).toBe(1)
    expect(selectBits(3)).toBe(2)
    expect(selectBits(4)).toBe(2)
    expect(selectBits(5)).toBe(3)
    expect(selectBits(32)).toBe(5)
  })
})

describe('muxOutputs', () => {
  it('picks the data bus selected by the select input', () => {
    const data = [netFromBits([0, 1]), netFromBits([1, 0]), netFromBits([1, 1])]
    expect(muxOutputs([...data, sel(2, 0)], 3)).toEqual([data[0]])
    expect(muxOutputs([...data, sel(2, 1)], 3)).toEqual([data[1]])
    expect(muxOutputs([...data, sel(2, 2)], 3)).toEqual([data[2]])
  })

  it('clamps an out-of-range select to the last data bus', () => {
    const data = [netFromBits([0]), netFromBits([1])]
    expect(muxOutputs([...data, sel(2, 3)], 2)).toEqual([data[1]])
  })

  it('propagates a floating select as floating and an error select as error', () => {
    const data = [netFromBits([0]), netFromBits([1])]
    expect(muxOutputs([...data, undefined], 2)).toEqual([undefined])
    expect(muxOutputs([...data, 'E'], 2)).toEqual(['E'])
  })
})

describe('demuxOutputs', () => {
  it('routes the data bus to the selected output and zeroes the rest', () => {
    const out = demuxOutputs([netFromBits([1, 0]), sel(1, 1)], 2, 2)
    expect(out[0]).toEqual(netFromBits([0, 0]))
    expect(out[1]).toEqual(netFromBits([1, 0]))
  })

  it('outputs only zeros for an out-of-range select', () => {
    const out = demuxOutputs([netFromBits([1, 0]), sel(2, 3)], 2, 2)
    expect(out).toEqual([netFromBits([0, 0]), netFromBits([0, 0])])
  })

  it('propagates a floating select to all outputs', () => {
    const out = demuxOutputs([netFromBits([1, 0]), undefined], 2, 2)
    expect(out).toEqual([undefined, undefined])
  })
})

describe('decoderOutputs', () => {
  it('produces a one-hot line for the selected index', () => {
    const out2 = decoderOutputs([sel(2, 0)], 2)
    expect(out2).toEqual([netFromBits([1]), netFromBits([0]), netFromBits([0]), netFromBits([0])])
    const out3 = decoderOutputs([sel(2, 3)], 2)
    expect(out3).toEqual([
      netFromBits([0]),
      netFromBits([0]),
      netFromBits([0]),
      netFromBits([1]),
    ])
  })
})

describe('encoderOutputs', () => {
  it('outputs the binary index of the lowest set input line', () => {
    expect(encoderOutputs([netFromBits([1]), netFromBits([0]), netFromBits([1]), netFromBits([0])], 4)).toEqual([
      netFromNumber(2, 0),
    ])
    expect(encoderOutputs([netFromBits([0]), netFromBits([0]), netFromBits([1]), netFromBits([0])], 4)).toEqual([
      netFromNumber(2, 2),
    ])
  })

  it('outputs zero when no input line is set', () => {
    expect(encoderOutputs([netFromBits([0]), netFromBits([0]), netFromBits([0]), netFromBits([0])], 4)).toEqual([
      netFromNumber(2, 0),
    ])
  })
})

describe('priorityEncoderOutputs', () => {
  it('outputs the index of the highest set line plus a group-valid flag', () => {
    expect(priorityEncoderOutputs([netFromBits([1]), netFromBits([0]), netFromBits([1]), netFromBits([0])], 4)).toEqual([
      netFromNumber(2, 2),
      netFromBits([1]),
    ])
    expect(priorityEncoderOutputs([netFromBits([0]), netFromBits([0]), netFromBits([1]), netFromBits([1])], 4)).toEqual([
      netFromNumber(2, 3),
      netFromBits([1]),
    ])
  })

  it('clears the group-valid flag when no line is set', () => {
    expect(priorityEncoderOutputs([netFromBits([0]), netFromBits([0]), netFromBits([0]), netFromBits([0])], 4)).toEqual([
      netFromNumber(2, 0),
      netFromBits([0]),
    ])
  })
})

describe('bitSelectorOutputs', () => {
  it('slices the selected bit group from the data bus', () => {
    const data = netFromBits([1, 0, 1, 1, 0, 1, 0, 1])
    expect(bitSelectorOutputs([data, sel(2, 0)], 8, 2)).toEqual([netFromBits([1, 0])])
    expect(bitSelectorOutputs([data, sel(2, 1)], 8, 2)).toEqual([netFromBits([1, 1])])
    expect(bitSelectorOutputs([data, sel(2, 3)], 8, 2)).toEqual([netFromBits([0, 1])])
  })

  it('pads a short trailing group with zeros', () => {
    const data = netFromBits([1, 0, 1])
    expect(bitSelectorOutputs([data, sel(2, 1)], 3, 2)).toEqual([netFromBits([1, 0])])
  })

  it('outputs zeros for an out-of-range group', () => {
    const data = netFromBits([1, 0, 1, 1, 0, 1, 0, 1])
    expect(bitSelectorOutputs([data, sel(3, 4)], 8, 2)).toEqual([netFromBits([0, 0])])
  })
})

describe('Plexers over the circuit net model', () => {
  it('a 2:1 MUX selects between two constants via a select bus', () => {
    const a = constant('a', 2, 0b01)
    const b = constant('b', 2, 0b10)
    const s0 = constant('s0', 1, 0)
    const s1 = constant('s1', 1, 1)
    const o0 = addComponent('o0', 'output', { label: 'Y0' })
    const o1 = addComponent('o1', 'output', { label: 'Y1' })
    const circ = toCircuit(
      [a, b, s0, s1, mux('m0'), mux('m1'), o0, o1],
      [
        { from: 'a:out:0', to: 'm0:in:0' },
        { from: 'b:out:0', to: 'm0:in:1' },
        { from: 's0:out:0', to: 'm0:in:2' },
        { from: 'm0:out:0', to: 'o0:in:0' },
        { from: 'a:out:0', to: 'm1:in:0' },
        { from: 'b:out:0', to: 'm1:in:1' },
        { from: 's1:out:0', to: 'm1:in:2' },
        { from: 'm1:out:0', to: 'o1:in:0' },
      ],
    )
    const r = evaluateCircuit(circ)
    // constant msb-right: a=0b01 -> [1,0]; b=0b10 -> [0,1]
    expect(r.values.get('o0:in:0')).toEqual(netFromBits([1, 0]))
    expect(r.values.get('o1:in:0')).toEqual(netFromBits([0, 1]))
  })

  it('a decoder lights one-hot output lines', () => {
    const s = constant('s', 2, 3)
    const o0 = addComponent('o0', 'output', { label: 'Y0' })
    const o3 = addComponent('o3', 'output', { label: 'Y3' })
    const circ = toCircuit(
      [s, dec('d'), o0, o3],
      [
        { from: 's:out:0', to: 'd:in:0' },
        { from: 'd:out:0', to: 'o0:in:0' },
        { from: 'd:out:3', to: 'o3:in:0' },
      ],
    )
    const r = evaluateCircuit(circ)
    expect(r.values.get('o0:in:0')).toEqual(netFromBits([0]))
    expect(r.values.get('o3:in:0')).toEqual(netFromBits([1]))
  })

  it('a priority encoder reports the highest set line', () => {
    const p0 = constant('p0', 1, 1)
    const p1 = constant('p1', 1, 0)
    const p2 = constant('p2', 1, 1)
    const p3 = constant('p3', 1, 0)
    const o = addComponent('o', 'output', { label: 'I' })
    const g = addComponent('g', 'output', { label: 'G' })
    const circ = toCircuit(
      [p0, p1, p2, p3, pe('pe'), o, g],
      [
        { from: 'p0:out:0', to: 'pe:in:0' },
        { from: 'p1:out:0', to: 'pe:in:1' },
        { from: 'p2:out:0', to: 'pe:in:2' },
        { from: 'p3:out:0', to: 'pe:in:3' },
        { from: 'pe:out:0', to: 'o:in:0' },
        { from: 'pe:out:1', to: 'g:in:0' },
      ],
    )
    const r = evaluateCircuit(circ)
    // index of highest set line (p2, value 2) -> LSB-first [0,1]; group valid -> 1
    expect(r.values.get('o:in:0')).toEqual(netFromBits([0, 1]))
    expect(r.values.get('g:in:0')).toEqual(netFromBits([1]))
  })

  it('a bit selector extracts a group from a bus', () => {
    const src = constant('src', 8, 0x0a)
    const s = constant('s', 2, 1)
    const o = addComponent('o', 'output', { label: 'Y' })
    const circ = toCircuit(
      [src, s, bs('bs'), o],
      [
        { from: 'src:out:0', to: 'bs:in:0' },
        { from: 's:out:0', to: 'bs:in:1' },
        { from: 'bs:out:0', to: 'o:in:0' },
      ],
    )
    const r = evaluateCircuit(circ)
    // constant 0x0a=10 is LSB-first [0,1,0,1,...]; group 1 -> bits[2..3]=[0,1]
    expect(r.values.get('o:in:0')).toEqual(netFromBits([0, 1]))
  })
})

// -- light local builders ----------------------------------------------------

function mux(id: string) {
  return addComponent(id, 'mux', { width: 2, dataCount: 2 })
}
function dec(id: string) {
  return addComponent(id, 'decoder', { selBits: 2 })
}
function pe(id: string) {
  return addComponent(id, 'priority_encoder', { dataCount: 4 })
}
function bs(id: string) {
  return addComponent(id, 'bit_selector', { width: 8, groupWidth: 2 })
}