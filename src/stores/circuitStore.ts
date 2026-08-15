/**
 * Application-layer state for the circuit designer (Layer 3). Holds the open
 * circuit *tabs* (multi-circuit, Logisim-style), the subcircuit library, the
 * current tool, selection, view transform, the live simulation result, and the
 * undo/redo history. Presentation reads these; reuse and coordinates are
 * computed by the core (Layer 1) + store selectors. Persistence and history
 * bookkeeping are orchestrated by the application layer (`application/circuit`).
 */

import { create } from 'zustand'
import type { Bit } from '../core/circuit'
import type { Circuit, ComponentId, PortId, Wire } from '../core/circuit'
import type { EvaluationResult, SimState } from '../core/circuit'
import { tick, propagate, emptyState } from '../core/circuit'
import { normalizeAttrs } from '../core/circuit/descriptors'
import type { AttrValue } from '../core/circuit/descriptors'
import { recordHistory, snapshotOf, HISTORY_LIMIT } from '../application/circuit/history'
import type { ProjectSnapshot } from '../application/circuit/history'
import type { ProjectFile } from '../application/circuit/persistence'

export type Tool =
  | 'select'
  | 'wire'
  | 'poke'
  | 'label'
  | 'add-gate'
  | 'add-input'
  | 'add-output'
  | 'add-constant'
  | 'add-probe'
  | 'add-tunnel'
  | 'add-clock'
  | 'add-led'
  | 'add-button'
  | 'add-segment'
  | 'add-adder'
  | 'add-subtractor'
  | 'add-comparator'
  | 'add-negator'
  | { readonly type: 'add-subcircuit'; readonly libraryId: string }

/** One open circuit in the project (the root plus any subcircuits). */
export interface CircuitTab {
  readonly id: string
  readonly name: string
  readonly circuit: Circuit
}

let uid = 1
function nextId(): string {
  return `c${uid++}`
}

/** Raise the id allocator so freshly minted ids never collide with loaded ones. */
export function idCounterAtLeast(n: number): number {
  if (uid <= n) uid = n + 1
  return uid
}

export interface CircuitState {
  /** All open circuits (root `main` plus editable subcircuit tabs). */
  tabs: readonly CircuitTab[]
  activeTabId: string
  tool: Tool
  selected: ComponentId | null
  selectedWire: string | null
  /** The output port chosen as the start of a wire-in-progress. */
  pendingFrom: PortId | null
  /** Forced input-pin levels, keyed by component id. */
  inputs: Record<string, Bit>
  /** Simulation result of the last evaluation. */
  sim: EvaluationResult | null
  /** Persistent simulation state (DFF registers + clock levels). Transient. */
  simState: SimState
  /** Pan [x, y] and zoom. */
  panX: number
  panY: number
  zoom: number
  /** Undo stack (past states, oldest first). */
  past: ProjectSnapshot[]
  /** Redo stack (future states, newest first). */
  future: ProjectSnapshot[]

  addComponent: (
    type: string,
    attrs?: Readonly<Record<string, AttrValue>>,
    x?: number,
    y?: number,
  ) => void
  moveComponent: (id: ComponentId, x: number, y: number) => void
  removeComponent: (id: ComponentId) => void
  removeWire: (id: string) => void
  /** Start a wire from the given (output) port. */
  beginWire: (port: PortId) => void
  /** Finish a wire at the given (input) port. */
  endWire: (port: PortId) => void
  toggleInput: (id: ComponentId) => void
  /** Rename a named component (input/output/text). Gate names are ignored. */
  renameComponent: (id: ComponentId, label: string) => void
  /** Set a single attribute of a component (drives the attribute table). */
  setAttr: (id: ComponentId, key: string, value: AttrValue) => void
  /** Rotate the selected component one quarter-turn clockwise. */
  rotateComponent: (id: ComponentId) => void
  addText: (x: number, y: number, content: string) => void
  select: (id: ComponentId | null) => void
  setTool: (tool: Tool) => void
  setSim: (sim: EvaluationResult) => void
  /** Advance clocks/registers one tick and recompute the visible picture. */
  tickSim: () => void
  setView: (patches: Partial<Pick<CircuitState, 'panX' | 'panY' | 'zoom'>>) => void
  /** Create a blank, editable new circuit tab and switch to it. */
  createCircuit: (name: string) => void
  /** Copy the active circuit into a named reusable subcircuit tab. */
  saveSubcircuit: (name: string) => void
  /** Switch the active tab. */
  switchTab: (id: string) => void
  /** Remove an editable (non-root) tab. */
  removeTab: (id: string) => void
  clearCanvas: () => void
  /** Undo the last undoable edit. */
  undo: () => void
  /** Redo the last undone edit. */
  redo: () => void
  /** Replace the whole project with a loaded one, reseeding ids and clearing history. */
  loadProject: (project: ProjectFile, opts?: { reseedId?: number }) => void
}

