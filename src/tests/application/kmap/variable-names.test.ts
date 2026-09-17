import { describe, it, expect } from 'vitest'
import {
  validateVariableNames,
  adjustVariablesToCount,
  renameKMapVariables,
  performSimplification,
} from '../../../application/kmap'
import { createKMap, withValue } from '../../../core/kmap'

function cellValue(model: { cells: readonly (readonly { minterm: number; value: 0 | 1 | 'X' | null }[])[] }, minterm: number) {
  return model.cells.flat().find((c) => c.minterm === minterm)?.value ?? null
}

describe('validateVariableNames', () => {
  it('accepts valid custom single-letter names', () => {
    const result = validateVariableNames(['X', 'Y', 'P'])
    expect(result.valid).toBe(true)
    expect(result.names).toEqual(['X', 'Y', 'P'])
    expect(result.issues).toEqual([])
  })

  it('accepts the default presets', () => {
    expect(validateVariableNames(['A', 'B']).valid).toBe(true)
    expect(validateVariableNames(['A', 'B', 'C', 'D']).valid).toBe(true)
    expect(validateVariableNames(['A', 'B', 'C', 'D', 'E']).valid).toBe(true)
  })

  it('trims surrounding whitespace', () => {
    const result = validateVariableNames([' A ', 'B', 'C '])
    expect(result.valid).toBe(true)
    expect(result.names).toEqual(['A', 'B', 'C'])
  })

  it('rejects empty names', () => {
    const result = validateVariableNames(['', 'B'])
    expect(result.valid).toBe(false)
    expect(result.issues[0]?.message).toContain('cannot be empty')
    expect(result.issues[0]?.index).toBe(0)
  })

  it('rejects whitespace-only names', () => {
    const result = validateVariableNames(['   ', 'B'])
    expect(result.valid).toBe(false)
    expect(result.issues.some((i) => i.message.includes('cannot be empty'))).toBe(true)
  })

  it('rejects multi-character names (expression engine restriction)', () => {
    const result = validateVariableNames(['AB', 'B'])
    expect(result.valid).toBe(false)
    expect(result.issues[0]?.message).toContain('single letter')
  })

  it('rejects digits and special characters', () => {
    expect(validateVariableNames(['1', 'B']).valid).toBe(false)
    expect(validateVariableNames(['A!', 'B']).valid).toBe(false)
    expect(validateVariableNames(['A-1', 'B']).valid).toBe(false)
  })

  it('rejects exact duplicates', () => {
    const result = validateVariableNames(['A', 'A'])
    expect(result.valid).toBe(false)
    expect(result.issues[0]?.message).toContain('already used by Variable 1')
  })

  it('rejects case-insensitive duplicates (ambiguous A/a)', () => {
    const result = validateVariableNames(['A', 'a'])
    expect(result.valid).toBe(false)
    expect(result.issues[0]?.message).toContain('already used by Variable 1')
  })

  it('reports multiple distinct issues', () => {
    const result = validateVariableNames(['', 'B', 'B', 'CD'])
    expect(result.valid).toBe(false)
    expect(result.issues.length).toBeGreaterThanOrEqual(3)
  })

  it('rejects fewer than 2 variables', () => {
    const result = validateVariableNames(['X'])
    expect(result.valid).toBe(false)
    expect(result.issues.some((i) => i.message.includes('at least 2 variables'))).toBe(true)
  })

  it('rejects more than 5 variables', () => {
    const result = validateVariableNames(['A', 'B', 'C', 'D', 'E', 'F'])
    expect(result.valid).toBe(false)
    expect(result.issues.some((i) => i.message.includes('at most 5 variables'))).toBe(true)
  })

  it('does not mutate the input array', () => {
    const input = ['A', 'B', 'C']
    validateVariableNames(input)
    expect(input).toEqual(['A', 'B', 'C'])
  })
})

