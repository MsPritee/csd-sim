import type { KMapModel } from '../../core/kmap'
import { minterms, maxterms, dontCares } from '../../core/kmap'
import { validateGroup } from '../../core/kmap/grouping'
import { analyzeGroupVariables, groupWraps, termFromConstants } from '../../core/kmap/group-reasoning'
import { verifySolution, type SolutionVerification } from '../../core/kmap/verification'
import { performSimplification, type SimplificationResult } from './use-cases'

/**
 * Step-by-step explanation model for a K-map solution.
 * This model is pure TypeScript — it contains NO React components — and is
 * generated from the existing logic engines, so it works for arbitrary inputs.
 */

export type WalkthroughMode = 'sop' | 'pos'

export type WalkthroughStepType =
  | 'understand'
  | 'candidate-groups'
  | 'group-valid'
  | 'variable-comparison'
  | 'variable-elimination'
  | 'term'
  | 'combine'
  | 'final'
  | 'verify'

export interface VariableRow {
  readonly minterm: number
  readonly binary: string
  readonly bits: readonly number[]
}

export interface VariableAnalysis {
  readonly variables: readonly string[]
  readonly rows: readonly VariableRow[]
  /** Variables that stay at one value across the whole group (they survive). */
  readonly constant: readonly { name: string; value: number }[]
  /** Variables that flip across the group (they are eliminated). */
  readonly changed: readonly string[]
}

export type WalkthroughViz =
  | { type: 'targets'; cells: readonly number[] }
  | { type: 'candidate-groups'; groups: readonly (readonly number[])[] }
  | { type: 'group'; cells: readonly number[]; wrap: boolean }
  | { type: 'variable-analysis'; cells: readonly number[] }
  | { type: 'eliminated'; cells: readonly number[]; kept: readonly string[] }
  | { type: 'final'; term: string }

export interface WalkthroughStep {
  readonly id: string
  readonly type: WalkthroughStepType
  readonly title: string
  readonly description: readonly string[]
  readonly affectedCells: readonly number[]
  readonly affectedGroups?: readonly (readonly number[])[]
  readonly variableAnalysis?: VariableAnalysis
  readonly derivedTerm?: string
  readonly hint?: string
  readonly viz: WalkthroughViz
}

export interface KMapSolution {
  readonly model: KMapModel
  readonly mode: WalkthroughMode
  readonly groups: readonly (readonly number[])[]
  readonly terms: readonly string[]
  readonly finalExpression: string
  readonly verification?: SolutionVerification
  readonly steps: readonly WalkthroughStep[]
}

function literal(name: string, negated: boolean): string {
  return negated ? `${name}'` : name
}

interface AnalyzedGroup {
  analysis: VariableAnalysis
  /** SOP product term built from constant variables. */
  sopTerm: string
  /** POS sum term built from constant variables. */
  posSum: string
  wrap: boolean
}

function analyzeGroup(
  model: KMapModel,
  group: readonly number[],
): AnalyzedGroup {
  const core = analyzeGroupVariables(model, group)
  const { constant, changed } = core
  const variables = [...core.variables]
  const n = variables.length

  const rows: VariableRow[] = core.rows.map((r) => ({
    minterm: r.minterm,
    binary: r.minterm.toString(2).padStart(n, '0'),
    bits: [...r.bits],
  }))

  const sopTerm = termFromConstants(constant, 'sop')
  const posSum = termFromConstants(constant, 'pos')

  return {
    analysis: { variables, rows, constant, changed },
    sopTerm,
    posSum,
    wrap: groupWraps(model, [...new Set(group)]),
  }
}

function groupIsValid(model: KMapModel, group: readonly number[]): boolean {
  return validateGroup(model, group).valid
}

