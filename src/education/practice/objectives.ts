/**
 * P2 — Learning objectives & the concept registry.
 *
 * Every problem may target one or more learning objectives. This registry
 * describes each concept that a student can master along the K-map journey and
 * the recommended ordering used on the practice home and for "next" guidance.
 */

import type { ConceptId } from './types'

export interface ConceptDescriptor {
  readonly id: ConceptId
  readonly title: string
  readonly short: string
  readonly description: string
}

/** Everyone participating in practice must be registered. */
export const CONCEPTS: readonly ConceptDescriptor[] = [
  { id: 'cell-identification', title: 'Cell Identification', short: 'Identify cells', description: 'Reading minterm positions on the K-map grid.' },
  { id: 'minterms', title: 'Minterms', short: 'Minterms', description: 'How a 1 in a cell corresponds to a minterm product.' },
  { id: 'adjacency', title: 'Adjacency', short: 'Adjacency', description: 'Cells that differ in exactly one variable.' },
  { id: 'group-formation', title: 'Group Formation', short: 'Grouping', description: 'Forming valid rectangular groups.' },
  { id: 'group-size', title: 'Group Size', short: 'Group size', description: 'Using power-of-two group sizes.' },
  { id: 'wrap-around', title: 'Wrap-around', short: 'Wrap-around', description: 'Adjacency across opposite K-map edges.' },
  { id: 'overlap', title: 'Overlap', short: 'Overlap', description: 'Strategic sharing of cells between groups.' },
  { id: 'don-t-care', title: "Don't-care", short: "Don't-care", description: "Using X cells to simplify the cover." },
  { id: 'variable-elimination', title: 'Variable Elimination', short: 'Var elimination', description: 'Dropping the variables that change inside a group.' },
  { id: 'sop', title: 'Sum of Products', short: 'SOP', description: 'Combining product terms with OR.' },
  { id: 'pos', title: 'Product of Sums', short: 'POS', description: 'Combining sum terms with AND.' },
  { id: 'minimality', title: 'Minimality', short: 'Minimal', description: 'Producing a cover with no redundant groups.' },
  { id: 'coverage', title: 'Coverage', short: 'Coverage', description: 'Covering every required cell at least once.' },
]

/** Broad learning-path stages a student passes through. */
export const LEARNING_STAGES: readonly { label: string; concepts: readonly ConceptId[] }[] = [
  { label: 'Fundamentals', concepts: ['cell-identification', 'minterms', 'adjacency'] },
  { label: 'Grouping', concepts: ['group-formation', 'group-size', 'wrap-around', 'overlap'] },
  { label: 'Simplification', concepts: ['variable-elimination', 'don-t-care', 'sop', 'pos'] },
  { label: 'Mastery', concepts: ['coverage', 'minimality'] },
]

export function conceptById(id: ConceptId): ConceptDescriptor {
  return CONCEPTS.find((c) => c.id === id)!
}

export function conceptTitle(id: ConceptId): string {
  return conceptById(id).title
}

export function conceptShort(id: ConceptId): string {
  return conceptById(id).short
}

/** Recommended concept to tackle next given the current mastered set. */
export function nextRecommended(mastered: ReadonlySet<ConceptId>): ConceptId | null {
  for (const stage of LEARNING_STAGES) {
    for (const c of stage.concepts) {
      if (!mastered.has(c)) return c
    }
  }
  return null
}