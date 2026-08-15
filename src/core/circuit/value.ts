/**
 * Core signal model. Pure TypeScript — no React, no state stores, no UI.
 *
 * A wire, pin or gate port carries a `NetValue`. Phase 0 graduates the engine
 * from a single bit (`0 | 1 | undefined | 'E'`) to a width-aware bus so that
 * arithmetic, probes, 7-segment displays and memory can follow (Phases 4-7).
 *
 * Representation: a width-`n` bus is stored as `n` per-bit `BitState`s so that
 * per-bit Unknown ('X') and Error ('E') states are visible on probes and
 * 7-segment displays, exactly like Logisim. For compatibility the previous
 * scalar encodings remain valid as the *floating* (`undefined`) and *error*
 * (`'E'`) members of `NetValue`.
 */

import type { GateType } from '../gates/types'
import { evaluateGate } from '../gates/evaluate'

/** A single net's per-wire-level state. */
export type BitState = 0 | 1 | 'X' | 'E'

/** A fully (or partially) determined bus of width `width`. */
export interface BitVector {
  readonly kind: 'bits'
  readonly width: number
  readonly states: readonly BitState[]
}

/** A net that cannot settle / has conflicting drivers / width mismatch. */
export type ErrorSignal = 'E'

/**
 * The value carried on a net:
 *  - `BitVector`  → a known (or partly X / partly E) bus.
 *  - `undefined`  → floating / disconnected (kept for backwards compatibility).
 *  - `'E'`        → conflict or width-mismatch error.
 */
export type NetValue = BitVector | undefined | ErrorSignal

/** One known bit of the width-1 LSB aliases a scalar 1-bit value. */
export type OneBitNet = 0 | 1 | 'X' | 'E' | undefined

/** Build a BitVector from per-bit states. */
export function netFromBits(states: readonly BitState[]): BitVector {
  return { kind: 'bits', width: states.length, states: [...states] }
}

/** Build a width-`width` bus from a packed integer (bits >= width are ignored). */
export function netFromNumber(width: number, value: number): BitVector {
  const states: BitState[] = []
  for (let i = 0; i < width; i++) {
    states.push(((value >> i) & 1) as Bit)
  }
  return { kind: 'bits', width, states }
}

/** Floating (disconnected) net. */
export function floatNet(): undefined {
  return undefined
}

/** Error net. */
export function errorNet(): ErrorSignal {
  return 'E' as ErrorSignal
}

/** Width of a net; 1 for scalars (undefined / 'E'). */
export function widthOf(net: NetValue): number {
  if (net !== undefined && net !== 'E' && net.kind === 'bits') return net.width
  return 1
}

/** Mask of bits that are known (0 or 1), MSB-aligned to the net width. */
export function knownMask(net: NetValue): number {
  if (net === undefined || net === 'E') return 0
  let mask = 0
  for (let i = 0; i < net.width; i++) {
    if (net.states[i] === 0 || net.states[i] === 1) mask |= 1 << i
  }
  return mask
}

/** Mask of bits that are in error. */
export function errorMask(net: NetValue): number {
  if (net === 'E') return 0xffffffff
  if (net === undefined || net.kind !== 'bits') return 0
  let mask = 0
  for (let i = 0; i < net.width; i++) {
    if (net.states[i] === 'E') mask |= 1 << i
  }
  return mask
}

/** Packed integer value when every bit is known; null if any bit is X/E. */
export function packedValue(net: NetValue): number | null {
  const bits = allBits(net)
  if (bits === null) return null
  let value = 0
  for (let i = 0; i < bits.length; i++) value |= (bits[i] as number) << i
  return value >>> 0
}

/**
 * View a net as a single bit. Used by the presentation layer which currently
 * only renders width-1 nets. Multi-bit nets collapse to the LSB only when all
 * bits agree, else to 'X' (or 'E' if any bit is in error).
 */
