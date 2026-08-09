export type ConceptId = string

export interface CommonMistake {
  readonly error: string
  readonly why: string
  readonly rule?: string
}

export interface Hint {
  readonly level: number
  readonly text: string
}

export interface Assessment {
  readonly prompt: string
  readonly options: readonly string[]
  readonly correctIndex: number
  readonly explanation: string
}

export interface VisualizationHook {
  readonly simulatorId: string
  readonly description: string
}

export interface InteractionHook {
  readonly type: string
  readonly tasks: readonly string[]
}

export interface Concept {
  readonly id: ConceptId
  readonly title: string
  readonly objective: string
  readonly prerequisites: readonly ConceptId[]
  readonly explanation: string
  readonly visualization: VisualizationHook | null
  readonly interaction: InteractionHook | null
  readonly commonMistakes: readonly CommonMistake[]
  readonly hints: readonly Hint[]
  readonly assessment: Assessment | null
}