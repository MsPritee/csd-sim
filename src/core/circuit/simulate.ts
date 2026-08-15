/**
 * Schematic-level simulation engine. Given a `Circuit` (and its subcircuit
 * library) plus forced input-pin levels and a `SimState`, it propagates signals
 * through gates, wires and subcircuits until a stable state is reached.
 *
 * Design notes:
 *  - True ternary evaluation: a gate with any unconnected input stays floating
 *    (`undefined`) rather than assuming 0. Phase 0 extends this to width-aware
 *    buses (see `value.ts`): width mismatches and conflicts produce an error
 *    net ('E').
 *  - `propagate` computes the steady-state of the *combinational* part plus the
 *    registered outputs of any sequential components (which read `state`).
 *  - `tick` advances state one step: for each stateful component it samples its
 *    inputs at the clock edge and returns a fresh `SimState`.
 *  - Iterative fixpoint with a shortage cap: combinational logic stabilises in
 *    ≤ (number of gates) passes; a non-converging state is reported as
 *    oscillation instead of returning garbage. Feedback loops that pass through
 *    a *stateful* component are legal sequential feedback and are NOT flagged.
 */

import { evaluateGateVector, errorNet, netFromNumber, bitValue, netToString, eq, packedValue } from './value'
import type { Bit, NetValue } from './value'
import { dffOutput, dffTick, emptyState, clockOutput, clockTick } from './state'
import type { SimState } from './state'
import { evalMemoryRead, memTick, isMemoryType } from './memory'
import { evalSourceComponent } from './arith'
import { getGate } from '../gates/catalog'
import { isOutputPort } from './types'
import type { Circuit, Component, PortId, Wire } from './types'
import { attrNumber, attrString, gateForType, isStatefulType, portCountOf } from './descriptors'

export type { Bit, NetValue } from './value'

/** A symbol for "this net oscillates / could not settle / error". */
export type ErrorSignal = 'E'

/** Simulated value carried on a port. See `value.ts` for the model. */

/** Just enough of the library for subcircuit arity + evaluation. */
export interface CircuitLibrary {
  /** Resolve a subcircuit's [inputCount, outputCount]. */
  readonly arity: (libraryId: string) => [number, number]
  /** Resolve a subcircuit's internal `Circuit` for evaluation. */
  readonly get: (libraryId: string) => Circuit
}

export interface EvaluationResult {
  /** Value read at every port. */
  readonly values: ReadonlyMap<PortId, NetValue>
  /** The forced value at each input pin's output port. */
  readonly inputs: ReadonlyMap<string, Bit>
  /** True when some net could not settle (combinational cycle). */
  readonly oscillating: boolean
  /** The ports that oscillate when `oscillating` is true. */
  readonly oscillatingPorts: readonly PortId[]
}

export interface TickResult {
  /** Steady-state values produced *from the pre-tick state*. */
  readonly result: EvaluationResult
  /** The state to use for the next propagation/tick. */
  readonly nextState: SimState
}

/** Worst-case passes before we declare a circuit oscillating. */
const MAX_PASSES = 64

type Resolved = {
  component: Component
  inputCount: number
  outputCount: number
  isInput: boolean
  isOutput: boolean
  gate: import('../gates/types').GateType | null
  stateful: boolean
  sub: Circuit | null // resolved subcircuit, if any
}
function arity(component: Component, library?: CircuitLibrary): [number, number] {
  if (component.type === 'subcircuit' && library) {
    return library.arity(attrString(component.attrs, 'libraryId'))
  }
  const pc = portCountOf(component.type, component.attrs)
  return [pc.inputs, pc.outputs]
}

function inPort(componentId: string, i: number): PortId {
  return `${componentId}:in:${i}`
}

function outPort(componentId: string, i: number): PortId {
  return `${componentId}:out:${i}`
}

/** Width of an input/output pin (defaults to 1). */
function pinWidth(component: Component): number {
  if (component.type === 'input' || component.type === 'output' || component.type === 'button') {
    return attrNumber(component.attrs, 'width', 1)
  }
  return 1
}

/** A single forced input pin's output bus: the bit parked into all lanes. */
function forcedPinNet(component: Component, level: Bit): NetValue {
  const width = pinWidth(component)
  return netFromNumber(width, level ? (1 << width) - 1 : 0)
}

/**
 * Evaluate the combinational steady state of a circuit for a given `state`.
 * Returns the value present on every input and output port.
 */
