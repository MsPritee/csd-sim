import type { Bit, GateType } from '../../core/gates/types'
import { getGate, GATE_DEFINITIONS } from '../../core/gates/catalog'
import { generateTruthTable } from '../../core/gates/evaluate'
import type { GateMisconception } from './misconceptions'
import { detectGateMisconception } from './misconceptions'
import { truthTableForExpression } from './expression'

/**
 * Challenge-mode generator + verifier (LG-08). Two randomized, seeded problem
 * kinds: (1) "which gate matches this output pattern?" and (2) "build a gate
 * from a description" where the answer is a typed Boolean expression. Both are
 * VERIFIED BY TRUTH-TABLE LOGICAL EQUIVALENCE, not exact-match, so any
 * equivalent-but-differently-written expression is accepted.
 */

export type GateChallengeKind = 'sos-row' | 'build-from-description'

interface Base {
  readonly id: string
  readonly kind: GateChallengeKind
  readonly targetGate: GateType
  readonly inputCount: number
  readonly inputLabels: readonly string[]
  readonly seed: string
}

/** "Which gate has this output column?" — pick from the eight gates. */
export interface SosRowChallenge extends Base {
  readonly kind: 'sos-row'
  readonly prompt: string
  readonly outputColumn: readonly Bit[]
  readonly inputHeader: string
  /** All gates, shuffled, as candidate answers. */
  readonly options: readonly GateType[]
  readonly answer: GateType
}

/** "Build a gate whose behavior matches this description" — type an expression. */
export interface DescriptionChallenge extends Base {
  readonly kind: 'build-from-description'
  readonly prompt: string
  readonly description: string
  readonly answer: GateType
}

export type GateChallenge = SosRowChallenge | DescriptionChallenge

export interface GateChallengeAnswer {
  readonly kind: GateChallengeKind
  readonly seed: string
  /** `sos-row`: the chosen gate. */
  readonly chosenGate?: GateType
  /** `build-from-description`: the typed Boolean expression. */
  readonly expression?: string
}

export interface MismatchRow {
  readonly inputs: readonly Bit[]
  readonly expected: Bit
  readonly actual: Bit
}

export interface GateChallengeResult {
  readonly correct: boolean
  /** False when the submission could not be interpreted (bad expression / no option). */
  readonly valid: boolean
  readonly misconception: GateMisconception | null
  readonly feedback: string
  readonly mismatches: readonly MismatchRow[]
}

const ALL_GATES: readonly GateType[] = GATE_DEFINITIONS.map((g) => g.id)
const RELATIONS: readonly GateType[] = ['AND', 'NAND', 'OR', 'NOR', 'XOR', 'XNOR']
const UNARY: readonly GateType[] = ['BUFFER', 'NOT']

function naturalInputCount(gate: GateType): number {
  return gate === 'BUFFER' || gate === 'NOT' ? 1 : 2
}

function hashSeed(seed: string): number {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function mulberry32(state: number): () => number {
  let a = state
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function shuffle<T>(items: readonly T[], rng: () => number): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j]!, out[i]!]
  }
  return out
}

function outputColumn(gate: GateType, inputCount: number): Bit[] {
  return generateTruthTable(gate, inputCount).map((row) => row[row.length - 1]!)
}

function describeGate(gate: GateType): string {
  return getGate(gate).description
}

export interface GateChallengeOptions {
  readonly kind?: GateChallengeKind
  readonly seed?: string
}

/** Generates one seeded challenge of the requested (or a random) kind. */
export function generateGateChallenge(options: GateChallengeOptions = {}): GateChallenge {
  const seed = options.seed ?? `challenge:${Date.now()}`
  const rng = mulberry32(hashSeed(seed))
  const kind = options.kind ?? (rng() < 0.5 ? 'sos-row' : 'build-from-description')
  const pool = kind === 'sos-row' ? RELATIONS : ALL_GATES
  const target = pool[Math.floor(rng() * pool.length)]!
  const id = `${kind}:${seed}`
  const inputCount = naturalInputCount(target)
  const inputLabels = 'ABCDEFGH'.slice(0, inputCount).split('')

  if (kind === 'sos-row') {
    const column = outputColumn(target, inputCount)
    return {
      id,
      kind,
      targetGate: target,
      inputCount,
      inputLabels,
      seed,
      prompt: 'Which gate produces this output column?',
      outputColumn: column,
      inputHeader: inputLabels.join(' '),
      options: shuffle(ALL_GATES, rng),
      answer: target,
    }
  }

  return {
    id,
    kind,
    targetGate: target,
    inputCount,
    inputLabels,
    seed,
    prompt: 'Build a Boolean expression for a gate that behaves like this:',
    description: describeGate(target),
    answer: target,
  }
}

