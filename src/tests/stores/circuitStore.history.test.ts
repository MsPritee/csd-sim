import { describe, it, expect, beforeEach } from 'vitest'
import { useCircuitStore } from '../../stores/circuitStore'
import type { CircuitState } from '../../stores/circuitStore'
import { parseProjectJSON } from '../../application/circuit/persistence'

function active(s: ReturnType<typeof useCircuitStore.getState>): CircuitState['tabs'][number]['circuit'] {
  return s.tabs.find((t) => t.id === s.activeTabId)?.circuit ?? s.tabs[0]!.circuit
}

beforeEach(() => {
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
})

describe('undo/redo', () => {
  it('undoes and redoes an added component', () => {
    const { addComponent } = useCircuitStore.getState()
    addComponent('input', { label: 'A' }, 0, 0)
    expect(active(useCircuitStore.getState()).components.length).toBe(1)

    useCircuitStore.getState().undo()
    expect(active(useCircuitStore.getState()).components.length).toBe(0)
    expect(useCircuitStore.getState().past.length).toBe(0)

    useCircuitStore.getState().redo()
    expect(active(useCircuitStore.getState()).components.length).toBe(1)
    expect(active(useCircuitStore.getState()).components[0]!.attrs.label).toBe('A')
  })

  it('replays multiple edits in order', () => {
    const { addComponent } = useCircuitStore.getState()
    addComponent('input', { label: 'A' }, 0, 0)
    addComponent('AND', {}, 100, 50)
    addComponent('output', { label: 'Y' }, 300, 50)

    // undo all three
    for (let i = 0; i < 3; i++) {
      useCircuitStore.getState().undo()
    }
    expect(active(useCircuitStore.getState()).components.length).toBe(0)

    // redo restores them in order
    for (let i = 0; i < 3; i++) {
      useCircuitStore.getState().redo()
    }
    const types = active(useCircuitStore.getState()).components.map((c) => c.type)
    expect(types).toEqual(['input', 'AND', 'output'])
  })

  it('undo clears the redo branch when a new edit is made', () => {
    const { addComponent } = useCircuitStore.getState()
    addComponent('input', {}, 0, 0)
    useCircuitStore.getState().undo()
    expect(useCircuitStore.getState().future.length).toBe(1)

    // a new edit after undo should discard the redo branch
    const { addComponent: addAgain } = useCircuitStore.getState()
    addAgain('input', {}, 0, 50)
    expect(useCircuitStore.getState().future.length).toBe(0)
  })

  it('undo restores a toggled input value', () => {
    const { addComponent } = useCircuitStore.getState()
    addComponent('input', { label: 'A' }, 0, 0)
    const st = useCircuitStore.getState()
    const id = active(st).components[0]!.id

    st.toggleInput(id)
    expect(useCircuitStore.getState().inputs[id]).toBe(1)

    useCircuitStore.getState().undo()
    expect(useCircuitStore.getState().inputs[id]).toBe(0)

    useCircuitStore.getState().redo()
    expect(useCircuitStore.getState().inputs[id]).toBe(1)
  })

  it('undoes setAttr and rotate', () => {
    const { addComponent } = useCircuitStore.getState()
    addComponent('AND', {}, 0, 0)
    let id = active(useCircuitStore.getState()).components[0]!.id

    useCircuitStore.getState().setAttr(id, 'inputs', '4')
    expect(active(useCircuitStore.getState()).components[0]!.attrs.inputs).toBe('4')
    useCircuitStore.getState().rotateComponent(id)
    expect(active(useCircuitStore.getState()).components[0]!.rotation).toBe(1)

    useCircuitStore.getState().undo()
    useCircuitStore.getState().undo()
    const c = active(useCircuitStore.getState()).components[0]!
    id = c.id
    expect(c.attrs.inputs).toBe(2)
    expect(c.rotation).toBe(0)
  })

  it('ephemeral actions (select/setView) do not grow the history', () => {
    const { addComponent } = useCircuitStore.getState()
    addComponent('input', {}, 0, 0)
    const before = useCircuitStore.getState().past.length

    const id = active(useCircuitStore.getState()).components[0]!.id
    useCircuitStore.getState().select(id)
    useCircuitStore.getState().setView({ panX: 100, zoom: 1.5 })
    useCircuitStore.getState().setTool('wire')
    expect(useCircuitStore.getState().past.length).toBe(before)
  })

  it('undo does nothing when the history is empty', () => {
    useCircuitStore.getState().undo()
    expect(active(useCircuitStore.getState()).components.length).toBe(0)
    useCircuitStore.getState().redo()
    expect(active(useCircuitStore.getState()).components.length).toBe(0)
  })
})

describe('loadProject', () => {
  it('replaces the project and clears history', () => {
    const { addComponent } = useCircuitStore.getState()
    addComponent('input', {}, 0, 0)
    useCircuitStore.getState().undo()
    expect(useCircuitStore.getState().past.length).toBe(0) // one add -> one undo

    const raw = {
      app: 'csd-sim',
      version: 1,
      activeTabId: 'main',
      tabs: [
        {
          id: 'main',
          name: 'main',
          circuit: {
            components: [
              { id: 'c1', type: 'OR', attrs: { width: 1, inputs: 2 }, x: 40, y: 40, rotation: 0 },
            ],
            wires: [],
          },
        },
      ],
    }
    const parsed = parseProjectJSON(JSON.stringify(raw))
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return

    // reseed well past any loaded/global id so the new component cannot collide
    useCircuitStore.getState().loadProject(parsed.project, { reseedId: 1000 })
    expect(active(useCircuitStore.getState()).components).toHaveLength(1)
    expect(active(useCircuitStore.getState()).components[0]!.type).toBe('OR')
    expect(useCircuitStore.getState().past.length).toBe(0)
    expect(useCircuitStore.getState().future.length).toBe(0)

    // reseeding the id counter prevents collisions with the restored c1 id
    useCircuitStore.getState().addComponent('input', {}, 0, 0)
    const ids = active(useCircuitStore.getState()).components.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids[ids.length - 1]).not.toBe('c1')
  })
})