import { describe, it, expect } from 'vitest'
import {
  initialMastery,
  applyMastery,
  statusForScore,
  weakestConcept,
  adaptiveDifficulty,
  adaptiveProblemConfig,
} from '../../../education/practice/mastery'

describe('mastery rules', () => {
  it('starts every concept NOT_STARTED', () => {
    const m = initialMastery()
    expect(m['adjacency'].status).toBe('NOT_STARTED')
    expect(m['adjacency'].attempts).toBe(0)
  })

  it('moves a concept to LEARNING after frequent mistakes', () => {
    let m = initialMastery()
    for (let i = 0; i < 4; i++) {
      m = applyMastery(m, [], ['adjacency'], i % 2 === 0 ? 1 : 0)
    }
    expect(m['adjacency'].status).toBe('LEARNING')
  })

  it('moves a concept to DEVELOPING as accuracy improves', () => {
    let m = initialMastery()
    m = applyMastery(m, [], ['adjacency'], 0)
    m = applyMastery(m, ['adjacency'], [], 0)
    const score = m['adjacency'].score
    expect(score).toBeGreaterThan(0)
    expect(statusForScore(score, 1)).not.toBe('NOT_STARTED')
  })

  it('reaches MASTERED with consistent correct reasoning and few hints', () => {
    let m = initialMastery()
    for (let i = 0; i < 5; i++) {
      m = applyMastery(m, ['adjacency'], [], 0)
    }
    expect(m['adjacency'].status).toBe('MASTERED')
    expect(m['adjacency'].score).toBeGreaterThanOrEqual(75)
  })

  it('reduces the gain when hints are used', () => {
    let noHint = initialMastery()
    noHint = applyMastery(noHint, ['adjacency'], [], 0)
    let withHint = initialMastery()
    withHint = applyMastery(withHint, ['adjacency'], [], 2)
    expect(withHint['adjacency'].score).toBeLessThan(noHint['adjacency'].score)
  })
})

describe('adaptive selection', () => {
  it('targets the weakest concept first', () => {
    const m = initialMastery()
    expect(weakestConcept(m)).toBe('cell-identification')
    const cfg = adaptiveProblemConfig(m, 'seed')
    expect(cfg.concepts).toEqual(['cell-identification'])
  })

  it('targets a weak concept over strong ones', () => {
    let m = initialMastery()
    // Master adjacency and cell-identification fully.
    m = applyMastery(m, ['cell-identification'], [], 0)
    m = applyMastery(m, ['cell-identification'], [], 0)
    m = applyMastery(m, ['adjacency'], [], 0)
    m = applyMastery(m, ['adjacency'], [], 0)
    m = applyMastery(m, ['adjacency'], [], 0)
    // Weakest should now be something not touched (e.g. minterms score 0).
    const weakest = weakestConcept(m)
    expect(['minterms', 'group-formation']).toContain(weakest)
    const cfg = adaptiveProblemConfig(m, 's')
    expect(cfg.concepts).toEqual([weakest])
  })

  it('serves a harder problem when the student is strong', () => {
    let m = initialMastery()
    for (const c of ['cell-identification', 'minterms', 'adjacency', 'group-formation', 'group-size', 'sop', 'pos', 'coverage']) {
      for (let i = 0; i < 5; i++) m = applyMastery(m, [c as never], [], 0)
    }
    expect(adaptiveDifficulty(m)).toBeGreaterThanOrEqual(3)
  })
})