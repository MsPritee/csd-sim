/**
 * Shared utilities for binary-to-decimal visualizer layout and animation
 */

export type ConversionPhase = 'identify' | 'powers' | 'weights' | 'multiply' | 'add' | 'result'

const PHASE_ORDER: readonly ConversionPhase[] = [
  'identify',
  'powers',
  'weights',
  'multiply',
  'add',
  'result',
]

export const DISPLAY_STEPS = [
  { id: 1, label: 'Identify', phases: ['identify'] as const },
  { id: 2, label: 'Place Values', phases: ['powers', 'weights'] as const },
  { id: 3, label: 'Multiply', phases: ['multiply'] as const },
  { id: 4, label: 'Add', phases: ['add'] as const },
  { id: 5, label: 'Result', phases: ['result'] as const },
] as const

export function phaseIndex(phase: string): number {
  const index = PHASE_ORDER.indexOf(phase as ConversionPhase)
  return index === -1 ? 0 : index
}

/** Row stays visible once its phase has been reached (cumulative reveal) */
export function isRowVisible(rowPhase: ConversionPhase, currentPhase: string): boolean {
  return phaseIndex(currentPhase) >= phaseIndex(rowPhase)
}

export function getDisplayStep(phase: string): number {
  for (const step of DISPLAY_STEPS) {
    if ((step.phases as readonly string[]).includes(phase)) {
      return step.id
    }
  }
  return 1
}

export function isDisplayStepActive(stepId: number, currentPhase: string): boolean {
  return getDisplayStep(currentPhase) === stepId
}

export function isDisplayStepComplete(stepId: number, currentPhase: string): boolean {
  return getDisplayStep(currentPhase) > stepId
}

/** Map bit position (from right, 0 = LSB) to column index (0 = MSB) */
export function positionToColumnIndex(position: number, bitLength: number): number {
  return bitLength - 1 - position
}

export function getCellSize(bitLength: number): 'compact' | 'auto' | 'large' {
  if (bitLength > 8) return 'compact'
  if (bitLength > 5) return 'auto'
  return 'large'
}

export const CELL_WIDTH: Record<'compact' | 'auto' | 'large', string> = {
  compact: '2.5rem',
  auto: '3rem',
  large: '3.5rem',
}
