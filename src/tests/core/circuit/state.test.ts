import { describe, expect, it } from 'vitest'
import {
  propagate,
  tick,
  evaluateCircuit,
  toCircuit,
  addComponent,
  bitValue,
  emptyState,
  clockOutput,
  clockTick,
} from '../../../core/circuit'
import type { SimState } from '../../../core/circuit'

const D_IN = 'd'
const CLK = 'clk'
const FF = 'ff'

/** A D flip-flop with separate D and clock inputs. */
function dffCircuit(feedbackQ = false) {
  const dff = addComponent(FF, 'dff')
  const d = addComponent(D_IN, 'input', { label: 'D' })
  const clk = addComponent(CLK, 'input', { label: 'CLK' })
  const wires: { from: string; to: string }[] = [
    { from: `${D_IN}:out:0`, to: `${FF}:in:0` },
    { from: `${CLK}:out:0`, to: `${FF}:in:1` },
  ]
  if (feedbackQ) wires.push({ from: `${FF}:out:0`, to: `${FF}:in:0` })
  return toCircuit([dff, d, clk], wires)
}

function q(state: SimState): 0 | 1 | 'X' | 'E' | undefined {
  return bitValue(propagate(dffCircuit(), { [D_IN]: 0, [CLK]: 0 }, state).values.get(`${FF}:out:0`))
}

describe('D flip-flop', () => {
  it('defaults to Q=0 and Q-bar=1', () => {
    const r = propagate(dffCircuit(), { [D_IN]: 0, [CLK]: 0 }, emptyState())
    expect(bitValue(r.values.get(`${FF}:out:0`))).toBe(0)
    expect(bitValue(r.values.get(`${FF}:out:1`))).toBe(1)
  })

  it('does not capture while the clock is low', () => {
    const s0 = emptyState()
    const t0 = tick(dffCircuit(), { [D_IN]: 1, [CLK]: 0 }, s0)
    expect(q(t0.nextState)).toBe(0)
  })

  it('captures D on the rising edge of CLK', () => {
    let s = emptyState()
    // idle at low clock
    let t = tick(dffCircuit(), { [D_IN]: 1, [CLK]: 0 }, s)
    s = t.nextState
    // rising edge: clk 0 -> 1 while D = 1
    t = tick(dffCircuit(), { [D_IN]: 1, [CLK]: 1 }, s)
    s = t.nextState
    expect(q(s)).toBe(1)

    // holds at high clock even when D changes to 0
    t = tick(dffCircuit(), { [D_IN]: 0, [CLK]: 1 }, s)
    s = t.nextState
    expect(q(s)).toBe(1)

    // drop low, then rise again with D = 0 -> capture 0
    t = tick(dffCircuit(), { [D_IN]: 0, [CLK]: 0 }, s)
    s = t.nextState
    t = tick(dffCircuit(), { [D_IN]: 0, [CLK]: 1 }, s)
    s = t.nextState
    expect(q(s)).toBe(0)
  })

  it('Q-bar is the complement of Q', () => {
    let s = emptyState()
    let t = tick(dffCircuit(), { [D_IN]: 1, [CLK]: 1 }, s)
    s = t.nextState
    const r = propagate(dffCircuit(), { [D_IN]: 1, [CLK]: 1 }, s)
    expect(bitValue(r.values.get(`${FF}:out:0`))).toBe(1)
    expect(bitValue(r.values.get(`${FF}:out:1`))).toBe(0)
  })

  it('does not report sequential feedback (Q to D) as oscillation', () => {
    const circ = dffCircuit(true)
    const r = evaluateCircuit(circ, { [CLK]: 0 })
    expect(r.oscillating).toBe(false)
    expect(bitValue(r.values.get(`${FF}:out:0`))).toBe(0)
  })

  it('still flags a pure combinational loop', () => {
    const not = addComponent('g1', 'NOT')
    const circ = toCircuit([not], [{ from: 'g1:out:0', to: 'g1:in:0' }])
    const r = evaluateCircuit(circ)
    expect(r.oscillating).toBe(true)
  })
})

describe('clock', () => {
  const CLK = 'ck'

  function clockCircuit() {
    const clock = addComponent(CLK, 'clock')
    return toCircuit([clock], [])
  }

  it('starts low (0)', () => {
    expect(clockOutput(emptyState(), CLK)).toBe(0)
  })

  it('toggles each tick', () => {
    let level = clockTick(undefined)
    expect(level).toBe(1)
    level = clockTick(level)
    expect(level).toBe(0)
  })

  it('propagates the clock level onto its output port', () => {
    const r = propagate(clockCircuit(), {}, emptyState())
    expect(bitValue(r.values.get(`${CLK}:out:0`))).toBe(0)

    const t0 = tick(clockCircuit(), {}, emptyState())
    expect(clockOutput(t0.nextState, CLK)).toBe(1)
    const r1 = propagate(clockCircuit(), {}, t0.nextState)
    expect(bitValue(r1.values.get(`${CLK}:out:0`))).toBe(1)
  })
})