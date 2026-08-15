import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { CircuitDesigner } from '../../../simulators/circuit'
import { ThemeProvider } from '../../../contexts/ThemeContext'
import { useCircuitStore } from '../../../stores/circuitStore'
import type { CircuitState } from '../../../stores/circuitStore'
import { bitValue, packedValue, portCountOf } from '../../../core/circuit'

/** Render the designer inside the ThemeProvider (it now exposes a theme toggle). */
function renderDesigner() {
  return render(
    <ThemeProvider>
      <CircuitDesigner />
    </ThemeProvider>,
  )
}

/** Active circuit of the current store state. */
function active(s: ReturnType<typeof useCircuitStore.getState>): CircuitState['tabs'][number]['circuit'] {
  return s.tabs.find((t) => t.id === s.activeTabId)?.circuit ?? s.tabs[0]!.circuit
}

// Reset the singleton store between tests.
beforeEach(() => {
  localStorage.clear()
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

describe('CircuitDesigner', () => {
  it('renders palette tools and an empty canvas', () => {
    renderDesigner()
    expect(screen.getByTestId('tool-select')).toBeInTheDocument()
    expect(screen.getByTestId('tool-wire')).toBeInTheDocument()
    expect(screen.getByTestId('tool-input')).toBeInTheDocument()
    expect(screen.getByTestId('tool-output')).toBeInTheDocument()
    expect(screen.getByTestId('canvas')).toBeInTheDocument()
  })

  it('places an input pin via the palette tool', () => {
    renderDesigner()
    fireEvent.click(screen.getByTestId('tool-input'))
    const canvas = screen.getByTestId('canvas')
    fireEvent.click(canvas)
    const state = useCircuitStore.getState()
    expect(active(state).components.length).toBe(1)
    expect(active(state).components[0]!.type).toBe('input')
  })

  it('places an output pin via the palette tool', () => {
    renderDesigner()
    fireEvent.click(screen.getByTestId('tool-output'))
    fireEvent.click(screen.getByTestId('canvas'))
    const state = useCircuitStore.getState()
    expect(active(state).components.length).toBe(1)
    expect(active(state).components[0]!.type).toBe('output')
  })

  it('places a splitter and a pull resistor via the palette', () => {
    renderDesigner()
    fireEvent.click(screen.getByTestId('palette-splitter'))
    fireEvent.click(screen.getByTestId('canvas'))
    fireEvent.click(screen.getByTestId('palette-pull'))
    fireEvent.click(screen.getByTestId('canvas'))
    const state = useCircuitStore.getState()
    const comps = active(state).components
    expect(comps.map((c) => c.type)).toEqual(['splitter', 'pull'])
    const splitter = comps.find((c) => c.type === 'splitter')!
    expect(splitter.attrs.fanOut).toBe(8)
    expect(splitter.attrs.width).toBe(8)
    expect(comps.find((c) => c.type === 'pull')!.attrs.pull).toBe(1)
    // the splitter glyph renders without error
    expect(screen.getAllByTestId('splitter-sum').length).toBeGreaterThan(0)
  })

  it('places a multiplexer via the palette (Plexers library)', () => {
    renderDesigner()
    fireEvent.click(screen.getByTestId('palette-mux'))
    fireEvent.click(screen.getByTestId('canvas'))
    const state = useCircuitStore.getState()
    const comps = active(state).components
    expect(comps.map((c) => c.type)).toEqual(['mux'])
    const mux = comps[0]!
    expect(mux.attrs.dataCount).toBe(2)
    // 2:1 MUX: 2 data + 1 select in, 1 out
    expect(portCountOf('mux', mux.attrs)).toEqual({ inputs: 3, outputs: 1 })
    // the pexler glyph renders without error
    expect(screen.getAllByTestId('plexer-mux').length).toBeGreaterThan(0)
  })

  it('places a gate via the palette and wires it by component clicks', () => {
    renderDesigner()
    // add AND gate
    fireEvent.click(screen.getByTestId('palette-and'))
    fireEvent.click(screen.getByTestId('canvas'))
    // add input A
    fireEvent.click(screen.getByTestId('tool-input'))
    fireEvent.click(screen.getByTestId('canvas'))
    // add input B
    fireEvent.click(screen.getByTestId('tool-input'))
    fireEvent.click(screen.getByTestId('canvas'))

    let state = useCircuitStore.getState()
    const gate = active(state).components.find((c) => c.type === 'AND')!
    const inA = active(state).components.filter((c) => c.type === 'input')[0]!

    // wire A -> gate in:0
    fireEvent.click(screen.getByTestId('tool-wire'))
    fireEvent.mouseDown(screen.getAllByTestId('component-input')[0]!)
    fireEvent.mouseDown(screen.getByTestId('component-and'))

    state = useCircuitStore.getState()
    expect(active(state).wires.length).toBe(1)
    expect(active(state).wires[0]!.from).toBe(`${inA.id}:out:0`)
    expect(active(state).wires[0]!.to).toBe(`${gate.id}:in:0`)
  })

  it('saves a subcircuit and reuses it', () => {
    renderDesigner()
    // Put two components on the canvas
    fireEvent.click(screen.getByTestId('tool-input'))
    fireEvent.click(screen.getByTestId('canvas'))
    fireEvent.click(screen.getByTestId('palette-and'))
    fireEvent.click(screen.getByTestId('canvas'))

    fireEvent.change(screen.getByTestId('subcircuit-name'), { target: { value: 'MyBlock' } })
    fireEvent.click(screen.getByTestId('save-subcircuit'))

    let state = useCircuitStore.getState()
    expect(state.tabs.length).toBe(2)
    expect(state.tabs.some((t) => t.name === 'MyBlock')).toBe(true)

    // reuse it: click the saved subcircuit then canvas
    fireEvent.click(screen.getByTestId('subcircuit-myblock'))
    fireEvent.click(screen.getByTestId('canvas'))
    state = useCircuitStore.getState()
    expect(active(state).components.some((c) => c.type === 'subcircuit')).toBe(true)
  })

  it('creates and switches between circuit tabs', () => {
    renderDesigner()
    fireEvent.click(screen.getByTestId('tool-input'))
    fireEvent.click(screen.getByTestId('canvas'))
    expect(active(useCircuitStore.getState()).components.length).toBe(1)

    // create a second circuit via the explorer
    fireEvent.click(screen.getByTestId('new-circuit'))
    let state = useCircuitStore.getState()
    expect(state.tabs.length).toBe(2)
    expect(active(state).components.length).toBe(0)

    // switch back to main
    fireEvent.click(screen.getByTestId('tab-main'))
    state = useCircuitStore.getState()
    expect(active(state).components.length).toBe(1)
    expect(state.activeTabId).toBe('main')

    // remove the extra tab
    const extra = useCircuitStore.getState().tabs.find((t) => t.id !== 'main')!
    fireEvent.click(screen.getByTestId(`tab-close-${extra.id}`))
    state = useCircuitStore.getState()
    expect(state.tabs.length).toBe(1)
  })

  it('clears the canvas', () => {
    renderDesigner()
    fireEvent.click(screen.getByTestId('tool-input'))
    fireEvent.click(screen.getByTestId('canvas'))
    expect(active(useCircuitStore.getState()).components.length).toBe(1)
    fireEvent.click(screen.getByTestId('clear-canvas'))
    expect(active(useCircuitStore.getState()).components.length).toBe(0)
  })

  it('simulates a wired AND from store level (input toggles flip output)', async () => {
    // Build A AND B -> OUT entirely through the store to exercise the live sim.
    const { addComponent, endWire, beginWire } = useCircuitStore.getState()
    addComponent('input', { label: 'A' }, 0, 0)
    addComponent('input', { label: 'B' }, 0, 100)
    addComponent('AND', { inputs: 2 }, 200, 50)
    addComponent('output', { label: 'Y' }, 400, 50)
    const s = useCircuitStore.getState()
    const a = active(s).components[0]!
    const b = active(s).components[1]!
    const g = active(s).components[2]!
    const o = active(s).components[3]!
    beginWire(`${a.id}:out:0`)
    endWire(`${g.id}:in:0`)
    beginWire(`${b.id}:out:0`)
    endWire(`${g.id}:in:1`)
    beginWire(`${g.id}:out:0`)
    endWire(`${o.id}:in:0`)

    // render now that wires exist
    renderDesigner()
    // default inputs 0 -> AND = 0
    await act(async () => {})
    expect(bitValue(useCircuitStore.getState().sim?.values.get(`${o.id}:in:0`))).toBe(0)
    // toggle A to 1, still 0
    await act(async () => {
      useCircuitStore.getState().toggleInput(a.id)
    })
    expect(bitValue(useCircuitStore.getState().sim?.values.get(`${o.id}:in:0`))).toBe(0)
    // toggle B to 1 -> AND = 1
    await act(async () => {
      useCircuitStore.getState().toggleInput(b.id)
    })
    expect(bitValue(useCircuitStore.getState().sim?.values.get(`${o.id}:in:0`))).toBe(1)
  })

  it('adds a text label via the Label tool and renames it inline', () => {
    renderDesigner()
    fireEvent.click(screen.getByTestId('tool-label'))
    fireEvent.click(screen.getByTestId('canvas'))

    let state = useCircuitStore.getState()
    expect(active(state).components.length).toBe(1)
    expect(active(state).components[0]!.type).toBe('text')

    const editor = screen.getByTestId('inline-editor')
    fireEvent.change(editor, { target: { value: 'ALU select' } })
    fireEvent.keyDown(editor, { key: 'Enter' })

    state = useCircuitStore.getState()
    expect(active(state).components[0]!.type).toBe('text')
    expect(active(state).components[0]!.attrs).toEqual({ text: 'ALU select' })
  })

  it('renames an input pin with the Label tool', () => {
    const { addComponent } = useCircuitStore.getState()
    addComponent('input', { label: 'A' }, 0, 0)
    renderDesigner()

    fireEvent.click(screen.getByTestId('tool-label'))
    fireEvent.mouseDown(screen.getAllByTestId('component-input')[0]!)

    const editor = screen.getByTestId('inline-editor')
    fireEvent.change(editor, { target: { value: 'CLOCK' } })
    fireEvent.keyDown(editor, { key: 'Enter' })

    const state = useCircuitStore.getState()
    const pin = active(state).components.find((c) => c.type === 'input')!
    expect(pin.attrs).toEqual({ label: 'CLOCK', width: 1 })
  })

  it('pokes an input pin to toggle its value', () => {
    const { addComponent } = useCircuitStore.getState()
    addComponent('input', { label: 'A' }, 0, 0)
    renderDesigner()

    const pin = active(useCircuitStore.getState()).components[0]!
    expect(useCircuitStore.getState().inputs[pin.id]).toBe(0)

    fireEvent.click(screen.getByTestId('tool-poke'))
    fireEvent.click(screen.getAllByTestId('component-input')[0]!)
    expect(useCircuitStore.getState().inputs[pin.id]).toBe(1)
  })

  it('rotates the selected component with Ctrl+R', async () => {
    const { addComponent } = useCircuitStore.getState()
    addComponent('AND', {}, 0, 0)
    renderDesigner()

    const gate = active(useCircuitStore.getState()).components[0]!
    await act(async () => {
      useCircuitStore.getState().select(gate.id)
    })

    await act(async () => {
      fireEvent.keyDown(window, { key: 'r', ctrlKey: true })
    })
    expect(active(useCircuitStore.getState()).components[0]!.rotation).toBe(1)
    await act(async () => {
      fireEvent.keyDown(window, { key: 'r', ctrlKey: true })
    })
    expect(active(useCircuitStore.getState()).components[0]!.rotation).toBe(2)
  })

  it('edits attributes through the attribute table (label + width)', () => {
    const { addComponent } = useCircuitStore.getState()
    addComponent('input', { label: 'A' }, 0, 0)
    renderDesigner()

    // addComponent auto-selects the new pin, so the attribute table shows it.
    expect(screen.getByTestId('attr-label')).toBeInTheDocument()
    expect(screen.getByTestId('attr-width')).toBeInTheDocument()

    fireEvent.change(screen.getByTestId('attr-label'), { target: { value: 'CLK' } })
    fireEvent.change(screen.getByTestId('attr-width'), { target: { value: '4' } })

    const state = useCircuitStore.getState()
    const pin = active(state).components.find((c) => c.type === 'input')!
    expect(pin.attrs.label).toBe('CLK')
    expect(pin.attrs.width).toBe(4)
  })

  it('changes gate input count via the attribute table', () => {
    const { addComponent } = useCircuitStore.getState()
    addComponent('AND', {}, 0, 0)
    renderDesigner()

    fireEvent.change(screen.getByTestId('attr-inputs'), { target: { value: '4' } })

    const state = useCircuitStore.getState()
    const gate = active(state).components.find((c) => c.type === 'AND')!
    expect(gate.attrs.inputs).toBe(4)
  })

  it('menu bar creates a circuit via File > New Circuit', () => {
    renderDesigner()
    fireEvent.click(screen.getByTestId('menu-file'))
    fireEvent.click(screen.getByTestId('menu-new-circuit'))
    const state = useCircuitStore.getState()
    expect(state.tabs.length).toBe(2)
    expect(state.activeTabId).not.toBe('main')
  })

  it('undoes and redoes through the Edit menu', () => {
    const { addComponent } = useCircuitStore.getState()
    addComponent('input', { label: 'A' }, 0, 0)
    renderDesigner()
    expect(active(useCircuitStore.getState()).components.length).toBe(1)

    fireEvent.click(screen.getByTestId('menu-edit'))
    fireEvent.click(screen.getByTestId('menu-undo'))
    expect(active(useCircuitStore.getState()).components.length).toBe(0)

    fireEvent.click(screen.getByTestId('menu-edit'))
    fireEvent.click(screen.getByTestId('menu-redo'))
    expect(active(useCircuitStore.getState()).components.length).toBe(1)
  })

  it('undoes with Ctrl+Z and redoes with Ctrl+Y', async () => {
    const { addComponent } = useCircuitStore.getState()
    addComponent('AND', {}, 0, 0)
    renderDesigner()
    expect(active(useCircuitStore.getState()).components.length).toBe(1)

    await act(async () => {
      fireEvent.keyDown(window, { key: 'z', ctrlKey: true })
    })
    expect(active(useCircuitStore.getState()).components.length).toBe(0)

    await act(async () => {
      fireEvent.keyDown(window, { key: 'y', ctrlKey: true })
    })
    expect(active(useCircuitStore.getState()).components.length).toBe(1)
  })

  it('imports a project JSON file into the store', async () => {
    renderDesigner()
    const json = JSON.stringify({
      app: 'csd-sim',
      version: 1,
      activeTabId: 'main',
      tabs: [
        {
          id: 'main',
          name: 'main',
          circuit: {
            components: [{ id: 'c42', type: 'XOR', attrs: { width: 1, inputs: 2 }, x: 80, y: 80, rotation: 0 }],
            wires: [],
          },
        },
      ],
    })
    const file = new File([json], 'circuit.json', { type: 'application/json' })
    fireEvent.change(screen.getByTestId('import-file'), { target: { files: [file] } })
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50))
    })
    const state = useCircuitStore.getState()
    expect(active(state).components).toHaveLength(1)
    expect(active(state).components[0]!.type).toBe('XOR')
    expect(active(state).components[0]!.id).toBe('c42')
  })

  it('rejects an invalid import file without changing the project', async () => {
    const { addComponent } = useCircuitStore.getState()
    addComponent('input', {}, 0, 0)
    renderDesigner()
    const file = new File(['{not json'], 'bad.json', { type: 'application/json' })
    fireEvent.change(screen.getByTestId('import-file'), { target: { files: [file] } })
    const notice = await screen.findByTestId('status-notice')
    expect(notice).toHaveTextContent(/Import failed/)
    expect(active(useCircuitStore.getState()).components).toHaveLength(1)
  })

  it('loads the Adder example via the Examples menu', () => {
    renderDesigner()
    fireEvent.click(screen.getByTestId('menu-examples'))
    fireEvent.click(screen.getByTestId('example-adder'))
    const state = useCircuitStore.getState()
    const comps = active(state).components
    const types = comps.map((c) => c.type)
    expect(types).toContain('input')
    expect(types).toContain('adder')
    expect(types).toContain('output')
    expect(active(state).wires.length).toBe(5)
  })

  it('loads the ALU example with all four operation blocks and a mux', () => {
    renderDesigner()
    fireEvent.click(screen.getByTestId('menu-examples'))
    fireEvent.click(screen.getByTestId('example-alu'))
    const comps = active(useCircuitStore.getState()).components
    const types = comps.map((c) => c.type)
    expect(types).toContain('adder')
    expect(types).toContain('subtractor')
    expect(types).toContain('AND')
    expect(types).toContain('OR')
    expect(types).toContain('mux')
    expect(active(useCircuitStore.getState()).wires.length).toBe(14)
  })

  it('places an adder from the Wiring / IO / Arithmetic palette', () => {
    renderDesigner()
    fireEvent.click(screen.getByTestId('palette-adder'))
    fireEvent.click(screen.getByTestId('canvas'))
    const state = useCircuitStore.getState()
    expect(active(state).components.length).toBe(1)
    expect(active(state).components[0]!.type).toBe('adder')
    expect(active(state).components[0]!.attrs.width).toBe(8)
  })

  it('ticks a clock through the Simulate menu and toggles its level', () => {
    const { addComponent } = useCircuitStore.getState()
    addComponent('clock', {}, 0, 0)
    renderDesigner()
    const id = active(useCircuitStore.getState()).components[0]!.id

    fireEvent.click(screen.getByTestId('menu-simulate'))
    fireEvent.click(screen.getByTestId('menu-tick'))
    expect(useCircuitStore.getState().simState.clock.get(id)).toBe(1)
    fireEvent.click(screen.getByTestId('menu-simulate'))
    fireEvent.click(screen.getByTestId('menu-tick'))
    expect(useCircuitStore.getState().simState.clock.get(id)).toBe(0)
  })

  it('evaluates a wired adder fed by constants', async () => {
    const { addComponent, beginWire, endWire } = useCircuitStore.getState()
    addComponent('constant', { width: 8, value: 5 }, 0, 0)
    addComponent('constant', { width: 8, value: 7 }, 0, 120)
    addComponent('adder', { width: 8 }, 200, 60)
    addComponent('output', { label: 'S' }, 400, 60)
    const s = useCircuitStore.getState()
    const a = active(s).components[0]!
    const b = active(s).components[1]!
    const g = active(s).components[2]!
    const o = active(s).components[3]!
    beginWire(`${a.id}:out:0`)
    endWire(`${g.id}:in:0`)
    beginWire(`${b.id}:out:0`)
    endWire(`${g.id}:in:1`)
    beginWire(`${g.id}:out:0`)
    endWire(`${o.id}:in:0`)

    renderDesigner()
    await act(async () => {})
    expect(packedValue(useCircuitStore.getState().sim?.values.get(`${o.id}:in:0`))).toBe(12)
  })

  it('places a RAM via the palette (Memory library)', () => {
    renderDesigner()
    fireEvent.click(screen.getByTestId('palette-ram'))
    fireEvent.click(screen.getByTestId('canvas'))
    const comps = active(useCircuitStore.getState()).components
    expect(comps.map((c) => c.type)).toEqual(['ram'])
    expect(comps[0]!.attrs.addrBits).toBe(4)
    expect(comps[0]!.attrs.width).toBe(8)
    expect(portCountOf('ram', comps[0]!.attrs)).toEqual({ inputs: 4, outputs: 1 })
    expect(screen.getAllByTestId('mem-ram').length).toBeGreaterThan(0)
  })

  it('drives a counter from a store clock tick', async () => {
    const { addComponent } = useCircuitStore.getState()
    addComponent('clock', {}, 0, 0)
    addComponent('counter', { width: 4 }, 200, 0)
    addComponent('constant', { width: 1, value: 1 }, 0, 200)
    const s = useCircuitStore.getState()
    const comps = active(s).components
    const clk = comps[0]!
    const ctr = comps[1]!
    const en = comps[2]!
    const { beginWire, endWire } = useCircuitStore.getState()
    beginWire(`${clk.id}:out:0`)
    endWire(`${ctr.id}:in:0`)
    beginWire(`${en.id}:out:0`)
    endWire(`${ctr.id}:in:1`)

    renderDesigner()
    await act(async () => {})
    fireEvent.click(screen.getByTestId('menu-simulate'))
    fireEvent.click(screen.getByTestId('menu-tick'))
    fireEvent.click(screen.getByTestId('menu-simulate'))
    fireEvent.click(screen.getByTestId('menu-tick'))
    expect(packedValue(useCircuitStore.getState().sim?.values.get(`${ctr.id}:out:0`))).toBe(1)
  })

  it('toggles the app appearance via the header theme button', () => {
    renderDesigner()
    const toggle = screen.getByTestId('theme-toggle')
    // starts dark (default)
    expect(toggle.textContent).toContain('Light')
    fireEvent.click(toggle)
    expect(localStorage.getItem('theme')).toBe('light')
    expect(toggle.textContent).toContain('Dark')
  })

  it('animates active-high wires with a propagation-flow overlay', () => {
    const { addComponent, beginWire, endWire } = useCircuitStore.getState()
    addComponent('constant', { width: 1, value: 1 }, 0, 0)
    addComponent('probe', {}, 200, 0)
    const s = useCircuitStore.getState()
    const c = active(s).components[0]!
    const p = active(s).components[1]!
    beginWire(`${c.id}:out:0`)
    endWire(`${p.id}:in:0`)
    renderDesigner()
    expect(screen.getAllByTestId('wire-flow').length).toBe(1)
  })
})
