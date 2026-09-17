import {
  type KMapModel,
  withValue,
} from '../../core/kmap'
import { createKMapWithVariables } from './use-cases'

/**
 * Dynamic variable-name selection support.
 *
 * These helpers belong to the APPLICATION layer: they validate and shape the
 * user's chosen variable names BEFORE they reach the model builder. They never
 * alter the K-map mathematics — the core engine continues to work with
 * variable positions (index i → variables[i], MSB-first); the chosen names act
 * purely as the presentation mapping.
 */

/** Single-letter names only (matches the boolean expression engine's parser). */
export const SINGLE_LETTER_NAME_RE = /^[A-Za-z]$/

/** Sensible fallback letters used when growing the variable count. */
const DEFAULT_NAMES = ['A', 'B', 'C', 'D', 'E'] as const

export interface VariableNameIssue {
  readonly index: number
  readonly message: string
}

export interface VariableNamesValidation {
  readonly valid: boolean
  readonly names: string[]
  readonly issues: VariableNameIssue[]
}

/**
 * Validate a set of variable names as a batch.
 *
 * Rules:
 * - every name is trimmed;
 * - names cannot be empty;
 * - names must be a single letter (A-Z, a-z) — the expression engine's naming
 *   restriction;
 * - names must be unique (case-insensitively, so "A" and "a" conflict);
 * - between 2 and 5 names are required (the K-map engine's bound).
 *
 * Invalid sets report per-field issues so the UI can render messages next to
 * the responsible row; callers must NOT apply an invalid set.
 */
export function validateVariableNames(variables: readonly string[]): VariableNamesValidation {
  const names = variables.map((v) => v.trim())
  const issues: VariableNameIssue[] = []

  if (names.length < 2) {
    issues.push({ index: 0, message: 'A K-map requires at least 2 variables.' })
  }
  if (names.length > 5) {
    issues.push({ index: 0, message: 'A K-map supports at most 5 variables.' })
  }

  for (let i = 0; i < names.length; i++) {
    const name = names[i] ?? ''
    const label = `Variable ${i + 1}`
    if (name === '') {
      issues.push({ index: i, message: `${label} name cannot be empty.` })
    } else if (!SINGLE_LETTER_NAME_RE.test(name)) {
      issues.push({ index: i, message: 'Variable names must be a single letter (A-Z).' })
    }
  }

  const seen = new Map<string, number>()
  for (let i = 0; i < names.length; i++) {
    const name = names[i] ?? ''
    if (name === '') continue
    const key = name.toUpperCase()
    const previous = seen.get(key)
    if (previous !== undefined) {
      issues.push({
        index: i,
        message: `Variable ${i + 1} name is already used by Variable ${previous + 1}.`,
      })
    } else {
      seen.set(key, i)
    }
  }

  return { valid: issues.length === 0, names, issues }
}

/**
 * Grow or shrink a variable-name list when the user changes the variable
 * count.
 *
 * - Shrink: drop trailing variables (clean removal).
 * - Grow: keep the existing selections, then append the positional default
 *   (D for the 4th slot, E for the 5th, ...), skipping any letter already used.
 *
 * For the default names this reproduces the legacy behavior exactly
 * (A,B → A,B,C → A,B,C,D → A,B,C,D,E) while preserving custom names.
 */
export function adjustVariablesToCount(
  previous: readonly string[],
  count: 2 | 3 | 4 | 5,
): string[] {
  if (previous.length >= count) return previous.slice(0, count)

  const result = [...previous.slice(0, count)]
  const used = new Set(result.map((n) => n.toUpperCase()))

  for (let pos = result.length; pos < count; pos++) {
    const preferred = DEFAULT_NAMES[pos]
    let next: string | undefined
    if (preferred !== undefined && !used.has(preferred)) {
      next = preferred
    } else {
      next = DEFAULT_NAMES.find((c) => !used.has(c) && !result.includes(c))
    }
    if (next === undefined) break
    result.push(next)
    used.add(next.toUpperCase())
  }

  return result.length < 2 ? [...DEFAULT_NAMES.slice(0, count)] : result
}

/**
 * Rebuild a K-map model with new variable names while preserving entered cell
 * values.
 *
 * Variables live at positions 0..n-1 with position 0 as the most significant
 * bit, so add/remove operations only ever affect the trailing (least
 * significant) positions. Preserving values across a count change therefore
 * maps minterms by bit-shifting by the difference:
 * - shrink (4→3, drop the LSB): newMinterm = oldMinterm >> dropped
 * - grow (3→4, append a zero LSB): newMinterm = oldMinterm << added
 *
 * The underlying mathematical model is unchanged; only the names change.
 */
export function renameKMapVariables(
  model: KMapModel,
  newVariables: readonly string[],
): KMapModel {
  const oldCount = model.layout.variables.length
  const newCount = newVariables.length
  const shift = oldCount - newCount

  let next = createKMapWithVariables(newVariables)
  for (const cell of model.cells.flat()) {
    if (cell.value === null) continue
    const mapped = shift > 0 ? cell.minterm >> shift : cell.minterm << -shift
    if (mapped < 0 || mapped >= 2 ** newCount) continue
    next = withValue(next, mapped, cell.value)
  }
  return next
}