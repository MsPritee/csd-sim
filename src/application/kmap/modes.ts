/**
 * K-Map simulator modes control the learning experience and available features.
 * Each mode has different rules for:
 * - solution visibility
 * - hints availability
 * - automatic assistance
 * - validation strictness
 * - feedback detail
 */
export type KMapMode = 'explore' | 'learn' | 'practice' | 'challenge' | 'solution'

export interface KMapModeConfig {
  /** Whether the solution is visible to the student */
  showSolution: boolean
  /** Whether hints are available */
  hintsAvailable: boolean
  /** Whether automatic assistance is provided */
  autoAssist: boolean
  /** How strict validation is (strict = only mathematically correct, lenient = allow educational attempts) */
  validationStrictness: 'strict' | 'lenient'
  /** Level of feedback detail */
  feedbackDetail: 'minimal' | 'normal' | 'detailed'
}

/**
 * Configuration for each K-map mode.
 */
export const MODE_CONFIGS: Record<KMapMode, KMapModeConfig> = {
  explore: {
    showSolution: true,
    hintsAvailable: true,
    autoAssist: true,
    validationStrictness: 'lenient',
    feedbackDetail: 'detailed',
  },
  learn: {
    showSolution: false,
    hintsAvailable: true,
    autoAssist: true,
    validationStrictness: 'lenient',
    feedbackDetail: 'detailed',
  },
  practice: {
    showSolution: false,
    hintsAvailable: true,
    autoAssist: false,
    validationStrictness: 'strict',
    feedbackDetail: 'normal',
  },
  challenge: {
    showSolution: false,
    hintsAvailable: false,
    autoAssist: false,
    validationStrictness: 'strict',
    feedbackDetail: 'minimal',
  },
  solution: {
    showSolution: true,
    hintsAvailable: true,
    autoAssist: true,
    validationStrictness: 'lenient',
    feedbackDetail: 'detailed',
  },
}

/**
 * Get the configuration for a specific mode.
 */
export function getModeConfig(mode: KMapMode): KMapModeConfig {
  return MODE_CONFIGS[mode]
}

/**
 * Check if a mode allows solution visibility.
 */
export function canShowSolution(mode: KMapMode): boolean {
  return getModeConfig(mode).showSolution
}

/**
 * Check if a mode allows hints.
 */
export function canShowHints(mode: KMapMode): boolean {
  return getModeConfig(mode).hintsAvailable
}