export function propagate(
  circuit: Circuit,
  inputs: Readonly<Record<string, Bit>> = {},
  state: SimState = emptyState(),
  library?: CircuitLibrary,
): EvaluationResult {
  const resolved: Resolved[] = circuit.components.map((c) => {
    const [inputCount, outputCount] = arity(c, library)
    return {
      component: c,
      inputCount,
      outputCount,
      isInput: c.type === 'input' || c.type === 'button',
      isOutput: c.type === 'output',
      gate: gateForType(c.type),
      stateful: isStatefulType(c.type),
      sub: c.type === 'subcircuit' && library ? library.get(attrString(c.attrs, 'libraryId')) : null,
    }
  })

  // index wires: for each input port, its source output port.
  const inputSource = new Map<PortId, PortId>()
  const outputConsumers = new Map<PortId, PortId[]>()
  for (const wire of circuit.wires) {
    const fromIsOutput = isOutputPort(wire.from)
    const source = fromIsOutput ? wire.from : wire.to
    const target = fromIsOutput ? wire.to : wire.from
    // Only a genuine input row can be a target.
    const targetIsInput = !isOutputPort(target)
    if (!targetIsInput) continue
    inputSource.set(target, source)
    const list = outputConsumers.get(source) ?? []
    list.push(target)
    outputConsumers.set(source, list)
  }

  const values = new Map<PortId, NetValue>()

  // Fixed sources: each input pin's output row = forced level.
  const forcedInputs = new Map<string, Bit>()
  for (const r of resolved) {
    if (r.isInput) {
      const level = inputs[r.component.id] ?? 0
      forcedInputs.set(r.component.id, level)
      values.set(outPort(r.component.id, 0), forcedPinNet(r.component, level))
    }
  }

  let changed = true
  let pass = 0
  while (changed && pass < MAX_PASSES) {
    changed = false
    pass++

    // Publish every wire-target (input-port) value from its driving source so
    // that any port's value is observable (used by ticks and, later, probes).
    for (const wire of circuit.wires) {
      if (isOutputPort(wire.from)) {
        values.set(wire.to, values.get(wire.from))
      }
    }

    for (const r of resolved) {
      if (r.isInput) continue
      const id = r.component.id

      // Read this component's driven input ports once (used by outputs, gates,
      // machine components and subcircuit mapping alike).
      const ins: NetValue[] = []
      for (let i = 0; i < r.inputCount; i++) {
        const source = inputSource.get(inPort(id, i))
        ins.push(source !== undefined ? (values.get(source) ?? undefined) : undefined)
      }

      if (r.isOutput) {
        const value = ins[0]
        changed = setIfChanged(values, inPort(id, 0), value) || changed
        continue
      }

      if (r.stateful) {
        if (r.component.type === 'clock') {
          const level = clockOutput(state, id) as Bit
          changed = setIfChanged(values, outPort(id, 0), bitNet(level)) || changed
        } else if (isMemoryType(r.component.type)) {
          const mw = attrNumber(r.component.attrs, 'width', 1)
          const memOuts = evalMemoryRead(
            state,
            id,
            r.component.type,
            r.component.attrs,
            ins,
            mw,
          )
          if (memOuts !== null) {
            for (let i = 0; i < r.outputCount; i++) {
              changed = setIfChanged(values, outPort(id, i), memOuts[i] ?? undefined) || changed
            }
          }
        } else {
          const q = dffOutput(state, id) as Bit
          changed = setIfChanged(values, outPort(id, 0), bitNet(q)) || changed
          changed = setIfChanged(values, outPort(id, 1), bitNet(q === 1 ? 0 : 1)) || changed
        }
        continue
      }

      if (r.gate) {
        const next = evaluateGateVector(r.gate, ins)
        changed = setIfChanged(values, outPort(id, 0), next) || changed
        continue
      }

      // Wiring / IO / Arithmetic machine components (constant, tunnel, adder,
      // subtractor, comparator, negator, probe handled by evaluator helpers).
      const contrib = evalSourceComponent(r.component.type, r.component.attrs, ins)
      if (contrib !== null) {
        for (let i = 0; i < r.outputCount; i++) {
          changed = setIfChanged(values, outPort(id, i), contrib[i]) || changed
        }
        continue
      }

      // subcircuit
      if (r.sub) {
        const innerInputIds: string[] = []
        for (const inner of r.sub.components) {
          if (inner.type === 'input') innerInputIds.push(inner.id)
        }
        // force library's own input pins from the instance's wired inputs
        const mapped: Record<string, Bit> = {}
        for (let i = 0; i < r.inputCount; i++) {
          const source = inputSource.get(inPort(id, i))
          const v = source !== undefined ? (values.get(source) ?? undefined) : undefined
          const innerId = innerInputIds[i]
          if (innerId !== undefined) {
            const bit = bitFromValue(v)
            if (bit !== undefined) mapped[innerId] = bit
          }
        }
        for (const innerId of innerInputIds) {
          if (!(innerId in mapped)) mapped[innerId] = 0
        }
        const innerResult = propagate(r.sub, mapped, state, library)
        const innerOutputIds: string[] = []
        for (const inner of r.sub.components) {
          if (inner.type === 'output') innerOutputIds.push(inner.id)
        }
        for (let i = 0; i < r.outputCount; i++) {
          const innerId = innerOutputIds[i]
          let value: NetValue = undefined
          if (innerId !== undefined) {
            value = innerResult.values.get(inPort(innerId, 0)) ?? undefined
          }
          changed = setIfChanged(values, outPort(id, i), value) || changed
        }
      }
    }
  }

  const oscillatingPorts: PortId[] = []
  const statefulIds = new Set(resolved.filter((r) => r.stateful).map((r) => r.component.id))
  // Structural feedback detection: a wire path that returns a gate's own
  // output to one of its inputs is a combinational loop unless it passes
  // through a stateful component (which breaks the combinational chain).
  for (const port of cyclePorts(inputSource, resolved, statefulIds)) {
    if (values.get(port) === 'E') continue
    values.set(port, errorNet())
    oscillatingPorts.push(port)
  }
  // Fixpoint exhaustion also implies oscillation.
  if (changed) {
    for (const r of resolved) {
      for (let i = 0; i < r.outputCount; i++) {
        const p = outPort(r.component.id, i)
        if (values.get(p) === 'E') continue
        values.set(p, errorNet())
        oscillatingPorts.push(p)
      }
    }
  }

  // Final read for output pins (so the map includes their input-row value).
  for (const r of resolved) {
    if (r.isOutput) {
      const source = inputSource.get(inPort(r.component.id, 0))
      const value = source !== undefined ? (values.get(source) ?? undefined) : undefined
      values.set(inPort(r.component.id, 0), value)
    }
  }

  return {
    values,
    inputs: forcedInputs,
    oscillating: changed || oscillatingPorts.length > 0,
    oscillatingPorts,
  }
}

