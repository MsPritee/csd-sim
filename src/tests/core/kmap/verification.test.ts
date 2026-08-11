import { describe, it, expect } from 'vitest'
import {
  verifySolution,
  createMinimalVerification,
  DEFAULT_VERIFICATION_OPTIONS,
  type SolutionVerification,
} from '../../../core/kmap/verification'
import { createKMap, withValue, type KMapModel } from '../../../core/kmap/model'

describe('verifySolution', () => {
  function makeModel(values: Record<number, 0 | 1 | 'X'>): KMapModel {
    let kmap = createKMap(['A', 'B'])
    for (const [m, v] of Object.entries(values)) {
      kmap = withValue(kmap, Number(m), v)
    }
    return kmap
  }

  function expectWellFormed(res: SolutionVerification) {
    expect(Array.isArray(res.feedback)).toBe(true)
    expect(Array.isArray(res.groupValidations)).toBe(true)
  }

  it('accepts a valid, covering, minimal solution', () => {
    const model = makeModel({ 0: 1, 1: 1 })
    const result = verifySolution(model, [[0, 1]])
    expectWellFormed(result)

    expect(result.valid).toBe(true)
    expect(result.coversRequiredCells).toBe(true)
    expect(result.containsInvalidCells).toBe(false)
    expect(result.isMinimal).toBe(true)
    expect(result.equivalent).toBe(true)
    expect(result.essentialRequirementsSatisfied).toBe(true)
    expect(result.feedback.some((m) => m.includes('mathematically correct'))).toBe(true)
  })

  it('reports missing required cells', () => {
    const model = makeModel({ 0: 1, 1: 1 })
    const result = verifySolution(model, [[0]])

    expect(result.coversRequiredCells).toBe(false)
    expect(result.equivalent).toBe(false)
    expect(result.feedback.some((m) => m.includes('Not all required cells are covered'))).toBe(true)
  })

  it('rejects an invalid (non-power-of-two) group', () => {
    const model = makeModel({ 0: 1 })
    const result = verifySolution(model, [[0, 1, 2]])

    expect(result.containsInvalidCells).toBe(true)
    expect(result.valid).toBe(false)
    expect(result.feedback.some((m) => m.includes('is invalid'))).toBe(true)
  })

  it('rejects a group that includes a 0 cell', () => {
    const model = makeModel({ 0: 1, 1: 0 })
    const result = verifySolution(model, [[0, 1]])

    expect(result.containsInvalidCells).toBe(true)
    expect(result.valid).toBe(false)
  })

  it('flags a redundant group as non-minimal', () => {
    const model = makeModel({ 0: 1, 1: 1, 2: 1, 3: 1 })
    const result = verifySolution(model, [[0, 1, 2, 3], [0, 1]])

    expect(result.isMinimal).toBe(false)
    expect(result.feedback.some((m) => m.includes('redundant'))).toBe(true)
  })

  it('accepts a valid minimal solution using separate groups', () => {
    const model = makeModel({ 0: 1, 1: 1, 2: 1 })
    const result = verifySolution(model, [[0, 1], [2]], DEFAULT_VERIFICATION_OPTIONS)

    expect(result.valid).toBe(true)
    expect(result.coversRequiredCells).toBe(true)
    expect(result.isMinimal).toBe(true)
  })

  it('treats essential requirements as satisfied when the check is disabled', () => {
    const model = makeModel({ 0: 1, 1: 1 })
    const result = verifySolution(model, [[0, 1]], {
      ...DEFAULT_VERIFICATION_OPTIONS,
      checkEssentialImplicants: false,
    })

    expect(result.essentialRequirementsSatisfied).toBe(true)
  })

  it('wires options to feedback but keeps computed grouping facts', () => {
    const model = makeModel({ 0: 1, 1: 1, 2: 1, 3: 1 })
    const result = verifySolution(model, [[0, 1, 2, 3], [0, 1]], {
      ...DEFAULT_VERIFICATION_OPTIONS,
      requireMinimal: false,
    })

    // isMinimal reflects the actual grouping regardless of the option
    expect(result.isMinimal).toBe(false)
    expect(result.feedback.some((m) => m.includes('redundant'))).toBe(true)
  })

  it('treats a group containing a zero as non-equivalent', () => {
    const model = makeModel({ 0: 1, 1: 0 })
    const result = verifySolution(model, [[0, 1]])

    expect(result.coversRequiredCells).toBe(true)
    expect(result.containsInvalidCells).toBe(true)
    expect(result.equivalent).toBe(false)
  })
})

describe('createMinimalVerification', () => {
  it('builds a minimal success result', () => {
    const result = createMinimalVerification(true, 'ok')
    expect(result.valid).toBe(true)
    expect(result.equivalent).toBe(true)
    expect(result.coversRequiredCells).toBe(true)
    expect(result.essentialRequirementsSatisfied).toBe(true)
    expect(result.feedback).toEqual(['ok'])
    expect(result.groupValidations).toEqual([])
  })

  it('builds a minimal failure result', () => {
    const result = createMinimalVerification(false, 'no')
    expect(result.valid).toBe(false)
    expect(result.containsInvalidCells).toBe(true)
    expect(result.isMinimal).toBe(false)
  })
})