export interface GateChallengeBatchOptions {
  readonly kind?: GateChallengeKind
  readonly count?: number
  readonly seed?: string
}

/** A seeded batch of distinct challenges (used by the challenge UI). */
export function generateGateChallengeBatch(options: GateChallengeBatchOptions = {}): GateChallenge[] {
  const count = options.count ?? 5
  return Array.from({ length: count }, (_, i) =>
    generateGateChallenge({
      kind: options.kind,
      seed: `${options.seed ?? 'challenge-batch'}:${i}`,
    }),
  )
}

/**
 * Finds the gate whose natural-arity output column equals `column`. Returns null
 * when no cataloged gate matches (used to reveal SOS-pattern answers & in tests).
 */
export function solveSosRowPattern(column: readonly Bit[]): GateType | null {
  const pool = column.length === 2 ? UNARY : column.length === 4 ? RELATIONS : []
  for (const gate of pool) {
    if (outputColumn(gate, naturalInputCount(gate)).every((b, i) => b === column[i])) {
      return gate
    }
  }
  return null
}

/**
 * Verifies a challenge submission by truth-table equivalence (not exact match).
 * For `sos-row` the chosen gate's output column must equal the target's; for
 * `build-from-description` the typed expression must evaluate to the same column
 * over every row.
 */
export function checkGateChallenge(challenge: GateChallenge, answer: GateChallengeAnswer): GateChallengeResult {
  if (challenge.kind === 'sos-row') {
    const chosen = answer.chosenGate
    if (!chosen || !ALL_GATES.includes(chosen)) {
      return {
        correct: false,
        valid: false,
        misconception: null,
        feedback: 'Choose one of the gates.',
        mismatches: [],
      }
    }
    const target = outputColumn(challenge.targetGate, challenge.inputCount)
    const actual = outputColumn(chosen, challenge.inputCount)
    const mismatches: MismatchRow[] = []
    target.forEach((expected, i) => {
      if (expected !== actual[i]) {
        mismatches.push({ inputs: inputsForRow(challenge.inputCount, i), expected, actual: actual[i] ?? 0 })
      }
    })
    if (mismatches.length === 0) {
      return { correct: true, valid: true, misconception: null, feedback: 'That gate has exactly this output column.', mismatches: [] }
    }
    const misconception = detectGateMisconception(challenge.targetGate, chosen)
    return {
      correct: false,
      valid: true,
      misconception,
      feedback: misconception?.explanation ?? 'That gate does not produce this output column.',
      mismatches,
    }
  }

  const expression = answer.expression?.trim()
  if (!expression) {
    return { correct: false, valid: false, misconception: null, feedback: 'Type a Boolean expression to answer.', mismatches: [] }
  }
  let actual: Bit[]
  try {
    actual = truthTableForExpression(expression, challenge.inputCount, challenge.inputLabels)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'The expression could not be parsed.'
    return { correct: false, valid: false, misconception: null, feedback: `Could not read that expression: ${message}`, mismatches: [] }
  }
  const expected = outputColumn(challenge.targetGate, challenge.inputCount)
  const mismatches: MismatchRow[] = []
  expected.forEach((v, i) => {
    if (actual[i] !== v) {
      mismatches.push({ inputs: inputsForRow(challenge.inputCount, i), expected: v, actual: actual[i] ?? 0 })
    }
  })
  if (mismatches.length === 0) {
    return {
      correct: true,
      valid: true,
      misconception: null,
      feedback: 'Equivalent to the target by truth table — correct.',
      mismatches: [],
    }
  }
  return {
    correct: false,
    valid: true,
    misconception: null,
    feedback: 'Not equivalent. Compare your expression against the target on every row.',
    mismatches,
  }
}

function inputsForRow(inputCount: number, row: number): Bit[] {
  const out: Bit[] = []
  for (let i = 0; i < inputCount; i++) out.push(((row >> (inputCount - 1 - i)) & 1) as Bit)
  return out
}