import { useEffect, useMemo, useRef, useState } from 'react'
import { evaluateCircuit, attrString, isGateComponentType, getDescriptor, bitValue } from '../../core/circuit'
import type { Component } from '../../core/circuit'
import type { NetValue } from '../../core/circuit'
import type { GateType } from '../../core/gates/types'
import { useCircuitStore, libraryAdapter } from '../../stores/circuitStore'
import type { Tool } from '../../stores/circuitStore'
import {
  downloadProject,
  readProjectFile,
  registerAutosave,
  restoreAutosave,
  downloadLogisimCirc,
  EXAMPLE_CIRCUITS,
} from '../../application/circuit'
import { GateGlyph, PinSymbol } from './GateGlyph'
import { LibraryGlyph } from './ComponentGlyph'
import { useTheme } from '../../contexts/ThemeContext'
import {
  componentLabel,
  portAbsPos,
  portCounts,
  GATE_TYPES,
  COMP_W,
  COMP_H,
  wireColor,
  orthogonalRoute,
  junctionPoints,
} from './layout'

interface CircuitDesignerProps {
  onBackToHome?: () => void
}

/** True when a net reads as a definite logic-high (used for flow overlays). */
function bitToHigh(value: NetValue | undefined): boolean {
  const bit = bitValue(value)
  return bit === 1
}

const GRID = 20

/** Phase-4 library components (Wiring / IO / Arithmetic) shown in the palette. */
const LIBRARY_ITEMS: { type: string; aria: string }[] = [
  { type: 'constant', aria: 'Constant' },
  { type: 'probe', aria: 'Probe' },
  { type: 'tunnel', aria: 'Tunnel' },
  { type: 'clock', aria: 'Clock' },
  { type: 'led', aria: 'LED' },
  { type: 'button', aria: 'Button' },
  { type: 'segment', aria: '7-Segment' },
  { type: 'adder', aria: 'Adder' },
  { type: 'subtractor', aria: 'Subtractor' },
  { type: 'comparator', aria: 'Comparator' },
  { type: 'negator', aria: 'Negator' },
  { type: 'splitter', aria: 'Splitter' },
  { type: 'pull', aria: 'Pull Resistor' },
  { type: 'mux', aria: 'Multiplexer' },
  { type: 'demux', aria: 'Demultiplexer' },
  { type: 'decoder', aria: 'Decoder' },
  { type: 'encoder', aria: 'Encoder' },
  { type: 'priority_encoder', aria: 'Priority Encoder' },
  { type: 'bit_selector', aria: 'Bit Selector' },
  { type: 'dff', aria: 'D Flip-Flop' },
  { type: 'jk', aria: 'JK Flip-Flop' },
  { type: 't', aria: 'T Flip-Flop' },
  { type: 'sr', aria: 'SR Flip-Flop' },
  { type: 'register', aria: 'Register' },
  { type: 'counter', aria: 'Counter' },
  { type: 'ram', aria: 'RAM' },
  { type: 'rom', aria: 'ROM' },
]

/** Base attribute overrides applied when dropping a library component. */
function libraryAttrs(type: string): Record<string, import('../../core/circuit/descriptors').AttrValue> {
  switch (type) {
    case 'constant':
      return { width: 8, value: 0 }
    case 'button':
      return { width: 1 }
    case 'segment':
      return { width: 8 }
    case 'adder':
    case 'subtractor':
    case 'comparator':
    case 'negator':
      return { width: 8 }
    case 'splitter':
      return { width: 8, fanOut: 8 }
    case 'pull':
      return { pull: 1 }
    case 'mux':
    case 'demux':
      return { width: 1, dataCount: 2 }
    case 'decoder':
      return { selBits: 2 }
    case 'encoder':
    case 'priority_encoder':
      return { dataCount: 4 }
    case 'bit_selector':
      return { width: 8, groupWidth: 1 }
    case 'register':
    case 'counter':
      return { width: 8 }
    case 'ram':
    case 'rom':
      return { width: 8, addrBits: 4 }
    default:
      return {}
  }
}

/** Logisim-style hierarchical Explorer libraries (regroups existing palette data). */
const EXPLORER_BY_LIBRARY: Record<string, { type: string; aria: string }[]> = {
  Wiring: [
    { type: 'input', aria: 'Input Pin' },
    { type: 'output', aria: 'Output Pin' },
    { type: 'constant', aria: 'Constant' },
    { type: 'probe', aria: 'Probe' },
    { type: 'tunnel', aria: 'Tunnel' },
    { type: 'clock', aria: 'Clock' },
    { type: 'splitter', aria: 'Splitter' },
    { type: 'pull', aria: 'Pull Resistor' },
  ],
  Gates: GATE_TYPES.map((g) => ({ type: g, aria: g })),
  Plexers: [
    { type: 'mux', aria: 'Multiplexer' },
    { type: 'demux', aria: 'Demultiplexer' },
    { type: 'decoder', aria: 'Decoder' },
    { type: 'encoder', aria: 'Encoder' },
    { type: 'priority_encoder', aria: 'Priority Encoder' },
    { type: 'bit_selector', aria: 'Bit Selector' },
  ],
  Arithmetic: [
    { type: 'adder', aria: 'Adder' },
    { type: 'subtractor', aria: 'Subtractor' },
    { type: 'comparator', aria: 'Comparator' },
    { type: 'negator', aria: 'Negator' },
  ],
  Memory: [
    { type: 'dff', aria: 'D Flip-Flop' },
    { type: 'jk', aria: 'JK Flip-Flop' },
    { type: 't', aria: 'T Flip-Flop' },
    { type: 'sr', aria: 'SR Flip-Flop' },
    { type: 'register', aria: 'Register' },
    { type: 'counter', aria: 'Counter' },
    { type: 'ram', aria: 'RAM' },
    { type: 'rom', aria: 'ROM' },
  ],
  IO: [
    { type: 'led', aria: 'LED' },
    { type: 'button', aria: 'Button' },
    { type: 'segment', aria: '7-Segment' },
  ],
}

