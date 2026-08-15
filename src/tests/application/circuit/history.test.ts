import { describe, it, expect } from 'vitest'
import { recordHistory, snapshotOf, HISTORY_LIMIT } from '../../../application/circuit/history'
import type { CircuitState } from '../../../stores/circuitStore'

const base: Pick<CircuitState, 'tabs' | 'activeTabId' | 'inputs' | 'past' | 'future'> = {
  tabs: [{ id: 'main', name: 'main', circuit: { components: [], wires: [] } }],
  activeTabId: 'main',
  inputs: {},
  past: [],
  future: [],
}

describe('snapshotOf', () => {
  it('captures tabs, activeTabId and inputs by reference', () => {
    const state = { ...base, inputs: { c1: 1 as 0 | 1 } }
    const snap = snapshotOf(state)
    expect(snap.tabs).toBe(state.tabs)
    expect(snap.activeTabId).toBe('main')
    expect(snap.inputs).toBe(state.inputs)
    expect(snap.inputs['c1']).toBe(1)
  })
})

describe('recordHistory', () => {
  it('pushes the current state onto past and clears future', () => {
    const state = {
      ...base,
      future: [{ tabs: base.tabs, activeTabId: 'x', inputs: {} }],
    }
    const next = recordHistory(state)
    expect(next.past).toHaveLength(1)
    expect(next.past[0]?.tabs).toBe(state.tabs)
    expect(next.past[0]?.activeTabId).toBe('main')
    expect(next.future).toEqual([])
  })

  it('appends onto an existing past', () => {
    const s1 = recordHistory(base)
    const s2 = recordHistory({ ...base, past: s1.past })
    expect(s2.past).toHaveLength(2)
  })

  it('caps the history at HISTORY_LIMIT entries', () => {
    let past: typeof base.past = []
    for (let i = 0; i < HISTORY_LIMIT + 20; i++) {
      const next = recordHistory({ ...base, past })
      past = next.past
    }
    expect(past.length).toBe(HISTORY_LIMIT)
    // the oldest entry was evicted; the newest is present
    expect(past[past.length - 1]!.activeTabId).toBe('main')
  })

  it('tolerates undefined history buckets (tests resetting with a bare partial)', () => {
    const stripped = { tabs: base.tabs, activeTabId: 'main', inputs: {} } as Pick<
      CircuitState,
      'tabs' | 'activeTabId' | 'inputs' | 'past' | 'future'
    >
    const next = recordHistory(stripped)
    expect(next.past).toHaveLength(1)
    expect(next.future).toEqual([])
  })
})