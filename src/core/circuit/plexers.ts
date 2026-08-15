/**
 * Plexer evaluators (Layer 1 — core). Pure TypeScript, no React, no stores.
 * Phase 6 adds the Plexers library: Multiplexer, Demultiplexer, Decoder,
 * Encoder, Priority Encoder and Bit Selector. All are combinational and
 * width-aware over `BitVector` nets.
 *
 * Port conventions (all inputs drive `in:0..in:N-1`, all outputs `out:0..`):
 *  - mux:  inputs = [data0..dataN-1, select], output = chosen data bus.
 *  - demux: inputs = [data, select], outputs = N copies (selected= data).
 *  - decoder: input = [select], outputs = 2^s one-hot lines (width 1).
 *  - encoder: inputs = [line0..lineN-1], output = binary index (lowest set wins).
 *  - priority_encoder: inputs = [line0..lineN-1], outputs = [index, group-valid].
 *  - bit_selector: inputs = [data, select], output = a contiguous group slice.
 *
 * Error/unknown behaviour mirrors the arithmetic library: a floating select or
 * data propagates floating, an error or unknown bit yields an error net.
 */

import { netFromNumber, netFromBits, errorNet, packedValue } from './value'
import type { NetValue } from './value'

/** Smallest `s` with `2^s >= n` (number of select/address lines for `n` options). */
export function selectBits(options: number): number {
  let s = 0
  let p = 1
  while (p < options) {
    p *= 2
    s++
  }
  return s
}

/** A width-1 known bit as a BitVector. */
function bitNet(bit: 0 | 1): NetValue {
  return netFromBits([bit])
}

/** A zero bus of width `w`. */
function zeroNet(w: number): NetValue {
  return netFromNumber(w, 0)
}

/**
 * Resolve a select net to an integer. Returns `undefined` when the select is
 * floating, and `null` when it is in error, unknown, or has no single value.
 */
function selectValue(sel: NetValue | undefined): number | null | undefined {
  if (sel === undefined) return undefined
  if (sel === 'E') return null
  const v = packedValue(sel)
  return v
}

/** Read a width-1 line as 0/1; `null` on unknown/error, `0` when floating. */
function lineBit(net: NetValue | undefined): 0 | 1 | null {
  if (net === undefined) return 0
  if (net === 'E') return null
  const v = packedValue(net)
  if (v === null) return null
  return (v & 1) as 0 | 1
}

/** Multiplexer: N data buses + select; picks the chosen data bus. */
export function muxOutputs(
  ins: readonly (NetValue | undefined)[],
  dataCount: number,
): NetValue[] {
  const selVal = selectValue(ins[dataCount])
  if (selVal === null) return [errorNet()]
  if (selVal === undefined) return [undefined]
  const idx = selVal >= dataCount ? dataCount - 1 : selVal
  return [ins[idx] ?? undefined]
}

/** Demultiplexer: one data bus + select; routes it to the chosen output, 0 elsewhere. */
export function demuxOutputs(
  ins: readonly (NetValue | undefined)[],
  dataCount: number,
  width: number,
): NetValue[] {
  const data = ins[0]
  const zeros = Array.from({ length: dataCount }, () => zeroNet(width))
  const selVal = selectValue(ins[1])
  if (selVal === null) return Array<NetValue>(dataCount).fill(errorNet())
  if (selVal === undefined) return Array<NetValue>(dataCount).fill(undefined)
  if (selVal < dataCount) zeros[selVal] = data ?? undefined
  return zeros
}

/** Decoder: select; one-hot line for the selected index, 0 elsewhere. */
export function decoderOutputs(
  ins: readonly (NetValue | undefined)[],
  selBits: number,
): NetValue[] {
  const outCount = 2 ** selBits
  const ones = Array.from({ length: outCount }, () => bitNet(0))
  const selVal = selectValue(ins[0])
  if (selVal === null || selVal === undefined) {
    const missing = selVal === undefined
    return Array<NetValue>(outCount).fill(missing ? undefined : errorNet())
  }
  if (selVal < outCount) ones[selVal] = bitNet(1)
  return ones
}

