/**
 * P2 — Practice session store.
 *
 * Holds the local, in-browser practice session: which problem is active, the
 * student's current cell selection / groups / hints / mistakes, the running
 * concept mastery, and the session index. It reuses the shared core engines
 * (generator, reasoning, mastery) and keeps no student identity.
 *
 * Mastery is persisted to localStorage for continuity within the browser (no
 * backend). The store holds UI-state only — all math lives in core.
 */

import { create } from 'zustand'
import { generateProblem, buildProblemModel } from '../core/kmap/problem-generator'
import {
  evaluateGroups,
  evaluateExpression,
} from '../education/practice/reasoning'
import {
  initialMastery,
  applyMastery,
  adaptiveProblemConfig,
  similarProblemConfig,
} from '../education/practice/mastery'
import { assertValidProblem } from '../core/kmap/problem-validator'
import type {
  KMapProblem,
  PracticeEvaluation,
  MistakeDetail,
  ConceptMastery,
  Difficulty,
  DontCareKind,
} from '../education/practice/types'

export type PracticeScreen = 'home' | 'session'
export type PracticeMode = 'guided' | 'independent' | 'challenge'

const MASTERY_KEY = 'csd.kmap.practice.mastery.v1'

function loadMastery(): ConceptMastery {
  try {
    const raw = localStorage.getItem(MASTERY_KEY)
    if (raw) return JSON.parse(raw) as ConceptMastery
  } catch {
    /* ignore */
  }
  return initialMastery()
}

function persistMastery(mastery: ConceptMastery) {
  try {
    localStorage.setItem(MASTERY_KEY, JSON.stringify(mastery))
  } catch {
    /* ignore */
  }
}

export interface SessionProfile {
  readonly variableCount: 2 | 3 | 4
  readonly difficulty: Difficulty
  readonly dontCare: DontCareKind
}

function profileFor(mode: PracticeMode): SessionProfile {
  switch (mode) {
    case 'guided':
      return { variableCount: 3, difficulty: 1, dontCare: 'none' }
    case 'independent':
      return { variableCount: 3, difficulty: 2, dontCare: 'none' }
    case 'challenge':
      return { variableCount: 4, difficulty: 5, dontCare: 'optional' }
  }
}

export interface PracticeState {
  screen: PracticeScreen
  mode: PracticeMode
  /** Total problems in the current session. */
  sessionSize: number
  /** Zero-based index of the current problem (beyond the end = finished). */
  index: number
  problem: KMapProblem | null
  selectedCells: readonly number[]
  groups: readonly (readonly number[])[]
  hintsUsed: number
  usedHints: boolean
  mistakes: readonly MistakeDetail[]
  evaluation: PracticeEvaluation | null
  /** The student's final expression, shown after they submit one. */
  submittedExpression: string
  conceptMastery: ConceptMastery

  startSession: (mode: PracticeMode, size: number) => void
  backHome: () => void
  selectCell: (minterm: number) => void
  clearSelection: () => void
  addGroup: () => void
  removeGroup: (index: number) => void
  clearGroups: () => void
  requestHint: () => void
  submitGroups: () => void
  submitExpression: (expression: string) => void
  nextProblem: () => void
  retry: () => void
  similar: () => void
}

function generateAdaptive(mastery: ConceptMastery, profile: SessionProfile, seed: string): KMapProblem {
  const base = adaptiveProblemConfig(mastery, seed)
  const config = {
    ...base,
    variableCount: profile.variableCount,
    difficulty: profile.difficulty,
    dontCare: profile.dontCare,
  }
  return assertValidProblem(generateProblem(config))
}

function emptyAttempt() {
  return {
    selectedCells: [],
    groups: [],
    hintsUsed: 0,
    usedHints: false,
    mistakes: [],
    evaluation: null,
    submittedExpression: '',
  }
}

export const usePracticeStore = create<PracticeState>((set) => {
  const mastered = typeof localStorage !== 'undefined' ? loadMastery() : initialMastery()

  return {
    screen: 'home',
    mode: 'guided',
    sessionSize: 5,
    index: 0,
    problem: null,
    selectedCells: [],
    groups: [],
    hintsUsed: 0,
    usedHints: false,
    mistakes: [],
    evaluation: null,
    submittedExpression: '',
    conceptMastery: mastered,

    startSession: (mode, size) => {
      const first = generateAdaptive(mastered, profileFor(mode), `${mode}-start`)
      set({
        screen: 'session',
        mode,
        sessionSize: size,
        index: 0,
        problem: first,
        ...emptyAttempt(),
      })
    },

    backHome: () => set({ screen: 'home', problem: null, evaluation: null }),

    selectCell: (minterm) =>
      set((s) => {
        if (s.evaluation) return s
        const has = s.selectedCells.includes(minterm)
        return {
          selectedCells: has
            ? s.selectedCells.filter((m) => m !== minterm)
            : [...s.selectedCells, minterm].sort((a, b) => a - b),
        }
      }),

    clearSelection: () => set({ selectedCells: [] }),

    addGroup: () =>
      set((s) => {
        if (!s.problem || s.evaluation || s.selectedCells.length === 0) return s
        return {
          groups: [...s.groups, [...s.selectedCells].sort((a, b) => a - b)],
          selectedCells: [],
        }
      }),

    removeGroup: (index) =>
      set((s) => ({ groups: s.groups.filter((_, i) => i !== index) })),

    clearGroups: () => set({ groups: [] }),

    requestHint: () =>
      set((s) => ({ hintsUsed: s.hintsUsed + 1, usedHints: true })),

    submitGroups: () =>
      set((s) => {
        if (!s.problem || s.evaluation) return s
        const model = buildProblemModel(s.problem)
        const evaluation = evaluateGroups(model, s.problem, s.groups, s.usedHints)
        return { evaluation, mistakes: evaluation.mistakes }
      }),

    submitExpression: (expression) =>
      set((s) => {
        if (!s.problem || s.evaluation) return s
        const model = buildProblemModel(s.problem)
        const evaluation = evaluateExpression(model, s.problem, expression, s.usedHints)
        return {
          evaluation,
          submittedExpression: expression,
          mistakes: evaluation.mistakes,
        }
      }),

    nextProblem: () =>
      set((s) => {
        if (!s.problem) return s
        const correct = s.evaluation?.equivalent && s.evaluation?.coversRequired
        const nextMastery = s.evaluation
          ? applyMastery(
              s.conceptMastery,
              correct ? s.evaluation.masterySignals : [],
              correct ? [] : s.evaluation.masterySignals,
              s.usedHints ? s.hintsUsed : 0,
            )
          : s.conceptMastery
        persistMastery(nextMastery)

        const nextIndex = s.index + 1
        if (nextIndex >= s.sessionSize) {
          return { index: nextIndex, problem: null, conceptMastery: nextMastery }
        }
        const next = generateAdaptive(nextMastery, profileFor(s.mode), `next-${nextIndex}`)
        return {
          index: nextIndex,
          problem: next,
          conceptMastery: nextMastery,
          ...emptyAttempt(),
        }
      }),

    retry: () => set(emptyAttempt()),

    similar: () =>
      set((s) => {
        if (!s.problem) return s
        const similar = similarProblemConfig(s.problem, `sim-${Date.now()}`)
        return {
          problem: assertValidProblem(generateProblem(similar)),
          ...emptyAttempt(),
        }
      }),
  }
})

export { buildProblemModel }