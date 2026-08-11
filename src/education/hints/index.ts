/**
 * Hints module.
 * This will contain progressive hint systems for educational content.
 * Placeholder for future educational content.
 */

export interface Hint {
  level: number
  text: string
  context?: string
}

/**
 * Create a hint with automatic level assignment.
 */
export function createHint(text: string, level: number, context?: string): Hint {
  return { level, text, context }
}

/**
 * Sort hints by level.
 */
export function sortHintsByLevel(hints: Hint[]): Hint[] {
  return [...hints].sort((a, b) => a.level - b.level)
}