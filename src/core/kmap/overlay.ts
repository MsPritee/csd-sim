import type { KMapModel } from './model'

/**
 * Mapping from a cell's minterm to the indices (within `groups`) of the
 * groups that contain it. Useful for coloring or focusing SVG cells.
 */
export type GroupHighlightMap = ReadonlyMap<number, readonly number[]>

/**
 * Build a cell → group-indices map for the given groups. Only cells that
 * actually exist within the model are included; out-of-range minterms are
 * ignored. A cell appearing in several groups lists all of them.
 */
export function groupsToHighlight(
  model: KMapModel,
  groups: readonly (readonly number[])[],
): GroupHighlightMap {
  const totalCells = model.layout.rows * model.layout.cols
  const result = new Map<number, number[]>()

  groups.forEach((group, index) => {
    for (const minterm of new Set(group)) {
      if (minterm < 0 || minterm >= totalCells) continue
      const entry = result.get(minterm)
      if (entry) {
        entry.push(index)
      } else {
        result.set(minterm, [index])
      }
    }
  })

  return result
}