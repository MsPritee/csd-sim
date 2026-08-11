import { create } from 'zustand'
import {
  createKMapWithVariables,
  setCellValue,
  cycleCellValue,
  setFromTruthTable,
  deriveKMapValues,
} from '../application/kmap'
import {
  type KMapModel,
  type CellValue,
} from '../core/kmap'
import { type KMapMode } from '../application/kmap'

// Re-export types that components need
export type { CellValue } from '../core/kmap'
export type { KMapMode } from '../application/kmap'

/**
 * Application/session state for K-map simulator.
 * This store focuses on UI state and orchestration, not mathematical logic.
 */
export interface KMapState {
  /** Current variable names */
  variables: readonly string[]
  /** Current K-map model */
  model: KMapModel
  /** Current simulator mode */
  mode: KMapMode
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
  /** Current learning step ID */
  currentStepId: string | null
  /** Current hint level */
  hintLevel: number
  
  // Actions
  setVariables: (variables: readonly string[]) => void
  setModel: (model: KMapModel) => void
  setCell: (minterm: number, value: CellValue) => void
  cycleCell: (minterm: number) => void
  setTruth: (values: readonly (CellValue | undefined)[]) => void
  clear: () => void
  setMode: (mode: KMapMode) => void
  setSelectedCells: (cells: Set<number>) => void
  setCurrentValue: (value: CellValue) => void
  setShowSOP: (show: boolean) => void
  setShowMintermNumbers: (show: boolean) => void
  setHoveredCell: (minterm: number | null) => void
  setCurrentStepId: (stepId: string | null) => void
  setHintLevel: (level: number) => void
}

export const useKMapStore = create<KMapState>((set) => {
  const model = createKMapWithVariables(['A', 'B', 'C'])
  return {
    variables: ['A', 'B', 'C'],
    model,
    mode: 'explore',
    selectedCells: new Set(),
    currentValue: 1,
    showSOP: true,
    showMintermNumbers: true,
    hoveredCell: null,
    currentStepId: null,
    hintLevel: 0,
    
    setVariables: (variables) => {
      const next = createKMapWithVariables(variables)
      set({ variables: next.layout.variables, model: next, selectedCells: new Set() })
    },
    
    setModel: (model) => set({ model }),
    
    setCell: (minterm, value) =>
      set((state) => ({
        model: setCellValue(state.model, minterm, value),
      })),
    
    cycleCell: (minterm) =>
      set((state) => ({
        model: cycleCellValue(state.model, minterm),
      })),
    
    setTruth: (values) =>
      set((state) => ({
        model: setFromTruthTable(state.model, values),
      })),
    
    clear: () =>
      set((state) => ({
        model: createKMapWithVariables(state.variables),
        selectedCells: new Set(),
      })),
    
    setMode: (mode) => set({ mode, selectedCells: new Set() }),
    
    setSelectedCells: (cells) => set({ selectedCells: cells }),
    
    setCurrentValue: (value) => set({ currentValue: value }),
    
    setShowSOP: (show) => set({ showSOP: show }),
    
    setShowMintermNumbers: (show) => set({ showMintermNumbers: show }),
    
    setHoveredCell: (minterm) => set({ hoveredCell: minterm }),
    
    setCurrentStepId: (stepId) => set({ currentStepId: stepId }),
    
    setHintLevel: (level) => set({ hintLevel: level }),
  }
})

/**
 * Derived computed values from K-map state.
 * This is kept separate from the store to avoid computed value caching issues.
 */
export function deriveKMapState(state: KMapState) {
  const derived = deriveKMapValues(state.model)
  return {
    ones: derived.ones,
    zeros: derived.zeros,
    dontcares: derived.dontcares,
    unset: derived.unset,
  }
}