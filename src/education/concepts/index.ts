/**
 * Concepts module.
 * This will contain the educational concept model with titles, objectives,
 * prerequisites, explanations, visualizations, interactions, common mistakes,
 * hints, and assessment hooks.
 * Placeholder for future educational content.
 */

export interface Concept {
  id: string
  title: string
  objective: string
  prerequisites?: readonly string[]
}