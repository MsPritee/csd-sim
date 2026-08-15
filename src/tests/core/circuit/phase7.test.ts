import { describe, expect, it } from 'vitest'
import {
  propagate,
  tick,
  evaluateCircuit,
  toCircuit,
  addComponent,
  bitValue,
  packedValue,
  emptyState,
  isStatefulType,
  portCountOf,
  defaultAttrs,
} from '../../../core/circuit'
import type { SimState } from '../../../core/circuit'

/** Run one tick with `inputs` against `state` and return the next state. */
function step(
  circ: ReturnType<typeof toCircuit>,
  inputs: Record<string, 0 | 1>,
  state: SimState,
): SimState {
  return tick(circ, inputs, state).nextState
}

/** Read a width-1 output bit after propagating with `state`. */
function bit(
  circ: ReturnType<typeof toCircuit>,
  inputs: Record<string, 0 | 1>,
  state: SimState,
  port: string,
): 0 | 1 | 'X' | 'E' | undefined {
  return bitValue(propagate(circ, inputs, state).values.get(port))
}

/** Read a packed multi-bit output after propagating with `state`. */
function packed(
  circ: ReturnType<typeof toCircuit>,
  inputs: Record<string, 0 | 1>,
  state: SimState,
  port: string,
): number | null {
  return packedValue(propagate(circ, inputs, state).values.get(port))
}

describe('Phase 7 descriptors', () => {
  it('registers every memory component as stateful with the right ports', () => {
    const expectPorts: Record<string, { inputs: number; outputs: number }> = {
      jk: { inputs: 3, outputs: 2 },
      t: { inputs: 2, outputs: 2 },
      sr: { inputs: 3, outputs: 2 },
      register: { inputs: 2, outputs: 1 },
      counter: { inputs: 2, outputs: 1 },
      ram: { inputs: 4, outputs: 1 },
      rom: { inputs: 1, outputs: 1 },
    }
    for (const [type, pc] of Object.entries(expectPorts)) {
      expect(isStatefulType(type)).toBe(true)
      expect(portCountOf(type, defaultAttrs(type))).toEqual(pc)
    }
  })

  it('ROM seeds its contents from the content attribute', () => {
    const rom = addComponent('r', 'rom', { width: 8, addrBits: 2, content: '5,7' })
    const a = addComponent('a', 'constant', { width: 2, value: 1 })
    const circ = toCircuit([rom, a], [{ from: 'a:out:0', to: 'r:in:0' }])
    expect(packedValue(evaluateCircuit(circ).values.get('r:out:0'))).toBe(7)
    const a0 = addComponent('a0', 'constant', { width: 2, value: 0 })
    const circ0 = toCircuit([addComponent('r0', 'rom', { width: 8, addrBits: 2, content: '5,7' }), a0], [
      { from: 'a0:out:0', to: 'r0:in:0' },
    ])
    expect(packedValue(evaluateCircuit(circ0).values.get('r0:out:0'))).toBe(5)
  })
})

describe('JK flip-flop', () => {
  function jk() {
    const f = addComponent('f', 'jk')
    const j = addComponent('j', 'input')
    const k = addComponent('k', 'input')
    const clk = addComponent('clk', 'input')
    return {
      circ: toCircuit(
        [f, j, k, clk],
        [
          { from: 'j:out:0', to: 'f:in:0' },
          { from: 'k:out:0', to: 'f:in:1' },
          { from: 'clk:out:0', to: 'f:in:2' },
        ],
      ),
    }
  }

  it('holds 0 initially, toggles on J=K=1 at the rising edge', () => {
    const { circ } = jk()
    let s = emptyState()
    // idle low, J=K=1
    s = step(circ, { j: 1, k: 1, clk: 0 }, s)
    expect(bit(circ, { j: 1, k: 1, clk: 0 }, s, 'f:out:0')).toBe(0)
    // rising edge with J=K=1 → toggle to 1
    s = step(circ, { j: 1, k: 1, clk: 1 }, s)
    expect(bit(circ, { j: 1, k: 1, clk: 1 }, s, 'f:out:0')).toBe(1)
    // next edge toggles back
    s = step(circ, { j: 1, k: 1, clk: 0 }, s)
    s = step(circ, { j: 1, k: 1, clk: 1 }, s)
    expect(bit(circ, { j: 1, k: 1, clk: 1 }, s, 'f:out:0')).toBe(0)
  })

  it('sets on J=1/K=0, resets on J=0/K=1, holds on J=K=0', () => {
    const { circ } = jk()
    let s = emptyState()
    s = step(circ, { j: 0, k: 0, clk: 0 }, s)
    s = step(circ, { j: 1, k: 0, clk: 1 }, s)
    expect(bit(circ, { j: 1, k: 0, clk: 1 }, s, 'f:out:0')).toBe(1)
    // hold while J=K=0 even on edges
    s = step(circ, { j: 0, k: 0, clk: 0 }, s)
    s = step(circ, { j: 0, k: 0, clk: 1 }, s)
    expect(bit(circ, { j: 0, k: 0, clk: 1 }, s, 'f:out:0')).toBe(1)
    // reset
    s = step(circ, { j: 0, k: 0, clk: 0 }, s)
    s = step(circ, { j: 0, k: 1, clk: 1 }, s)
    expect(bit(circ, { j: 0, k: 1, clk: 1 }, s, 'f:out:0')).toBe(0)
    // Q-bar is the complement
    expect(bit(circ, { j: 0, k: 1, clk: 1 }, s, 'f:out:1')).toBe(1)
  })
})

