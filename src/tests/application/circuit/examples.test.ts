import { describe, it, expect } from 'vitest'
import { EXAMPLE_CIRCUITS, getExample } from '../../../application/circuit/examples'
import { parseProjectJSON, projectToJSON } from '../../../application/circuit/persistence'
import { evaluateCircuit, packedValue } from '../../../core/circuit'
import type { NetValue } from '../../../core/circuit'

/** Read the value arriving at an output pin's input row. */
function readOut(r: { values: ReadonlyMap<string, NetValue> }, outId: string): NetValue {
  return (r.values.get(`${outId}:in:0`) as NetValue) ?? undefined
}

/** Pack a net to an integer, asserting it is known. */
function packed(r: { values: ReadonlyMap<string, NetValue> }, outId: string): number {
  const v = readOut(r, outId)
  if (v === undefined || v === 'E') throw new Error(`output ${outId} not known`)
  const overrides = packedValue(v)
  if (overrides === null) throw new Error(`output ${outId} has unknown bits`)
  return overrides
}

describe('example circuits — round-trip through the save/load machinery', () => {
  it('exposes the three expected templates in a stable order', () => {
    expect(EXAMPLE_CIRCUITS.map((e) => e.id)).toEqual(['adder', 'mux-demux', 'alu'])
  })

  it('getExample resolves known ids and rejects unknown ones', () => {
    expect(getExample('adder')?.name).toBe('Adder')
    expect(getExample('alu')?.project).toBeDefined()
    expect(getExample('nope')).toBeUndefined()
  })

  for (const ex of EXAMPLE_CIRCUITS) {
    it(`${ex.id} is a valid project file and round-trips through parseProjectJSON`, () => {
      expect(ex.project.app).toBe('csd-sim')
      const parsed = parseProjectJSON(projectToJSON({ tabs: ex.project.tabs, activeTabId: ex.project.activeTabId }))
      expect(parsed.ok).toBe(true)
      if (!parsed.ok) return
      expect(parsed.project.activeTabId).toBe(ex.project.tabs[0]!.id)
      expect(parsed.project.tabs).toHaveLength(1)
      // components survived (ids + types) and wires are intact.
      expect(parsed.project.tabs[0]!.circuit.components).toHaveLength(ex.project.tabs[0]!.circuit.components.length)
      expect(parsed.project.tabs[0]!.circuit.wires).toHaveLength(ex.project.tabs[0]!.circuit.wires.length)
    })
  }

  it('no example oscillates', () => {
    for (const ex of EXAMPLE_CIRCUITS) {
      const circ = ex.project.tabs[0]!.circuit
      const r = evaluateCircuit(circ)
      expect(r.oscillating, ex.id).toBe(false)
    }
  })
})

describe('example circuits — simulation behaviour', () => {
  function active(ex: (typeof EXAMPLE_CIRCUITS)[number]) {
    return ex.project.tabs[0]!.circuit
  }

  it('Adder: A+B+Cin with carry-out', () => {
    const circ = active(getExample('adder')!)
    // 0xFF + 0xFF + 0 = 0x1FE -> Sum 0xFE, Cout 1
    const r = evaluateCircuit(circ, { a: 1, b: 1, cin: 0 })
    expect(packed(r, 'sum')).toBe(0xfe)
    expect(packed(r, 'cout')).toBe(1)
    // 0xFF + 0xFF + 1 = 0x1FF -> Sum 0xFF, Cout 1 (full-width).
    const r2 = evaluateCircuit(circ, { a: 1, b: 1, cin: 1 })
    expect(packed(r2, 'sum')).toBe(0xff)
    expect(packed(r2, 'cout')).toBe(1)
  })

  it('MUX+DEMUX: routes the selected input onto the selected output', () => {
    const circ = active(getExample('mux-demux')!)
    // Sel 0 -> mux picks D0 -> demux steers to O0 (the other output is zero/low)
    const r0 = evaluateCircuit(circ, { d0: 1, d1: 1, sel: 0 })
    expect(packed(r0, 'o0')).toBe(1)
    expect(packed(r0, 'o1')).toBe(0)
    // Sel 1 -> mux picks D1 -> demux steers to O1
    const r1 = evaluateCircuit(circ, { d0: 1, d1: 1, sel: 1 })
    expect(packed(r1, 'o0')).toBe(0)
    expect(packed(r1, 'o1')).toBe(1)
  })

  it('ALU: add selected by Op 0, OR clamped to last slot by Op 3', () => {
    const circ = active(getExample('alu')!)
    // Op 0 -> mux picks data0 = adder: 0xFF + 0xFF = 0xFE
    const rAdd = evaluateCircuit(circ, { a: 1, b: 1, op: 0 })
    expect(packed(rAdd, 'result')).toBe(0xfe)
    // Op (2-bit) forced high = 0b11 = 3 -> mux selects last slot = OR: 0xFF | 0xFF = 0xFF
    const rOr = evaluateCircuit(circ, { a: 1, b: 1, op: 1 })
    expect(packed(rOr, 'result')).toBe(0xff)
  })
})