export function bitValue(net: NetValue): OneBitNet {
  if (net === undefined) return undefined
  if (net === 'E') return 'E'
  let value: 0 | 1 | -1 = -1 // -1 sentinel for mixed
  for (const s of net.states) {
    if (s === 'E') return 'E'
    if (s === 'X') return 'X'
    if (value === -1) value = s
    else if (value !== s) return 'X'
  }
  return value === -1 ? 'X' : value
}

/** The per-bit states of a fully known bus; null when any bit is X/E. */
export function allBits(net: NetValue): readonly Bit[] | null {
  if (net === undefined || net === 'E') return null
  if (net.states.some((s) => s === 'X' || s === 'E')) return null
  return net.states as readonly Bit[]
}

/** Structural equality. */
export function eq(a: NetValue, b: NetValue): boolean {
  if (a === b) return true
  if (a === undefined || b === undefined) return false
  if (a === 'E' || b === 'E') return a === b
  if (a.width !== b.width) return false
  for (let i = 0; i < a.width; i++) if (a.states[i] !== b.states[i]) return false
  return true
}

/** A single 0/1 bit (used where widths are 1). */
export type Bit = 0 | 1

/**
 * Evaluate a gate over a set of width-matched input nets, elementwise.
 *
 * Handle the outer circuit concerns here so the simulation loop stays small:
 *  - any floating input  → floating output (backwards compatible)
 *  - any error input     → error output
 *  - width mismatch      → error output
 *  - any unknown bit     → output bit Unknown, per bit
 *  - otherwise           → the canonical gate math for each bit column
 */
export function evaluateGateVector(
  gate: GateType,
  inputs: readonly NetValue[],
): NetValue {
  if (inputs.some((i) => i === undefined)) return undefined
  if (inputs.some((i) => i === 'E')) return 'E'
  const vectors = inputs as readonly BitVector[]
  const width = vectors[0]!.width
  if (vectors.some((v) => v.width !== width)) return 'E' as ErrorSignal

  // Controlled gates have a tri-state output: while the control is 0 the
  // output genuinely floats (high impedance), which a per-column Bit cannot
  // represent.
  if (gate === 'CON_BUF' || gate === 'CON_INV') {
    return evaluateControlledVector(gate, vectors)
  }

  const out: BitState[] = []
  for (let i = 0; i < width; i++) {
    const column = vectors.map((v) => v.states[i] as BitState)
    if (column.some((s) => s === 'E')) {
      out.push('E')
      continue
    }
    if (column.some((s) => s === 'X')) {
      out.push('X')
      continue
    }
    out.push(evaluateGate(gate, column as readonly Bit[]))
  }
  return { kind: 'bits', width, states: out }
}

/**
 * Controlled buffer / inverter: per lane the output is the (inverted) data bit
 * when the control bit is 1, else Unknown ('X', high impedance). A control bus
 * that is entirely 0 yields a fully floating output.
 */
function evaluateControlledVector(
  gate: GateType,
  vectors: readonly BitVector[],
): NetValue {
  const [data, control] = vectors
  if (data === undefined || control === undefined) return undefined
  if (data.width !== control.width) return 'E' as ErrorSignal
  if (packedValue(control) === 0) return undefined
  const out: BitState[] = []
  for (let i = 0; i < data.width; i++) {
    const c = control.states[i]
    if (c === 'E') {
      out.push('E')
      continue
    }
    if (c === 'X' || c === 0) {
      out.push('X')
      continue
    }
    const d = data.states[i]
    if (d === 'E') {
      out.push('E')
      continue
    }
    if (d === 'X') {
      out.push('X')
      continue
    }
    out.push(gate === 'CON_INV' ? ((d === 1 ? 0 : 1) as Bit) : (d as Bit))
  }
  return { kind: 'bits', width: data.width, states: out }
}

/** Human-readable string for a net. */
export function netToString(net: NetValue): string {
  if (net === undefined) return '-'
  if (net === 'E') return 'E'
  const packed = packedValue(net)
  if (packed !== null) {
    if (net.width === 1) return String(packedValue(net))
    return packed.toString()
  }
  return net.states.map((s) => (s === 'X' ? 'x' : s === 'E' ? 'E' : String(s))).join('')
}