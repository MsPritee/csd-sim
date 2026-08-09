import type {
  Assessment,
  Concept,
  ConceptId,
  Hint,
  InteractionHook,
  CommonMistake,
  VisualizationHook,
} from './types'

export interface ConceptDraft {
  readonly id: ConceptId
  readonly title: string
  readonly objective: string
  readonly prerequisites?: readonly ConceptId[]
  readonly explanation: string
  readonly visualization?: VisualizationHook | null
  readonly interaction?: InteractionHook | null
  readonly commonMistakes?: readonly CommonMistake[]
  readonly hints?: readonly Hint[]
  readonly assessment?: Assessment | null
}

export function createConcept(draft: ConceptDraft): Concept {
  return {
    id: draft.id,
    title: draft.title,
    objective: draft.objective,
    prerequisites: draft.prerequisites ?? [],
    explanation: draft.explanation,
    visualization: draft.visualization ?? null,
    interaction: draft.interaction ?? null,
    commonMistakes: draft.commonMistakes ?? [],
    hints: [...(draft.hints ?? [])].sort((a, b) => a.level - b.level),
    assessment: draft.assessment ?? null,
  }
}

export function validateConcept(concept: Concept): readonly string[] {
  const errors: string[] = []

  if (!concept.id.trim()) errors.push('id must not be empty')
  if (!concept.title.trim()) errors.push('title must not be empty')
  if (!concept.objective.trim()) errors.push('objective must not be empty')
  if (!concept.explanation.trim()) errors.push('explanation must not be empty')

  if (concept.hints.length > 0) {
    const levels = concept.hints.map((h) => h.level)
    const unique = new Set(levels)
    if (unique.size !== levels.length) {
      errors.push('hint levels must be unique')
    }
    levels.forEach((level, i) => {
      if (level < 1) errors.push(`hint at index ${i} must have level >= 1`)
    })
  }

  const assessment = concept.assessment
  if (assessment) {
    if (assessment.options.length < 2) {
      errors.push('assessment must have at least 2 options')
    }
    if (
      assessment.correctIndex < 0 ||
      assessment.correctIndex >= assessment.options.length
    ) {
      errors.push('assessment correctIndex must reference an existing option')
    }
  }

  return errors
}

export function hasValidated(concept: Concept): boolean {
  return validateConcept(concept).length === 0
}