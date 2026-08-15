import { describe, it, expect } from 'vitest'
import {
  generateGateExercise,
  generateGateExerciseBatch,
  checkGateExercise,
} from '../../../education/gates/exercises'

describe('generateGateExercise', () => {
  it('is deterministic for a given seed and kind', () => {
    const a = generateGateExercise({ kind: 'table-to-gate', seed: 'fixed' })
    const b = generateGateExercise({ kind: 'table-to-gate', seed: 'fixed' })
    expect(a.id).toBe(b.id)
    expect(a.choices).toEqual(b.choices)
    expect(a.gate).toBe(b.gate)
  })

  it('always offers four choices including the answer', () => {
    for (const kind of ['table-to-gate', 'expression-to-gate', 'description-to-gate'] as const) {
      for (let i = 0; i < 8; i++) {
        const ex = generateGateExercise({ kind, seed: `seed-${kind}-${i}` })
        expect(ex.choices).toHaveLength(4)
        expect(ex.choices).toContain(ex.answer)
        expect(ex.answer).toBe(ex.gate)
      }
    }
  })

  it('formats a truth table for table-to-gate', () => {
    const ex = generateGateExercise({ kind: 'table-to-gate', seed: 'tt' })
    expect(ex.tableLines.length).toBeGreaterThan(0)
    expect(ex.tableLines[0]).toBe('A B  Y')
  })

  it('includes the expression in the prompt for expression-to-gate', () => {
    const ex = generateGateExercise({ kind: 'expression-to-gate', seed: 'expr' })
    expect(ex.prompt).toContain('Y =')
  })

  it('includes the description in the prompt for description-to-gate', () => {
    const ex = generateGateExercise({ kind: 'description-to-gate', seed: 'desc' })
    expect(ex.prompt).toContain('Which gate matches this description')
  })

  it('varied seeds tend to cover different gates', () => {
    const seen = new Set(
      Array.from({ length: 40 }, (_, i) =>
        generateGateExercise({ kind: 'table-to-gate', seed: `cover-${i}` }).gate,
      ),
    )
    expect(seen.size).toBeGreaterThan(4)
  })
})

describe('generateGateExerciseBatch', () => {
  it('produces the requested count of distinct exercises', () => {
    const batch = generateGateExerciseBatch({ count: 6, seed: 'batch' })
    expect(batch).toHaveLength(6)
    expect(new Set(batch.map((e) => e.id)).size).toBe(6)
  })

  it('defaults to five exercises', () => {
    expect(generateGateExerciseBatch({ seed: 'b' })).toHaveLength(5)
  })
})

describe('checkGateExercise', () => {
  it('accepts the correct answer', () => {
    const ex = generateGateExercise({ kind: 'table-to-gate', seed: 'ck' })
    const idx = ex.choices.indexOf(ex.answer)
    const check = checkGateExercise(ex, idx)
    expect(check.correct).toBe(true)
    expect(check.chosenGate).toBe(ex.answer)
    expect(check.feedback).toMatch(/Correct/)
  })

  it('detects a misconception when the student guesses the confusing distractor', () => {
    let ex = generateGateExercise({ kind: 'table-to-gate', seed: 'mis' })
    for (let i = 0; i < 50 && !(ex.gate === 'AND' && ex.choices.includes('OR')); i++) {
      ex = generateGateExercise({ kind: 'table-to-gate', seed: `mis-${i}` })
    }
    expect(ex.gate).toBe('AND')
    expect(ex.choices).toContain('OR')
    const orIndex = ex.choices.indexOf('OR')
    const check = checkGateExercise(ex, orIndex)
    expect(check.correct).toBe(false)
    expect(check.misconception?.id).toBe('and-or')
    expect(check.hint.length).toBeGreaterThan(0)
    expect(check.chosenGate).toBe('OR')
  })

  it('reports the expected gate and falls back when confused', () => {
    const ex = generateGateExercise({ kind: 'description-to-gate', seed: 'fallback' })
    const badIndex = ex.choices.findIndex((c) => c !== ex.answer)
    const check = checkGateExercise(ex, badIndex)
    expect(check.correct).toBe(false)
    expect(check.expectedGate).toBe(ex.answer)
  })

  it('handles an invalid chosen index gracefully', () => {
    const ex = generateGateExercise({ kind: 'expression-to-gate', seed: 'invalid' })
    const check = checkGateExercise(ex, 99)
    expect(check.correct).toBe(false)
    expect(check.chosenGate).toBeNull()
  })
})