function buildGroupSteps(
  model: KMapModel,
  groups: readonly (readonly number[])[],
  mode: WalkthroughMode,
): WalkthroughStep[] {
  const steps: WalkthroughStep[] = []
  const vars = [...model.layout.variables]

  for (let gi = 0; gi < groups.length; gi++) {
    const group = groups[gi]!
    const { analysis, sopTerm, posSum, wrap } = analyzeGroup(model, group)
    const valid = groupIsValid(model, group)
    const term = mode === 'sop' ? sopTerm : posSum

    steps.push({
      id: `group-${gi}-valid`,
      type: 'group-valid',
      title: `Group ${gi + 1} — Why is this a valid group?`,
      description: buildValidityDescription(group, valid, wrap),
      affectedCells: [...group],
      affectedGroups: [[...group]],
      derivedTerm: term,
      hint: 'Valid K-map groups contain a power-of-two number of adjacent cells that form a rectangle.',
      viz: { type: 'group', cells: [...group], wrap },
    })

    steps.push({
      id: `group-${gi}-compare`,
      type: 'variable-comparison',
      title: `Group ${gi + 1} — Compare the variables in each cell`,
      description: compareDescription(analysis),
      affectedCells: [...group],
      affectedGroups: [[...group]],
      variableAnalysis: analysis,
      hint: 'Look at each variable across all cells in the group.',
      viz: { type: 'variable-analysis', cells: [...group] },
    })

    steps.push({
      id: `group-${gi}-eliminate`,
      type: 'variable-elimination',
      title: `Group ${gi + 1} — Variables that change disappear`,
      description: eliminateDescription(analysis),
      affectedCells: [...group],
      affectedGroups: [[...group]],
      variableAnalysis: analysis,
      derivedTerm: term,
      hint: 'A variable that flips inside a group does not affect the common value, so it is eliminated.',
      viz: {
        type: 'eliminated',
        cells: [...group],
        kept: analysis.constant.map((c) => c.name),
      },
    })

    steps.push({
      id: `group-${gi}-term`,
      type: 'term',
      title: `Group ${gi + 1} — The simplified term`,
      description: termDescription(analysis, term, mode, vars),
      affectedCells: [...group],
      affectedGroups: [[...group]],
      variableAnalysis: analysis,
      derivedTerm: term,
      hint: 'Keep the constant variables — complemented if they are 0 (SOP) or 1 (POS).',
      viz: { type: 'group', cells: [...group], wrap },
    })
  }

  return steps
}

function buildValidityDescription(
  group: readonly number[],
  valid: boolean,
  wrap: boolean,
): string[] {
  const lines = [
    `Group size = ${group.length}.`,
    `${group.length} is a power of 2.`,
    `Cells form a ${wrap ? 'wrap-around ' : ''}rectangle.`,
  ]
  if (wrap) {
    lines.push(
      'These cells appear far apart on screen, but the K-map wraps around its edges, so they are adjacent.',
    )
  }
  return [valid ? '✓ This is a valid group.' : '✗ This group is not valid.', ...lines]
}

function compareDescription(analysis: VariableAnalysis): string[] {
  const { constant, changed } = analysis
  return [
    changed.length > 0
      ? `${changed.join(', ')} ${changed.length === 1 ? 'changes' : 'change'} within the group.`
      : 'No variable changes within this group.',
    constant.length > 0
      ? `${constant.map((c) => `${c.name}=${c.value}`).join(', ')} stay${constant.length === 1 ? 's' : ''} constant.`
      : 'No variable stays constant.',
    'A variable that changes inside a group does not affect the common value of that group.',
  ]
}

function eliminateDescription(analysis: VariableAnalysis): string[] {
  const { constant, changed } = analysis
  const lines: string[] = []
  for (const c of constant) {
    lines.push(`${c.name} stays ${c.value} → retained.`)
  }
  for (const v of changed) {
    lines.push(`${v} changes → eliminated.`)
  }
  lines.push('Changing variables disappear; constant variables remain.')
  return lines
}

function termDescription(
  analysis: VariableAnalysis,
  term: string,
  mode: WalkthroughMode,
  vars: readonly string[],
): string[] {
  const lines: string[] = []
  for (const c of analysis.constant) {
    const negated = mode === 'sop' ? c.value === 0 : c.value === 1
    lines.push(`${c.name} = ${c.value} → ${literal(c.name, negated)}`)
  }
  lines.push(
    `Therefore: ${mode === 'sop' ? 'product term' : 'sum term'} = ${term}.`,
  )
  lines.push(
    `Uses ${vars.length} variables; the unchanged variables form the term.`,
  )
  return lines
}

/**
 * Generate the full step-by-step solution walkthrough for a K-map.
 * Both SOP and POS walks are derived from the same simplification result.
 */
