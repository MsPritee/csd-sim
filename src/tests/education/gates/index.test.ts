import { describe, it, expect } from 'vitest'
import { evaluateGate } from '../../../core/gates/evaluate'
import type { GateType, Bit } from '../../../core/gates/types'
import {
  GATE_CONCEPTS,
  GATE_CONCEPT_LIST,
  getGateConcept,
  explainGate,
} from '../../../education/gates'

const ALL_TYPES: readonly GateType[] = [
  'BUFFER',
  'NOT',
  'AND',
  'NAND',
  'OR',
  'NOR',
  'XOR',
  'XNOR',
]

describe('gate concepts', () => {
  it('defines a concept for every gate', () => {
    for (const id of ALL_TYPES) {
      expect(GATE_CONCEPTS[id]).toBeDefined()
    }
    expect(GATE_CONCEPT_LIST).toHaveLength(ALL_TYPES.length)
  })

  it('every concept is complete and well-formed', () => {
    for (const c of GATE_CONCEPT_LIST) {
      expect(c.id).toBe(ALL_TYPES.find((t) => t === c.id))
      expect(c.title.length).toBeGreaterThan(0)
      expect(c.objective.length).toBeGreaterThan(0)
      expect(c.explanation.length).toBeGreaterThan(0)
      expect(c.visualization.length).toBeGreaterThan(0)
      expect(c.interaction.length).toBeGreaterThan(0)
      expect(c.commonMistakes.length).toBeGreaterThan(0)
      expect(c.hints.length).toBeGreaterThan(0)
      expect(c.assessment.length).toBeGreaterThan(0)
    }
  })

  it('getGateConcept round-trips and rejects unknown ids', () => {
    expect(getGateConcept('AND')).toBe(GATE_CONCEPTS.AND)
    expect(() => getGateConcept('MYSTERY' as GateType)).toThrow(RangeError)
  })

  it('AND concept teaches the all-inputs rule', () => {
    const c = getGateConcept('AND')
    expect(c.objective).toMatch(/every input/)
    expect(c.hints.some((h) => h.includes('strict'))).toBe(true)
  })
})

describe('explainGate', () => {
  it('agrees with the engine output and reports it in `what`', () => {
    const inputs: Bit[] = [1, 0]
    const exp = explainGate('AND', inputs)
    expect(exp.what).toContain('1')
    expect(exp.what).toContain('0')
    expect(exp.what).toContain('·')
    expect(exp.rule).toBe('AND — all inputs must be 1')
  })

  it('AND with a 0 input explains why the output is 0', () => {
    const exp = explainGate('AND', [1, 0])
    expect(exp.why).toMatch(/B.*is 0/)
  })

  it('AND when all inputs are 1 explains the output is 1', () => {
    expect(explainGate('AND', [1, 1]).why).toMatch(/every input is 1/i)
  })

  it('NOT inverts and explains it', () => {
    const exp = explainGate('NOT', [0])
    expect(exp.what).toContain("A'")
    expect(exp.what).toContain('1')
    expect(exp.why).toMatch(/inverts it/)
  })

  it('NAND applies the inversion on the 11 row', () => {
    const exp = explainGate('NAND', [1, 1])
    expect(exp.why).toMatch(/flips it to 0/)
    expect(exp.notice.some((n) => n.includes('0 exactly when'))).toBe(true)
  })

  it('XOR outputs 1 for differing inputs and explains odd parity', () => {
    const exp = explainGate('XOR', [1, 0])
    expect(exp.what).toContain('⊕')
    expect(exp.why).toMatch(/odd count/)
  })

  it('XOR outputs 0 for equal inputs with even explanation', () => {
    const exp = explainGate('XOR', [1, 1])
    expect(exp.why).toMatch(/even count/)
  })

  it('XNOR is the even-parity counterpart', () => {
    const exp = explainGate('XNOR', [0, 0])
    expect(exp.why).toMatch(/even count/)
    expect(exp.why).toContain('1')
  })

  it('explains every gate with output equal to the engine', () => {
    for (const gate of ALL_TYPES) {
      const inputs: Bit[] = gate === 'BUFFER' || gate === 'NOT' ? [0] : [1, 0]
      const exp = explainGate(gate, inputs)
      expect(exp.what).toContain(evaluateGate(gate, inputs).toString())
    }
  })

  it('rejects inputs outside the gate arity', () => {
    expect(() => explainGate('AND', [0])).toThrow(RangeError)
  })
})