/**
 * Memory elements (Layer 1 — core). Pure TypeScript, no React, no stores.
 *
 * Phase 7 implements the Memory library: edge-triggered flip-flops (JK, T,
 * SR), a multi-bit Register, an up/down Counter, and stored RAM / ROM. There
 * are two halves:
 *
 *  - `evalMemoryRead(state, id, type, attrs, ins, width)` — the *combinational*
 *    view used by `propagate`: it spills each element's stored value (and the
 *    RAM/ROM word currently addressed) onto its output port(s).
 *  - `memTick(type, attrs, current, ram, ins, width)` — the *edge-triggered*
 *    advance used by `tick`: on the rising clock edge it loads a flip-flop,
 *    loads a register, steps a counter, or writes RAM; otherwise it holds.
 *
 * Unknown / error / floating inputs act as "don't touch": the element holds its
 * previous value rather than collapsing to a spurious 0 (a safe, displayable
 * simplification). All sequential behaviour is edge-triggered on the clock.
 */

import type { Bit, BitVector, NetValue } from './value'
import { netFromNumber, packedValue } from './value'
import type { MemState, RamState, SimState } from './state'
import { attrNumber } from './descriptors'
import type { AttrValue } from './descriptors'
import type { ComponentId } from './types'

/** Attribute bag for a memory instance (matches the component schema). */
type MemAttrs = Readonly<Record<string, AttrValue>>

/** Mask for the lowest `width` bits (avoid JS shift edges above 31). */
function mask(width: number): number {
  return width >= 31 ? 0xffffffff : (1 << width) - 1
}

function bitNet(bit: Bit): BitVector {
  return { kind: 'bits', width: 1, states: [bit] }
}

/** True for the memory element types Phase 7 introduces. */
export function isMemoryType(type: string): boolean {
  return (
    type === 'jk' ||
    type === 't' ||
    type === 'sr' ||
    type === 'register' ||
    type === 'counter' ||
    type === 'ram' ||
    type === 'rom'
  )
}

/** Number of addressable words from an `addrBits` schema. */
export function memLen(addrBits: number): number {
  return 2 ** Math.max(0, Math.min(addrBits, 31))
}

/**
 * Build the initial word array for a RAM/ROM. Empty words default to 0; an
 * optional `content` attribute (comma/space-separated decimal words) seeds the
 * array so a ROM can be shipped with preset data.
 */
export function initialRam(
  attrs: MemAttrs,
  width: number,
  addrBits: number,
): RamState {
  const len = memLen(addrBits)
  const raw = typeof attrs['content'] === 'string' ? (attrs['content'] as string) : ''
  const words = raw
    .split(/[,\s]+/)
    .filter((s) => s.length > 0)
    .map((s) => parseInt(s, 10))
  const data: number[] = []
  for (let i = 0; i < len; i++) data.push((words[i] ?? 0) & mask(width))
  return { data, width, addrBits, clkPrev: 0 }
}

/** Whether the clock net is a clean rising edge (0 → 1). */
function rising(clkPrev: Bit | undefined, clk: number | null): boolean {
  return (clkPrev ?? 0) === 0 && clk === 1
}

/** The next tracked clock level from a (possibly unknown) clock bus. */
function clkNow(clk: number | null, prev: Bit | undefined): Bit {
  if (clk === 0 || clk === 1) return clk as Bit
  return prev ?? 0
}

/**
 * Combinational read of a memory element's current output(s) from `state`.
 * Returns `null` when the type is not a Phase-7 memory element.
 */
export function evalMemoryRead(
  state: SimState,
  id: ComponentId,
  type: string,
  attrs: MemAttrs,
  ins: readonly (NetValue | undefined)[],
  width: number,
): NetValue[] | null {
  switch (type) {
    case 'jk':
    case 't':
    case 'sr': {
      const q = (state.mem.get(id)?.value ?? 0) as Bit
      return [bitNet(q), bitNet(q === 1 ? 0 : 1)]
    }
    case 'register':
    case 'counter': {
      const v = state.mem.get(id)?.value ?? 0
      return [netFromNumber(width, v & mask(width))]
    }
    case 'ram':
    case 'rom': {
      const addrBits = attrNumber(attrs, 'addrBits', 4)
      const cur = state.ram.get(id) ?? initialRam(attrs, width, addrBits)
      const a = packedValue(ins[0])
      if (a === undefined || a === null) {
        if (ins[0] === undefined) return [undefined]
        return [netFromNumber(width, 0) as NetValue]
      }
      if (a < cur.data.length) return [netFromNumber(width, cur.data[a] & mask(width))]
      return [netFromNumber(width, 0) as NetValue]
    }
    default:
      return null
  }
}