/**
 * Advance the sequential state one tick. The returned result reflects the
 * PRE-tick state (Logisim edge-triggered behaviour: outputs change *with*
 * the clock edge); call `propagate` again with `nextState` to see post-tick
 * values.
 */
export function tick(
  circuit: Circuit,
  inputs: Readonly<Record<string, Bit>> = {},
  state: SimState = emptyState(),
  library?: CircuitLibrary,
): TickResult {
  const result = propagate(circuit, inputs, state, library)

  // Phase 1: advance every clock component one half-cycle. Free-running clocks
  // are the source of their own edges, so they must move first.
  const clocks: Map<string, Bit> = new Map(state.clock)
  for (const c of circuit.components) {
    if (c.type !== 'clock') continue
    const next = clockTick(state.clock.get(c.id)) as Bit
    if (next !== state.clock.get(c.id)) clocks.set(c.id, next)
  }

  // Phase 2: re-propagate with the new clock levels so edge-triggered
  // components (DFFs and memory elements) sample the clock transition they
  // just experienced.
  const postClock: SimState = { dff: state.dff, clock: clocks, mem: state.mem, ram: state.ram }
  const postResult = propagate(circuit, inputs, postClock, library)

  let dff: Map<string, import('./state').DffState> = new Map(state.dff)
  for (const c of circuit.components) {
    if (c.type !== 'dff') continue
    const d = bitFromValue(postResult.values.get(inPort(c.id, 0)))
    const clk = bitFromValue(postResult.values.get(inPort(c.id, 1)))
    const next = dffTick(state.dff.get(c.id), d, clk)
    const prev = state.dff.get(c.id)
    if (!prev || prev.q !== next.q || prev.clkPrev !== next.clkPrev) {
      dff.set(c.id, next)
    }
  }

  let mem: Map<string, import('./state').MemState> = new Map(state.mem)
  let ram: Map<string, import('./state').RamState> = new Map(state.ram)
  for (const c of circuit.components) {
    if (!isMemoryType(c.type)) continue
    if (c.type === 'ram' || c.type === 'rom') {
      const mw = attrNumber(c.attrs, 'width', 8)
      const pc = portCountOf(c.type, c.attrs)
      const ins: (number | null)[] = []
      for (let i = 0; i < pc.inputs; i++) {
        ins.push(packedNet(postResult.values.get(inPort(c.id, i))))
      }
      const next = memTick(c.type, c.attrs, undefined, state.ram.get(c.id), ins, mw)
      if (next?.nextRam) ram.set(c.id, next.nextRam)
      continue
    }
    const mw = attrNumber(c.attrs, 'width', 1)
    const pc = portCountOf(c.type, c.attrs)
    const ins: (number | null)[] = []
    for (let i = 0; i < pc.inputs; i++) {
      ins.push(packedNet(postResult.values.get(inPort(c.id, i))))
    }
    const next = memTick(c.type, c.attrs, state.mem.get(c.id), undefined, ins, mw)
    if (next?.nextMem) mem.set(c.id, next.nextMem)
  }

  return { result, nextState: { dff, clock: clocks, mem, ram } }
}

