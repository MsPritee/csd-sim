/**
 * Logisim `.circ` export (Layer 2 — application; stretch Phase 8). Pure
 * TypeScript, no React. Produces a real Logisim 2.x-style XML document (the
 * `lib` / `comp` / `wire` structure) for the designer's editable project, so a
 * circuit can be handed to Logisim or archived as a portable text file.
 *
 * Geometry has to come from the presentation layer (which owns port layout),
 * so every function accepts a `resolve(portId)` callback returning canvas
 * coordinates. The component `<tool>` names mirror Logisim's own libraries
 * (Gates / Wiring / IO / Plexers / Arithmetic / Memory) for the components we
 * replicate; each element additionally carries a `_type` / `_attrs` annotation
 * for a lossless round-trip back to the CSD-sim project.
 */

import type { Component, PortId } from '../../core/circuit'
import type { CircuitState, CircuitTab } from '../../stores/circuitStore'
import type { AttrValue } from '../../core/circuit/descriptors'
import { attrString, attrNumber } from '../../core/circuit/descriptors'

/** Resolve a port id to canvas coordinates (provided by the presentation layer). */
export type PortResolver = (port: PortId) => { x: number; y: number } | null

/** Logisim tool name for a component type, or null when it has no Logisim analog. */
export function logisimToolName(type: string): string | null {
  switch (type) {
    // Gates
    case 'BUFFER':
      return 'Buffer'
    case 'NOT':
      return 'NOT'
    case 'AND':
    case 'NAND':
    case 'OR':
    case 'NOR':
    case 'XOR':
    case 'XNOR':
      return type
    case 'CON_BUF':
      return 'Controlled Buffer'
    case 'CON_INV':
      return 'Controlled Inverter'
    case 'ODD_PARITY':
      return 'Odd Parity'
    case 'EVEN_PARITY':
      return 'Even Parity'
    // Wiring / IO
    case 'input':
      return 'Pin'
    case 'output':
      return 'Pin'
    case 'constant':
      return 'Constant'
    case 'probe':
      return 'Probe'
    case 'tunnel':
      return 'Tunnel'
    case 'clock':
      return 'Clock'
    case 'splitter':
      return 'Splitter'
    case 'pull':
      return 'Pull Resistor'
    case 'led':
      return 'LED'
    case 'button':
      return 'Button'
    case 'segment':
      return '7-Segment Display'
    // Arithmetic
    case 'adder':
      return 'Adder'
    case 'subtractor':
      return 'Subtractor'
    case 'comparator':
      return 'Comparator'
    case 'negator':
      return 'Negator'
    // Plexers
    case 'mux':
      return 'Multiplexer'
    case 'demux':
      return 'Demultiplexer'
    case 'decoder':
      return 'Decoder'
    case 'encoder':
      return 'Encoder'
    case 'priority_encoder':
      return 'Priority Encoder'
    case 'bit_selector':
      return 'Bit Selector'
    // Memory
    case 'dff':
      return 'D Flip-Flop'
    case 'jk':
      return 'J-K Flip-Flop'
    case 't':
      return 'T Flip-Flop'
    case 'sr':
      return 'S-R Flip-Flop'
    case 'register':
      return 'Register'
    case 'counter':
      return 'Counter'
    case 'ram':
      return 'RAM'
    case 'rom':
      return 'ROM'
    default:
      return null // subcircuit, text and any future types
  }
}

/** Logisim library descriptor for a component type. */
function libraryOf(type: string): string | null {
  const tool = logisimToolName(type)
  if (!tool) return null
  switch (type) {
    case 'BUFFER':
    case 'NOT':
    case 'AND':
    case 'NAND':
    case 'OR':
    case 'NOR':
    case 'XOR':
    case 'XNOR':
    case 'CON_BUF':
    case 'CON_INV':
    case 'ODD_PARITY':
    case 'EVEN_PARITY':
      return '#Gates'
    case 'adder':
    case 'subtractor':
    case 'comparator':
    case 'negator':
      return '#Arithmetic'
    case 'mux':
    case 'demux':
    case 'decoder':
    case 'encoder':
    case 'priority_encoder':
    case 'bit_selector':
      return '#Plexers'
    case 'dff':
    case 'jk':
    case 't':
    case 'sr':
    case 'register':
    case 'counter':
    case 'ram':
    case 'rom':
      return '#Memory'
    case 'led':
    case 'button':
    case 'segment':
      return '#IO'
    default:
      return '#Wiring'
  }
}

