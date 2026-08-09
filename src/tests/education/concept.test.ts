import { describe, expect, it } from 'vitest'
import { createConcept, validateConcept } from '../../education/concepts/concept'
import type { ConceptDraft } from '../../education/concepts/concept'

const validDraft: ConceptDraft = {
  id: 'kmap-ad-jacency',
  title: 'K-map Adjacency',
  objective: 'Identify adjacent cells that differ in one variable.',
  explanation: 'Adjacent cells in a K-map differ by exactly one bit.',
  visualization: { simulatorId: 'kmap', description: 'Show wrap-around adjacency.' },
  interaction: { type: 'select-pair', tasks: ['Click two adjacent cells.'] },
  commonMistakes: [
    { error: 'Grouping 6 cells', why: 'Groups must have power-of-two sizes.' },
  ],
  hints: [{ level: 1, text: 'Move one cell at a time.' }],
  assessment: {
    prompt: 'Which sizes are valid K-map groups?',
    options: ['6', '4', '3'],
    correctIndex: 1,
    explanation: 'K-map groups must contain 1, 2, 4, 8, ... cells.',
  },
}

describe('createConcept', () => {
  it('applies defaults for optional fields', () => {
    const concept = createConcept({ ...validDraft, prerequisites: undefined })
    expect(concept.prerequisites).toEqual([])
    expect(concept.commonMistakes).toHaveLength(1)
    expect(concept.assessment?.options).toHaveLength(3)
  })

  it('sorts hints by level', () => {
    const concept = createConcept({
      ...validDraft,
      hints: [
        { level: 2, text: 'second' },
        { level: 1, text: 'first' },
      ],
    })
    expect(concept.hints.map((h) => h.level)).toEqual([1, 2])
  })
})

describe('validateConcept', () => {
  it('accepts a fully valid concept', () => {
    expect(validateConcept(createConcept(validDraft))).toEqual([])
  })

  it('flags missing required text', () => {
    const concept = createConcept({ ...validDraft, objective: '   ' })
    const errors = validateConcept(concept)
    expect(errors).toContain('objective must not be empty')
  })

  it('flags duplicate hint levels', () => {
    const concept = createConcept({
      ...validDraft,
      hints: [
        { level: 1, text: 'a' },
        { level: 1, text: 'b' },
      ],
    })
    expect(validateConcept(concept)).toContain('hint levels must be unique')
  })

  it('flags an out-of-range assessment answer', () => {
    const concept = createConcept({
      ...validDraft,
      assessment: { prompt: 'p', options: ['a', 'b'], correctIndex: 5, explanation: 'e' },
    })
    expect(validateConcept(concept)).toContain(
      'assessment correctIndex must reference an existing option',
    )
  })
})