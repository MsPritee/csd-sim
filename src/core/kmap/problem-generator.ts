/**
 * P2 — Deterministic K-map problem generator.
 *
 * Generates VALID, reproducible problems. Expected solutions are NEVER
 * hard-coded: they are computed with the existing `simplify` engine so the
 * system naturally supports equivalent alternative solutions.
 *
 * Strategy:
 *  1. A small curated TEMPLATES registry guarantees the "hard-to-hit" concepts
 *     (wrap-around, overlap, required don't-care, strategic overlap) that are
 *     too rare to rely on random sampling — reproducible via the seed.
 *  2. For common concepts a seeded PRNG (mulberry32) samples candidate maps
 *     and accepts the first that satisfies the requested emphasis, so the
 *     generator is both varied and deterministic.
 */

import { createKMap, withValue, minterms, maxterms, dontCares, type KMapModel } from './model'
import { simplify, type CellGroup } from './simplify'
import { groupsOverlap } from './grouping'
import { groupWraps, analyzeGroupVariables } from './group-reasoning'
import type {
  KMapProblem,
  ProblemSeedConfig,
  ConceptId,
  Difficulty,
  VariableCount,
} from '../../education/practice/types'

type ConceptSet = ReadonlySet<ConceptId>

const VARIABLES_BY_COUNT: Record<VariableCount, readonly string[]> = {
  2: ['A', 'B'],
  3: ['A', 'B', 'C'],
  4: ['A', 'B', 'C', 'D'],
}

const CONCEPT_ORDER: readonly ConceptId[] = [
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

/* ------------------------------------------------------------------ *
 * Seeded PRNG (mulberry32) — deterministic across runs and platforms.
 * ------------------------------------------------------------------ */
function hashSeed(seed: string): number {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = (h * 16777619) >>> 0
  }
  return h >>> 0
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/* ------------------------------------------------------------------ *
 * Model + concept extraction (reuses the shared simplification engine).
 * ------------------------------------------------------------------ */
function buildModel(variables: readonly string[], ones: number[], dc: number[]): KMapModel {
  let model = createKMap([...variables])
  const total = 2 ** variables.length
  for (let m = 0; m < total; m++) {
    if (dc.includes(m)) model = withValue(model, m, 'X')
    else model = withValue(model, m, ones.includes(m) ? 1 : 0)
  }
  return model
}

function relevantGroups(model: KMapModel, mode: 'sop' | 'pos'): CellGroup[] {
  const ones = new Set(minterms(model))
  const zeros = new Set(maxterms(model))
  const dc = new Set(dontCares(model))
  const s = simplify(model, ones, zeros, dc)
  return (mode === 'sop' ? s.sopGroups : s.posGroups).map((g) => [...g.cells].sort((a, b) => a - b))
}

function extractConcepts(
  model: KMapModel,
  mode: 'sop' | 'pos',
  dcCells: readonly number[],
): ConceptSet {
  const concepts = new Set<ConceptId>([mode === 'sop' ? 'sop' : 'pos'])
  const groups = relevantGroups(model, mode)
  concepts.add('cell-identification')
  concepts.add('minterms')

  if (groups.length > 0) concepts.add('group-formation')
  if (groups.some((g) => g.length >= 2)) concepts.add('adjacency')
  if (groups.some((g) => g.length >= 4)) concepts.add('group-size')
  if (groups.length > 1) concepts.add('coverage')
  if (groups.length > 1) concepts.add('minimality')
  if (groups.some((g) => groupWraps(model, g))) concepts.add('wrap-around')
  for (let i = 0; i < groups.length; i++) {
    for (let j = i + 1; j < groups.length; j++) {
      if (groupsOverlap(groups[i]!, groups[j]!)) {
        concepts.add('overlap')
        break
      }
    }
    if (concepts.has('overlap')) break
  }
  if (groups.some((g) => analyzeGroupVariables(model, g).changed.length > 0)) {
    concepts.add('variable-elimination')
  }
  const dcSet = new Set(dcCells)
  if (groups.some((g) => g.some((c) => dcSet.has(c)))) concepts.add('don-t-care')

  return concepts
}

/** A problem is valid and non-trivial if it has a real, non-constant cover. */
function isNontrivial(model: KMapModel, mode: 'sop' | 'pos'): boolean {
  const groups = relevantGroups(model, mode)
  const required = mode === 'sop' ? minterms(model) : maxterms(model)
  if (required.length === 0) return false
  const covered = new Set<number>()
  for (const g of groups) for (const c of g) covered.add(c)
  return required.every((m) => covered.has(m)) && groups.length >= 1
}

function matchesDifficulty(concepts: ConceptSet, difficulty: Difficulty): boolean {
  switch (difficulty) {
    case 1:
      return !concepts.has('wrap-around') && !concepts.has('overlap') && !concepts.has('don-t-care')
    case 2:
      return !concepts.has('overlap') && !concepts.has('don-t-care')
    case 3:
      return true
    case 4:
      return concepts.has('wrap-around') || concepts.has('overlap') || concepts.has('don-t-care')
    case 5:
      return (
        (concepts.has('wrap-around') || concepts.has('don-t-care')) && concepts.has('overlap')
      )
    default:
      return true
  }
}

/* ------------------------------------------------------------------ *
 * Random (but seeded) generation for common concepts.
 * ------------------------------------------------------------------ */
function randomSubset(rng: () => number, pool: number[], want: number): number[] {
  const copy = [...pool]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j]!, copy[i]!]
  }
  return copy.slice(0, want).sort((a, b) => a - b)
}

