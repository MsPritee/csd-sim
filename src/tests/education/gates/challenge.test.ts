import { describe, it, expect } from 'vitest'
import {
  parseBooleanExpression,
  evaluateBooleanExpression,
  truthTableForExpression,
} from '../../../education/gates/expression'
import {
  generateGateChallenge,
  generateGateChallengeBatch,
  checkGateChallenge,
  solveSosRowPattern,
} from '../../../education/gates/challenge'
import type { SosRowChallenge, DescriptionChallenge } from '../../../education/gates/challenge'

describe('Boolean expression evaluator', () => {
  it('evaluates AND', () => {
    expect(evaluateBooleanExpression('A·B', [1, 1])).toBe(1)
    expect(evaluateBooleanExpression('A·B', [1, 0])).toBe(0)
    expect(evaluateBooleanExpression('A and B', [1, 1])).toBe(1)
  })

  it('evaluates OR and XOR', () => {
    expect(evaluateBooleanExpression('A+B', [0, 1])).toBe(1)
    expect(evaluateBooleanExpression('A⊕B', [1, 1])).toBe(0)
    expect(evaluateBooleanExpression('A⊕B', [0, 1])).toBe(1)
    expect(evaluateBooleanExpression('A xor B', [1, 0])).toBe(1)
  })

  it('honours NOT with prefix and postfix forms', () => {
    expect(evaluateBooleanExpression("A'", [1])).toBe(0)
    expect(evaluateBooleanExpression('!A', [0])).toBe(1)
    expect(evaluateBooleanExpression('¬A', [1])).toBe(0)
  })

  it('respects precedence: NOT > AND > OR and parentheses override', () => {
    // A + B·C = A + (B·C)
    expect(evaluateBooleanExpression('A+B·C', [0, 1, 1])).toBe(1)
    // (A+B)·C
    expect(evaluateBooleanExpression('(A+B)·C', [0, 1, 1])).toBe(1)
    expect(evaluateBooleanExpression('(A+B)·C', [0, 1, 0])).toBe(0)
    // !A·B = (!A)·B
    expect(evaluateBooleanExpression('!A·B', [1, 1])).toBe(0)
    expect(evaluateBooleanExpression('!(A+B)', [0, 0])).toBe(1)
  })

  it('accepts an optional "Y =" left-hand side', () => {
    expect(evaluateBooleanExpression('Y = A + B', [0, 1])).toBe(1)
  })

  it('throws a readable message on an invalid token', () => {
    expect(() => parseBooleanExpression('A @ B')).toThrow(/Unexpected character/)
    expect(() => parseBooleanExpression('A + ')).toThrow(/end of expression/)
  })

  it('builds an MSB-first output column matching the engine', () => {
    // AND over 2 inputs: rows 00,01,10,11 -> 0,0,0,1
    expect(truthTableForExpression('A·B', 2, ['A', 'B'])).toEqual([0, 0, 0, 1])
    expect(truthTableForExpression('A+B', 2, ['A', 'B'])).toEqual([0, 1, 1, 1])
  })
})