describe('adjustVariablesToCount', () => {
  it('reproduces default names when growing (2 -> 3 -> 4 -> 5)', () => {
    expect(adjustVariablesToCount(['A', 'B'], 3)).toEqual(['A', 'B', 'C'])
    expect(adjustVariablesToCount(['A', 'B', 'C'], 4)).toEqual(['A', 'B', 'C', 'D'])
    expect(adjustVariablesToCount(['A', 'B', 'C', 'D'], 5)).toEqual(['A', 'B', 'C', 'D', 'E'])
  })

  it('removes trailing variables cleanly when shrinking (4 -> 3 -> 2)', () => {
    expect(adjustVariablesToCount(['A', 'B', 'C', 'D'], 3)).toEqual(['A', 'B', 'C'])
    expect(adjustVariablesToCount(['A', 'B', 'C'], 2)).toEqual(['A', 'B'])
    expect(adjustVariablesToCount(['A', 'B', 'C', 'D', 'E'], 2)).toEqual(['A', 'B'])
  })

  it('preserves custom names when growing and adds a sensible default', () => {
    expect(adjustVariablesToCount(['X', 'Y', 'P'], 4)).toEqual(['X', 'Y', 'P', 'D'])
    expect(adjustVariablesToCount(['X', 'Y'], 3)).toEqual(['X', 'Y', 'C'])
  })

  it('skips the positional default when it is already used', () => {
    expect(adjustVariablesToCount(['X', 'Y', 'D'], 4)).toEqual(['X', 'Y', 'D', 'A'])
  })

  it('preserves custom names when shrinking', () => {
    expect(adjustVariablesToCount(['X', 'Y', 'P', 'Z'], 3)).toEqual(['X', 'Y', 'P'])
  })

  it('grows from an empty list to the defaults', () => {
    expect(adjustVariablesToCount([], 3)).toEqual(['A', 'B', 'C'])
  })

  it('is the identity when the count is unchanged', () => {
    expect(adjustVariablesToCount(['X', 'Y', 'P'], 3)).toEqual(['X', 'Y', 'P'])
  })
})

describe('renameKMapVariables', () => {
  it('renames variables while preserving entered cell values', () => {
    let model = createKMap(['A', 'B', 'C'])
    model = withValue(model, 0, 1)
    model = withValue(model, 5, 'X')

    const renamed = renameKMapVariables(model, ['X', 'Y', 'Z'])
    expect(renamed.layout.variables).toEqual(['X', 'Y', 'Z'])
    expect(cellValue(renamed, 0)).toBe(1)
    expect(cellValue(renamed, 5)).toBe('X')
  })

  it('shifts minterms correctly when shrinking 4 -> 3 (drops the LSB)', () => {
    let model = createKMap(['A', 'B', 'C', 'D'])
    model = withValue(model, 0, 1)
    model = withValue(model, 3, 1)
    model = withValue(model, 8, 'X')
    model = withValue(model, 11, 'X')

    const renamed = renameKMapVariables(model, ['A', 'B', 'C'])
    expect(renamed.layout.variables).toEqual(['A', 'B', 'C'])
    expect(cellValue(renamed, 0)).toBe(1) // 0 >> 1
    expect(cellValue(renamed, 1)).toBe(1) // 3 >> 1
    expect(cellValue(renamed, 4)).toBe('X') // 8 >> 1
    expect(cellValue(renamed, 5)).toBe('X') // 11 >> 1
  })

  it('shifts minterms correctly when growing 3 -> 4 (appends a zero LSB)', () => {
    let model = createKMap(['A', 'B', 'C'])
    model = withValue(model, 0, 1)
    model = withValue(model, 3, 1)

    const renamed = renameKMapVariables(model, ['A', 'B', 'C', 'D'])
    expect(cellValue(renamed, 0)).toBe(1) // 0 << 1
    expect(cellValue(renamed, 6)).toBe(1) // 3 << 1
  })

  it('rebuilds a valid 5-variable plane model with custom names', () => {
    const model = createKMap(['A', 'B', 'C', 'D', 'E'])
    const renamed = renameKMapVariables(model, ['X', 'Y', 'Z', 'P', 'Q'])
    expect(renamed.layout.variables).toEqual(['X', 'Y', 'Z', 'P', 'Q'])
    expect(renamed.cells.flat()).toHaveLength(32)
  })
})

describe('custom names flow into generated expressions', () => {
  it('produces X and Y based expressions for a 2-variable map', () => {
    let model = createKMap(['X', 'Y'])
    model = withValue(model, 1, 1)
    model = withValue(model, 2, 1)

    const result = performSimplification(model)
    expect(result.sop).toBe("X'Y + XY'")
    expect(result.sop).not.toContain('A')
  })

  it('produces X, Y and Z based expressions for a 3-variable map', () => {
    let model = createKMap(['X', 'Y', 'Z'])
    model = withValue(model, 0, 1)
    model = withValue(model, 7, 1)

    const result = performSimplification(model)
    expect(result.sop).toBe("X'Y'Z' + XYZ")
    expect(result.sop).not.toContain('A')
  })
})