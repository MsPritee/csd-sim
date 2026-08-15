import { describe, it, expect } from 'vitest'
import {
  projectToJSON,
  parseProjectJSON,
  STORAGE_KEY,
  registerAutosave,
  restoreAutosave,
  clearAutosave,
} from '../../../application/circuit/persistence'
import { useCircuitStore } from '../../../stores/circuitStore'
import type { CircuitState } from '../../../stores/circuitStore'

function active(s: ReturnType<typeof useCircuitStore.getState>): CircuitState['tabs'][number]['circuit'] {
  return s.tabs.find((t) => t.id === s.activeTabId)?.circuit ?? s.tabs[0]!.circuit
}

function resetStore(): void {
  useCircuitStore.setState({
    tabs: [{ id: 'main', name: 'main', circuit: { components: [], wires: [] } }],
    activeTabId: 'main',
    tool: 'select',
    selected: null,
    selectedWire: null,
    pendingFrom: null,
    inputs: {},
    sim: null,
    panX: 40,
    panY: 40,
    zoom: 1,
    past: [],
    future: [],
  })
}

describe('projectToJSON / parseProjectJSON', () => {
  it('round-trips a project with components and wires', () => {
    resetStore()
    const { addComponent, beginWire, endWire } = useCircuitStore.getState()
    addComponent('input', { label: 'A' }, 0, 0)
    addComponent('AND', { inputs: 2 }, 200, 50)
    const s = useCircuitStore.getState()
    const a = active(s).components.find((c) => c.type === 'input')!
    const g = active(s).components.find((c) => c.type === 'AND')!
    beginWire(`${a.id}:out:0`)
    endWire(`${g.id}:in:0`)

    const json = projectToJSON(useCircuitStore.getState())
    const parsed = parseProjectJSON(json)
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return

    expect(parsed.project.app).toBe('csd-sim')
    expect(parsed.project.tabs).toHaveLength(1)
    const tab = parsed.project.tabs[0]!
    expect(tab.circuit.components).toHaveLength(2)
    expect(tab.circuit.wires).toHaveLength(1)
    expect(tab.circuit.wires[0]!.from).toBe(`${a.id}:out:0`)
    const and = tab.circuit.components.find((c) => c.type === 'AND')!
    expect(and.attrs.inputs).toBe(2)
    expect(and.x).toBe(200)
  })

  it('rejects non-JSON text', () => {
    const r = parseProjectJSON('{not json')
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.reason).toMatch(/not valid JSON/)
  })

  it('rejects files from another app', () => {
    const r = parseProjectJSON(JSON.stringify({ app: 'other', tabs: [] }))
    expect(r.ok).toBe(false)
  })

  it('rejects a project with no tabs', () => {
    const r = parseProjectJSON(JSON.stringify({ app: 'csd-sim', version: 1, tabs: [] }))
    expect(r.ok).toBe(false)
  })

  it('rejects unknown component types', () => {
    const raw = {
      app: 'csd-sim',
      version: 1,
      activeTabId: 'main',
      tabs: [{ id: 'main', name: 'main', circuit: { components: [{ id: 'c1', type: 'flux-capacitor', attrs: {}, x: 0, y: 0, rotation: 0 }], wires: [] } }],
    }
    const r = parseProjectJSON(JSON.stringify(raw))
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.reason).toMatch(/flux-capacitor/)
  })

  it('rejects malformed wires', () => {
    const raw = {
      app: 'csd-sim',
      version: 1,
      activeTabId: 'main',
      tabs: [{ id: 'main', name: 'main', circuit: { components: [], wires: [{ id: 'w1' }] } }],
    }
    expect(parseProjectJSON(JSON.stringify(raw)).ok).toBe(false)
  })

  it('rejects duplicate tab ids', () => {
    const raw = {
      app: 'csd-sim',
      version: 1,
      tabs: [
        { id: 'main', name: 'a', circuit: { components: [], wires: [] } },
        { id: 'main', name: 'b', circuit: { components: [], wires: [] } },
      ],
    }
    expect(parseProjectJSON(JSON.stringify(raw)).ok).toBe(false)
  })

  it('normalizes attrs to schema defaults and clamps rotation on import', () => {
    const raw = {
      app: 'csd-sim',
      version: 1,
      activeTabId: 'main',
      tabs: [
        {
          id: 'main',
          name: 'main',
          circuit: {
            components: [{ id: 'c1', type: 'input', attrs: { label: 'X' }, x: 10, y: 20, rotation: 7 }],
            wires: [],
          },
        },
      ],
    }
    const r = parseProjectJSON(JSON.stringify(raw))
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const comp = r.project.tabs[0]!.circuit.components[0]!
    // label preserved, width default filled in
    expect(comp.attrs.label).toBe('X')
    expect(comp.attrs.width).toBe(1)
    // rotation 7 % 4 = 3
    expect(comp.rotation).toBe(3)
    // coordinates default to 0 when absent
    expect(comp.x).toBe(10)
  })

  it('falls back to the first tab when activeTabId is missing', () => {
    const raw = {
      app: 'csd-sim',
      version: 1,
      tabs: [{ id: 'main', name: 'main', circuit: { components: [], wires: [] } }],
    }
    const r = parseProjectJSON(JSON.stringify(raw))
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.project.activeTabId).toBe('main')
  })
})

describe('localStorage autosave', () => {
  beforeEach(() => {
    resetStore()
    clearAutosave()
  })

  it('persists editable-project changes and restores them', async () => {
    const unsub = registerAutosave(0)
    const { addComponent } = useCircuitStore.getState()
    addComponent('input', { label: 'A' }, 0, 0)
    await new Promise((r) => setTimeout(r, 20))
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull()
    unsub()

    resetStore()
    expect(active(useCircuitStore.getState()).components).toHaveLength(0)
    expect(restoreAutosave()).toBe(true)
    expect(active(useCircuitStore.getState()).components).toHaveLength(1)
    expect(active(useCircuitStore.getState()).components[0]!.type).toBe('input')
  })

  it('ignores stale/invalid autosave data', () => {
    localStorage.setItem(STORAGE_KEY, '{nope')
    resetStore()
    expect(restoreAutosave()).toBe(false)
    expect(active(useCircuitStore.getState()).components).toHaveLength(0)
  })

  it('registerAutosave returns an unsubscribe that stops future writes', () => {
    const unsub = registerAutosave(0)
    unsub()
    const { addComponent } = useCircuitStore.getState()
    addComponent('AND', {}, 0, 0)
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })
})