/** The Logisim attribute entries for a component (best-effort but lossless-ish). */
function attributesOf(comp: Component): { name: string; val: string }[] {
  const attrs: { name: string; val: string }[] = []
  const width = attrNumber(comp.attrs, 'width', 1)
  switch (comp.type) {
    case 'input':
    case 'output':
      attrs.push({ name: 'facing', val: 'east' })
      attrs.push({ name: 'label', val: attrString(comp.attrs, 'label', comp.type === 'input' ? 'A' : 'Y') })
      if (width > 1) attrs.push({ name: 'width', val: String(width) })
      break
    case 'constant':
      attrs.push({ name: 'width', val: String(width) })
      attrs.push({ name: 'value', val: String(attrNumber(comp.attrs, 'value', 0)) })
      break
    case 'adder':
    case 'subtractor':
    case 'comparator':
    case 'negator':
    case 'register':
    case 'counter':
      attrs.push({ name: 'width', val: String(width) })
      break
    case 'mux':
    case 'demux':
      attrs.push({ name: 'select', val: String(attrNumber(comp.attrs, 'dataCount', 2)) })
      attrs.push({ name: 'dataBits', val: String(width) })
      break
    case 'decoder':
    case 'encoder':
    case 'priority_encoder':
      attrs.push({ name: 'select', val: String(attrNumber(comp.attrs, 'dataCount', 4)) })
      break
    case 'splitter':
      attrs.push({ name: 'width', val: String(width) })
      break
    case 'bit_selector':
      attrs.push({ name: 'width', val: String(width) })
      attrs.push({ name: 'groupOut', val: String(attrNumber(comp.attrs, 'groupWidth', 1)) })
      break
    case 'ram':
    case 'rom':
      attrs.push({ name: 'addrWidth', val: String(attrNumber(comp.attrs, 'addrBits', 4)) })
      attrs.push({ name: 'dataBits', val: String(width) })
      if (comp.type === 'rom' && attrString(comp.attrs, 'content', '') !== '') {
        attrs.push({ name: 'contents', val: attrString(comp.attrs, 'content') })
      }
      break
    case 'pull':
      attrs.push({ name: 'pull', val: String(attrNumber(comp.attrs, 'pull', 1)) })
      break
    case 'AND':
    case 'NAND':
    case 'OR':
    case 'NOR':
    case 'XOR':
    case 'XNOR':
    case 'ODD_PARITY':
    case 'EVEN_PARITY':
      attrs.push({ name: 'inputs', val: String(attrNumber(comp.attrs, 'inputs', 5)) })
      break
    default:
      break
  }
  // Lossless CSD-sim annotations (ignored by Logisim, enabling a future import).
  attrs.push({ name: '_type', val: comp.type })
  if (Object.keys(comp.attrs).length > 0) {
    attrs.push({ name: '_attrs', val: JSON.stringify(comp.attrs) })
  }
  return attrs
}

function compTag(comp: Component, resolve: PortResolver, libName: string): string {
  const loc = resolve(`${comp.id}:out:0`) ?? { x: comp.x, y: comp.y }
  const tool = logisimToolName(comp.type)!
  const a = attributesOf(comp)
    .map((x) => `<a name="${x.name}" val="${x.val}"/>`)
    .join('')
  return `    <comp loc="(${loc.x},${loc.y})" name="${tool}" lib="${libName}">${a}</comp>`
}

/**
 * Serialize a project's circuits to a Logisim 2.x-style `.circ` XML string.
 * `resolve` maps each port id to canvas coordinates; components without a
 * Logisim analog (subcircuit / text) are skipped.
 */
export function toLogisimXml(
  state: Pick<CircuitState, 'tabs' | 'activeTabId'>,
  resolve: PortResolver,
): string {
  const libs = new Map<string, Set<string>>() // desc -> used tool names
  const byLib = new Map<string, string>()
  for (const tab of state.tabs) {
    for (const c of tab.circuit.components) {
      const tool = logisimToolName(c.type)
      if (!tool) continue
      const desc = libraryOf(c.type)!
      const set = libs.get(desc) ?? new Set<string>()
      set.add(tool)
      libs.set(desc, set)
    }
  }
  let libIndex = 0
  const libXml: string[] = []
  for (const [desc, tools] of libs) {
    const name = String(libIndex++)
    byLib.set(desc, name)
    const toolXml = [...tools].map((t) => `<tool name="${t}"/>`).join('')
    libXml.push(`    <lib desc="${desc}" name="${name}">${toolXml}</lib>`)
  }

  const circuitXml = state.tabs
    .map((tab: CircuitTab) => {
      const comps = tab.circuit.components
        .filter((c) => logisimToolName(c.type) !== null)
        .map((c) => compTag(c, resolve, byLib.get(libraryOf(c.type)!)!))
        .join('\n')
      const wires = tab.circuit.wires
        .map((w) => {
          const a = resolve(w.from)
          const b = resolve(w.to)
          if (!a || !b) return ''
          return `    <wire from="(${a.x},${a.y})" to="(${b.x},${b.y})"/>`
        })
        .filter(Boolean)
        .join('\n')
      const title = tab.id === state.activeTabId ? 'main' : tab.name
      const inner = [comps, wires].filter(Boolean).join('\n')
      return `  <circuit name="${title}">\n${inner}\n  </circuit>`
    })
    .join('\n')

  return (
    '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n' +
    '<project source="3" version="1.0">\n' +
    libXml.join('\n') +
    '\n' +
    `  <main name="${state.activeTabId === 'main' ? 'main' : state.tabs.find((t) => t.id === state.activeTabId)?.name ?? 'main'}" />\n` +
    circuitXml +
    '\n</project>'
  )
}

/** Trigger a browser download of the current project as a `.circ` file. */
export function downloadLogisimCirc(
  state: Pick<CircuitState, 'tabs' | 'activeTabId'>,
  resolve: PortResolver,
): void {
  const xml = toLogisimXml(state, resolve)
  const blob = new Blob([xml], { type: 'application/xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${state.activeTabId || 'circuit'}.circ`
  a.click()
  URL.revokeObjectURL(url)
}

/** Assert a DOM won't be needed — keeping the export logic pure for tests. */
export type { AttrValue }