describe('T flip-flop', () => {
  function tff() {
    const f = addComponent('f', 't')
    const t = addComponent('t', 'input')
    const clk = addComponent('clk', 'input')
    return {
      circ: toCircuit(
        [f, t, clk],
        [
          { from: 't:out:0', to: 'f:in:0' },
          { from: 'clk:out:0', to: 'f:in:1' },
        ],
      ),
    }
  }

  it('toggles on every rising edge only while T=1', () => {
    const { circ } = tff()
    let s = emptyState()
    // first rising edge toggles 0 -> 1
    s = step(circ, { t: 1, clk: 0 }, s)
    s = step(circ, { t: 1, clk: 1 }, s)
    expect(bit(circ, { t: 1, clk: 1 }, s, 'f:out:0')).toBe(1)
    // second rising edge toggles back
    s = step(circ, { t: 1, clk: 0 }, s)
    s = step(circ, { t: 1, clk: 1 }, s)
    expect(bit(circ, { t: 1, clk: 1 }, s, 'f:out:0')).toBe(0)
    // T=0 holds regardless of edges
    s = step(circ, { t: 0, clk: 0 }, s)
    s = step(circ, { t: 0, clk: 1 }, s)
    expect(bit(circ, { t: 0, clk: 1 }, s, 'f:out:0')).toBe(0)
    // Q-bar complement
    expect(bit(circ, { t: 0, clk: 1 }, s, 'f:out:1')).toBe(1)
  })
})

describe('SR flip-flop', () => {
  function sr() {
    const f = addComponent('f', 'sr')
    const s = addComponent('s', 'input')
    const r = addComponent('r', 'input')
    const clk = addComponent('clk', 'input')
    return {
      circ: toCircuit(
        [f, s, r, clk],
        [
          { from: 's:out:0', to: 'f:in:0' },
          { from: 'r:out:0', to: 'f:in:1' },
          { from: 'clk:out:0', to: 'f:in:2' },
        ],
      ),
    }
  }

  it('sets with S=1, resets with R=1, holds otherwise', () => {
    const { circ } = sr()
    let s = emptyState()
    s = step(circ, { s: 1, r: 0, clk: 0 }, s)
    s = step(circ, { s: 1, r: 0, clk: 1 }, s)
    expect(bit(circ, { s: 1, r: 0, clk: 1 }, s, 'f:out:0')).toBe(1)
    s = step(circ, { s: 0, r: 0, clk: 0 }, s)
    s = step(circ, { s: 0, r: 0, clk: 1 }, s)
    expect(bit(circ, { s: 0, r: 0, clk: 1 }, s, 'f:out:0')).toBe(1)
    s = step(circ, { s: 0, r: 1, clk: 0 }, s)
    s = step(circ, { s: 0, r: 1, clk: 1 }, s)
    expect(bit(circ, { s: 0, r: 1, clk: 1 }, s, 'f:out:0')).toBe(0)
  })
})

describe('Register', () => {
  function reg() {
    const f = addComponent('f', 'register', { width: 8 })
    const d = addComponent('d', 'constant', { width: 8, value: 10 })
    const clk = addComponent('clk', 'input')
    return {
      circ: toCircuit(
        [f, d, clk],
        [
          { from: 'd:out:0', to: 'f:in:0' },
          { from: 'clk:out:0', to: 'f:in:1' },
        ],
      ),
    }
  }

  it('loads the D bus on the rising edge and holds it', () => {
    const { circ } = reg()
    let s = emptyState()
    expect(packed(circ, { clk: 0 }, s, 'f:out:0')).toBe(0)
    s = step(circ, { clk: 0 }, s)
    s = step(circ, { clk: 1 }, s)
    // captures D = 0b1010 = 10 on the rising edge
    expect(packed(circ, { clk: 1 }, s, 'f:out:0')).toBe(10)
    // holds across a non-capturing (high, then low) window
    s = step(circ, { clk: 0 }, s)
    expect(packed(circ, { clk: 0 }, s, 'f:out:0')).toBe(10)
  })
})

