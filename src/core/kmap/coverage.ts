import { minterms, maxterms, type KMapModel } from './model'
import { unionCoverage, type Group } from './grouping'

/**
 * Group-coverage reasoning used to teach that grouping must cover every
 * required cell (the 1s for SOP, the 0s for POS). Reuses the model's
 * minterm/maxterm extraction and the grouping union helper.
 */

export type CoverageMode = 'sop' | 'pos'

/** The cells that MUST be covered for the given mode. */
export function requiredCells(model: KMapModel, mode: CoverageMode): number[] {
  return mode === 'sop' ? minterms(model) : maxterms(model)
}

/**
 * Required cells not covered by the union of the given groups. An empty
 * result means the selected groups cover every required cell.
 */
export function uncoveredRequired(
  model: KMapModel,
  groups: readonly Group[],
  mode: CoverageMode,
): number[] {
  const required = new Set(requiredCells(model, mode))
  const covered = unionCoverage(groups)
  return [...required].filter((m) => !covered.has(m)).sort((a, b) => a - b)
}

/** True when every required cell is covered by the provided groups. */
export function coversAllRequired(
  model: KMapModel,
  groups: readonly Group[],
  mode: CoverageMode,
): boolean {
  return uncoveredRequired(model, groups, mode).length === 0
}