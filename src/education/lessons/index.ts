/**
 * Lessons module.
 * This will contain structured lessons that sequence learning steps toward
 * a measurable objective, reusing the learning-step model from the
 * application layer.
 * Placeholder for future educational content.
 */

export interface Lesson {
  id: string
  title: string
  objectives: readonly string[]
  stepIds: readonly string[]
}