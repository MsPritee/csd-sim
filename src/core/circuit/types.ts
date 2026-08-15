/**
 * Core circuit-design engine types. Pure TypeScript — no React, no state
 * stores, no UI. These types describe a schematic-level digital circuit:
 * placed components (gates, input pins, output pins, subcircuits), the wires
 * that connect their ports, and the results of simulating it.
 *
 * This is the engine backing a Logisim-style visual designer. Presentation
 * layers read/write this model and never duplicate the math.
 */

import type { GateType } from '../gates/types'
import { portCountOf, gateForType } from './descriptors'
import type { AttrValue } from './descriptors'

/** A single binary signal value. */
export type Bit = 0 | 1

/**
 * Ternary signal used during evaluation: undefined means the node is floating
 * (no wire driving it). Gates with any floating input stay floating.
 */
export type TriBit = Bit | undefined

/** Stable identifier for a component placed on a canvas. */
export type ComponentId = string

/** Stable identifier for a single port: "<componentId>:in:<n>" or ":out:<n>". */
export type PortId = string

/**
 * What a component is. It is identified by its descriptor `type` (e.g. 'AND',
 * 'input', 'output', 'dff', 'subcircuit', 'text') plus a bag of attributes.
 * The attribute schema, port counts and behaviour all live in the descriptor
 * registry (`descriptors.ts`), so component kinds become data, not branches.
 */

/** A component placed on the canvas. */
export interface Component {
  readonly id: ComponentId
  /** Component *type* id — maps to a `ComponentDescriptor`. */
  readonly type: string
  /** Editable attributes for this instance (labels, bit width, gate arity…). */
  readonly attrs: Readonly<Record<string, AttrValue>>
  /** Grid-space top-left anchor. */
  readonly x: number
  readonly y: number
  /** 0..3 quarter-turn rotations (clockwise). */
  readonly rotation: 0 | 1 | 2 | 3
}

/** A wire connects one output port to exactly one input port. */
export interface Wire {
  readonly id: string
  /** Must reference an output port of a component. */
  readonly from: PortId
  /** Must reference an input port of a component. */
  readonly to: PortId
}

/** A reusable circuit. The active designer canvas edits one of these. */
export interface Circuit {
  readonly components: readonly Component[]
  readonly wires: readonly Wire[]
}

/**
 * Port layout of a single component: ordered input ports then ordered output
 * ports. Inputs conventionally sit on the left, outputs on the right; the row
 * index is what the wire joins.
 */
export interface PortSignature {
  readonly id: ComponentId
  readonly gate: GateType | null
  /** Number of input rows (left side). */
  readonly inputCount: number
  /** Number of output rows (right side). */
  readonly outputCount: number
}

/** Build the canonical input port id for a component. */
export function inputPort(componentId: ComponentId, index: number): PortId {
  return `${componentId}:in:${index}`
}

/** Build the canonical output port id for a component. */
export function outputPort(componentId: ComponentId, index: number): PortId {
  return `${componentId}:out:${index}`
}

/** Test whether a port id belongs to the given component. */
export function portComponentId(port: PortId): ComponentId {
  return port.split(':', 1)[0]!
}

/** True when the port is an output port (source of signal), else an input port. */
export function isOutputPort(port: PortId): boolean {
  return port.includes(':out:')
}

/** Parse a port id back into { componentId, isOutput, index }. */
export function parsePort(port: PortId): {
  componentId: ComponentId
  isOutput: boolean
  index: number
} {
  const indexOf = port.lastIndexOf(':')
  const kind = port.substring(0, indexOf).endsWith('out') ? 'out' : 'in'
  const componentId = port.substring(0, indexOf).replace(/:(in|out)$/, '')
  return { componentId, isOutput: kind === 'out', index: Number(port.substring(indexOf + 1)) }
}

/**
 * How many input and output rows a component exposes, resolved entirely from
 * its descriptor (`portCountOf`). Subcircuit arity comes from the library when
 * supplied, otherwise its descriptor fallback applies.
 */
export function portSignatureFor(
  component: Component,
  libraryInputs?: number,
  libraryOutputs?: number,
): PortSignature {
  const library =
    libraryInputs !== undefined && libraryOutputs !== undefined
      ? { inputs: libraryInputs, outputs: libraryOutputs }
      : undefined
  const pc = portCountOf(component.type, component.attrs, library)
  const gate = gateForType(component.type)
  return { id: component.id, gate, inputCount: pc.inputs, outputCount: pc.outputs }
}