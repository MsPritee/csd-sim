/**
 * P2 — Concept mastery & adaptive next problem (Feature 21, 22, 23).
 *
 * Deterministic, rule-based — no statistical models (Feature 23 constraint).
 * A concept's learning score moves up on correct demonstration and down on a
 * mistake; an attempt that used hints earns a smaller gain. Status thresholds
 * map the running score to NOT_STARTED / LEARNING / DEVELOPING / MASTERED.
 * Adaptive selection then targets the weakest concept next.
 */

import type {
  ConceptId,
  ConceptMastery,
  ConceptState,
  MistakeCategory,
  MasteryStatus,
  PracticeEvaluation,
  PracticeFeedback,
  ProblemSeedConfig,
  Difficulty,
  KMapProblem,
} from './types'
import { nextRecommended } from './objectives'

const ALL_CONCEPTS: readonly ConceptId[] = [
  'cell-identification',
  'minterms',
  'adjacency',
  'group-formation',
  'group-size',
  'wrap-around',
  'overlap',
  'don-t-care',
  'variable-elimination',
  'sop',
  'pos',
  'minimality',
  'coverage',
]

export function initialMastery(): ConceptMastery {
  const out = {} as Record<ConceptId, ConceptState>
  for (const id of ALL_CONCEPTS) {
    out[id] = {
      conceptId: id,
      score: 0,
      attempts: 0,
      correct: 0,
      mistakes: 0,
      mistakesTrack: [],
      hintsUsed: 0,
      status: 'NOT_STARTED',
    }
  }
  return out as ConceptMastery
}

export function statusForScore(score: number, attempts: number): MasteryStatus {
  if (attempts === 0) return 'NOT_STARTED'
  if (score < 40) return 'LEARNING'
  if (score < 75) return 'DEVELOPING'
  return 'MASTERED'
}

export function masteryForConcept(mastery: ConceptMastery, conceptId: ConceptId): ConceptState {
  return mastery[conceptId] ?? {
    conceptId,
    score: 0,
    attempts: 0,
    correct: 0,
    mistakes: 0,
    mistakesTrack: [],
    hintsUsed: 0,
    status: 'NOT_STARTED',
  }
}

const clamp = (v: number) => Math.max(0, Math.min(100, v))

/**
 * Mutate mastery with data from one finished attempt/evaluation. Returns a new
 * ConceptMastery. `signalsCorrect` are concepts the student demonstrated;
 * `signalsIncorrect` are concepts the student struggled with.
 */
export function applyMastery(
  mastery: ConceptMastery,
  signalsCorrect: readonly ConceptId[],
  signalsIncorrect: readonly ConceptId[],
  hintsUsed: number,
): ConceptMastery {
  const next = { ...mastery } as Record<ConceptId, ConceptState>

  for (const id of signalsIncorrect) {
    const st = next[id]!
    const score = clamp(st.score - 12)
    next[id] = {
      ...st,
      score,
      attempts: st.attempts + 1,
      mistakes: st.mistakes + 1,
      mistakesTrack: [...st.mistakesTrack, true],
      hintsUsed: st.hintsUsed + hintsUsed,
      status: statusForScore(score, st.attempts + 1),
    }
  }

  for (const id of signalsCorrect) {
    const st = next[id]!
    const gain = hintsUsed > 0 ? 10 : 20
    const score = clamp(st.score + gain)
    next[id] = {
      ...st,
      score,
      attempts: st.attempts + 1,
      correct: st.correct + 1,
      mistakesTrack: [...st.mistakesTrack, false],
      hintsUsed: st.hintsUsed + hintsUsed,
      status: statusForScore(score, st.attempts + 1),
    }
  }

  return next as ConceptMastery
}

const CONCEPT_LABELS: Record<ConceptId, string> = {
  'cell-identification': 'Cell identification',
  minterms: 'Minterms',
  adjacency: 'Adjacency',
  'group-formation': 'Group formation',
  'group-size': 'Group size',
  'wrap-around': 'Wrap-around',
  overlap: 'Overlap',
  'don-t-care': "Don't-care",
  'variable-elimination': 'Variable elimination',
  sop: 'SOP',
  pos: 'POS',
  minimality: 'Minimality',
  coverage: 'Coverage',
}

