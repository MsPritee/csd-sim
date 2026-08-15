/**
 * Multi-bit arithmetic evaluators (Layer 1 — core). Pure TypeScript, no React
 * and no stores. These power the Phase-4 arithmetic library: Adder,
 * Subtractor, Comparator, Negator, Constant and the Tunnel pass-through relay.
 *
 * Semantics:
 *  - A floating (`undefined`) operand propagates floating outputs.
 *  - An error net ('E'), a width mismatch, or any unknown ('X') bit produces an
 *    error net on every affected output (a safe, displayable simplification of
 *    Logisim's per-bit X arithmetic — probes show 'E' rather than garbage).
 *  - All results are width-stable, unsigned buses.
 */

import { netFromNumber, packedValue, errorNet } from './value'
import type { Bit, BitVector, NetValue } from './value'
import { splitterNets, pullNet } from './wirelib'
import { evalPlexerComponent } from './plexers'

/** A width-1 known bit as a BitVector. */
function bitNet(bit: Bit): BitVector {
  return { kind: 'bits', width: 1, states: [bit] }
}

/** Mask for the lowest `width` bits (safe for width ≤ 16 to avoid JS shift edges). */
function mask(width: number): number {
  return width >= 31 ? 0xffffffff : (1 << width) - 1
}

/** Resolve an optional carry/borrow-in net to a bit (undefined → 0, error → null). */
function cinBit(cin: NetValue | undefined): Bit | null {
  if (cin === undefined) return 0
  if (cin === 'E') return null
  const p = packedValue(cin)
  if (p === null) return null
  return ((p & 1) as Bit)
}

/** Unsigned value of a fully-known, width-`w` net, or null on any uncertainty. */
function known(a: NetValue, w: number): number | null {
  if (a === undefined) return null
  if (a === 'E') return null
  if (a.width !== w) return null
  const p = packedValue(a)
  return p === null ? null : p
}

/** Adder: [sum (width w), carry-out (1 bit)]. */
export function addBuses(
  a: NetValue | undefined,
  b: NetValue | undefined,
  cin: NetValue | undefined,
  width: number,
): NetValue[] {
  if (a === undefined || b === undefined) return [undefined, undefined]
  const av = known(a, width)
  const bv = known(b, width)
  const ci = cinBit(cin)
  if (av === null || bv === null || ci === null) return [errorNet(), errorNet()]
  const m = mask(width)
  const total = av + bv + ci
  return [netFromNumber(width, total & m), bitNet((((total >> width) & 1) as Bit))]
}

/** Subtractor (borrow-in): [difference (width w), borrow-out (1 bit)]. */
export function subBuses(
  a: NetValue | undefined,
  b: NetValue | undefined,
  bin: NetValue | undefined,
  width: number,
): NetValue[] {
  if (a === undefined || b === undefined) return [undefined, undefined]
  const av = known(a, width)
  const bv = known(b, width)
  const biBit = cinBit(bin)
  if (av === null || bv === null || biBit === null) return [errorNet(), errorNet()]
  const m = mask(width)
  const diff = (av - bv - biBit) % (1 << width)
  const wrapped = ((diff % (1 << width)) + (1 << width)) % (1 << width)
  const borrow = av < bv + biBit ? 1 : 0
  return [netFromNumber(width, wrapped & m), bitNet(borrow as Bit)]
}

/** Two's-complement negation: [-a (width a.width)]. */
export function negateNet(a: NetValue | undefined, width: number): NetValue {
  if (a === undefined) return undefined
  const av = known(a, width)
  if (av === null) return errorNet()
  const m = mask(width)
  return netFromNumber(width, ((-av) & m))
}

/** Comparator: [gt, eq, lt] (each width 1). */
export function compareBuses(
  a: NetValue | undefined,
  b: NetValue | undefined,
  width: number,
): NetValue[] {
  if (a === undefined || b === undefined) return [undefined, undefined, undefined]
  const av = known(a, width)
  const bv = known(b, width)
  if (av === null || bv === null) return [errorNet(), errorNet(), errorNet()]
  return [bitNet((av > bv ? 1 : 0) as Bit), bitNet((av === bv ? 1 : 0) as Bit), bitNet((av < bv ? 1 : 0) as Bit)]
}

/**
 * Evaluate any Phase-4 component that is a source with output ports, returning
 * its per-output nets. Returns `null` for types this module does not own so the
 * simulator can fall through to gate / subcircuit handling.
 */
export function evalSourceComponent(
  type: string,
  attrs: Readonly<Record<string, unknown>>,
  inputs: readonly (NetValue | undefined)[],
): NetValue[] | null {
  const width = typeof attrs['width'] === 'number' ? attrs['width'] : 8
  switch (type) {
    case 'constant': {
      const value = typeof attrs['value'] === 'number' ? attrs['value'] : 0
      return [netFromNumber(width, value & mask(width))]
    }
    case 'tunnel':
      return [inputs[0] ?? undefined]
    case 'adder':
      return addBuses(inputs[0], inputs[1], inputs[2], width)
    case 'subtractor':
      return subBuses(inputs[0], inputs[1], inputs[2], width)
    case 'comparator':
      return compareBuses(inputs[0], inputs[1], width)
    case 'negator':
      return [negateNet(inputs[0], width)]
    case 'splitter': {
      const fanOut = typeof attrs['fanOut'] === 'number' ? attrs['fanOut'] : 8
      return splitterNets(inputs, width, fanOut)
    }
    case 'pull': {
      const pull = (attrs['pull'] as number) === 0 ? 0 : 1
      return [pullNet(inputs[0], pull)]
    }
    case 'mux':
    case 'demux':
    case 'decoder':
    case 'encoder':
    case 'priority_encoder':
    case 'bit_selector':
      return evalPlexerComponent(type, attrs, inputs)
    default:
      return null
  }
}