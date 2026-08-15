import { describe, expect, it } from 'vitest'
import { addComponent } from '../../../core/circuit'
import { toLogisimXml, logisimToolName } from '../../../application/circuit'
import type { CircuitTab } from '../../../stores/circuitStore'

/** A trivial port resolver that maps `comp:out:0` to (10,10) and `:in:` to (20,20). */
const resolve = (port: string): { x: number; y: number } | null =>
  port.includes(':out:') ? { x: 10, y: 10 } : { x: 20, y: 20 }

describe('Logisim .circ export (Phase 8 stretch)', () => {
  it('maps component types to Logisim library tool names', () => {
    expect(logisimToolName('AND')).toBe('AND')
    expect(logisimToolName('CON_BUF')).toBe('Controlled Buffer')
    expect(logisimToolName('input')).toBe('Pin')
    expect(logisimToolName('adder')).toBe('Adder')
    expect(logisimToolName('mux')).toBe('Multiplexer')
    expect(logisimToolName('jk')).toBe('J-K Flip-Flop')
    expect(logisimToolName('ram')).toBe('RAM')
    expect(logisimToolName('text')).toBeNull()
  })

  it('emits a Logisim-shaped document with libs, comps and wires', () => {
    const c1 = addComponent('in1', 'input', { label: 'A' })
    const g = addComponent('g1', 'AND', { inputs: 2 })
    const c2 = addComponent('out1', 'output', { label: 'Y' })
    const const8 = addComponent('k1', 'constant', { width: 8, value: 5 })
    const clk = addComponent('ck', 'clock')
    const main: CircuitTab = {
      id: 'main',
      name: 'main',
      circuit: {
        components: [c1, g, c2, const8, clk],
        wires: [
          { id: 'w0', from: 'in1:out:0', to: 'g1:in:0' },
          { id: 'w1', from: 'g1:out:0', to: 'out1:in:0' },
        ],
      },
    }
    const xml = toLogisimXml({ tabs: [main], activeTabId: 'main' }, resolve)

    expect(xml.startsWith('<?xml version="1.0"')).toBe(true)
    expect(xml).toContain('<project source="3" version="1.0">')
    expect(xml).toContain('<lib desc="#Gates"')
    expect(xml).toContain('<comp loc="(10,10)" name="AND"')
    expect(xml).toContain('<comp loc="(10,10)" name="Pin"')
    expect(xml).toContain('<comp loc="(10,10)" name="Constant"')
    expect(xml).toContain('<comp loc="(10,10)" name="Clock"')
    expect(xml).toContain('<wire from="(10,10)" to="(20,20)"/>')
    // width + value + lossless annotations present
    expect(xml).toContain('<a name="value" val="5"/>')
    expect(xml).toContain('_type')
  })

  it('skips components without a Logisim analog', () => {
    const txt = addComponent('t1', 'text', { text: 'hi' })
    const main: CircuitTab = { id: 'main', name: 'main', circuit: { components: [txt], wires: [] } }
    const xml = toLogisimXml({ tabs: [main], activeTabId: 'main' }, resolve)
    expect(xml).not.toContain('text')
    expect(xml).not.toContain('_type" val="text"')
  })
})