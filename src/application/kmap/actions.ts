import type { CellValue } from '../../core/kmap'
import type { GroupValidation } from '../../core/kmap/grouping'

/**
 * K-Map student interaction actions.
 * These represent meaningful student interactions that can be used for:
 * - undo/redo
 * - learning analytics
 * - mistake detection
 * - replay
 * - AI tutor context
 * - teacher analytics
 */
export type KMapAction =
  | { type: 'CELL_SELECTED'; minterm: number }
  | { type: 'CELL_VALUE_CHANGED'; minterm: number; value: CellValue }
  | { type: 'GROUP_CREATED'; cells: number[] }
  | { type: 'GROUP_REMOVED'; cells: number[] }
  | { type: 'GROUP_VALIDATED'; group: number[]; result: GroupValidation }
  | { type: 'HINT_REQUESTED'; level: number }
  | { type: 'STEP_STARTED'; stepId: string }
  | { type: 'STEP_COMPLETED'; stepId: string }
  | { type: 'MISTAKE_DETECTED'; action: KMapAction; explanation: string }
  | { type: 'SOLUTION_REVEALED' }
  | { type: 'ANSWER_SUBMITTED'; answer: string }
  | { type: 'MODE_CHANGED'; from: KMapMode; to: KMapMode }

export type KMapMode = 'explore' | 'learn' | 'practice' | 'challenge' | 'solution'

/**
 * Validates that a KMapAction has the required structure for its type.
 */
export function isValidAction(action: unknown): action is KMapAction {
  if (typeof action !== 'object' || action === null) return false
  const a = action as Record<string, unknown>
  
  switch (a.type) {
    case 'CELL_SELECTED':
      return typeof a.minterm === 'number'
    case 'CELL_VALUE_CHANGED':
      return typeof a.minterm === 'number' && 
             (a.value === 0 || a.value === 1 || a.value === 'X' || a.value === null)
    case 'GROUP_CREATED':
    case 'GROUP_REMOVED':
      return Array.isArray(a.cells) && a.cells.every((c: unknown) => typeof c === 'number')
    case 'GROUP_VALIDATED':
      return Array.isArray(a.group) && 
             a.group.every((c: unknown) => typeof c === 'number') &&
             typeof a.result === 'object' && a.result !== null
    case 'HINT_REQUESTED':
      return typeof a.level === 'number'
    case 'STEP_STARTED':
    case 'STEP_COMPLETED':
      return typeof a.stepId === 'string'
    case 'MISTAKE_DETECTED':
      return typeof a.explanation === 'string' && isValidAction(a.action)
    case 'SOLUTION_REVEALED':
      return true
    case 'ANSWER_SUBMITTED':
      return typeof a.answer === 'string'
    case 'MODE_CHANGED':
      return typeof a.from === 'string' && typeof a.to === 'string'
    default:
      return false
  }
}