import { create } from 'zustand'
import {
  createKMapWithVariables,
  setCellValue,
} from '../application/kmap'
import {
  type KMapModel,
  type CellValue,
} from '../core/kmap'

// Re-export types that components need
export type { CellValue } from '../core/kmap'

/**
 * Application/session state for K-map simulator.
 * This store focuses on UI state and orchestration, not mathematical logic.
 */
export interface KMapState {
  /** Current variable names */
  variables: readonly string[]
  /** Current K-map model */
  model: KMapModel
  /** Currently selected cells for grouping */
  selectedCells: Set<number>
  /** Current cell value for painting */
  currentValue: CellValue
  /** Whether to show SOP or POS */
  showSOP: boolean
  /** Whether to show cell minterm numbers */
  showMintermNumbers: boolean
  /** Currently hovered cell */
  hoveredCell: number | null

  // Actions
  setVariables: (variables: readonly string[]) => void
  setModel: (model: KMapModel) => void
  setCell: (minterm: number, value: CellValue) => void
  clear: () => void
  setSelectedCells: (cells: Set<number>) => void
  setCurrentValue: (value: CellValue) => void
  setShowSOP: (show: boolean) => void
  setShowMintermNumbers: (show: boolean) => void
  setHoveredCell: (minterm: number | null) => void
}

export const useKMapStore = create<KMapState>((set) => {
  const model = createKMapWithVariables(['A', 'B', 'C'])
  return {
    variables: ['A', 'B', 'C'],
    model,
    selectedCells: new Set(),
    currentValue: 1,
    showSOP: true,
    showMintermNumbers: true,
    hoveredCell: null,

    setVariables: (variables) => {
      const next = createKMapWithVariables(variables)
      set({ variables: next.layout.variables, model: next, selectedCells: new Set() })
    },

    setModel: (model) => set({ model }),

    setCell: (minterm, value) =>
      set((state) => ({
        model: setCellValue(state.model, minterm, value),
      })),

    clear: () =>
      set((state) => ({
        model: createKMapWithVariables(state.variables),
        selectedCells: new Set(),
      })),

    setSelectedCells: (cells) => set({ selectedCells: cells }),

    setCurrentValue: (value) => set({ currentValue: value }),

    setShowSOP: (show) => set({ showSOP: show }),

    setShowMintermNumbers: (show) => set({ showMintermNumbers: show }),

    setHoveredCell: (minterm) => set({ hoveredCell: minterm }),
  }
})