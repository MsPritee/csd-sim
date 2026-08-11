import type { KMapModel } from './model'
import { minterms, dontCares } from './model'
import {
  validateGroup,
  validateSopGroup,
  unionCoverage,
  isRedundant,
  type GroupValidation,
} from './grouping'

/**
 * Solution verification result for educational grading.
 * This interface provides a clean boundary between mathematical correctness
 * and educational assessment.
 */
export interface SolutionVerification {
  /** Whether the solution is mathematically valid */
  valid: boolean
  /** Whether the solution is logically equivalent to the optimal solution */
  equivalent: boolean
  /** Whether all required cells are covered */
  coversRequiredCells: boolean
  /** Whether the solution contains invalid groupings */
  containsInvalidCells: boolean
  /** Whether the solution is minimal (no redundant groups) */
  isMinimal: boolean
  /** Whether essential prime implicants are satisfied */
  essentialRequirementsSatisfied: boolean
  /** Educational feedback messages */
  feedback: string[]
  /** Detailed validation results for each group */
  groupValidations: readonly GroupValidation[]
}

/**
 * Verification options for controlling strictness level.
 */
export interface VerificationOptions {
  /** Whether to require minimal solution (no redundant groups) */
  requireMinimal: boolean
  /** Whether to check for essential prime implicants */
  checkEssentialImplicants: boolean
  /** Whether to allow don't-care cells in groups */
  allowDontCareInGroups: boolean
  /** Strictness level for validation */
  strictness: 'strict' | 'lenient'
}

/**
 * Default verification options for standard educational use.
 */
export const DEFAULT_VERIFICATION_OPTIONS: VerificationOptions = {
  requireMinimal: true,
  checkEssentialImplicants: true,
  allowDontCareInGroups: true,
  strictness: 'lenient',
}

/**
 * Verify a K-map solution for educational purposes.
 * This wraps the existing simplification logic with educational grading interfaces.
 * 
 * @param model - The K-map model
 * @param groups - The student's proposed groups
 * @param options - Verification options
 * @returns Verification result with educational feedback
 */
export function verifySolution(
  model: KMapModel,
  groups: readonly number[][],
  options: VerificationOptions = DEFAULT_VERIFICATION_OPTIONS
): SolutionVerification {
  const feedback: string[] = []
  const groupValidations: GroupValidation[] = []

  // Required (real 1) cells that must be covered, and flexible don't-cares.
  const required = new Set(minterms(model))
  const dc = new Set(dontCares(model))

  // Validate each group structurally and under SOP rules (no 0 cells).
  let containsInvalidCells = false
  for (const group of groups) {
    const structural = validateGroup(model, group)
    const sop = validateSopGroup(model, group)
    groupValidations.push(structural)

    if (!structural.valid || !sop.valid) {
      containsInvalidCells = true
      const problems = [...structural.issues, ...sop.issues]
        .map((i) => i.message)
        .join(', ')
      feedback.push(`Group [${group.join(', ')}] is invalid: ${problems}.`)
    }
  }

  const valid = !containsInvalidCells

  // A group covering only duplicate/fully-covered cells adds nothing required.
  let isMinimal = true
  for (let i = 0; i < groups.length; i++) {
    const others = groups.filter((_, j) => j !== i)
    if (isRedundant(others, groups[i]!)) {
      isMinimal = false
      feedback.push(`Group [${groups[i]!.join(', ')}] is redundant and can be removed.`)
      break
    }
  }

  // Logical equivalence: every required cell is covered, and groups only
  // touch required or don't-care cells (never 0s).
  const covered = unionCoverage(groups)
  const coversRequiredCells = [...required].every((m) => covered.has(m))
  const groupsStayInAllowable = [...covered].every(
    (m) => required.has(m) || dc.has(m),
  )
  const equivalent = coversRequiredCells && groupsStayInAllowable && !containsInvalidCells

  if (!coversRequiredCells) {
    const missing = [...required].filter((m) => !covered.has(m))
    feedback.push(
      `Not all required cells are covered. Missing: [${missing.join(', ')}].`,
    )
  }

  if (coversRequiredCells && containsInvalidCells) {
    feedback.push('Your solution covers the required cells but contains invalid groups.')
  }

  if (!equivalent && coversRequiredCells && !containsInvalidCells) {
    feedback.push('Your solution covers the required cells but includes non-required cells.')
  }

  if (!isMinimal && options.requireMinimal) {
    feedback.push('Your solution contains redundant groups that can be eliminated.')
  }

  const essentialRequirementsSatisfied =
    (!options.checkEssentialImplicants ? true : equivalent && isMinimal)

  if (!essentialRequirementsSatisfied && options.checkEssentialImplicants) {
    feedback.push('Your solution does not fully satisfy the essential requirements.')
  }

  if (valid && equivalent && coversRequiredCells && (!options.requireMinimal || isMinimal)) {
    feedback.push('Your solution is mathematically correct!')
  }

  return {
    valid,
    equivalent,
    coversRequiredCells,
    containsInvalidCells,
    isMinimal,
    essentialRequirementsSatisfied,
    feedback,
    groupValidations,
  }
}

/**
 * Create a minimal verification result for cases where verification is not needed.
 */
export function createMinimalVerification(
  valid: boolean,
  message: string
): SolutionVerification {
  return {
    valid,
    equivalent: valid,
    coversRequiredCells: valid,
    containsInvalidCells: !valid,
    isMinimal: valid,
    essentialRequirementsSatisfied: valid,
    feedback: [message],
    groupValidations: [],
  }
}