/**
 * Advance an edge-triggered memory element one tick given its packed input
 * values (port order; `null` = unknown / error / floating). Returns the next
 * `MemState` and/or `RamState`, or `null` when the type is not a memory
 * element (ROM included — it is read-only so never mutates).
 */
export function memTick(
  type: string,
  attrs: MemAttrs,
  mem: MemState | undefined,
  ram: RamState | undefined,
  ins: readonly (number | null)[],
  width: number,
): { nextMem?: MemState; nextRam?: RamState } | null {
  switch (type) {
    case 'jk': {
      const clk = ins[2]
      const held: MemState = {
        value: mem?.value ?? 0,
        clkPrev: clkNow(clk, mem?.clkPrev),
      }
      if (!rising(mem?.clkPrev, clk)) return { nextMem: held }
      const j = ins[0]
      const k = ins[1]
      let q = mem?.value ?? 0
      if (j === 1 && k === 0) q = 1
      else if (j === 0 && k === 1) q = 0
      else if (j === 1 && k === 1) q = q === 1 ? 0 : 1
      return { nextMem: { value: q, clkPrev: held.clkPrev } }
    }
    case 't': {
      const clk = ins[1]
      const held: MemState = {
        value: mem?.value ?? 0,
        clkPrev: clkNow(clk, mem?.clkPrev),
      }
      if (rising(mem?.clkPrev, clk) && ins[0] === 1) {
        const q = ((mem?.value ?? 0) === 1 ? 0 : 1) as Bit
        return { nextMem: { value: q, clkPrev: held.clkPrev } }
      }
      return { nextMem: held }
    }
    case 'sr': {
      const clk = ins[2]
      const held: MemState = {
        value: mem?.value ?? 0,
        clkPrev: clkNow(clk, mem?.clkPrev),
      }
      if (!rising(mem?.clkPrev, clk)) return { nextMem: held }
      const s = ins[0]
      const r = ins[1]
      let q = mem?.value ?? 0
      if (s === 1 && r === 0) q = 1
      else if (s === 0 && r === 1) q = 0
      // s=0,r=0 holds; s=1,r=1 is illegal/undefined → keep the previous value.
      return { nextMem: { value: q, clkPrev: held.clkPrev } }
    }
    case 'register': {
      const clk = ins[1]
      const d = ins[0]
      const held: MemState = {
        value: mem?.value ?? 0,
        clkPrev: clkNow(clk, mem?.clkPrev),
      }
      if (!rising(mem?.clkPrev, clk) || d === null) return { nextMem: held }
      return { nextMem: { value: d & mask(width), clkPrev: held.clkPrev } }
    }
    case 'counter': {
      const clk = ins[0]
      const en = ins[1]
      const dir = attrNumber(attrs, 'direction', 1)
      const held: MemState = {
        value: mem?.value ?? 0,
        clkPrev: clkNow(clk, mem?.clkPrev),
      }
      if (rising(mem?.clkPrev, clk) && en === 1) {
        const cur = mem?.value ?? 0
        const next = (cur + (dir === 0 ? -1 : 1)) & mask(width)
        return { nextMem: { value: next, clkPrev: held.clkPrev } }
      }
      return { nextMem: held }
    }
    case 'ram': {
      const clk = ins[3]
      const a = ins[0]
      const d = ins[1]
      const we = ins[2]
      const addrBits = attrNumber(attrs, 'addrBits', 4)
      const cur = ram ?? initialRam(attrs, width, addrBits)
      const data = [...cur.data]
      const next: RamState = { data, width, addrBits, clkPrev: clkNow(clk, cur.clkPrev) }
      if (rising(cur.clkPrev, clk) && we === 1 && a !== null && d !== null && a < data.length) {
        data[a] = d & mask(width)
      }
      return { nextRam: next }
    }
    case 'rom':
      return null
    default:
      return null
  }
}