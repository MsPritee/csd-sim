import { getGate } from '../../core/gates/catalog'
import type { GateType } from '../../core/gates/types'
import type { Component, PortId } from '../../core/circuit'
import { bitValue, packedValue } from '../../core/circuit'
import type { NetValue } from '../../core/circuit'
import {
  COMPONENT_DESCRIPTORS,
  attrString,
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
/** Connection-dot x for an input-pin component (facing right, value box). */
const INPUT_DOT_X = 68
/** Connection x for an output-pin component (left edge of the lamp circle). */
const OUTPUT_DOT_X = 100

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
    // a source: its connection dot is on the facing (right) side
    return { x: INPUT_DOT_X, y: 45 }
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

/** Pin row y-positions for a port column (Logisim 2-pin classic layout). */
export function centerRow(index: number, count: number): number {
  if (count === 1) return 50
  // Keep the classic two-input positions (32 / 68) and compress wider gates
  // (Logisim defaults to 5 inputs) inside the 100px box.
  if (count === 2) return index === 0 ? 32 : 68
  const spacing = 48 / (count - 1)
  return 18 + index * spacing
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