/**
 * Undo/redo history (Layer 2 — application). Pure TypeScript orchestration for
 * the circuit designer's snapshot stack. The store owns the mutable history
 * (`past` / `future`); this module defines the snapshot shape and the pure
 * helpers that build and cap it, keeping the bookkeeping out of the store and
 * fully unit-testable without React or Zustand.
 *
 * Snapshots only cover *editable* project state — the open circuits and the
 * forced input-pin values. Ephemeral UI state (selection, tool, pan/zoom) and
 * the simulation result are intentionally excluded, matching Logisim's undo.
 */

import type { CircuitState } from '../../stores/circuitStore'

/** The bounded undo/redo stack size. */
export const HISTORY_LIMIT = 100

/**
 * A single point-in-time of the editable project. `tabs` and `inputs` are
 * captured by reference; because every store mutation produces fresh arrays
 * and objects, these references stay immutable and are safe to share.
 */
export interface ProjectSnapshot {
  readonly tabs: readonly CircuitState['tabs'][number][]
  readonly activeTabId: string
  readonly inputs: Readonly<Record<string, 0 | 1>>
}

/** Build the project snapshot of a state, excluding the history buckets themselves. */
export function snapshotOf(
  state: Pick<CircuitState, 'tabs' | 'activeTabId' | 'inputs'>,
): ProjectSnapshot {
  return {
    tabs: state.tabs,
    activeTabId: state.activeTabId,
    inputs: state.inputs,
  }
}

/**
 * Return the next `past`/`future` pair after recording a snapshot of `state`.
 * Assumes the caller is about to perform an undoable edit, so it pushes the
 * current state onto `past` and clears `future`. Defensive against undefined
 * history buckets (e.g. tests that reset the store with a bare partial).
 */
export function recordHistory(state: Pick<CircuitState, 'tabs' | 'activeTabId' | 'inputs' | 'past' | 'future'>): {
  past: ProjectSnapshot[]
  future: ProjectSnapshot[]
} {
  const past = state.past ?? []
  const next: ProjectSnapshot[] = [...past, snapshotOf(state)]
  if (next.length > HISTORY_LIMIT) next.splice(0, next.length - HISTORY_LIMIT)
  return { past: next, future: [] }
}