/** Ordered Explorer libraries, mirroring logisim.app's palette order. */
const EXPLORER_ORDER: readonly string[] = ['Wiring', 'Gates', 'Plexers', 'Arithmetic', 'Memory', 'IO']

/** Single source of truth for whether a type is a gate (for icon selection). */
const isGateTypeName = (type: string): boolean => GATE_TYPES.includes(type as GateType)

/** Guards against re-hydrating (and clobbering in-session edits) across mounts. */
let hydrated = false

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
        {title}
      </div>
      {children}
    </div>
  )
}

/** Toolbar button carrying a small inline glyph preview (gate or library item). */
function GlyphButton({
  type,
  active,
  onClick,
  testid,
  title,
}: {
  type: string
  active: boolean
  onClick: () => void
  testid: string
  title: string
}) {
  const attrs = libraryAttrs(type)
  const counts = portCounts({ type, attrs, id: '', x: 0, y: 0, rotation: 0 })
  const out = Array.from({ length: counts.outputs }, () => undefined)
  return (
    <button
      onClick={onClick}
      data-testid={testid}
      title={title}
      className="rounded-lg border p-0.5 transition-colors"
      style={{
        backgroundColor: active ? 'var(--accent-bg)' : 'var(--bg-card)',
        borderColor: active ? 'var(--accent-primary)' : 'var(--border-color)',
      }}
    >
      <svg viewBox="0 0 140 100" className="h-8 w-12" data-testid={`palette-glyph-${type.toLowerCase()}`}>
        {isGateTypeName(type) ? (
          <GateGlyph gate={type as GateType} inputs={[]} output={undefined} />
        ) : (
          <LibraryGlyph type={type} attrs={attrs} counts={counts} inVals={[]} outVals={out} />
        )}
      </svg>
    </button>
  )
}

/** A 2-state icon button for the top toolbar's Poke / Select / Wire / Label tools. */
function ToolIconButton({
  active,
  onClick,
  label,
  testid,
  glyph,
}: {
  active: boolean
  onClick: () => void
  label: string
  testid: string
  glyph: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      data-testid={testid}
      title={label}
      className="flex h-10 w-10 flex-col items-center justify-center gap-0 rounded-lg border transition-colors"
      style={{
        backgroundColor: active ? 'var(--accent-bg)' : 'var(--bg-card)',
        borderColor: active ? 'var(--accent-primary)' : 'var(--border-color)',
        color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
      }}
    >
      <span className="text-lg leading-none">{glyph}</span>
    </button>
  )
}

/** Minimal 24px icon glyphs for the four canvas tools (Logisim-style). */
function ToolGlyph({ tool }: { tool: string }) {
  switch (tool) {
    case 'select':
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
          <path d="M4 3l7 18 3-7 7-3z" />
        </svg>
      )
    case 'poke':
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
          <path d="M9 3h2v7h3v4h-4v-3H8V8H7z" transform="scale(0.8) translate(3,4)" />
          <circle cx="12" cy="12" r="2.4" />
        </svg>
      )
    case 'wire':
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
          <path d="M4 16h9V8h7" />
          <circle cx="4" cy="16" r="2" fill="currentColor" />
          <circle cx="20" cy="8" r="2" fill="currentColor" />
        </svg>
      )
    case 'label':
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
          <path d="M6 19V5h12M9 10h6M9 14h4" />
        </svg>
      )
    default:
      return null
  }
}