describe('SOS-row pattern solver + challenges', () => {
  it('solves each relation gate uniquely from its output column', () => {
    expect(solveSosRowPattern([0, 0, 0, 1])).toBe('AND')
    expect(solveSosRowPattern([0, 1, 1, 1])).toBe('OR')
    expect(solveSosRowPattern([0, 1, 1, 0])).toBe('XOR')
    expect(solveSosRowPattern([1, 0, 0, 0])).toBe('NOR')
    expect(solveSosRowPattern([1, 1, 1, 0])).toBe('NAND')
    expect(solveSosRowPattern([1, 0, 0, 1])).toBe('XNOR')
    expect(solveSosRowPattern([0, 1])).toBe('BUFFER')
    expect(solveSosRowPattern([1, 0])).toBe('NOT')
  })

  it('generates a deterministic sos-row challenge with all gates as options', () => {
    const a = generateGateChallenge({ kind: 'sos-row', seed: 'sos-a' }) as SosRowChallenge
    const b = generateGateChallenge({ kind: 'sos-row', seed: 'sos-a' })
    expect(a).toEqual(b)
    expect(a.id).toContain('sos-row')
    expect(a.options).toHaveLength(12)
    expect(a.outputColumn).toHaveLength(4)
    expect(a.answer).toBe(solveSosRowPattern(a.outputColumn))
  })

  it('verifies the correct sos-row gate', () => {
    const ch = generateGateChallenge({ kind: 'sos-row', seed: 'sos-a' }) as SosRowChallenge
    const result = checkGateChallenge(ch, { kind: 'sos-row', seed: ch.seed, chosenGate: ch.answer })
    expect(result.correct).toBe(true)
    expect(result.valid).toBe(true)
  })

  it('detects a wrong sos-row gate with a misconception', () => {
    const ch = generateGateChallenge({ kind: 'sos-row', seed: 'sos-a' }) as SosRowChallenge
    const wrong = ch.options.find((g) => g !== ch.answer)!
    const result = checkGateChallenge(ch, { kind: 'sos-row', seed: ch.seed, chosenGate: wrong })
    expect(result.correct).toBe(false)
    expect(result.valid).toBe(true)
    expect(result.mismatches.length).toBeGreaterThan(0)
  })

  it('rejects a missing sos-row answer as invalid', () => {
    const ch = generateGateChallenge({ kind: 'sos-row', seed: 'sos-a' }) as SosRowChallenge
    const result = checkGateChallenge(ch, { kind: 'sos-row', seed: ch.seed })
    expect(result.valid).toBe(false)
  })
})

describe('Build-a-gate-from-description challenges', () => {
  it('generates a deterministic description challenge', () => {
    const a = generateGateChallenge({ kind: 'build-from-description', seed: 'desc-a' }) as DescriptionChallenge
    const b = generateGateChallenge({ kind: 'build-from-description', seed: 'desc-a' })
    expect(a).toEqual(b)
    expect(a.id).toContain('build-from-description')
    expect(a.description.length).toBeGreaterThan(0)
  })

  it('accepts an equivalent (not exact) expression by truth-table equivalence', () => {
    const ch = generateGateChallenge({ kind: 'build-from-description', seed: 'desc-a' }) as DescriptionChallenge
    // Learn the target, then submit a correct expression using the known gate semantics.
    const target = ch.targetGate
    const expr = canonicalExpression(target)
    const result = checkGateChallenge(ch, { kind: 'build-from-description', seed: ch.seed, expression: expr })
    expect(result.valid).toBe(true)
    expect(result.correct).toBe(true)
    expect(result.mismatches).toEqual([])
  })

  it('rejects a non-equivalent expression and reports mismatches', () => {
    const ch = generateGateChallenge({ kind: 'build-from-description', seed: 'desc-b' })
    const result = checkGateChallenge(ch, {
      kind: 'build-from-description',
      seed: ch.seed,
      expression: 'A', // almost never equals a 2-input gate for every row
    })
    if (ch.targetGate === 'BUFFER' || ch.targetGate === 'NOT') {
      // A only matches BUFFER; NOT(0)=1 so A is not equivalent.
      expect(ch.targetGate === 'BUFFER' ? result.correct === true : result.correct === false).toBe(true)
    } else {
      expect(result.correct).toBe(false)
      expect(result.valid).toBe(true)
      expect(result.mismatches.length).toBeGreaterThan(0)
    }
  })

  it('reports a malformed expression as invalid without crashing', () => {
    const ch = generateGateChallenge({ kind: 'build-from-description', seed: 'desc-a' })
    const result = checkGateChallenge(ch, { kind: 'build-from-description', seed: ch.seed, expression: 'A @ B' })
    expect(result.valid).toBe(false)
    expect(result.correct).toBe(false)
    expect(result.feedback).toContain('Could not read')
  })

  it('generates a distinct seeded batch', () => {
    const batch = generateGateChallengeBatch({ kind: 'build-from-description', count: 5, seed: 'batch-a' })
    expect(batch).toHaveLength(5)
    expect(new Set(batch.map((c) => c.id)).size).toBe(5)
  })
})

function canonicalExpression(gate: string): string {
  return {
    BUFFER: 'A',
    NOT: "A'",
    AND: 'A·B',
    NAND: "(A·B)'",
    OR: 'A+B',
    NOR: "(A+B)'",
    XOR: 'A⊕B',
    XNOR: "(A⊕B)'",
  }[gate] as string
}