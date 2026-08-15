import type { GateType } from '../../core/gates/types'
import { generateTruthTable } from '../../core/gates/evaluate'
import { getGate, GATE_DEFINITIONS } from '../../core/gates/catalog'
import type { GateMisconception } from './misconceptions'
import { detectGateMisconception } from './misconceptions'

/**
 * Truth-table literacy exercises (LG-06). Deterministic generators that ask a
 * student to map a table, expression, or description to the correct gate, plus
 * a checker that detects the likely misconception and returns a targeted hint.
 * Fully seeded so exercises and their ids are reproducible in tests and UI.
 */

export type GateExerciseKind = 'table-to-gate' | 'expression-to-gate' | 'description-to-gate'

export interface GateExercise {
  readonly id: string
  readonly kind: GateExerciseKind
  /** The correct gate. */
  readonly gate: GateType
  readonly prompt: string
  /** For `table-to-gate`, formatted truth-table lines. */
  readonly tableLines: readonly string[]
  /** Four shuffled options to choose from (always includes `gate`). */
  readonly choices: readonly GateType[]
  readonly answer: GateType
  readonly seed: string
}

export interface GateExerciseCheck {
  readonly correct: boolean
  /** The gate the student picked (null if the option was invalid). */
  readonly chosenGate: GateType | null
  readonly expectedGate: GateType
  readonly misconception: GateMisconception | null
  readonly feedback: string
  readonly hint: string
}

const INPUT_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] as const

const ALL_KINDS: readonly GateExerciseKind[] = [
  'table-to-gate',
  'expression-to-gate',
  'description-to-gate',
]

/** Likely-distractor pools for each gate, used to build 4-option choices. */
const DISTRACTORS: Readonly<Record<GateType, readonly GateType[]>> = {
  BUFFER: ['NOT', 'AND', 'OR'],
  NOT: ['BUFFER', 'NAND', 'NOR'],
  AND: ['NAND', 'OR', 'NOR'],
  NAND: ['AND', 'NOR', 'OR'],
  OR: ['AND', 'NOR', 'XOR'],
  NOR: ['OR', 'NAND', 'AND'],
  XOR: ['OR', 'XNOR', 'NOR'],
  XNOR: ['XOR', 'NAND', 'NOR'],
  CON_BUF: ['BUFFER', 'AND', 'OR'],
  CON_INV: ['NOT', 'BUFFER', 'CON_BUF'],
  ODD_PARITY: ['XOR', 'OR', 'EVEN_PARITY'],
  EVEN_PARITY: ['XNOR', 'ODD_PARITY', 'NOR'],
}

/** FNV-1a string hash → 32-bit seed. */
function hashSeed(seed: string): number {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** Deterministic PRNG (mulberry32). */
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

function formatTableLines(gate: GateType): string[] {
  const isUnary = gate === 'BUFFER' || gate === 'NOT'
  const inputCount = isUnary ? 1 : 2
  const table = generateTruthTable(gate, inputCount)
  const labels = INPUT_LABELS.slice(0, inputCount)
  const header = `${labels.join(' ')}  Y`
  const rows = table.map((row) => `${row.slice(0, -1).join(' ')}  ${row[row.length - 1]}`)
  return [header, ...rows]
}

function buildPrompt(kind: GateExerciseKind, gate: GateType): string {
  const def = getGate(gate)
  switch (kind) {
    case 'table-to-gate':
      return 'Which gate has this truth table?'
    case 'expression-to-gate':
      return `Which gate is described by the expression ${def.booleanExpression}?`
    case 'description-to-gate':
      return `Which gate matches this description: "${def.description}"?`
    default:
      return `Identify the correct gate.`
  }
}

export interface GateExerciseOptions {
  readonly kind?: GateExerciseKind
  readonly seed?: string
}

/** Generates one deterministic gate-mapping exercise. */
export function generateGateExercise(options: GateExerciseOptions = {}): GateExercise {
  const seed = options.seed ?? `seed:${Date.now()}`
  const rng = mulberry32(hashSeed(seed))
  const kind = options.kind ?? ALL_KINDS[Math.floor(rng() * ALL_KINDS.length)]!
  const allGates = GATE_DEFINITIONS.map((g) => g.id)
  const gate = allGates[Math.floor(rng() * allGates.length)]!

  const pool = shuffle(DISTRACTORS[gate], rng)
  const distractors = pool.slice(0, 3)
  const choices = shuffle([gate, ...distractors], rng)
  const answerIndex = choices.indexOf(gate)

  return {
    id: `${kind}:${gate}:${seed}`,
    kind,
    gate,
    prompt: buildPrompt(kind, gate),
    tableLines: kind === 'table-to-gate' ? formatTableLines(gate) : [],
    choices,
    answer: choices[answerIndex]!,
    seed,
  }
}

export interface GateExerciseBatchOptions {
  readonly kind?: GateExerciseKind
  readonly count?: number
  readonly seed?: string
}

/** Generates a batch of distinct exercises deterministically. */
export function generateGateExerciseBatch(options: GateExerciseBatchOptions = {}): GateExercise[] {
  const count = options.count ?? 5
  return Array.from({ length: count }, (_, i) =>
    generateGateExercise({
      kind: options.kind,
      seed: `${options.seed ?? 'batch'}:${i}`,
    }),
  )
}

/** Validates a student's choice and returns targeted misconception feedback. */
export function checkGateExercise(exercise: GateExercise, chosenIndex: number): GateExerciseCheck {
  const chosenGate = exercise.choices[chosenIndex] ?? null
  if (chosenGate === exercise.answer) {
    return {
      correct: true,
      chosenGate,
      expectedGate: exercise.answer,
      misconception: null,
      feedback: 'Correct — well done.',
      hint: '',
    }
  }
  const misconception = chosenGate ? detectGateMisconception(exercise.answer, chosenGate) : null
  return {
    correct: false,
    chosenGate,
    expectedGate: exercise.answer,
    misconception,
    feedback: misconception?.explanation ?? 'That choice does not produce this behavior.',
    hint: misconception?.hint ?? 'Compare each option\'s truth table to the prompt.',
  }
}