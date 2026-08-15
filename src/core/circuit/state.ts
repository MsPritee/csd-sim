/**
 * Sequential (stateful) circuit support. Pure TypeScript — no UI.
 *
 * Phase 0 introduces the *state model* and a tick-driven `tick()` API so that
 * memory elements can be added later. The single sequential proof-of-concept
 * shipped here is a minimal D flip-flop (D and CLK in; Q and Q-bar out), which
 * validates the whole mechanism: persistent per-component state, rising-edge
 * capture on a clock, and (crucially) legal sequential feedback that must NOT
 * be reported as a combinational oscillation.
 */

import type { Bit } from './value'
import type { ComponentId } from './types'

/** Per-component persistent state for a D flip-flop. */
export interface DffState {
  readonly q: Bit
  readonly clkPrev: Bit
}

/**
 * Persistent state of an edge-triggered memory element (JK / T / SR
 * flip-flops, Register, Counter): a packed `value` plus the last observed
 * clock level used to detect rising edges.
 */
export interface MemState {
  readonly value: number
  readonly clkPrev: Bit
}

/**
 * Persistent state of a stored memory (RAM / ROM): the word array plus the
 * last clock level (RAM writes are edge-triggered). ROM keeps its array
 * read-only but uses the same container for a uniform engine.
 */
export interface RamState {
  readonly data: readonly number[]
  readonly width: number
  readonly addrBits: number
  readonly clkPrev: Bit
}

/** The whole simulator's persistent state keyed by component id. */
export interface SimState {
  readonly dff: ReadonlyMap<ComponentId, DffState>
  /** Current output level (0/1) of every clock component. */
  readonly clock: ReadonlyMap<ComponentId, Bit>
  /** Edge-triggered flip-flop / register / counter state. */
  readonly mem: ReadonlyMap<ComponentId, MemState>
  /** Stored word arrays for RAM / ROM. */
  readonly ram: ReadonlyMap<ComponentId, RamState>
}

/** An empty default state (all flip-flops reset to 0, clocks low). */
export function emptyState(): SimState {
  return { dff: new Map(), clock: new Map(), mem: new Map(), ram: new Map() }
}

/** Current D flip-flop output value (defaults to 0 when uninitialised). */
export function dffOutput(state: SimState, id: ComponentId): Bit {
  return state.dff.get(id)?.q ?? 0
}

/**
 * Advance a D flip-flop for one tick given its wired D and CLK inputs.
 * On the rising edge of CLK the output samples D; otherwise Q holds. Returns a
 * fresh DffState.
 */
export function dffTick(
  current: DffState | undefined,
  d: Bit | undefined,
  clk: Bit | undefined,
): DffState {
  const clkPrev = current?.clkPrev ?? 0
  const clkNow = clk ?? 0
  const rising = clkPrev === 0 && clkNow === 1
  const q = rising && d !== undefined ? d : (current?.q ?? 0)
  return { q, clkPrev: clkNow }
}

/** Current clock output level (defaults to 0 / low when uninitialised). */
export function clockOutput(state: SimState, id: ComponentId): Bit {
  return state.clock.get(id) ?? 0
}

/** Advance a clock one tick: toggles high/low each step (a free-running square wave). */
export function clockTick(current: Bit | undefined): Bit {
  return current === 1 ? 0 : 1
}