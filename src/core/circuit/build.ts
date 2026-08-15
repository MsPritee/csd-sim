/**
 * Brief factories for schematics and simple validation helpers used across
 * tests and the designer UI. Pure TypeScript — no UI.
 */

import type { Component, Circuit, PortId } from './types'
import { isOutputPort, parsePort } from './types'
import { normalizeAttrs } from './descriptors'
import type { AttrValue } from './descriptors'

/** Create components with a type + attributes, on a grid position. */
export function addComponent(
  id: string,
  type: string,
  attrs: Readonly<Record<string, AttrValue>> = {},
  x = 0,
  y = 0,
  rotation: 0 | 1 | 2 | 3 = 0,
): Component {
  return { id, type, attrs: normalizeAttrs(type, attrs), x, y, rotation }
}

/** Create a gate component. */
export function makeGate(
  id: string,
  gateType: import('../gates/types').GateType,
  x = 0,
  y = 0,
  attrs: Readonly<Record<string, AttrValue>> = {},
): Component {
  return addComponent(id, gateType, attrs, x, y)
}

/** Normalise a list into a Circuit. */
export function toCircuit(
  components: readonly Component[],
  wires: readonly { from: PortId; to: PortId }[],
): Circuit {
  return {
    components,
    wires: wires.map((w, i) => ({ id: `w${i}`, from: w.from, to: w.to })),
  }
}

/** List every output port a circuit exposes (used to renumber subcircuit pins). */
export function collectOutputPorts(circuit: Circuit): PortId[] {
  const out: PortId[] = []
  for (const c of circuit.components) {
    if (c.type === 'output') out.push(`${c.id}:in:0`)
  }
  return out
}

/** Detect wires that loop back into an already-connected input row. */
export function findConflicts(circuit: Circuit): { wireId: string; message: string }[] {
  const targets = new Map<PortId, string>()
  const issues: { wireId: string; message: string }[] = []
  for (const w of circuit.wires) {
    const to = isOutputPort(w.to) ? w.from : w.to
    const existing = targets.get(to)
    if (existing !== undefined) {
      issues.push({ wireId: w.id, message: `Multiple wires drive port ${to} (${existing} and ${w.id}).` })
    } else {
      targets.set(to, existing ?? w.id)
    }
  }
  return issues
}

/** Validate a port id refers to an existing component. */
export function portBelongsToComponent(port: PortId, components: readonly Component[]): boolean {
  const id = parsePort(port).componentId
  return components.some((c) => c.id === id)
}

export { parsePort }