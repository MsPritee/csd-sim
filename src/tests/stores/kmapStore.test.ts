import { describe, it, beforeEach, expect } from 'vitest'
import { useKMapStore } from '../../stores/kmapStore'

function valueAt(minterm: number): 0 | 1 | 'X' | null {
  return useKMapStore.getState().model.cells.flat().find((c) => c.minterm === minterm)?.value ?? null
}

describe('kmapStore variable names', () => {
  beforeEach(() => {
    useKMapStore.getState().setVariables(['A', 'B', 'C'])
  })

  it('applies custom variable names to the store and model', () => {
    useKMapStore.getState().setVariables(['X', 'Y', 'Z'])
    const { variables, model } = useKMapStore.getState()
    expect(variables).toEqual(['X', 'Y', 'Z'])
    expect(model.layout.variables).toEqual(['X', 'Y', 'Z'])
  })

  it('preserves entered cell values when renaming within the same count', () => {
    useKMapStore.getState().setCell(3, 1)
    useKMapStore.getState().setCell(5, 'X')

    useKMapStore.getState().setVariables(['X', 'Y', 'Z'])
    expect(valueAt(3)).toBe(1)
    expect(valueAt(5)).toBe('X')
  })

  it('keeps custom names when the variable count grows', () => {
    useKMapStore.getState().setVariables(['X', 'Y', 'P'])
    useKMapStore.getState().setVariables(['X', 'Y', 'P', 'D'])
    expect(useKMapStore.getState().variables).toEqual(['X', 'Y', 'P', 'D'])
  })

  it('maps cell values by bit shift when shrinking 4 -> 3', () => {
    useKMapStore.getState().setVariables(['A', 'B', 'C', 'D'])
    useKMapStore.getState().setCell(8, 1)

    useKMapStore.getState().setVariables(['A', 'B', 'C'])
    expect(useKMapStore.getState().variables).toEqual(['A', 'B', 'C'])
    expect(valueAt(4)).toBe(1) // 8 >> 1
  })

  it('maps cell values by bit shift when growing 3 -> 4', () => {
    useKMapStore.getState().setVariables(['A', 'B', 'C'])
    useKMapStore.getState().setCell(2, 1)

    useKMapStore.getState().setVariables(['A', 'B', 'C', 'D'])
    expect(useKMapStore.getState().variables).toEqual(['A', 'B', 'C', 'D'])
    expect(valueAt(4)).toBe(1) // 2 << 1
  })

  it('clears the selection whenever the variables change', () => {
    useKMapStore.getState().setSelectedCells(new Set([1, 3]))
    useKMapStore.getState().setVariables(['X', 'Y', 'Z'])
    expect(useKMapStore.getState().selectedCells.size).toBe(0)
  })
})