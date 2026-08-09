export type RuleId = string

export interface Rule {
  readonly id: RuleId
  readonly name: string
  readonly statement: string
}

export type VariableChangeKind = 'kept' | 'changed' | 'eliminated' | 'introduced'

export interface VariableChange {
  readonly variable: string
  readonly kind: VariableChangeKind
}

export interface TransformationStep {
  /** Terms before simplification, e.g. ["A'BC", "ABC"] */
  readonly before: readonly string[]
  /** Terms after simplification, e.g. ["BC"] */
  readonly after: readonly string[]
  readonly rule: Rule
}

export interface Explanation {
  readonly what: string
  readonly why: string
  readonly rule: Rule
  readonly changes: readonly VariableChange[]
  readonly notice: readonly string[]
}