/**
 * Backwards-compatible facade over `propagate` with an empty state and 1-bit
 * forced inputs. Existing callers/tests keep using `evaluateCircuit`.
 */
export function evaluateCircuit(
  circuit: Circuit,
  inputs: Readonly<Record<string, Bit>> = {},
  library?: CircuitLibrary,
): EvaluationResult {
  return propagate(circuit, inputs, emptyState(), library)
}

/**
 * Builds a new circuit from a collection of components and wires. Primarily a
 * convenience constructor shared by tests and callers.
 */
export function makeCircuit(
  components: readonly Component[],
  wires: readonly Wire[] = [],
): Circuit {
  return { components, wires }
}

function bitNet(bit: Bit): NetValue {
  return { kind: 'bits', width: 1, states: [bit] }
}

/** Normalise a net to a single 0/1 bit, or `undefined` when not known. */
function bitFromValue(value: NetValue): Bit | undefined {
  const bit = bitValue(value)
  return bit === 0 || bit === 1 ? bit : undefined
}

/** Pack a net to an integer for memory evaluation; `null` when unknown/error/floating. */
function packedNet(value: NetValue | undefined): number | null {
  if (value === undefined) return null
  return packedValue(value)
}

function setIfChanged(
  values: Map<PortId, NetValue>,
  port: PortId,
  next: NetValue,
): boolean {
  if (!eq(values.get(port), next)) {
    values.set(port, next)
    return true
  }
  return false
}

/**
 * Structural feedback detection. For every non-input component, walk the
 * "which inputs drive me" chain backwards through wires; if that chain ever
 * returns to the component itself, the component sits in a combinational
 * feedback loop (oscillator). Paths that pass through a stateful component
 * (`statefulIds`) are legal sequential feedback and terminate the walk.
 */
function cyclePorts(
  inputSource: Map<PortId, PortId>,
  resolved: Resolved[],
  statefulIds: Set<string>,
): PortId[] {
  // effInputs: componentId -> its driven input ports
  const effInputs = new Map<string, PortId[]>()
  for (const r of resolved) {
    const arr: PortId[] = []
    for (let i = 0; i < r.inputCount; i++) {
      const p = inPort(r.component.id, i)
      if (inputSource.has(p)) arr.push(p)
    }
    effInputs.set(r.component.id, arr)
  }

  const visited = new Set<string>()
  const stack = new Set<string>()
  const result = new Set<PortId>()

  const dfs = (compId: string): boolean => {
    if (stack.has(compId)) return true
    if (visited.has(compId)) return false
    // A stateful component's output is not a combinational function of its
    // inputs: it cannot participate in a combinational cycle.
    if (statefulIds.has(compId)) return false
    stack.add(compId)
    visited.add(compId)
    let feedback = false
    for (const inP of effInputs.get(compId) ?? []) {
      const source = inputSource.get(inP)
      if (source === undefined) continue
      const srcComp = parseSourceComponent(source)
      if (dfs(srcComp)) feedback = true
    }
    stack.delete(compId)
    return feedback
  }

  for (const r of resolved) {
    if (r.isInput || r.isOutput) continue
    if (dfs(r.component.id)) {
      for (const inP of effInputs.get(r.component.id) ?? []) result.add(inP)
      for (let i = 0; i < r.outputCount; i++) result.add(outPort(r.component.id, i))
    }
  }
  return [...result]
}

/** From an output port id, extract the owning component id. */
function parseSourceComponent(source: PortId): string {
  const idx = source.lastIndexOf(':out:')
  return source.substring(0, idx)
}

export { getGate }

/** Human-readable name for a value (kept for the existing UI/tests). */
export function signalLabel(value: NetValue | undefined): string {
  if (value === undefined) return '-'
  if (value === 'E') return 'E'
  return netToString(value)
}