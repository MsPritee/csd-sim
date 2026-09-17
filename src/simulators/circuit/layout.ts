import { getGate } from '../../core/gates/catalog'
import type { GateType } from '../../core/gates/types'
import type { Component, PortId } from '../../core/circuit'
import { bitValue, packedValue, attrNumber, attrString } from '../../core/circuit'
import type { NetValue } from '../../core/circuit'
import type { AttrValue } from '../../core/circuit/descriptors'
import {
  COMPONENT_DESCRIPTORS,
  isGateComponentType,
  portCountOf,
} from '../../core/circuit/descriptors'
import type { ComponentDescriptor } from '../../core/circuit/descriptors'

/** Grid-units box for each component kind. */
export const COMP_W = 140
export const COMP_H = 100

/** Local x for the input-side pin column. */
const IN_X = 8
/** Local x for the output-side pin column. */
const OUT_X = 132
/** Connection x for an output-pin component (left edge of the lamp circle). */
const OUTPUT_DOT_X = 100

/** Input-pin glyph: a 34×34 value square centred in the 140×100 box. */
export const INPUT_PIN_SQUARE = { x: 34, y: 28, width: 34, height: 34 }

/** Which side of an input pin its connection (and wire port) faces. */
export type PinFacing = 'east' | 'west' | 'north' | 'south'

/** Local (component-relative) connection-dot / wire-port position for an input pin. */
export function inputPinPortLocal(facing: PinFacing): { x: number; y: number } {
  const s = INPUT_PIN_SQUARE
  const cx = s.x + s.width / 2
  const cy = s.y + s.height / 2
  switch (facing) {
    case 'west':
      return { x: s.x, y: cy }
    case 'north':
      return { x: cx, y: s.y }
    case 'south':
      return { x: cx, y: s.y + s.height }
    case 'east':
    default:
      return { x: s.x + s.width, y: cy }
  }
}

/** Input-pin label placement: always OUTSIDE the pin square (no center, no box). */
export type PinLabelLocation = 'top' | 'bottom' | 'left' | 'right'

export function pinLabelPosition(
  location: PinLabelLocation,
): { x: number; y: number; anchor: 'start' | 'middle' | 'end' } {
  const s = INPUT_PIN_SQUARE
  const cx = s.x + s.width / 2
  const cy = s.y + s.height / 2
  switch (location) {
    case 'top':
      return { x: cx, y: s.y - 12, anchor: 'middle' }
    case 'left':
      return { x: s.x - 12, y: cy, anchor: 'end' }
    case 'right':
      return { x: s.x + s.width + 12, y: cy, anchor: 'start' }
    case 'bottom':
    default:
      return { x: cx, y: s.y + s.height + 12, anchor: 'middle' }
  }
}

/** Resolve an instance's port counts via its descriptor (library arity d when supplied). */
function counts(
  component: Component,
  libraryInputs?: number,
  libraryOutputs?: number,
): { inputs: number; outputs: number } {
  const library =
    libraryInputs !== undefined && libraryOutputs !== undefined
      ? { inputs: libraryInputs, outputs: libraryOutputs }
      : undefined
  return portCountOf(component.type, component.attrs, library)
}

/**
 * Resolve the local (component-relative) position of a port.
 * Coordinates are drawn from the component's top-left anchor.
 * Input/output pin ports sit on their drawn connection dot (Logisim-style),
 * gate ports on the symbol's left/right pin columns.
 */
export function portLocalPos(
  id: PortId,
  component: Component,
  libraryInputs?: number,
  libraryOutputs?: number,
): { x: number; y: number } {
  const isOut = id.includes(':out:')
  const index = Number(id.slice(id.lastIndexOf(':') + 1))

  if (component.type === 'input') {
    // a source: its connection dot sits on the facing side of the value square
    const facing = attrString(component.attrs, 'facing', 'east') as PinFacing
    return inputPinPortLocal(facing)
  }
  if (component.type === 'output') {
    // a sink: its connection is on the left edge of the lamp
    return { x: OUTPUT_DOT_X, y: 45 }
  }

  if (isOut) {
    const count = counts(component, libraryInputs, libraryOutputs).outputs
    return { x: OUT_X, y: centerRow(index, count) }
  }
  const count = counts(component, libraryInputs, libraryOutputs).inputs
  return { x: IN_X, y: centerRow(index, count) }
}

