import { create } from 'zustand'
import {
  createKMap,
  dontCares,
  maxterms,
  minterms,
  withValue,
  type CellValue,
  type KMapModel,
} from '../core/kmap'

/**
 * Cycle order when a student clicks a cell:
 * empty → 1 → 0 → X (don't-care) → empty.
 */
export const CYCLE_ORDER: readonly CellValue[] = [null, 1, 0, 'X'] as const

export function nextCellValue(current: CellValue): CellValue {
  const index = CYCLE_ORDER.indexOf(current)
  return CYCLE_ORDER[(index + 1) % CYCLE_ORDER.length] ?? null
}

export interface KMapState {
  variables: readonly string[]
  model: KMapModel
  setVariables: (variables: readonly string[]) => void
  setCell: (minterm: number, value: CellValue) => void
  cycleCell: (minterm: number) => void
  setTruth: (values: readonly (CellValue | undefined)[]) => void
  clear: () => void
}

export const useKMapStore = create<KMapState>((set) => {
  const model = createKMap(['A', 'B', 'C'])
  return {
    variables: ['A', 'B', 'C'],
    model,
    setVariables: (variables) => {
      const validated = variables.filter((v) => /^[A-Za-z]$/.test(v)).slice(0, 4)
      if (validated.length < 2) validated.push('A', 'B')
      const next = [...validated].slice(0, validated.length)
      set({ variables: next, model: createKMap(next) })
    },
    setCell: (minterm, value) =>
      set((state) => {
        const validMinterms = new Set(state.model.cells.flat().map((c) => c.minterm))
        if (!validMinterms.has(minterm)) return state
        return { model: withValue(state.model, minterm, value) }
      }),
    cycleCell: (minterm) =>
      set((state) => {
        const cells = state.model.cells.flat()
        const current = cells.find((c) => c.minterm === minterm)?.value
        if (current === undefined) return state
        return { model: withValue(state.model, minterm, nextCellValue(current)) }
      }),
    setTruth: (values) =>
      set((state) => {
        let next: KMapModel = createKMap([...state.variables])
        values.forEach((value, minterm) => {
          if (value !== undefined) next = withValue(next, minterm, value)
        })
        return { model: next }
      }),
    clear: () =>
      set((state) => ({ model: createKMap([...state.variables]) })),
  }
})

export interface KMapDerived {
  /** Minterms where output = 1 */
  readonly ones: readonly number[]
  /** Minterms where output = 0 */
  readonly zeros: readonly number[]
  /** Don't-care minterms. */
  readonly dontcares: readonly number[]
  /** Minterms never assigned (still empty). */
  readonly unset: readonly number[]
}

export function deriveKMap(model: KMapModel): KMapDerived {
  const assigned = new Set<number>()
  for (const cell of model.cells.flat()) {
    if (cell.value !== null) assigned.add(cell.minterm)
  }
  return {
    ones: minterms(model),
    zeros: maxterms(model),
    dontcares: dontCares(model),
    unset: model.cells.flat().map((c) => c.minterm).filter((m) => !assigned.has(m)),
  }
}