function randomCandidate(
  rng: () => number,
  variables: readonly string[],
  mode: 'sop' | 'pos',
  dontCare: 'none' | 'optional' | 'required',
): { ones: number[]; dc: number[] } {
  const total = 2 ** variables.length
  const pool = Array.from({ length: total }, (_, i) => i)
  const allowDc = dontCare !== 'none'
  const want = Math.max(2, Math.min(total - 2, 2 + Math.floor(rng() * (total - 4))))
  let ones = randomSubset(rng, pool, want)
  let dc: number[] = []
  if (allowDc && rng() < (dontCare === 'required' ? 1 : 0.4)) {
    const remaining = pool.filter((m) => !ones.includes(m))
    dc = randomSubset(rng, remaining, Math.max(1, Math.floor(rng() * (remaining.length))))
  }
  // POS just complements the roles.
  if (mode === 'pos') {
    ones = pool.filter((m) => !ones.includes(m)).filter((m) => !dc.includes(m))
  }
  // Don't-care "required": ensure at least one dc adjacent to a one that is used.
  return { ones, dc }
}

/* ------------------------------------------------------------------ *
 * Curated templates guarantee the hard-to-hit concepts deterministically.
 * `ones`/`dc` are given; expected solutions are still computed by the engine.
 * ------------------------------------------------------------------ */
interface Template {
  readonly id: string
  readonly variables: readonly string[]
  readonly ones: readonly number[]
  readonly dc: readonly number[]
  readonly mode: 'sop' | 'pos'
  readonly difficulty: Difficulty
  readonly dontCare: 'none' | 'optional' | 'required'
  readonly concepts: readonly ConceptId[]
}

const TEMPLATES: readonly Template[] = [
  {
    id: 'wrap-corners-4var',
    variables: ['A', 'B', 'C', 'D'],
    ones: [0, 3, 12, 15],
    dc: [],
    mode: 'sop',
    difficulty: 3,
    dontCare: 'none',
    concepts: ['wrap-around', 'adjacency', 'variable-elimination', 'group-size'],
  },
  {
    id: 'wrap-band-4var',
    variables: ['A', 'B', 'C', 'D'],
    ones: [0, 1, 4, 5, 8, 9, 12, 13],
    dc: [],
    mode: 'sop',
    difficulty: 2,
    dontCare: 'none',
    concepts: ['wrap-around', 'group-size', 'variable-elimination'],
  },
  {
    id: 'overlap-essential-4var',
    variables: ['A', 'B', 'C', 'D'],
    ones: [1, 3, 5, 7, 8, 9, 10, 11, 15],
    dc: [],
    mode: 'sop',
    difficulty: 4,
    dontCare: 'none',
    concepts: ['overlap', 'minimality', 'coverage', 'adjacency'],
  },
  {
    id: 'dontcare-optional-4var',
    variables: ['A', 'B', 'C', 'D'],
    ones: [0, 4, 8, 12],
    dc: [1, 5, 9, 13],
    mode: 'sop',
    difficulty: 3,
    dontCare: 'optional',
    concepts: ['don-t-care', 'wrap-around', 'variable-elimination'],
  },
  {
    id: 'dontcare-required-4var',
    variables: ['A', 'B', 'C', 'D'],
    ones: [0, 2, 8, 10],
    dc: [1, 3, 9, 11, 14],
    mode: 'sop',
    difficulty: 4,
    dontCare: 'required',
    concepts: ['don-t-care', 'adjacency', 'group-size', 'variable-elimination'],
  },
  {
    id: 'pos-basic-3var',
    variables: ['A', 'B', 'C'],
    ones: [1, 2, 5, 6],
    dc: [],
    mode: 'pos',
    difficulty: 2,
    dontCare: 'none',
    concepts: ['pos', 'adjacency', 'minimality'],
  },
  {
    id: 'strategic-overlap-challenge',
    variables: ['A', 'B', 'C', 'D'],
    ones: [0, 1, 2, 4, 5, 6, 8, 9, 10],
    dc: [3, 7, 11, 15],
    mode: 'sop',
    difficulty: 5,
    dontCare: 'optional',
    concepts: ['wrap-around', 'overlap', 'don-t-care', 'minimality', 'variable-elimination'],
  },
  {
    id: 'coverage-separate-3var',
    variables: ['A', 'B', 'C'],
    ones: [0, 1, 2, 4, 7],
    dc: [],
    mode: 'sop',
    difficulty: 2,
    dontCare: 'none',
    concepts: ['coverage', 'adjacency', 'minimality'],
  },
]