describe('Counter', () => {
  function counter(dir = 1) {
    const f = addComponent('f', 'counter', { width: 4, direction: dir })
    const clk = addComponent('clk', 'input')
    const en = addComponent('en', 'input')
    return {
      circ: toCircuit(
        [f, clk, en],
        [
          { from: 'clk:out:0', to: 'f:in:0' },
          { from: 'en:out:0', to: 'f:in:1' },
        ],
      ),
    }
  }

  it('counts up on rising edges while enabled and wraps', () => {
    const { circ } = counter(1)
    let s = emptyState()
    for (let i = 1; i <= 17; i++) {
      s = step(circ, { en: 1, clk: 0 }, s)
      s = step(circ, { en: 1, clk: 1 }, s)
    }
    // 17 steps mod 16 = 1
    expect(packed(circ, { en: 1, clk: 1 }, s, 'f:out:0')).toBe(1)
  })

  it('holds while disabled and counts down with direction=0', () => {
    const { circ } = counter(1)
    let s = emptyState()
    s = step(circ, { en: 1, clk: 0 }, s)
    s = step(circ, { en: 1, clk: 1 }, s)
    expect(packed(circ, { en: 1, clk: 1 }, s, 'f:out:0')).toBe(1)
    // disabled edges do not advance
    s = step(circ, { en: 0, clk: 0 }, s)
    s = step(circ, { en: 0, clk: 1 }, s)
    s = step(circ, { en: 0, clk: 0 }, s)
    s = step(circ, { en: 0, clk: 1 }, s)
    expect(packed(circ, { en: 0, clk: 1 }, s, 'f:out:0')).toBe(1)

    const down = counter(0)
    s = emptyState()
    s = step(down.circ, { en: 1, clk: 0 }, s)
    s = step(down.circ, { en: 1, clk: 1 }, s)
    expect(packed(down.circ, { en: 1, clk: 1 }, s, 'f:out:0')).toBe(0xf)
  })
})

describe('RAM', () => {
  /** Build a RAM with fixed address/data constants (bus values via constants). */
  function ram(addrBits = 2, width = 8, aValue = 0, dValue = 0) {
    const m = addComponent('m', 'ram', { width, addrBits })
    const a = addComponent('a', 'constant', { width: addrBits, value: aValue })
    const d = addComponent('d', 'constant', { width, value: dValue })
    const we = addComponent('we', 'input')
    const clk = addComponent('clk', 'input')
    return {
      circ: toCircuit(
        [m, a, d, we, clk],
        [
          { from: 'a:out:0', to: 'm:in:0' },
          { from: 'd:out:0', to: 'm:in:1' },
          { from: 'we:out:0', to: 'm:in:2' },
          { from: 'clk:out:0', to: 'm:in:3' },
        ],
      ),
    }
  }

  it('reads zeros before any write', () => {
    const { circ } = ram()
    expect(packed(circ, { we: 0, clk: 0 }, emptyState(), 'm:out:0')).toBe(0)
  })

  it('writes only on the rising edge with write-enable high', () => {
    let s = emptyState()
    // write 0b1010 = 10 to address 1 (state persists by component id `m`)
    let { circ } = ram(2, 8, 1, 10)
    s = step(circ, { we: 1, clk: 0 }, s)
    s = step(circ, { we: 1, clk: 1 }, s)
    expect(packed(circ, { we: 1, clk: 1 }, s, 'm:out:0')).toBe(10)
    // read a different address → still 0
    ;({ circ } = ram(2, 8, 2, 0))
    expect(packed(circ, { we: 0, clk: 0 }, s, 'm:out:0')).toBe(0)
    // write-enable low does not clobber word 1 on the next edge
    ;({ circ } = ram(2, 8, 1, 99))
    s = step(circ, { we: 0, clk: 0 }, s)
    s = step(circ, { we: 0, clk: 1 }, s)
    expect(packed(circ, { we: 0, clk: 1 }, s, 'm:out:0')).toBe(10)
  })

  it('addresses beyond capacity read 0', () => {
    const { circ } = ram(2, 8, 4, 0)
    expect(packed(circ, { we: 0, clk: 0 }, emptyState(), 'm:out:0')).toBe(0)
  })
})

describe('ROM', () => {
  it('reads combinational contents without ticks', () => {
    const rom = addComponent('r', 'rom', { width: 8, addrBits: 2, content: '3, 9' })
    const a = addComponent('a', 'constant', { width: 2, value: 1 })
    const circ = toCircuit([rom, a], [{ from: 'a:out:0', to: 'r:in:0' }])
    const r = evaluateCircuit(circ)
    expect(packedValue(r.values.get('r:out:0'))).toBe(9)
    expect(r.oscillating).toBe(false)
  })
})