/**
 * Pin row y-positions for a port column: the group is centered vertically in
 * the 100px box (y=50) with equal spacing between every adjacent pin. The
 * two-input case keeps the classic Logisim positions (32 / 68).
 */
export function centerRow(index: number, count: number): number {
  if (count <= 1) return 50
  const gap = Math.min(36, 60 / (count - 1))
  return 50 + (index - (count - 1) / 2) * gap
}

/** Label placement options for gates and labelled elements. */
export type LabelLocation = 'top' | 'bottom' | 'left' | 'right' | 'center'

/**
 * Anchor for a component label. `top`, `bottom` and `center` sit inside the
 * box; `left`/`right` sit just outside it so the text never covers the shape.
 */
export function labelPosition(
  location: LabelLocation,
  width: number,
  height: number,
): { x: number; y: number; anchor: 'start' | 'middle' | 'end' } {
  switch (location) {
    case 'top':
      return { x: width / 2, y: 8, anchor: 'middle' }
    case 'center':
      return { x: width / 2, y: height / 2 + 4, anchor: 'middle' }
    case 'left':
      return { x: -6, y: height / 2, anchor: 'end' }
    case 'right':
      return { x: width + 6, y: height / 2, anchor: 'start' }
    case 'bottom':
    default:
      return { x: width / 2, y: height - 4, anchor: 'middle' }
  }
}

/** SVG text styling computed from a component's label style attributes. */
export interface LabelTextStyle {
  readonly fontSize: number
  readonly fill: string
  readonly fontWeight: number
  readonly fontStyle: 'italic' | 'normal'
  readonly textDecoration: 'underline' | 'none'
  readonly fontFamily: string | undefined
}

/** SVG text props derived from the style attributes (labelColor/bold/italic/underline/size/font). */
export function labelStyleProps(attrs: Readonly<Record<string, AttrValue>>): LabelTextStyle {
  const color = attrString(attrs, 'labelColor')
  const font = attrString(attrs, 'labelFont')
  return {
    fontSize: attrNumber(attrs, 'labelSize', 11),
    fill: color !== '' ? color : 'var(--text-secondary)',
    fontWeight: attrs['labelBold'] === true ? 700 : 400,
    fontStyle: attrs['labelItalic'] === true ? 'italic' : 'normal',
    textDecoration: attrs['labelUnderline'] === true ? 'underline' : 'none',
    fontFamily: font !== '' ? font : undefined,
  }
}

export function portCounts(
  component: Component,
  libraryInputs?: number,
  libraryOutputs?: number,
): { inputs: number; outputs: number } {
  return counts(component, libraryInputs, libraryOutputs)
}

/** Absolute (canvas) position of a port, honouring component rotation (quarter-turns about the component's centre). */
export function portAbsPos(
  id: PortId,
  component: Component,
  libraryInputs?: number,
  libraryOutputs?: number,
): { x: number; y: number } {
  const local = portLocalPos(id, component, libraryInputs, libraryOutputs)
  const cx = COMP_W / 2
  const cy = COMP_H / 2
  const rad = ((component.rotation as number) * Math.PI) / 2
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  const rx = local.x - cx
  const ry = local.y - cy
  return {
    x: component.x + cx + rx * cos - ry * sin,
    y: component.y + cy + rx * sin + ry * cos,
  }
}

/**
 * Logisim-style orthogonal (90°-elbow) route between two port positions.
 * Wires leave the source horizontally, run to the midpoint, then join the
 * target vertically and finally horizontally. Collinear points collapse to a
 * straight segment.
 */