/**
 * Encoder: index of the *lowest* set input line, 0 when none are set.
 * (A deterministic resolution of Logisim's multi-high "undefined" case.)
 */
export function encoderOutputs(
  ins: readonly (NetValue | undefined)[],
  count: number,
): NetValue[] {
  const outW = selectBits(count)
  let value = 0
  for (let i = 0; i < count; i++) {
    const bit = lineBit(ins[i])
    if (bit === null) return [errorNet()]
    if (bit === 1) {
      value = i
      break
    }
  }
  return [netFromNumber(outW, value)]
}

/** Priority Encoder: index of the *highest* set input line plus a group-valid flag. */
export function priorityEncoderOutputs(
  ins: readonly (NetValue | undefined)[],
  count: number,
): NetValue[] {
  const outW = selectBits(count)
  let index = 0
  let group = 0
  for (let i = count - 1; i >= 0; i--) {
    const bit = lineBit(ins[i])
    if (bit === null) return [errorNet(), errorNet()]
    if (bit === 1) {
      index = i
      group = 1
      break
    }
  }
  return [netFromNumber(outW, index), bitNet(group as 0 | 1)]
}

/** Bit Selector: extract the `groupWidth`-bit group chosen by select from a bus. */
export function bitSelectorOutputs(
  ins: readonly (NetValue | undefined)[],
  width: number,
  groupWidth: number,
): NetValue[] {
  const data = ins[0]
  if (data === undefined) return [undefined]
  if (data === 'E') return [errorNet()]
  if (data.width !== width) return [errorNet()]
  const groups = Math.ceil(width / groupWidth)
  const selVal = selectValue(ins[1])
  if (selVal === null) return [errorNet()]
  if (selVal === undefined) return [undefined]
  if (selVal < 0 || selVal >= groups) return [zeroNet(groupWidth)]
  const states = data.states.slice(selVal * groupWidth, selVal * groupWidth + groupWidth)
  while (states.length < groupWidth) states.push(0)
  return [netFromBits(states)]
}

/** Read a width-1 line as 0/1; `null` on unknown/error, `0` when floating. */

/**
 * Dispatcher for the Phase-6 Plexers library. Returns `null` for types this
 * module does not own so the simulator can fall through to other handling.
 */
export function evalPlexerComponent(
  type: string,
  attrs: Readonly<Record<string, unknown>>,
  inputs: readonly (NetValue | undefined)[],
): NetValue[] | null {
  const width = typeof attrs['width'] === 'number' ? attrs['width'] : 1
  switch (type) {
    case 'mux': {
      const dataCount = typeof attrs['dataCount'] === 'number' ? attrs['dataCount'] : 2
      return muxOutputs(inputs, dataCount)
    }
    case 'demux': {
      const dataCount = typeof attrs['dataCount'] === 'number' ? attrs['dataCount'] : 2
      return demuxOutputs(inputs, dataCount, width)
    }
    case 'decoder': {
      const selBits = typeof attrs['selBits'] === 'number' ? attrs['selBits'] : 2
      return decoderOutputs(inputs, selBits)
    }
    case 'encoder': {
      const count = typeof attrs['dataCount'] === 'number' ? attrs['dataCount'] : 4
      return encoderOutputs(inputs, count)
    }
    case 'priority_encoder': {
      const count = typeof attrs['dataCount'] === 'number' ? attrs['dataCount'] : 4
      return priorityEncoderOutputs(inputs, count)
    }
    case 'bit_selector': {
      const groupWidth = typeof attrs['groupWidth'] === 'number' ? attrs['groupWidth'] : 1
      return bitSelectorOutputs(inputs, width, groupWidth)
    }
    default:
      return null
  }
}