/** The active tab (falling back to the first, if somehow missing). */
function activeTab(state: Pick<CircuitState, 'tabs' | 'activeTabId'>): CircuitTab | undefined {
  return state.tabs.find((t) => t.id === state.activeTabId) ?? state.tabs[0]
}

/** Map over tabs replacing the active one's circuit. */
function mapActiveCircuit(
  state: Pick<CircuitState, 'tabs' | 'activeTabId'>,
  fn: (circuit: Circuit) => Circuit,
): readonly CircuitTab[] {
  const id = activeTab(state)?.id
  return state.tabs.map((t) => (t.id === id ? { ...t, circuit: fn(t.circuit) } : t))
}

/**
 * Wrap an undoable edit: prefix the current state onto the history stack
 * (clearing `future`) before applying the update. The updater must return a
 * partial that never touches `past`/`future`.
 */
function withHistory(update: (s: CircuitState) => Partial<CircuitState>) {
  return (s: CircuitState): Partial<CircuitState> => ({ ...recordHistory(s), ...update(s) })
}

const emptyCircuit: Circuit = { components: [], wires: [] }

export const useCircuitStore = create<CircuitState>((set, get) => ({
  tabs: [{ id: 'main', name: 'main', circuit: emptyCircuit }],
  activeTabId: 'main',
  tool: 'select',
  selected: null,
  selectedWire: null,
  pendingFrom: null,
  inputs: {},
  sim: null,
  simState: emptyState(),
  panX: 40,
  panY: 40,
  zoom: 1,
  past: [],
  future: [],

  addComponent: (type, attrs = {}, x = 0, y = 0) => {
    const id = nextId()
    set(
      withHistory((s) => ({
        tabs: mapActiveCircuit(s, (c) => ({
          ...c,
          components: [...c.components, { id, type, attrs: normalizeAttrs(type, attrs), x, y, rotation: 0 }],
        })),
        inputs: type === 'input' ? { ...s.inputs, [id]: 0 } : s.inputs,
        selected: id,
        tool: 'select',
      })),
    )
  },

  moveComponent: (id, x, y) => {
    set(
      withHistory((s) => ({
        tabs: mapActiveCircuit(s, (c) => ({
          ...c,
          components: c.components.map((comp) => (comp.id === id ? { ...comp, x, y } : comp)),
        })),
      })),
    )
  },

  removeComponent: (id) => {
    set(
      withHistory((s) => {
        const tabs = mapActiveCircuit(s, (c) => {
          const components = c.components.filter((comp) => comp.id !== id)
          const wires = c.wires.filter(
            (w) => !w.from.startsWith(`${id}:`) && !w.to.startsWith(`${id}:`),
          )
          return { components, wires }
        })
        const inputs = { ...s.inputs }
        delete inputs[id]
        return {
          tabs,
          inputs,
          selected: s.selected === id ? null : s.selected,
          pendingFrom: s.pendingFrom?.startsWith(`${id}:`) ? null : s.pendingFrom,
        }
      }),
    )
  },

  removeWire: (id) => {
    set(
      withHistory((s) => ({
        tabs: mapActiveCircuit(s, (c) => ({ ...c, wires: c.wires.filter((w) => w.id !== id) })),
        selectedWire: s.selectedWire === id ? null : s.selectedWire,
        pendingFrom: null,
      })),
    )
  },

  beginWire: (port) => {
    set(() => ({ pendingFrom: port, tool: 'wire' }))
  },

  endWire: (port) => {
    const { pendingFrom, tool } = get()
    const circuit = activeTab(get())?.circuit
    if (!pendingFrom || tool !== 'wire' || !circuit) return
    if (pendingFrom === port) {
      set({ pendingFrom: null })
      return
    }
    const already = circuit.wires.some((w) => w.to === port)
    if (!already) {
      const wire: Wire = { id: nextId(), from: pendingFrom, to: port }
      set(
        withHistory((s) => ({
          tabs: mapActiveCircuit(s, (c) => ({ ...c, wires: [...c.wires, wire] })),
          pendingFrom: null,
        })),
      )
    } else {
      set({ pendingFrom: null })
    }
  },

  toggleInput: (id) => {
    set(
      withHistory((s) => {
        const circuit = activeTab(s)?.circuit
        const comp = circuit?.components.find((c) => c.id === id)
        if (!comp || comp.type !== 'input') return s
        const current = s.inputs[id] ?? 0
        return { inputs: { ...s.inputs, [id]: current === 1 ? 0 : 1 } }
      }),
    )
  },

  renameComponent: (id, label) => {
    set(
      withHistory((s) => ({
        tabs: mapActiveCircuit(s, (c) => ({
          ...c,
          components: c.components.map((comp) => {
            if (comp.id !== id) return comp
            if (comp.type === 'input' || comp.type === 'output') {
              return { ...comp, attrs: { ...comp.attrs, label } }
            }
            if (comp.type === 'text') return { ...comp, attrs: { ...comp.attrs, text: label } }
            return comp
          }),
        })),
      })),
    )
  },

  setAttr: (id, key, value) => {
    set(
      withHistory((s) => ({
        tabs: mapActiveCircuit(s, (c) => ({
          ...c,
          components: c.components.map((comp) =>
            comp.id === id ? { ...comp, attrs: { ...comp.attrs, [key]: value } } : comp,
          ),
        })),
      })),
    )
  },

  rotateComponent: (id) => {
    set(
      withHistory((s) => ({
        tabs: mapActiveCircuit(s, (c) => ({
          ...c,
          components: c.components.map((comp) =>
            comp.id === id
              ? { ...comp, rotation: (((comp.rotation as number) + 1) % 4) as 0 | 1 | 2 | 3 }
              : comp,
          ),
        })),
      })),
    )
  },

  addText: (x, y, content) => {
    const id = nextId()
    const attrs = normalizeAttrs('text', { text: content })
    set(
      withHistory((s) => ({
        tabs: mapActiveCircuit(s, (c) => ({
          ...c,
          components: [...c.components, { id, type: 'text', attrs, x, y, rotation: 0 }],
        })),
      })),
    )
  },

  select: (id) => set({ selected: id, selectedWire: null }),
  setTool: (tool) => set({ tool }),

  setSim: (sim) => set({ sim }),

  tickSim: () => {
    const s = get()
    const circuit = activeTab(s)?.circuit
    if (!circuit) return
    const lib = libraryAdapter(s.tabs)
    const { nextState } = tick(circuit, s.inputs, s.simState ?? emptyState(), lib)
    const sim = propagate(circuit, s.inputs, nextState, lib)
    set({ simState: nextState, sim })
  },

  setView: (patches) =>
    set((s) => ({
      panX: patches.panX ?? s.panX,
      panY: patches.panY ?? s.panY,
      zoom: patches.zoom ?? s.zoom,
    })),

  createCircuit: (name) => {
    const id = nextId()
    set(
      withHistory((s) => ({
        tabs: [...s.tabs, { id, name, circuit: { components: [], wires: [] } }],
        activeTabId: id,
        selected: null,
        selectedWire: null,
        pendingFrom: null,
        tool: 'select',
      })),
    )
  },

  saveSubcircuit: (name) => {
    const s = get()
    const circuit = activeTab(s)?.circuit
    if (!circuit) return
    const id = nextId()
    const copy: Circuit = { components: [...circuit.components], wires: [...circuit.wires] }
    set(
      withHistory((prev) => ({
        tabs: [...prev.tabs, { id, name, circuit: copy }],
      })),
    )
  },

  switchTab: (id) => {
    set({
      activeTabId: id,
      selected: null,
      selectedWire: null,
      pendingFrom: null,
      tool: 'select',
      inputs: {},
    })
  },

  removeTab: (id) => {
    if (id === 'main') return
    set(
      withHistory((s) => {
        const remaining = s.tabs.filter((t) => t.id !== id)
        if (remaining.length === 0) return s
        let activeTabId = s.activeTabId
        if (!remaining.some((t) => t.id === activeTabId)) activeTabId = remaining[0]!.id
        return {
          tabs: remaining,
          activeTabId,
          selected: null,
          pendingFrom: null,
          inputs: {},
        }
      }),
    )
  },

  clearCanvas: () =>
    set(
      withHistory((s) => {
        const tabs = mapActiveCircuit(s, () => ({ components: [], wires: [] }))
        return { tabs, selected: null, pendingFrom: null, inputs: {} }
      }),
    ),

  undo: () =>
    set((s) => {
      const past = s.past ?? []
      if (past.length === 0) return s
      const prev = past[past.length - 1]!
      const current = snapshotOf(s)
      const future = s.future ?? []
      const nextFuture = [current, ...future]
      if (nextFuture.length > HISTORY_LIMIT) nextFuture.length = HISTORY_LIMIT
      return {
        tabs: prev.tabs,
        activeTabId: prev.activeTabId,
        inputs: prev.inputs,
        past: past.slice(0, -1),
        future: nextFuture,
        selected: null,
        selectedWire: null,
        pendingFrom: null,
      }
    }),

  redo: () =>
    set((s) => {
      const future = s.future ?? []
      if (future.length === 0) return s
      const next = future[0]!
      const current = snapshotOf(s)
      const past = s.past ?? []
      const nextPast = [...past, current]
      if (nextPast.length > HISTORY_LIMIT) nextPast.splice(0, nextPast.length - HISTORY_LIMIT)
      return {
        tabs: next.tabs,
        activeTabId: next.activeTabId,
        inputs: next.inputs,
        past: nextPast,
        future: future.slice(1),
        selected: null,
        selectedWire: null,
        pendingFrom: null,
      }
    }),

  loadProject: (project, opts) =>
    set((s) => {
      if (opts?.reseedId) idCounterAtLeast(opts.reseedId)
      void s
      return {
        tabs: project.tabs.map((t) => ({
          id: t.id,
          name: t.name,
          circuit: { components: [...t.circuit.components], wires: [...t.circuit.wires] },
        })),
        activeTabId: project.activeTabId,
        inputs: {},
        sim: null,
        simState: emptyState(),
        past: [],
        future: [],
        selected: null,
        selectedWire: null,
        pendingFrom: null,
        tool: 'select',
      }
    }),
}))

/** Build a CircuitLibrary adapter that resolves subcircuit instances from the tabs. */
export function libraryAdapter(
  tabs: readonly CircuitTab[],
): import('../core/circuit').CircuitLibrary {
  const find = (id: string) => tabs.find((t) => t.id === id)?.circuit
  return {
    arity: (id) => {
      const circ = find(id)
      if (!circ) return [2, 1]
      const inputs = circ.components.filter((c) => c.type === 'input').length
      const outputs = circ.components.filter((c) => c.type === 'output').length
      return [inputs, outputs]
    },
    get: (id) => find(id) ?? { components: [], wires: [] },
  }
}