function templateMatches(t: Template, config: ProblemSeedConfig): boolean {
  if (t.variables.length !== config.variableCount) return false
  if (t.mode !== config.mode) return false
  if (t.difficulty !== config.difficulty) return false
  if (config.dontCare !== 'none' && t.dontCare === 'none') return false
  if (config.dontCare === 'none' && t.dontCare !== 'none') return false
  if (config.dontCare === 'optional' && t.dontCare === 'required') return false
  return config.concepts.every((c) => t.concepts.includes(c))
}

function templateToProblem(t: Template, config: ProblemSeedConfig): KMapProblem {
  const variables = [...t.variables]
  const model = buildModel(variables, [...t.ones], [...t.dc])
  const ones = new Set(minterms(model))
  const zeros = new Set(maxterms(model))
  const dc = new Set(dontCares(model))
  const s = simplify(model, ones, zeros, dc)
  const onesList = [...minterms(model)].sort((a, b) => a - b)
  const maxList = [...maxterms(model)].sort((a, b) => a - b)
  return {
    id: t.id,
    seed: `${t.id}-${config.seed}`,
    title: problemTitle(t.variables.length, t.mode, t.difficulty),
    prompt: modePrompt(variables, onesList, [...dontCares(model)], t.mode),
    variables,
    variableCount: t.variables.length as VariableCount,
    mode: t.mode,
    minterms: onesList,
    maxterms: maxList,
    dontCares: [...dontCares(model)].sort((a, b) => a - b),
    dontCareKind: t.dontCare,
    difficulty: t.difficulty,
    learningObjectives: objectivesForConcepts(t.concepts, t.variables.length),
    concepts: CONCEPT_ORDER.filter((c) => t.concepts.includes(c)),
    allowedHints: config.difficulty >= 4 ? 3 : 5,
    expected: {
      sop: s.sop,
      pos: s.pos,
      sopGroups: s.sopGroups.map((g) => [...g.cells].sort((a, b) => a - b)),
      posGroups: s.posGroups.map((g) => [...g.cells].sort((a, b) => a - b)),
    },
    likelyMisconceptions: likelyMisconceptions(t.concepts),
  }
}

/* ------------------------------------------------------------------ *
 * Public generator API.
 * ------------------------------------------------------------------ */
