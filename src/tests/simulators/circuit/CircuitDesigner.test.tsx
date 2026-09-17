import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { CircuitDesigner } from '../../../simulators/circuit'
import { ThemeProvider } from '../../../contexts/ThemeContext'
import { useCircuitStore } from '../../../stores/circuitStore'
import type { CircuitState } from '../../../stores/circuitStore'
import { bitValue, packedValue, portCountOf } from '../../../core/circuit'
import { gateBodyBounds } from '../../../simulators/circuit/GateGlyph'

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
    selection: [],
    selectedWires: [],
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
    expect(active(state).components[0]!.attrs).toEqual({
      text: 'ALU select',
      labelColor: '',
      labelBold: false,
      labelItalic: false,
      labelUnderline: false,
      labelSize: 11,
      labelFont: '',
    })
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
    expect(pin.attrs).toEqual({
      label: 'CLOCK',
      width: 1,
      labelLocation: 'bottom',
      facing: 'east',
      labelColor: '',
      labelBold: false,
      labelItalic: false,
      labelUnderline: false,
      labelSize: 11,
      labelFont: '',
    })
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

  it('box-selects components and wires with a rubber-band drag', () => {
    const { addComponent, beginWire, endWire } = useCircuitStore.getState()
    addComponent('AND', {}, 120, 120)
    addComponent('input', { label: 'A' }, 120, 260)
    const s = useCircuitStore.getState()
    const gate = active(s).components[0]!
    const pin = active(s).components[1]!
    beginWire(`${pin.id}:out:0`)
    endWire(`${gate.id}:in:0`)
    useCircuitStore.setState({ tool: 'select' })

    renderDesigner()
    const canvas = screen.getByTestId('canvas')
    fireEvent.mouseDown(canvas, { clientX: 100, clientY: 100 })
    fireEvent.mouseMove(canvas, { clientX: 900, clientY: 900 })
    expect(screen.getByTestId('box-select')).toBeInTheDocument()
    fireEvent.mouseUp(canvas)

    const st = useCircuitStore.getState()
    expect(st.selection).toEqual([gate.id, pin.id])
    expect(st.selectedWires).toContain(active(st).wires[0]!.id)
  })

  it('drags every box-selected component together', () => {
    const { addComponent } = useCircuitStore.getState()
    addComponent('AND', {}, 120, 120)
    addComponent('input', { label: 'A' }, 120, 260)
    const s = useCircuitStore.getState()
    const gate = active(s).components[0]!
    const pin = active(s).components[1]!
    s.setSelection([gate.id, pin.id])

    renderDesigner()
    const canvas = screen.getByTestId('canvas')
    // grab the selected gate and move the whole selection
    fireEvent.mouseDown(screen.getByTestId('component-and'), { clientX: 160, clientY: 160 })
    fireEvent.mouseMove(canvas, { clientX: 200, clientY: 200 })
    fireEvent.mouseUp(canvas)

    const after = active(useCircuitStore.getState()).components
    expect(after.find((c) => c.id === gate.id)!.x).toBe(160)
    expect(after.find((c) => c.id === gate.id)!.y).toBe(160)
    expect(after.find((c) => c.id === pin.id)!.x).toBe(160)
    expect(after.find((c) => c.id === pin.id)!.y).toBe(300)
  })

  it('deletes the whole multi-selection with Delete', () => {
    const { addComponent, beginWire, endWire } = useCircuitStore.getState()
    addComponent('AND', {}, 120, 120)
    addComponent('input', { label: 'A' }, 120, 260)
    const s = useCircuitStore.getState()
    const gate = active(s).components[0]!
    const pin = active(s).components[1]!
    beginWire(`${pin.id}:out:0`)
    endWire(`${gate.id}:in:0`)
    s.setSelection([gate.id, pin.id])

    renderDesigner()
    fireEvent.keyDown(window, { key: 'Delete' })

    const st = useCircuitStore.getState()
    expect(active(st).components).toHaveLength(0)
    expect(active(st).wires).toHaveLength(0)
    expect(st.selection).toEqual([])
    expect(st.selectedWires).toEqual([])
  })

  it('clears the multi-selection with Escape', () => {
    const { addComponent } = useCircuitStore.getState()
    addComponent('AND', {}, 120, 120)
    addComponent('input', { label: 'A' }, 120, 260)
    const s = useCircuitStore.getState()
    s.setSelection([active(s).components[0]!.id, active(s).components[1]!.id])

    renderDesigner()
    fireEvent.keyDown(window, { key: 'Escape' })
    const st = useCircuitStore.getState()
    expect(st.selection).toEqual([])
    expect(st.selected).toBeNull()
  })

  it('deselects on a plain empty-canvas click', () => {
    const { addComponent } = useCircuitStore.getState()
    addComponent('AND', {}, 120, 120)
    renderDesigner()
    const id = active(useCircuitStore.getState()).components[0]!.id
    expect(useCircuitStore.getState().selection).toEqual([id])

    fireEvent.click(screen.getByTestId('canvas'), { clientX: 50, clientY: 50 })
    expect(useCircuitStore.getState().selection).toEqual([])
  })

  it('pans the canvas with right-button drag', () => {
    const { addComponent } = useCircuitStore.getState()
    addComponent('AND', {}, 120, 120)
    renderDesigner()
    const canvas = screen.getByTestId('canvas')
    fireEvent.mouseDown(canvas, { button: 2, clientX: 100, clientY: 100 })
    fireEvent.mouseMove(canvas, { clientX: 140, clientY: 80 })
    fireEvent.mouseUp(canvas)
    const st = useCircuitStore.getState()
    expect(st.panX).toBe(80)
    expect(st.panY).toBe(20)
    // panning must not disturb the selection
    expect(st.selection).toEqual([active(st).components[0]!.id])
  })

  it('pans the canvas with Space + left-drag', () => {
    renderDesigner()
    const canvas = screen.getByTestId('canvas')
    fireEvent.keyDown(window, { code: 'Space' })
    fireEvent.mouseDown(canvas, { clientX: 100, clientY: 100 })
    fireEvent.mouseMove(canvas, { clientX: 160, clientY: 130 })
    fireEvent.mouseUp(canvas)
    fireEvent.keyUp(window, { code: 'Space' })
    const st = useCircuitStore.getState()
    expect(st.panX).toBe(100)
    expect(st.panY).toBe(70)
    expect(useCircuitStore.getState().selection).toEqual([])
  })

  it('shows the multi-selection hint in the attributes panel', () => {
    const { addComponent } = useCircuitStore.getState()
    addComponent('AND', {}, 120, 120)
    addComponent('input', { label: 'A' }, 120, 260)
    const s = useCircuitStore.getState()
    s.setSelection([active(s).components[0]!.id, active(s).components[1]!.id])
    renderDesigner()
    expect(screen.getByTestId('multi-selection-hint').textContent).toContain('2 components selected')
  })

  it('marks a selected element with corner brackets instead of a dashed box', () => {
    const { addComponent } = useCircuitStore.getState()
    addComponent('AND', {}, 120, 120)
    renderDesigner()
    expect(screen.getByTestId('selection-corners')).toBeInTheDocument()
    const comp = screen.getByTestId('component-and')
    expect(comp.querySelector('rect[stroke-dasharray]')).toBeNull()
  })

  it('renders gates without the &, ≥1, =1 and parity symbols in the body', () => {
    const { addComponent } = useCircuitStore.getState()
    addComponent('AND', {}, 120, 120)
    addComponent('OR', {}, 300, 120)
    addComponent('XOR', {}, 480, 120)
    addComponent('ODD_PARITY', {}, 120, 260)
    renderDesigner()
    expect(screen.queryByText('&')).not.toBeInTheDocument()
    expect(screen.queryByText('≥1')).not.toBeInTheDocument()
    expect(screen.queryByText('=1')).not.toBeInTheDocument()
    expect(screen.queryByText('2k+1')).not.toBeInTheDocument()
  })

  it('offers top/bottom/left/right/center label locations', () => {
    const { addComponent } = useCircuitStore.getState()
    addComponent('AND', {}, 120, 120)
    renderDesigner()
    const select = screen.getByTestId('attr-labelLocation') as HTMLSelectElement
    const options = Array.from(select.options).map((o) => o.value)
    expect(options).toEqual(expect.arrayContaining(['top', 'bottom', 'left', 'right', 'center']))
  })

  it('places the gate label outside the box for left/right locations', () => {
    const { addComponent } = useCircuitStore.getState()
    addComponent('AND', {}, 120, 120)
    renderDesigner()
    fireEvent.change(screen.getByTestId('attr-labelLocation'), { target: { value: 'left' } })
    const st = useCircuitStore.getState()
    expect(active(st).components[0]!.attrs.labelLocation).toBe('left')
    const label = screen.getByTestId('gate-label')
    expect(label).toHaveAttribute('text-anchor', 'end')
    expect(Number(label.getAttribute('x'))).toBeLessThan(0)
  })

  it('edits label style through the label-style popup', () => {
    const { addComponent } = useCircuitStore.getState()
    addComponent('AND', {}, 120, 120)
    renderDesigner()
    fireEvent.click(screen.getByTestId('btn-label-style'))
    expect(screen.getByTestId('style-modal-label')).toBeInTheDocument()
    fireEvent.change(screen.getByTestId('label-size-input'), { target: { value: '18' } })
    fireEvent.change(screen.getByTestId('label-color-input'), { target: { value: '#ff00aa' } })
    fireEvent.click(screen.getByTestId('label-labelbold-input'))
    const st = useCircuitStore.getState()
    const gate = active(st).components[0]!
    expect(gate.attrs.labelSize).toBe(18)
    expect(gate.attrs.labelColor).toBe('#ff00aa')
    expect(gate.attrs.labelBold).toBe(true)
    const label = screen.getByTestId('gate-label')
    expect(label).toHaveAttribute('font-size', '18')
    expect(label).toHaveAttribute('fill', '#ff00aa')
    expect(label).toHaveAttribute('font-weight', '700')
    fireEvent.click(screen.getByTestId('style-modal-close'))
    expect(screen.queryByTestId('style-modal-label')).not.toBeInTheDocument()
  })

  it('edits the shape border color through the border-color popup', () => {
    const { addComponent } = useCircuitStore.getState()
    addComponent('AND', {}, 120, 120)
    renderDesigner()
    fireEvent.click(screen.getByTestId('btn-border-color'))
    expect(screen.getByTestId('style-modal-border')).toBeInTheDocument()
    fireEvent.change(screen.getByTestId('border-color-input'), { target: { value: '#123456' } })
    const st = useCircuitStore.getState()
    expect(active(st).components[0]!.attrs.borderColor).toBe('#123456')
    const gateBody = screen.getByTestId('component-and').querySelector('[data-testid="gate-body"]')
    expect(gateBody).toHaveAttribute('stroke', '#123456')
  })

  it('defaults arity gates (AND/OR) to two inputs', () => {
    const { addComponent } = useCircuitStore.getState()
    addComponent('AND', {}, 0, 0)
    addComponent('OR', {}, 200, 0)
    const st = useCircuitStore.getState()
    const comps = active(st).components
    expect(comps[0]!.attrs.inputs).toBe(2)
    expect(comps[1]!.attrs.inputs).toBe(2)
    expect(portCountOf('AND', comps[0]!.attrs)).toEqual({ inputs: 2, outputs: 1 })
  })

  it('computes tight gate body bounds for the selection corners', () => {
    expect(gateBodyBounds('AND', 2)).toEqual({ x: 34, y: 17, width: 70, height: 66 })
    expect(gateBodyBounds('NAND', 2)).toEqual({ x: 34, y: 17, width: 84, height: 66 })
    expect(gateBodyBounds('XOR', 2)).toEqual({ x: 24, y: 17, width: 80, height: 66 })
    expect(gateBodyBounds('ODD_PARITY', 2)).toEqual({ x: 34, y: 12, width: 70, height: 76 })
    expect(gateBodyBounds('NOT', 1)).toEqual({ x: 54, y: 34, width: 56, height: 32 })
  })

  it('renders the input pin as an inner square with no outer box and no default label', () => {
    const { addComponent } = useCircuitStore.getState()
    addComponent('input', {}, 0, 0)
    renderDesigner()
    const pin = screen.getByTestId('component-input')
    expect(pin.querySelector('[data-testid="input-pin-square"]')).not.toBeNull()
    // the 140×100 outer box must not be drawn for the input pin
    expect(pin.querySelector('rect[width="140"]')).toBeNull()
    expect(pin.querySelector('[data-testid="pin-label"]')?.textContent).toBe('')
  })

  it('offers only outside label locations (top/bottom/left/right) for the input pin', () => {
    const { addComponent } = useCircuitStore.getState()
    addComponent('input', {}, 0, 0)
    renderDesigner()
    const select = screen.getByTestId('attr-labelLocation') as HTMLSelectElement
    const options = Array.from(select.options).map((o) => o.value)
    expect(options).toEqual(['top', 'bottom', 'left', 'right'])
    expect(options).not.toContain('center')
  })

  it('places the input pin label outside the square for left/top locations', () => {
    const { addComponent } = useCircuitStore.getState()
    addComponent('input', { label: 'A' }, 0, 0)
    renderDesigner()
    const pin = screen.getByTestId('component-input')

    fireEvent.change(screen.getByTestId('attr-labelLocation'), { target: { value: 'left' } })
    expect(active(useCircuitStore.getState()).components[0]!.attrs.labelLocation).toBe('left')
    const leftLabel = pin.querySelector('[data-testid="pin-label"]')!
    expect(leftLabel).toHaveAttribute('text-anchor', 'end')
    expect(Number(leftLabel.getAttribute('x'))).toBeLessThan(34)

    fireEvent.change(screen.getByTestId('attr-labelLocation'), { target: { value: 'top' } })
    const topLabel = pin.querySelector('[data-testid="pin-label"]')!
    expect(Number(topLabel.getAttribute('y'))).toBeLessThan(28)
  })

  it('defaults the input connection facing to east and offers north/south/west', () => {
    const { addComponent } = useCircuitStore.getState()
    addComponent('input', {}, 0, 0)
    renderDesigner()
    const sel = screen.getByTestId('attr-facing') as HTMLSelectElement
    expect(Array.from(sel.options).map((o) => o.value)).toEqual(['east', 'west', 'north', 'south'])
    expect(active(useCircuitStore.getState()).components[0]!.attrs.facing).toBe('east')
    fireEvent.change(sel, { target: { value: 'north' } })
    expect(active(useCircuitStore.getState()).components[0]!.attrs.facing).toBe('north')
  })
})
