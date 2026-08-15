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