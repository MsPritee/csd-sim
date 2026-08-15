/**
 * Core gate engine types. Pure TypeScript — no React, no Zustand, no UI.
 * These types describe logic gates, their laws metadata, and their inputs so
 * the presentation / educational / application layers all share one source.
 */

/** A single binary input or output bit. */
export type Bit = 0 | 1

/** Canonical set of gates supported by the engine. */
export type GateType =
  | 'BUFFER'
  | 'NOT'
  | 'AND'
  | 'NAND'
  | 'OR'
  | 'NOR'
  | 'XOR'
  | 'XNOR'
  | 'CON_BUF'
  | 'CON_INV'
  | 'ODD_PARITY'
  | 'EVEN_PARITY'

/** Human-readable role a gate plays for its output. */
export type GateRole = 'identity' | 'invert' | 'relation'

/**
 * Static, framework-independent specification of a gate. A `GateDefinition`
 * never holds state; all behavior is derived from it at call time.
 */
export interface GateDefinition {
  /** Stable id, also used by `evaluateGate`. */
  readonly id: GateType
  /** Display name, e.g. "AND gate". */
  readonly name: string
  /** Short display symbol, e.g. "&" (BUFFER/NOT are drawings, not math). */
  readonly symbol: string
  /** A readable, markdown-safe Boolean expression, e.g. "A · B". */
  readonly booleanExpression: string
  /** One-line plain-English use, e.g. "1 only when all inputs are 1". */
  readonly description: string
  /** Role class used by education/content layers. */
  readonly role: GateRole
  /** Minimum supported input count (1 for BUFFER/NOT, else 2). */
  readonly minInputs: number
  /** Maximum supported input count. */
  readonly maxInputs: number
  /** Whether input order never changes the output (AND/OR/XOR... are). */
  readonly commutative: boolean
  /** The gate whose output is the inverse of this gate's (AND→NAND, etc.). */
  readonly complementaryOf: GateType | null
  /** Identity element for this gate (null where it has none). */
  readonly identity: Bit | null
}