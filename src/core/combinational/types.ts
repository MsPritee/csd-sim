import type { Bit } from '../gates/types'

/** Shared result shapes for the combinational building blocks (LG-09). */

export interface HalfAdderResult {
  readonly sum: Bit
  readonly carry: Bit
}

export interface FullAdderResult {
  readonly sum: Bit
  readonly carry: Bit
}

export interface AdderResult {
  /** Sum bits, LSB-first (bit 0 is the least significant). Same order as the inputs. */
  readonly sum: readonly Bit[]
  readonly carryOut: Bit
}