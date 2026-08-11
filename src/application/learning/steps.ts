import type { KMapAction } from '../kmap/actions'

/**
 * A hint that can be shown to a student.
 */
export interface Hint {
  level: number
  text: string
}

/**
 * Result of validating a student action against a learning step.
 */
export interface ValidationResult {
  valid: boolean
  explanation?: string
  nextStepId?: string
}

/**
 * A reusable learning step model for educational content.
 * This is generic enough to support:
 * - K-map lessons
 * - Boolean algebra lessons
 * - number-system lessons
 * - combinational circuit lessons
 * - sequential circuit lessons
 */
export interface LearningStep {
  /** Unique identifier for this step */
  id: string
  /** What the student should achieve in this step */
  objective: string
  /** Instruction for the student */
  instruction: string
  /** Optional description of the expected action */
  expectedAction?: string
  /** Optional validation function for student actions */
  validation?: (action: KMapAction) => ValidationResult
  /** Progressive hints available for this step */
  hints: Hint[]
  /** Optional explanation shown after completion */
  explanation?: string
  /** Optional ID of the next step */
  nextStepId?: string
  /** Optional prerequisite step IDs */
  prerequisites?: readonly string[]
}

/**
 * Create a learning step with validation.
 */
export function createLearningStep(step: Omit<LearningStep, 'hints'> & { hints?: Omit<Hint, 'level'>[] }): LearningStep {
  return {
    ...step,
    hints: (step.hints ?? []).map((h, i) => ({ ...h, level: i + 1 })),
    prerequisites: step.prerequisites ?? [],
  }
}

/**
 * Validate a learning step structure.
 */
export function validateLearningStep(step: LearningStep): readonly string[] {
  const errors: string[] = []

  if (!step.id.trim()) {
    errors.push('Step id must not be empty')
  }
  if (!step.objective.trim()) {
    errors.push('Step objective must not be empty')
  }
  if (!step.instruction.trim()) {
    errors.push('Step instruction must not be empty')
  }

  if (step.hints.length > 0) {
    const levels = step.hints.map((h) => h.level)
    const unique = new Set(levels)
    if (unique.size !== levels.length) {
      errors.push('Hint levels must be unique')
    }
    levels.forEach((level, i) => {
      if (level < 1) {
        errors.push(`Hint at index ${i} must have level >= 1`)
      }
    })
  }

  return errors
}

/**
 * Get a hint by level for a learning step.
 */
export function getHint(step: LearningStep, level: number): Hint | undefined {
  return step.hints.find((h) => h.level === level)
}

/**
 * Get the highest hint level available for a step.
 */
export function getMaxHintLevel(step: LearningStep): number {
  return step.hints.length > 0 ? Math.max(...step.hints.map((h) => h.level)) : 0
}