/** A simple dropdown menu for the top menu bar. */
function Menu({
  label,
  items,
  testid,
}: {
  label: string
  items: { label: string; onClick: () => void; testid: string; disabled?: boolean }[]
  testid: string
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative" onMouseLeave={() => setOpen(false)}>
      <button
        onClick={() => setOpen((o) => !o)}
        data-testid={testid}
        className="rounded px-2 py-1 text-sm transition-colors hover:bg-black/5"
        style={{ color: 'var(--text-secondary)' }}
      >
        {label}
      </button>
      {open && (
        <div
          className="absolute left-0 top-full z-30 flex min-w-44 flex-col rounded-lg border p-1 shadow-lg"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
        >
          {items.map((it) => (
            <button
              key={it.testid}
              disabled={it.disabled}
              onClick={() => {
                it.onClick()
                setOpen(false)
              }}
              data-testid={it.testid}
              className="rounded px-2 py-1 text-left text-sm transition-colors hover:bg-black/5 disabled:opacity-40"
              style={{ color: 'var(--text-primary)' }}
            >
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function CircuitDesigner({ onBackToHome }: CircuitDesignerProps = {}) {
  const {
    tabs,
    activeTabId,
    tool,
    selected,
    selectedWire,
    pendingFrom,
    inputs,
    sim,
    panX,
    panY,
    zoom,
    addComponent,
    moveComponent,
    removeComponent,
    removeWire,
    beginWire,
    endWire,
    toggleInput,
    renameComponent,
    rotateComponent,
    addText,
    select,
    setTool,
    setSim,
    tickSim,
    setView,
    createCircuit,
    saveSubcircuit,
    switchTab,
    removeTab,
    clearCanvas,
    undo,
    redo,
    past,
    future,
    loadProject,
  } = useCircuitStore()

  const { theme, toggleTheme } = useTheme()

  const circuit = useMemo(
    () => tabs.find((t) => t.id === activeTabId)?.circuit ?? tabs[0]?.circuit ?? { components: [], wires: [] },
    [tabs, activeTabId],
  )
  const subcircuits = useMemo(() => tabs.filter((t) => t.id !== 'main'), [tabs])

  const svgRef = useRef<SVGSVGElement>(null)
  const importInputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState<{ id: string; dx: number; dy: number } | null>(null)
  const [panning, setPanning] = useState<{ sx: number; sy: number; px: number; py: number } | null>(null)
  const [mouse, setMouse] = useState<{ x: number; y: number } | null>(null)
  const [subName, setSubName] = useState('')
  const [editing, setEditing] = useState<{ id: string; label: string } | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  // Hydrate the autosaved project once, then keep autosaving while open.
  useEffect(() => {
    if (!hydrated) {
      hydrated = true
      restoreAutosave()
    }
    return registerAutosave()
  }, [])

  // Auto-dismiss transient status notices.
  useEffect(() => {
    if (!notice) return
    const t = setTimeout(() => setNotice(null), 3000)
    return () => clearTimeout(t)
  }, [notice])

  const handleDownload = () => {
    downloadProject({ tabs, activeTabId })
    setNotice('Project downloaded.')
  }

  const handleExportCirc = () => {
    downloadLogisimCirc({ tabs, activeTabId }, resolvePort)
    setNotice('Logisim .circ exported.')
  }

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const result = await readProjectFile(file)
    if (result.ok) {
      loadProject(result.project)
      setNotice('Project imported.')
    } else {
      setNotice(`Import failed: ${result.reason}`)
    }
    e.target.value = ''
  }

  const handleLoadExample = (id: string) => {
    const ex = EXAMPLE_CIRCUITS.find((e) => e.id === id)
    if (!ex) return
    loadProject(ex.project)
    setNotice(`Example loaded: ${ex.name}`)
  }

  // Live simulation on every active-circuit/input/tabs change.
  useEffect(() => {
    const result = evaluateCircuit(circuit, inputs, libraryAdapter(tabs))
    setSim(result)
  }, [circuit, inputs, tabs, setSim])

  const snap = (v: number) => Math.round(v / GRID) * GRID

  function toCanvas(clientX: number, clientY: number): { x: number; y: number } {
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }
    return {
      x: (clientX - rect.left - panX) / zoom,
      y: (clientY - rect.top - panY) / zoom,
    }
  }

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.button !== 0) return
    if (tool === 'select' || tool === 'wire' || (typeof tool === 'object' && tool.type === 'add-subcircuit')) {
      if (typeof tool === 'object' && tool.type === 'add-subcircuit') {
        const { x, y } = toCanvas(e.clientX, e.clientY)
        addComponent('subcircuit', { libraryId: tool.libraryId }, snap(x) - COMP_W / 2, snap(y) - COMP_H / 2)
        return
      }
      return
    }
    const { x, y } = toCanvas(e.clientX, e.clientY)
    if (tool === 'add-gate') {
      if (gateToAdd) {
        addComponent(gateToAdd as GateType, {}, snap(x) - COMP_W / 2, snap(y) - COMP_H / 2)
      }
      return
    }
    const libType = libraryTypeFromTool(tool)
    if (libType) {
      addComponent(libType, libraryAttrs(libType), snap(x) - COMP_W / 2, snap(y) - COMP_H / 2)
      return
    }
    if (tool === 'add-input') {
      addComponent('input', { label: `I${circuit.components.filter((c) => c.type === 'input').length + 1}` }, snap(x), snap(y))
    } else if (tool === 'add-output') {
      addComponent('output', { label: `O${circuit.components.filter((c) => c.type === 'output').length + 1}` }, snap(x), snap(y))
    } else if (tool === 'label') {
      addText(snap(x), snap(y), '')
      const st = useCircuitStore.getState()
      const act = st.tabs.find((t) => t.id === st.activeTabId)
      const placed = act?.circuit.components.find((c) => c.type === 'text')
      if (placed) setEditing({ id: placed.id, label: '' })
    }
  }

  const handleComponentMouseDown = (e: React.MouseEvent, comp: Component) => {
    if (tool === 'select') {
      if (e.button === 0) {
        select(comp.id)
        const rect = svgRef.current?.getBoundingClientRect()
        if (rect) {
          setDragging({
            id: comp.id,
            dx: comp.x - (e.clientX - rect.left - panX) / zoom,
            dy: comp.y - (e.clientY - rect.top - panY) / zoom,
          })
        }
        e.stopPropagation()
      }
      return
    }
    if (tool === 'wire') {
      if (pendingFrom) {
        endWire(`${comp.id}:in:0`)
        e.stopPropagation()
        return
      }
      const outs = portCounts(comp, libraryInputs(comp), libraryOutputs(comp)).outputs
      if (outs > 0) beginWire(`${comp.id}:out:0`)
      e.stopPropagation()
      return
    }
    if (tool === 'label') {
      if (e.button === 0) {
        select(comp.id)
        const initial =
          comp.type === 'text' ? attrString(comp.attrs, 'text') : comp.type === 'input' || comp.type === 'output' ? attrString(comp.attrs, 'label') : ''
        setEditing({ id: comp.id, label: initial })
        e.stopPropagation()
      }
      return
    }
  }

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return
    if (tool === 'select') {
      setPanning({ sx: e.clientX, sy: e.clientY, px: panX, py: panY })
    } else if (tool === 'wire') {
      setMouse(toCanvas(e.clientX, e.clientY))
    } else {
      setPanning({ sx: e.clientX, sy: e.clientY, px: panX, py: panY })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragging) {
      const rect = svgRef.current?.getBoundingClientRect()
      if (!rect) return
      const nx = (e.clientX - rect.left - panX) / zoom + dragging.dx
      const ny = (e.clientY - rect.top - panY) / zoom + dragging.dy
      moveComponent(dragging.id, snap(nx), snap(ny))
      return
    }
    if (panning) {
      setView({ panX: panning.px + (e.clientX - panning.sx), panY: panning.py + (e.clientY - panning.sy) })
      return
    }
    if (tool === 'wire') {
      setMouse(toCanvas(e.clientX, e.clientY))
    }
  }

  const handleMouseUp = () => {
    setDragging(null)
    setPanning(null)
    setMouse(null)
  }

  const handleWheel = (e: React.WheelEvent) => {
    const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1
    const nextZoom = Math.min(2.5, Math.max(0.4, zoom * factor))
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    setView({
      zoom: nextZoom,
      panX: mx - ((mx - panX) * nextZoom) / zoom,
      panY: my - ((my - panY) * nextZoom) / zoom,
    })
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && (selected || selectedWire)) {
        if (selectedWire) removeWire(selectedWire)
        else if (selected) removeComponent(selected)
        e.preventDefault()
      }
      if (e.key === 'Escape') {
        setTool('select')
        select(null)
        setEditing(null)
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'r' || e.key === 'R')) {
        if (selected) {
          rotateComponent(selected)
          e.preventDefault()
        }
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
        if (e.shiftKey) redo()
        else undo()
        e.preventDefault()
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y')) {
        redo()
        e.preventDefault()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected, selectedWire, removeComponent, removeWire, setTool, select, rotateComponent, undo, redo])

  const libraryInputs = (comp: Component): number | undefined => {
    if (comp.type !== 'subcircuit') return undefined
    const libraryId = attrString(comp.attrs, 'libraryId')
    const def = tabs.find((s) => s.id === libraryId)
    return def ? def.circuit.components.filter((c) => c.type === 'input').length : undefined
  }
  const libraryOutputs = (comp: Component): number | undefined => {
    if (comp.type !== 'subcircuit') return undefined
    const libraryId = attrString(comp.attrs, 'libraryId')
    const def = tabs.find((s) => s.id === libraryId)
    return def ? def.circuit.components.filter((c) => c.type === 'output').length : undefined
  }

  const resolvePort = (port: string): { x: number; y: number } | null => {
    const comp = circuit.components.find((c) => c.id === port.split(':')[0])
    if (!comp) return null
    return portAbsPos(port, comp, libraryInputs(comp), libraryOutputs(comp))
  }

  const wireStart = (w: (typeof circuit.wires)[number]) => resolvePort(w.from)
  const wireEnd = (w: (typeof circuit.wires)[number]) => resolvePort(w.to)

  const pendingPos = useMemo(() => {
    if (!pendingFrom) return null
    const comp = circuit.components.find((c) => c.id === pendingFrom.split(':')[0])
    if (!comp) return null
    return portAbsPos(pendingFrom, comp, libraryInputs(comp), libraryOutputs(comp))
  }, [pendingFrom, circuit, tabs]) // eslint-disable-line react-hooks/exhaustive-deps

  const componentValue = (comp: Component): { inputs: (NetValue | undefined)[]; output: NetValue | undefined } => {
    const counts = portCounts(comp, libraryInputs(comp), libraryOutputs(comp))
    const inputs: (NetValue | undefined)[] = []
    for (let i = 0; i < counts.inputs; i++) {
      const src = circuit.wires.find((w) => w.to === `${comp.id}:in:${i}`)
      const port = src ? src.from : undefined
      inputs.push(port ? (sim?.values.get(port) ?? undefined) : undefined)
    }
    const out = sim?.values.get(`${comp.id}:out:0`)
    return { inputs, output: out }
  }

  const selectedComponent = useMemo(
    () => circuit.components.find((c) => c.id === selected) ?? null,
    [circuit, selected],
  )

  const paletteActions: { tool: Tool; label: string; testid: string }[] = [
    { tool: 'select', label: 'Design', testid: 'tool-select' },
    { tool: 'poke', label: 'Poke', testid: 'tool-poke' },
    { tool: 'wire', label: 'Wire', testid: 'tool-wire' },
    { tool: 'label', label: 'Label', testid: 'tool-label' },
    { tool: 'add-input', label: 'Input', testid: 'tool-input' },
    { tool: 'add-output', label: 'Output', testid: 'tool-output' },
  ]

  // palette gates: each gate type triggers add of that gate on next click
  const [gateToAdd, setGateToAdd] = useState<string | null>(null)

  const gateTool = (gate: string) => {
    setGateToAdd(gate)
    setTool('add-gate')
  }

  /** Select the placement tool for an Explorer-library item (gates vs add-*). */
  const selectExplorerItem = (type: string) => {
    if (isGateTypeName(type)) {
      gateTool(type)
      return
    }
    setTool(`add-${type}` as Tool)
    setGateToAdd(null)
  }

  const openRenameEditor = () => {
    if (!selected) return
    const comp = circuit.components.find((c) => c.id === selected)
    if (!comp) return
    const initial =
      comp.type === 'text' ? attrString(comp.attrs, 'text') : comp.type === 'input' || comp.type === 'output' ? attrString(comp.attrs, 'label') : ''
    setEditing({ id: comp.id, label: initial })
  }

  const junctions = useMemo(
    () => junctionPoints(circuit.wires, resolvePort),
    [circuit.wires, circuit.components, tabs], // eslint-disable-line react-hooks/exhaustive-deps
  )

  return (
    <main className="min-h-screen flex flex-col relative" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <header className="flex items-center justify-between gap-3 px-4 py-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <button
          onClick={onBackToHome}
          className="transition-colors text-lg px-2 py-1"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          aria-label="Back to Home"
        >
          ⌂ <span className="hidden sm:inline text-sm">Home</span>
        </button>
        <h1 className="font-bold text-lg sm:text-2xl" style={{ color: 'var(--accent-primary)' }}>
          Circuit Designer
        </h1>
        {/* Menu bar */}
        <div className="flex items-center gap-1">
          <Menu
            label="File"
            testid="menu-file"
            items={[
              {
                label: 'New Circuit',
                testid: 'menu-new-circuit',
                onClick: () => createCircuit(`circuit-${tabs.length}`),
              },
              {
                label: 'Save as Subcircuit',
                testid: 'menu-save-subcircuit',
                onClick: () => {
                  const name = subName.trim() || `sub-${tabs.length}`
                  saveSubcircuit(name)
                  setSubName('')
                },
              },
              { label: 'Clear Canvas', testid: 'menu-clear', onClick: () => clearCanvas() },
              { label: 'Download Project…', testid: 'menu-download', onClick: () => handleDownload() },
              { label: 'Export .circ…', testid: 'menu-export-circ', onClick: () => handleExportCirc() },
              { label: 'Import Project…', testid: 'menu-import', onClick: () => importInputRef.current?.click() },
            ]}
          />
          <Menu
            label="Edit"
            testid="menu-edit"
            items={[
              { label: 'Undo', testid: 'menu-undo', onClick: () => undo(), disabled: past.length === 0 },
              { label: 'Redo', testid: 'menu-redo', onClick: () => redo(), disabled: future.length === 0 },
              { label: 'Rename…', testid: 'menu-rename', onClick: () => openRenameEditor(), disabled: !selected },
              {
                label: 'Rotate',
                testid: 'menu-rotate',
                onClick: () => selected && rotateComponent(selected),
                disabled: !selected,
              },
              {
                label: 'Delete',
                testid: 'menu-delete',
                onClick: () => {
                  if (selected) removeComponent(selected)
                  else if (selectedWire) removeWire(selectedWire)
                },
                disabled: !selected && !selectedWire,
              },
            ]}
          />
          <Menu
            label="Simulate"
            testid="menu-simulate"
            items={[
              { label: 'Tick Clock', testid: 'menu-tick', onClick: () => tickSim() },
              { label: 'Zoom In', testid: 'menu-zoom-in', onClick: () => setView({ zoom: Math.min(2.5, zoom * 1.25) }) },
              { label: 'Zoom Out', testid: 'menu-zoom-out', onClick: () => setView({ zoom: Math.max(0.4, zoom / 1.25) }) },
              { label: 'Reset Zoom', testid: 'menu-zoom-reset', onClick: () => setView({ panX: 40, panY: 40, zoom: 1 }) },
            ]}
          />
          <Menu
            label="Examples"
            testid="menu-examples"
            items={EXAMPLE_CIRCUITS.map((ex) => ({
              label: ex.name,
              testid: `example-${ex.id}`,
              onClick: () => handleLoadExample(ex.id),
            }))}
          />
          <button
            onClick={toggleTheme}
            data-testid="theme-toggle"
            title={theme === 'dark' ? 'Switch to light appearance' : 'Switch to dark appearance'}
            className="rounded border px-2 py-1 text-sm transition-colors"
            style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
          >
            {theme === 'dark' ? '☀ Light' : '☾ Dark'}
          </button>
        </div>
      </header>

      {/* Logisim-style top icon toolbar: tools + gate/library shortcuts */}
      <div
        className="flex items-center gap-1 overflow-x-auto border-b px-2 py-1"
        style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}
        data-testid="toolbar"
      >
        {paletteActions.map((a) => (
          <ToolIconButton
            key={a.testid}
            active={isActive(tool, a.tool)}
            onClick={() => {
              setTool(a.tool)
              setGateToAdd(null)
            }}
            label={a.label}
            testid={a.testid}
            glyph={<ToolGlyph tool={typeof a.tool === 'string' ? a.tool : ''} />}
          />
        ))}
        <div className="mx-1 h-8 w-px shrink-0" style={{ backgroundColor: 'var(--border-color)' }} />
        {GATE_TYPES.map((g) => (
          <GlyphButton
            key={g}
            type={g}
            active={gateToAdd === g && tool === 'add-gate'}
            onClick={() => gateTool(g)}
            testid={`palette-${g.toLowerCase()}`}
            title={g}
          />
        ))}
        <div className="mx-1 h-8 w-px shrink-0" style={{ backgroundColor: 'var(--border-color)' }} />
        {LIBRARY_ITEMS.map((it) => (
          <GlyphButton
            key={it.type}
            type={it.type}
            active={tool === `add-${it.type}`}
            onClick={() => {
              setTool(`add-${it.type}` as Tool)
              setGateToAdd(null)
            }}
            testid={`palette-${it.type}`}
            title={it.aria}
          />
        ))}
      </div>

      {/* hidden import target */}
      <input
        ref={importInputRef}
        type="file"
        accept="application/json,.json"
        onChange={handleImportFile}
        className="hidden"
        data-testid="import-file"
        aria-label="Import project file"
      />

      {/* transient status notice */}
      {notice && (
        <div
          className="absolute left-1/2 top-16 z-40 -translate-x-1/2 rounded-lg border px-4 py-2 text-sm shadow-lg"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
          data-testid="status-notice"
        >
          {notice}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Left palette: Explorer + tools */}
        <aside
          className="w-52 shrink-0 border-r p-3 flex flex-col gap-4 overflow-y-auto"
          style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}
        >
          <Section title="Explorer">
            <div className="flex flex-col gap-1">
              {tabs.map((t) => (
                <div key={t.id} className="flex items-center gap-1">
                  <button
                    onClick={() => switchTab(t.id)}
                    data-testid={`tab-${t.id}`}
                    className="flex-1 rounded border px-2 py-1 text-left text-xs"
                    style={{
                      backgroundColor: t.id === activeTabId ? 'var(--accent-bg)' : 'var(--bg-card)',
                      borderColor: t.id === activeTabId ? 'var(--accent-primary)' : 'var(--border-color)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {t.name}
                  </button>
                  {t.id !== 'main' && (
                    <button
                      onClick={() => removeTab(t.id)}
                      data-testid={`tab-close-${t.id}`}
                      className="rounded px-1 text-xs"
                      style={{ color: 'var(--text-muted)' }}
                      title="Remove circuit"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => createCircuit(`circuit-${tabs.length}`)}
                data-testid="new-circuit"
                className="rounded border border-dashed px-2 py-1 text-xs"
                style={{ borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' }}
              >
                + New circuit
              </button>
            </div>
          </Section>

          <Section title="Library">
            <div className="flex flex-col gap-1">
              {EXPLORER_ORDER.map((lib) => (
                <details key={lib} open className="group">
                  <summary
                    className="flex cursor-pointer items-center gap-1 rounded px-1.5 py-1 text-xs font-semibold uppercase tracking-wider transition-colors hover:bg-black/5"
                    style={{ color: 'var(--text-secondary)' }}
                    data-testid={`library-${lib.toLowerCase()}`}
                  >
                    <span className="text-[10px] leading-none transition-transform group-open:rotate-90">▸</span>
                    {lib}
                  </summary>
                  <div className="ml-2 mt-1 flex flex-col gap-0.5 border-l pl-1.5" style={{ borderColor: 'var(--border-color)' }}>
                    {EXPLORER_BY_LIBRARY[lib].map((it) => {
                      const active =
                        isGateTypeName(it.type)
                          ? gateToAdd === it.type && tool === 'add-gate'
                          : it.type === 'input' || it.type === 'output'
                            ? isActive(tool, `add-${it.type}` as Tool)
                            : tool === `add-${it.type}`
                      return (
                        <button
                          key={it.type}
                          onClick={() => selectExplorerItem(it.type)}
                          data-testid={`explorer-${it.type.toLowerCase()}`}
                          title={it.aria}
                          className="rounded px-1.5 py-1 text-left text-xs transition-colors"
                          style={{
                            backgroundColor: active ? 'var(--accent-bg)' : 'transparent',
                            color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
                          }}
                        >
                          {it.aria}
                        </button>
                      )
                    })}
                  </div>
                </details>
              ))}
            </div>
          </Section>

          <Section title="Subcircuits">
            {subcircuits.length === 0 ? (
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Save a circuit below to reuse it as a block.
              </p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {subcircuits.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setTool({ type: 'add-subcircuit', libraryId: s.id })
                      setGateToAdd(null)
                    }}
                    data-testid={`subcircuit-${s.name.toLowerCase().replace(/\s+/g, '-')}`}
                    className="rounded-lg border px-2 py-1.5 text-xs"
                    style={{
                      backgroundColor: toolIsSub(tool) && tool.libraryId === s.id ? 'var(--accent-bg)' : 'var(--bg-card)',
                      borderColor: toolIsSub(tool) && tool.libraryId === s.id ? 'var(--accent-primary)' : 'var(--border-color)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            )}
            <div className="mt-2 flex flex-col gap-1.5">
              <input
                value={subName}
                onChange={(e) => setSubName(e.target.value)}
                placeholder="Name circuit…"
                className="rounded-lg border px-2 py-1 text-xs"
                style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                data-testid="subcircuit-name"
              />
              <button
                onClick={() => {
                  if (subName.trim()) {
                    saveSubcircuit(subName.trim())
                    setSubName('')
                  }
                }}
                disabled={!subName.trim()}
                className="rounded-lg border px-2 py-1.5 text-xs transition-colors disabled:opacity-50"
                style={{ borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' }}
                data-testid="save-subcircuit"
              >
                Save as subcircuit
              </button>
            </div>
          </Section>

          <Section title="Canvas">
            <button
              onClick={() => {
                setView({ panX: 40, panY: 40, zoom: 1 })
                clearCanvas()
              }}
              className="rounded-lg border px-2 py-1.5 text-xs transition-colors"
              style={{ borderColor: 'var(--danger-bg, #f87171)', color: '#f87171' }}
              data-testid="clear-canvas"
            >
              Clear canvas
            </button>
          </Section>
        </aside>

        {/* Canvas + tabs */}
        <div className="flex-1 relative overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          {/* Tabs bar */}
          <div className="flex items-center gap-1 border-b px-2 py-1" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-tertiary)' }}>
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => switchTab(t.id)}
                data-testid={`canvas-tab-${t.id}`}
                className="rounded-t px-3 py-1 text-xs transition-colors"
                style={{
                  backgroundColor: t.id === activeTabId ? 'var(--bg-card)' : 'transparent',
                  borderColor: 'var(--border-color)',
                  color: t.id === activeTabId ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  borderBottom: t.id === activeTabId ? '2px solid var(--accent-primary)' : '2px solid transparent',
                }}
              >
                {t.name}
              </button>
            ))}
          </div>

          <svg
            ref={svgRef}
            className="absolute inset-0 h-full w-full cursor-crosshair"
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            onClick={handleCanvasClick}
            data-testid="canvas"
          >
            <defs>
              <pattern id="grid-dots" width={GRID} height={GRID} patternUnits="userSpaceOnUse">
                <circle cx={2} cy={2} r={1.2} fill="var(--border-light)" opacity={0.35} />
              </pattern>
            </defs>
            <g transform={`translate(${panX},${panY}) scale(${zoom})`}>
              <rect x={-2000} y={-2000} width={8000} height={8000} fill="url(#grid-dots)" />
            </g>
            <g transform={`translate(${panX},${panY}) scale(${zoom})`}>
              {/* wires */}
              {circuit.wires.map((w) => {
                const s = wireStart(w)
                const e2 = wireEnd(w)
                if (!s || !e2) return null
                const active = selectedWire === w.id
                const signal = sim?.values.get(w.from)
                const pts = orthogonalRoute(s, e2)
                const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
                const high = bitToHigh(signal)
                return (
                  <g key={w.id} onClick={(ev) => {
                    ev.stopPropagation()
                    if (tool === 'select') {
                      setTool('select')
                      useCircuitStore.setState({ selectedWire: w.id })
                      useCircuitStore.setState({ selected: null })
                    }
                  }}>
                    {/* propagation-flow overlay on active-high wires */}
                    {high && <path d={d} fill="none" stroke={wireColor(signal)} strokeWidth={3} className="wire-high-flow" data-testid="wire-flow" />}
                    <path
                      d={d}
                      fill="none"
                      stroke={active ? 'var(--accent-primary)' : wireColor(signal)}
                      strokeWidth={active ? 3.5 : 2.5}
                      data-testid={`wire-${w.id}`}
                    />
                  </g>
                )
              })}

              {/* junction dots */}
              {junctions.map((p, i) => (
                <circle key={`junction-${i}`} cx={p.x} cy={p.y} r={3.5} fill="var(--border-color)" data-testid="junction-dot" />
              ))}

              {/* components */}
              {circuit.components.map((comp) => {
                const isSel = selected === comp.id
                const { inputs: inVals, output } = componentValue(comp)
                const counts = portCounts(comp, libraryInputs(comp), libraryOutputs(comp))
                const isText = comp.type === 'text'
                return (
                  <g
                    key={comp.id}
                    transform={`translate(${comp.x},${comp.y}) rotate(${((comp.rotation as number) % 4) * 90}, ${COMP_W / 2}, ${COMP_H / 2})`}
                    onMouseDown={(e) => handleComponentMouseDown(e, comp)}
                    onClick={(e) => {
                      if (tool === 'poke') {
                        e.stopPropagation()
                        select(comp.id)
                        // Logisim's "poke": clicking toggles an input pin.
                        if (comp.type === 'input') toggleInput(comp.id)
                      } else if (tool === 'select') {
                        e.stopPropagation()
                        select(comp.id)
                      }
                    }}
                    data-testid={`component-${comp.type.toLowerCase()}`}
                    style={{ cursor: tool === 'select' ? 'move' : 'pointer' }}
                  >
                    {isText ? (
                      <text
                        x={0}
                        y={0}
                        fontSize="14"
                        fill={isSel ? 'var(--accent-primary)' : 'var(--text-primary)'}
                        style={{ userSelect: 'none', cursor: 'text' }}
                      >
                        {attrString(comp.attrs, 'text') || ' '}
                      </text>
                    ) : (
                      <>
                        {isSel && (
                          <rect x={isGateComponentType(comp.type) ? -6 : -8} y={isGateComponentType(comp.type) ? -6 : -8} width={COMP_W + 12} height={COMP_H + 12} rx={8} fill="none" stroke="var(--accent-primary)" strokeWidth={2} strokeDasharray="5 4" />
                        )}
                        {isGateComponentType(comp.type) ? (
                          <GateGlyph
                            gate={comp.type as GateType}
                            inputs={inVals}
                            output={output}
                            label={componentLabel(comp)}
                            labelLocation={(comp.attrs.labelLocation as 'top' | 'bottom') ?? 'bottom'}
                          />
                        ) : (
                          <>
                            <rect x={0} y={0} width={COMP_W} height={COMP_H} rx={10} fill="var(--bg-card)" stroke={isSel ? 'var(--accent-primary)' : 'var(--border-color)'} strokeWidth={1.5} />
                            <text x={COMP_W / 2} y={comp.attrs.labelLocation === 'top' ? 14 : COMP_H - 10} textAnchor="middle" fontSize="11" fill="var(--text-secondary)" style={{ userSelect: 'none' }}>
                              {componentLabel(comp)}
                            </text>
                        {comp.type === 'input' || comp.type === 'output' ? (
                            <PinSymbol type={comp.type} label={attrString(comp.attrs, 'label')} value={output ?? inVals[0]} width={typeof comp.attrs.width === 'number' ? comp.attrs.width : 1} />
                          ) : comp.type === 'subcircuit' ? (
                            <SubcircuitGlyph label={attrString(comp.attrs, 'libraryId')} counts={counts} inVals={inVals} output={output} />
                          ) : (
                            <LibraryGlyph
                              type={comp.type}
                              attrs={comp.attrs}
                              counts={counts}
                              inVals={inVals}
                              outVals={Array.from({ length: counts.outputs }, (_, i) => sim?.values.get(`${comp.id}:out:${i}`))}
                            />
                          )}
                        </>
                      )}
                    </>
                  )}
                  </g>
                )
              })}

              {/* wire-in-progress preview */}
              {pendingFrom && pendingPos && mouse && (
                <line x1={pendingPos.x} y1={pendingPos.y} x2={mouse.x} y2={mouse.y} stroke="var(--accent-primary)" strokeWidth={2} strokeDasharray="6 4" data-testid="wire-preview" />
              )}
            </g>
          </svg>

          {/* zoom controls */}
          <div className="absolute bottom-4 right-4 flex flex-col gap-1">
            <button
              onClick={() => setView({ zoom: Math.min(2.5, zoom * 1.25) })}
              className="rounded-lg border w-9 h-9 text-lg leading-none"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
              data-testid="zoom-in"
            >
              +
            </button>
            <button
              onClick={() => setView({ zoom: Math.max(0.4, zoom / 1.25) })}
              className="rounded-lg border w-9 h-9 text-lg leading-none"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
              data-testid="zoom-out"
            >
              −
            </button>
            <button
              onClick={() => setView({ panX: 40, panY: 40, zoom: 1 })}
              className="rounded-lg border w-9 h-9 text-sm leading-none"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
              data-testid="zoom-reset"
            >
              ⌂
            </button>
          </div>

          {/* inline rename / text editor */}
          {editing &&
            (() => {
              const comp = circuit.components.find((c) => c.id === editing.id)
              if (!comp) return null
              const isText = comp.type === 'text'
              const left = comp.x * zoom + panX
              const top = comp.y * zoom + panY
              return (
                <div className="absolute" style={{ left, top, zIndex: 20 }}>
                  <input
                    autoFocus
                    value={editing.label}
                    onChange={(e) => setEditing({ ...editing, label: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        renameComponent(editing.id, editing.label.trim())
                        setEditing(null)
                      } else if (e.key === 'Escape') {
                        setEditing(null)
                      } else {
                        e.stopPropagation()
                      }
                    }}
                    onBlur={() => {
                      renameComponent(editing.id, editing.label.trim())
                      setEditing(null)
                    }}
                    data-testid="inline-editor"
                    className="rounded border px-1.5 py-0.5 text-sm outline-none"
                    style={{
                      width: isText ? 160 : COMP_W - 16,
                      backgroundColor: 'var(--bg-card)',
                      borderColor: 'var(--accent-primary)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
              )
            })()}

          {/* status / oscillating hint */}
          {sim?.oscillating && (
            <div className="absolute bottom-4 left-4 rounded-lg border px-3 py-2 text-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: '#f87171', color: '#f87171' }} data-testid="oscillation-banner">
              ⚠ Feedback loop detected — output cannot settle.
            </div>
          )}
        </div>

        {/* Right palette: attribute table */}
        <aside
          className="w-52 shrink-0 border-l p-3 overflow-y-auto"
          style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}
        >
          <Section title="Attributes">
            {selectedComponent ? (
              <AttributeTable component={selectedComponent} />
            ) : (
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Select a component to edit its attributes.
              </p>
            )}
          </Section>
        </aside>
      </div>
    </main>
  )

  function isActive(current: Tool, target: Tool): boolean {
    if (typeof current === 'object') return false
    if (typeof target === 'object') return false
    return current === target
  }
  function toolIsSub(t: Tool): t is { type: 'add-subcircuit'; libraryId: string } {
    return typeof t === 'object'
  }
}

/** Map a `add-*` tool to its component type ('' when not a library item). */
function libraryTypeFromTool(tool: Tool): string {
  if (typeof tool === 'object') return ''
  const hit = LIBRARY_ITEMS.find((it) => `add-${it.type}` === tool)
  return hit ? hit.type : ''
}

/** Editable attribute panel driven by the selected component's descriptor schema. */
function AttributeTable({ component }: { component: Component }) {
  const setAttr = useCircuitStore((s) => s.setAttr)
  const desc = getDescriptor(component.type)

  if (desc.attributes.length === 0) {
    return <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No editable attributes.</p>
  }

  return (
    <div className="flex flex-col gap-2.5">
      {desc.attributes.map((a) => {
        const value = component.attrs[a.key] ?? a.default
        const commit = (v: unknown) => setAttr(component.id, a.key, v as string | number | boolean)
        return (
          <label key={a.key} className="flex flex-col gap-1">
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {a.label}
            </span>
            {a.type === 'select' ? (
              <select
                value={String(value)}
                onChange={(e) => {
                  const opt = a.options?.find((o) => String(o) === e.target.value)
                  commit(opt ?? e.target.value)
                }}
                data-testid={`attr-${a.key}`}
                className="rounded border px-1.5 py-0.5 text-xs"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              >
                {a.options?.map((o) => (
                  <option key={String(o)} value={String(o)}>
                    {String(o)}
                  </option>
                ))}
              </select>
            ) : a.type === 'boolean' ? (
              <input
                type="checkbox"
                checked={Boolean(value)}
                onChange={(e) => commit(e.target.checked)}
                data-testid={`attr-${a.key}`}
                className="h-4 w-4"
              />
            ) : a.type === 'number' ? (
              <input
                type="number"
                value={Number(value)}
                min={a.min}
                max={a.max}
                step={a.step}
                onChange={(e) => commit(e.target.value === '' ? a.default : Number(e.target.value))}
                data-testid={`attr-${a.key}`}
                className="rounded border px-1.5 py-0.5 text-xs"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              />
            ) : (
              <input
                type="text"
                value={String(value)}
                onChange={(e) => commit(e.target.value)}
                data-testid={`attr-${a.key}`}
                className="rounded border px-1.5 py-0.5 text-xs"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              />
            )}
          </label>
        )
      })}
    </div>
  )
}

/** Minimal labelled block for a subcircuit instance. */
function SubcircuitGlyph({
  label,
  counts,
  inVals,
  output,
}: {
  label: string
  counts: { inputs: number; outputs: number }
  inVals: (NetValue | undefined)[]
  output: NetValue | undefined
}) {
  const inYs = counts.inputs === 1 ? [50] : counts.inputs === 2 ? [32, 68] : Array.from({ length: counts.inputs }, (_, i) => 20 + (60 * i) / Math.max(1, counts.inputs - 1))
  const outYs = counts.outputs === 1 ? [50] : Array.from({ length: counts.outputs }, (_, i) => 20 + (60 * i) / Math.max(1, counts.outputs - 1))
  return (
    <g>
      {inYs.map((y, i) => (
        <line key={`in-${i}`} x1={8} y1={y} x2={30} y2={y} stroke="var(--border-light)" strokeWidth={2} />
      ))}
      {outYs.map((y, i) => (
        <line key={`out-${i}`} x1={110} y1={y} x2={132} y2={y} stroke="var(--border-light)" strokeWidth={2} />
      ))}
      {inYs.map((y, i) => (
        <circle key={`pin-in-${i}`} cx={8} cy={y} r={6} fill={wireColor(inVals[i])} />
      ))}
      {outYs.map((y, i) => (
        <circle key={`pin-out-${i}`} cx={132} cy={y} r={7} fill={wireColor(output)} />
      ))}
      <rect x={30} y={20} width={80} height={60} rx={6} fill="var(--bg-tertiary)" stroke="var(--border-light)" strokeWidth={2} />
      <text x={70} y={50} textAnchor="middle" fontSize="10" fill="var(--text-secondary)" style={{ userSelect: 'none' }}>
        {label}
      </text>
    </g>
  )
}