export function orthogonalRoute(
  a: { x: number; y: number },
  b: { x: number; y: number },
): { x: number; y: number }[] {
  if (a.x === b.x || a.y === b.y) return [a, b]
  const midX = (a.x + b.x) / 2
  return [
    { x: a.x, y: a.y },
    { x: midX, y: a.y },
    { x: midX, y: b.y },
    { x: b.x, y: b.y },
  ]
}

/** A stable, readable label for a component (its label/text attr or descriptor name). */
export function componentLabel(component: Component): string {
  if (isGateComponentType(component.type)) return getGate(component.type).name
  if (component.type === 'text') return attrString(component.attrs, 'text')
  if (component.type === 'dff') return 'D FF'
  if (component.type === 'subcircuit') return attrString(component.attrs, 'libraryId')
  if (component.type === 'input' || component.type === 'output')
    return attrString(component.attrs, 'label')
  return COMPONENT_DESCRIPTORS.get(component.type)?.label ?? component.type
}

/** Logisim wire-color conventions (Logisim 2.7 / logisim.app). */
export function wireColor(value: NetValue | undefined): string {
  const bit = bitValue(value)
  if (bit === 1) return '#4ade80' // bright green = 1
  if (bit === 0) return '#16a34a' // dark green = 0
  if (bit === 'E') return '#ef4444' // red = error / conflict
  return '#60a5fa' // blue = floating / unknown
}

/** The digit rendered inside a pin, per Logisim ("E" for error, blank when floating). */
export function pinText(value: NetValue | undefined): string {
  if (value === undefined || value === 'E') return value === 'E' ? 'E' : ''
  if (value.kind === 'bits' && value.width > 1) {
    const packed = packedValue(value)
    return packed === null ? '' : String(packed)
  }
  const bit = bitValue(value)
  if (bit === 1 || bit === 0) return String(bit)
  return ''
}

export const GATE_TYPES: readonly GateType[] = [...COMPONENT_DESCRIPTORS.values()]
  .filter((d): d is ComponentDescriptor & { gate: GateType } => d.gate !== undefined)
  .map((d) => d.gate)

/** A minimal wire shape (only the two port endpoints are needed). */
export interface WireLike {
  readonly from: string
  readonly to: string
}

/**
 * Compute Logisim-style junction dots: coordinates where wires meet. A point is
 * a junction when it is an endpoint shared by two or more wires (fan-out / join)
 * or when a wire's endpoint lands on another wire's route (T-junction). Returns
 * one point per junction, deduplicated.
 */
export function junctionPoints(
  wires: readonly WireLike[],
  resolve: (port: string) => { x: number; y: number } | null,
): { x: number; y: number }[] {
  const endpoints = new Map<string, number>()
  const vertices = new Map<string, number>()
  const seen = new Set<string>()
  const points = new Map<string, { x: number; y: number }>()

  const key = (p: { x: number; y: number }) => `${p.x},${p.y}`

  for (const w of wires) {
    const a = resolve(w.from)
    const b = resolve(w.to)
    if (!a || !b) continue
    const route = orthogonalRoute(a, b)
    // Track endpoint occurrences separately from interior elbow vertices.
    for (let i = 0; i < route.length; i++) {
      const k = key(route[i]!)
      if (!seen.has(k)) {
        seen.add(k)
        points.set(k, route[i]!)
      }
      vertices.set(k, (vertices.get(k) ?? 0) + 1)
      if (i === 0 || i === route.length - 1) {
        endpoints.set(k, (endpoints.get(k) ?? 0) + 1)
      }
    }
  }

  const out: { x: number; y: number }[] = []
  for (const [k, ep] of endpoints) {
    const isJunction = ep >= 2 || (vertices.get(k) ?? 0) >= 2
    if (isJunction) out.push(points.get(k)!)
  }
  return out
}