const CATEGORY_LABELS: Record<MistakeCategory, string> = {
  CELL_IDENTIFICATION: 'Cell identification',
  ADJACENCY: 'Adjacency',
  GROUP_SIZE: 'Group size',
  GROUP_SHAPE: 'Group shape',
  WRAP_AROUND: 'Wrap-around',
  OVERLAP: 'Overlap',
  DONT_CARE: "Don't-care",
  COVERAGE: 'Coverage',
  VARIABLE_ELIMINATION: 'Variable elimination',
  COMPLEMENTATION: 'Complementation',
  SOP_POS_CONFUSION: 'SOP / POS',
  MINTERM_MAXTERM_CONFUSION: 'Minterm / maxterm',
  MINIMALITY: 'Minimality',
}

export function categoryLabel(category: MistakeCategory): string {
  return CATEGORY_LABELS[category] ?? category
}

/** Concepts the student has demonstrated or still needs to review, as text. */
export function demonstratedConcepts(evaluation: PracticeEvaluation): readonly string[] {
  return evaluation.equivalent && evaluation.coversRequired
    ? evaluation.masterySignals.map((c) => CONCEPT_LABELS[c] ?? c)
    : []
}

export function reviewConcepts(mastery: ConceptMastery): readonly string[] {
  return ALL_CONCEPTS.filter((c) => {
    const st = mastery[c]!
    return st.status === 'LEARNING' || (st.status === 'DEVELOPING' && st.score < 60)
  }).map((c) => CONCEPT_LABELS[c] ?? c)
}

/** Build the human-facing end-of-attempt feedback (Feature 20). */
export function buildFeedback(
  mastery: ConceptMastery,
  evaluation: PracticeEvaluation,
  hintsUsed: number,
): PracticeFeedback {
  const correct = demonstratedConcepts(evaluation)
  const review = reviewConcepts(mastery)
  const accuracy = Math.max(0, Math.min(100, evaluation.score))
  return {
    score: evaluation.score,
    accuracy,
    mistakes: evaluation.mistakes.length,
    hintsUsed,
    correct,
    review,
    status: statusForScore(accuracy, 1),
  }
}

/** Which concept is currently weakest (lowest score) — for adaptive targeting. */
export function weakestConcept(mastery: ConceptMastery): ConceptId {
  let min = Infinity
  let pick: ConceptId = 'adjacency'
  for (const c of ALL_CONCEPTS) {
    const st = mastery[c]!
    if (st.score < min) {
      min = st.score
      pick = c
    }
  }
  return pick
}

/** Difficulty to serve next based on demonstrated mastery. */
export function adaptiveDifficulty(mastery: ConceptMastery): Difficulty {
  const unmastered = ALL_CONCEPTS.filter((c) => mastery[c]!.status !== 'MASTERED').length
  if (unmastered >= 9) return 1
  if (unmastered >= 6) return 2
  if (unmastered >= 3) return 3
  if (unmastered >= 1) return 4
  return 5
}

/** Build a seed config that targets a weak concept (Feature 23). */
export function adaptiveProblemConfig(
  mastery: ConceptMastery,
  seed: string,
): ProblemSeedConfig {
  const weak = weakestConcept(mastery)
  const difficulty = adaptiveDifficulty(mastery)
  const variableCount = difficulty <= 2 ? 3 : 4
  return {
    variableCount,
    mode: weak === 'pos' ? 'pos' : 'sop',
    difficulty,
    dontCare: weak === 'don-t-care' ? 'required' : weak === 'coverage' || weak === 'overlap' ? 'optional' : 'none',
    concepts: [weak],
    seed: `${seed}-${weak}-${difficulty}`,
  }
}

/** Recommended concept for "Next" guidance. */
export function recommendedNext(mastery: ConceptMastery): ConceptId | null {
  const mastered = new Set(ALL_CONCEPTS.filter((c) => mastery[c]!.status === 'MASTERED'))
  return nextRecommended(mastered)
}

/** Pick a "similar problem" — same objective as the current one. */
export function similarProblemConfig(problem: KMapProblem, seed: string): ProblemSeedConfig {
  const primary = problem.concepts[0] ?? 'adjacency'
  return {
    variableCount: problem.variableCount,
    mode: problem.mode,
    difficulty: problem.difficulty,
    dontCare: problem.dontCareKind,
    concepts: [primary],
    seed: `${problem.id}-${seed}-similar`,
  }
}