export function generateProblem(config: ProblemSeedConfig): KMapProblem {
  const matched = TEMPLATES.filter((t) => templateMatches(t, config))
  if (matched.length > 0) {
    const idx = hashSeed(`${config.seed}-${matched.length}`) % matched.length
    return templateToProblem(matched[idx]!, config)
  }

  const variables = [...VARIABLES_BY_COUNT[config.variableCount]]
  const rng = mulberry32(hashSeed(config.seed))
  const maxAttempts = config.maxAttempts ?? 4000
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const { ones, dc } = randomCandidate(rng, variables, config.mode, config.dontCare)
    const model = buildModel(variables, ones, dc)
    if (!isNontrivial(model, config.mode)) continue
    const concepts = extractConcepts(model, config.mode, dc)
    if (!config.concepts.every((c) => concepts.has(c))) continue
    if (!matchesDifficulty(concepts, config.difficulty)) continue

    const onesSet = new Set(minterms(model))
    const zerosSet = new Set(maxterms(model))
    const dcSet = new Set(dontCares(model))
    const s = simplify(model, onesSet, zerosSet, dcSet)
    const relevantIds = CONCEPT_ORDER.filter((c) => concepts.has(c))
    const onesList = [...minterms(model)].sort((a, b) => a - b)
    const maxList = [...maxterms(model)].sort((a, b) => a - b)
    return {
      id: `${config.variableCount}var-${config.seed}-${attempt}`,
      seed: config.seed,
      title: problemTitle(config.variableCount, config.mode, config.difficulty),
      prompt: modePrompt(variables, onesList, [...dontCares(model)], config.mode),
      variables,
      variableCount: config.variableCount,
      mode: config.mode,
      minterms: onesList,
      maxterms: maxList,
      dontCares: [...dontCares(model)].sort((a, b) => a - b),
      dontCareKind: config.dontCare,
      difficulty: config.difficulty,
      learningObjectives: objectivesForConcepts(relevantIds, config.variableCount),
      concepts: relevantIds,
      allowedHints: config.difficulty >= 4 ? 3 : 5,
      expected: {
        sop: s.sop,
        pos: s.pos,
        sopGroups: s.sopGroups.map((g) => [...g.cells].sort((a, b) => a - b)),
        posGroups: s.posGroups.map((g) => [...g.cells].sort((a, b) => a - b)),
      },
      likelyMisconceptions: likelyMisconceptions(relevantIds),
    }
  }

  // Fallback: a guaranteed valid template / curated problem to avoid infinite loops.
  return templateToProblem(TEMPLATES[0]!, config)
}

/* ------------------------------------------------------------------ *
 * Presentation helpers.
 * ------------------------------------------------------------------ */
export function buildProblemModel(problem: KMapProblem): KMapModel {
  return buildModel([...problem.variables], [...problem.minterms], [...problem.dontCares])
}

function modePrompt(variables: readonly string[], ones: number[], dc: number[], mode: 'sop' | 'pos'): string {
  const relevant = [...ones].sort((a, b) => a - b)
  if (mode === 'pos') {
    const total = 2 ** variables.length
    const zeros = Array.from({ length: total }, (_, i) => i).filter(
      (m) => !ones.includes(m) && !dc.includes(m),
    )
    return `\u03a0M(${zeros.join(',')})  \u2014 simplify to a Product of Sums expression.`
  }
  return `\u03a3m(${relevant.join(',')})  \u2014 simplify to a Sum of Products expression.`
}

function problemTitle(vars: number, mode: 'sop' | 'pos', difficulty: Difficulty): string {
  const labels = ['Beginner', 'Basic', 'Intermediate', 'Advanced', 'Challenge']
  return `${labels[difficulty - 1]} ${vars}-variable ${mode.toUpperCase()}`
}

function objectivesForConcepts(concepts: readonly ConceptId[], _vars: number): readonly string[] {
  const map: Record<ConceptId, string> = {
    'cell-identification': 'Identify the correct cells in the K-map.',
    minterms: 'Recognize the minterm positions.',
    adjacency: 'Identify adjacent cells.',
    'group-formation': 'Form valid, rectangular groups.',
    'group-size': 'Choose groups of the correct (power-of-two) size.',
    'wrap-around': 'Apply wrap-around adjacency between opposite edges.',
    overlap: 'Use strategic overlap between groups.',
    'don-t-care': 'Use don\u2019t-care cells to obtain a simpler cover.',
    'variable-elimination': 'Eliminate variables that change inside a group.',
    sop: 'Group 1s and combine product terms with OR.',
    pos: 'Group 0s and combine sum terms with AND.',
    minimality: 'Produce a minimal cover without redundant groups.',
    coverage: 'Cover every required cell at least once.',
  }
  const seen = new Set<string>()
  const out: string[] = []
  for (const c of concepts) {
    const text = map[c]
    if (text && !seen.has(text)) {
      seen.add(text)
      out.push(text)
    }
  }
  return out
}

function likelyMisconceptions(concepts: readonly ConceptId[]): readonly string[] {
  const map: Partial<Record<ConceptId, string[]>> = {
    'wrap-around': ['WRAP_AROUND'],
    overlap: ['OVERLAP'],
    'don-t-care': ['DONT_CARE'],
    adjacency: ['ADJACENCY', 'GROUP_SHAPE'],
    'group-size': ['GROUP_SIZE'],
    'variable-elimination': ['VARIABLE_ELIMINATION'],
    sop: ['SOP_POS_CONFUSION'],
    pos: ['SOP_POS_CONFUSION'],
    coverage: ['COVERAGE'],
    minimality: ['MINIMALITY'],
  }
  const out: string[] = []
  for (const c of concepts) {
    for (const m of map[c] ?? []) if (!out.includes(m)) out.push(m)
  }
  return out
}