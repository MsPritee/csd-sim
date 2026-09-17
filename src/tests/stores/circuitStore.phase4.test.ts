import { describe, it, expect, beforeEach } from 'vitest'
import { useCircuitStore } from '../../stores/circuitStore'

function active() {
  const s = useCircuitStore.getState()
  return s.tabs.find((t) => t.id === s.activeTabId)?.circuit ?? s.tabs[0]!.circuit
}

beforeEach(() => {
  useCircuitStore.setState({
    tabs: [{ id: 'main', name: 'main', circuit: { components: [], wires: [] } }],
    activeTabId: 'main',
    inputs: {},
    sim: null,
    selected: null,
    selectedWire: null,
    selection: [],
    selectedWires: [],
  })
})

describe('Phase 4 — store wiring', () => {
  it('adds library components with sensible defaults', () => {
    const { addComponent } = useCircuitStore.getState()
    addComponent('constant', { width: 8 }, 0, 0)
    addComponent('adder', { width: 8 }, 0, 0)
    const comps = active().components
    expect(comps).toHaveLength(2)
    expect(comps[0]!.type).toBe('constant')
    expect(comps[0]!.attrs.width).toBe(8)
    expect(comps[1]!.type).toBe('adder')
  })

  it('toggleInput ignores non-input components', () => {
    const { addComponent, toggleInput } = useCircuitStore.getState()
    addComponent('constant', { width: 8 }, 0, 0)
    const id = active().components[0]!.id
    toggleInput(id)
    expect(useCircuitStore.getState().inputs[id]).toBeUndefined()
  })

  it('tickSim advances an empty simulation without crashing', () => {
    const { addComponent, tickSim, setSim } = useCircuitStore.getState()
    addComponent('clock', {}, 0, 0)
    tickSim()
    expect(useCircuitStore.getState().sim).toBeTruthy()
    setSim(useCircuitStore.getState().sim!)
  })

  it('tickSim toggles a free-running clock level', () => {
    const { addComponent, tickSim } = useCircuitStore.getState()
    addComponent('clock', {}, 0, 0)
    const id = active().components[0]!.id
    tickSim()
    const afterOne = useCircuitStore.getState().simState.clock.get(id)
    tickSim()
    const afterTwo = useCircuitStore.getState().simState.clock.get(id)
    expect(afterOne).toBe(1)
    expect(afterTwo).toBe(0)
  })
})

describe('multi-selection actions', () => {
  it('setSelection replaces the whole selection and mirrors primaries', () => {
    const { addComponent, setSelection } = useCircuitStore.getState()
    addComponent('AND', {}, 0, 0)
    addComponent('OR', {}, 200, 200)
    const comps = active().components
    setSelection([comps[0]!.id, comps[1]!.id])
    const s = useCircuitStore.getState()
    expect(s.selection).toEqual([comps[0]!.id, comps[1]!.id])
    expect(s.selected).toBe(comps[0]!.id)
    setSelection([], ['w1'])
    const s2 = useCircuitStore.getState()
    expect(s2.selection).toEqual([])
    expect(s2.selected).toBeNull()
    expect(s2.selectedWires).toEqual(['w1'])
    expect(s2.selectedWire).toBe('w1')
  })

  it('moveComponents translates every listed component by the new coordinates', () => {
    const { addComponent, moveComponents } = useCircuitStore.getState()
    addComponent('AND', {}, 0, 0)
    addComponent('OR', {}, 200, 200)
    const comps = active().components
    moveComponents([
      { id: comps[0]!.id, x: 40, y: 60 },
      { id: comps[1]!.id, x: 300, y: 260 },
    ])
    const after = active().components
    expect(after.find((c) => c.id === comps[0]!.id)!.x).toBe(40)
    expect(after.find((c) => c.id === comps[0]!.id)!.y).toBe(60)
    expect(after.find((c) => c.id === comps[1]!.id)!.x).toBe(300)
    expect(after.find((c) => c.id === comps[1]!.id)!.y).toBe(260)
  })

  it('rotateComponents rotates every listed component once clockwise', () => {
    const { addComponent, rotateComponents } = useCircuitStore.getState()
    addComponent('AND', {}, 0, 0)
    addComponent('OR', {}, 200, 200)
    const comps = active().components
    rotateComponents([comps[0]!.id, comps[1]!.id])
    const s = active().components
    expect(s.find((c) => c.id === comps[0]!.id)!.rotation).toBe(1)
    expect(s.find((c) => c.id === comps[1]!.id)!.rotation).toBe(1)
  })

  it('removeComponents removes the listed components, their wires, and cleans the selection', () => {
    const { addComponent, beginWire, endWire, setSelection, removeComponents } = useCircuitStore.getState()
    addComponent('input', { label: 'A' }, 0, 0)
    addComponent('AND', {}, 200, 0)
    const comps = active().components
    beginWire(`${comps[0]!.id}:out:0`)
    endWire(`${comps[1]!.id}:in:0`)
    expect(active().wires).toHaveLength(1)
    setSelection([comps[0]!.id, comps[1]!.id])
    const wireId = active().wires[0]!.id
    setSelection([comps[0]!.id, comps[1]!.id], [wireId])
    removeComponents([comps[0]!.id, comps[1]!.id])
    const s = useCircuitStore.getState()
    expect(active().components).toHaveLength(0)
    expect(active().wires).toHaveLength(0)
    expect(s.selection).toEqual([])
    expect(s.selectedWires).toEqual([])
  })

  it('removeWires removes several wires and drops them from the selection', () => {
    const { addComponent, beginWire, endWire, setSelection, removeWires } = useCircuitStore.getState()
    addComponent('input', { label: 'A' }, 0, 0)
    addComponent('input', { label: 'B' }, 0, 200)
    addComponent('AND', {}, 200, 0)
    const comps = active().components
    beginWire(`${comps[0]!.id}:out:0`)
    endWire(`${comps[2]!.id}:in:0`)
    beginWire(`${comps[1]!.id}:out:0`)
    endWire(`${comps[2]!.id}:in:1`)
    const wires = active().wires
    expect(wires).toHaveLength(2)
    setSelection([comps[0]!.id], [wires[0]!.id, wires[1]!.id])
    removeWires([wires[0]!.id, wires[1]!.id])
    const s = useCircuitStore.getState()
    expect(active().wires).toHaveLength(0)
    expect(s.selectedWires).toEqual([])
    expect(s.selectedWire).toBeNull()
  })

  it('select collapses the multi-selection back to a single component', () => {
    const { addComponent, setSelection, select } = useCircuitStore.getState()
    addComponent('AND', {}, 0, 0)
    addComponent('OR', {}, 200, 200)
    const comps = active().components
    setSelection([comps[0]!.id, comps[1]!.id])
    select(comps[1]!.id)
    const s = useCircuitStore.getState()
    expect(s.selection).toEqual([comps[1]!.id])
    expect(s.selected).toBe(comps[1]!.id)
    expect(s.selectedWires).toEqual([])
  })
})