export function generateWalkthrough(
  model: KMapModel,
  mode: WalkthroughMode = 'sop',
): KMapSolution {
  const simplification: SimplificationResult = performSimplification(model)
  const ones = minterms(model)
  const zeros = maxterms(model)
  const dc = dontCares(model)

  const relevant = mode === 'sop' ? ones : zeros
  const groups = (mode === 'sop' ? simplification.sopGroups : simplification.posGroups).map(
    (g) => g.cells,
  )
  const terms = (mode === 'sop' ? simplification.sopGroups : simplification.posGroups).map(
    (g) => (mode === 'sop' ? g.productText : `(${g.sumText})`),
  )
  const finalExpression = mode === 'sop' ? simplification.sop : simplification.pos

  const steps: WalkthroughStep[] = []

  // Step 0 — understand which cells matter.
  steps.push({
    id: 'understand',
    type: 'understand',
    title: `Identify the ${mode === 'sop' ? '1s' : '0s'}`,
    description: [
      `For ${mode.toUpperCase()}, we group the cells that contain ${mode === 'sop' ? '1' : '0'}.`,
      `${relevant.length} relevant cell${relevant.length === 1 ? '' : 's'}: [${relevant.join(', ')}].`,
      dc.length > 0 ? `${dc.length} don't-care cell${dc.length === 1 ? '' : 's'} may be used when helpful.` : 'No don\'t-care cells in this K-map.',
    ],
    affectedCells: [...relevant],
    affectedGroups: [...groups],
    hint: 'Every input combination where the output is 1 (SOP) or 0 (POS) is a required cell.',
    viz: { type: 'targets', cells: [...relevant] },
  })

  // Candidate groups overview.
  steps.push({
    id: 'candidates',
    type: 'candidate-groups',
    title: 'Possible groups',
    description: buildCandidatesDescription(groups),
    affectedCells: [...relevant],
    affectedGroups: [...groups],
    hint: 'Look for the largest rectangles of adjacent cells first.',
    viz: { type: 'candidate-groups', groups: [...groups] },
  })

  // Per-group narrative.
  steps.push(...buildGroupSteps(model, groups, mode))

  if (groups.length > 0) {
    steps.push({
      id: 'combine',
      type: 'combine',
      title: `${mode === 'sop' ? 'Sum' : 'Product'} of the group terms`,
      description: groupCombineDescription(groups, terms, mode),
      affectedCells: [...relevant],
      affectedGroups: [...groups],
      derivedTerm: finalExpression,
      hint: `${mode === 'sop' ? 'Combine the product terms with OR (+).' : 'Combine the sum terms with AND (·).'}`,
      viz: { type: 'final', term: finalExpression },
    })
  }

  steps.push({
    id: 'final',
    type: 'final',
    title: 'Final simplified expression',
    description: [
      `Every group ${mode === 'sop' ? 'ORs' : 'ANDs'} together to form the final ${mode.toUpperCase()} expression.`,
      `${mode.toUpperCase()}: ${finalExpression}`,
    ],
    affectedCells: [...relevant],
    affectedGroups: [...groups],
    derivedTerm: finalExpression,
    hint: 'The final expression is the combination of all group terms.',
    viz: { type: 'final', term: finalExpression },
  })

  // Verification — reuse the existing verification engine on the SOP cover.
  let verification: SolutionVerification | undefined
  try {
    verification = verifySolution(
      model,
      simplification.sopGroups.map((g) => [...g.cells]),
    )
  } catch {
    verification = undefined
  }

  const equivalent = verification?.equivalent && verification?.coversRequiredCells
  steps.push({
    id: 'verify',
    type: 'verify',
    title: 'Final verification',
    description: [
      'The simplified expression is checked against the original function.',
      equivalent
        ? '✓ Both produce the same output for every input combination.'
        : '⚠ The grouping does not yet cover every required cell.',
    ],
    affectedCells: [...relevant],
    affectedGroups: [...groups],
    derivedTerm: finalExpression,
    hint: 'Verification compares outputs for all input combinations.',
    viz: { type: 'final', term: finalExpression },
  })

  return {
    model,
    mode,
    groups,
    terms,
    finalExpression,
    verification,
    steps,
  }
}

function buildCandidatesDescription(
  groups: readonly (readonly number[])[],
): string[] {
  if (groups.length === 0) {
    return ['No candidate groups were found.']
  }
  return groups.map(
    (g, i) => `Group ${i + 1}: ${g.length} cell${g.length === 1 ? '' : 's'} [${g.join(', ')}].`,
  )
}

function groupCombineDescription(
  groups: readonly (readonly number[])[],
  terms: readonly string[],
  mode: WalkthroughMode,
): string[] {
  const combiner = mode === 'sop' ? ' + ' : ' · '
  const joined = terms.join(combiner)
  const lines: string[] = []
  groups.forEach((g, i) => {
    lines.push(`Group ${i + 1} (cells [${g.join(', ')}]) → ${terms[i]}`)
  })
  lines.push(`Combined: ${joined}`)
  lines.push(mode === 'sop'
    ? 'Each product term is OR-ed together (Sum of Products).'
    : 'Each sum term is AND-ed together (Product of Sums).')
  return lines
}