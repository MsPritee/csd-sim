/**
 * P3 — Common function representation & validated input.
 *
 * A single representation of a Boolean function from which every view
 * (truth table, minterms, maxterms, don't-cares, K-map, expression) is
 * derived, so all input methods stay synchronized (Feature 24).
 *
 * Parsing is strict: it raises structured, educational errors instead of
 * silently filtering invalid values (Feature 5). It reuses the existing
 * `truth-table` conversion (`mintermsToKMap`, `kmapToTruthTable`) and the
 * OR-set semantics of maxterms, so nothing re-implements model math.
 */

import { mintermsToKMap, kmapToTruthTable, type KMapModel } from './truth-table'
import type { CellValue } from './model'
import {
  parseBooleanExpression,
  expressionTruthTable,
  detectMode,
} from '../boolean/expression'

/** A named, checked provenance-independent Boolean function definition. */
export interface FunctionDefinition {
  readonly variables: readonly string[]
  /** Cells that must be 1. */
  readonly minterms: readonly number[]
  /** Cells that must be 0. */
  readonly maxterms: readonly number[]
  /** Cells that are don't-care (either 0 or 1). */
  readonly dontCares: readonly number[]
}

export type DefinitionSource =
  | 'kmap'
  | 'truth-table'
  | 'minterms'
  | 'maxterms'
  | 'expression'

export interface DefError {
  readonly code:
    | 'EMPTY'
    | 'MALFORMED'
    | 'OUT_OF_RANGE'
    | 'DUPLICATE'
    | 'CONFLICT'
    | 'INVALID_DONT_CARE'
    | 'RANGE'
  readonly message: string
}

export function isValidRange(value: number, totalCells: number): boolean {
  return Number.isInteger(value) && value >= 0 && value < totalCells
}

function buildError(code: DefError['code'], message: string): Error & DefError {
  return Object.assign(new Error(message), { code, message })
}

/**
 * Parse a flexibly-notated index list: comma/space separated decimals and
 * `a-b` ranges, optionally wrapped as `Σm(...)`, `ΠM(...)` or `d(...)`.
 * Returns distinct sorted indices and any duplicates/out-of-range problems.
 */
export interface ParsedIndexList {
  readonly values: readonly number[]
  readonly duplicates: readonly number[]
  readonly outOfRange: readonly number[]
}

const INDEX_WRAPPERS =
  /^\s*[\u03a3\u03a0\u00a3]?\s*(?:\w|M|d)*\s*\(([^)]*)\)\s*$/i

export function parseIndexListText(text: string): { raw: readonly string[]; valid: readonly number[] } {
  const trimmed = text.trim()
  if (trimmed === '') return { raw: [], valid: [] }
  const tokens: string[] = []
  for (const part of trimmed.split(/[,;\s]+/)) {
    if (part === '') continue
    tokens.push(...expandRangeToken(part))
  }
  const valid: number[] = []
  for (const t of tokens) {
    if (/^\d+$/.test(t)) {
      valid.push(Number(t))
    } else {
      // keep raw tokens so caller can report malformed ranges
    }
  }
  return { raw: tokens, valid }
}

function expandRangeToken(token: string): string[] {
  const m = /^(\d+)-(\d+)$/.exec(token.trim())
  if (!m) return [token]
  const start = Number(m[1])
  const end = Number(m[2])
  if (start > end) {
    throw buildError('RANGE', `Range "${token}" is invalid: starting value ${start} is greater than its end ${end}.`)
  }
  const out: string[] = []
  for (let i = start; i <= end; i++) out.push(String(i))
  return out
}

/** Strip a Σ/Π/d wrapper, returning the inner list text. */
export function unwrapIndexList(text: string): string {
  const t = text.trim()
  const m = INDEX_WRAPPERS.exec(t)
  if (m) return m[1] ?? ''
  return t.replace(/^[(\[]/, '').replace(/[)\]]$/, '')
}

export interface IndexCounts {
  readonly values: readonly number[]
  readonly duplicates: readonly number[]
  readonly outOfRange: readonly number[]
}

/**
 * Parse + strictly validate a list that must be 0-K desired cells.
 */
export function parseValidatedIndices(
  text: string,
  totalCells: number,
  allowEmpty: boolean,
): { values: number[]; duplicates: number[]; outOfRange: number[] } {
  const inner = unwrapIndexList(text)
  const raw = parseIndexListText(inner).raw
  const values: number[] = []
  const duplicates: number[] = []
  const outOfRange: number[] = []
  const seen = new Set<number>()

  for (const token of raw) {
    const asNum = /^\d+$/.test(token) ? Number(token) : NaN
    if (Number.isNaN(asNum)) {
      throw new DefinitionError(buildError('MALFORMED', `"${token}" is not a valid index. Indices must be whole numbers (e.g. 0, 1, 2).`))
    }
    if (!isValidRange(asNum, totalCells)) {
      outOfRange.push(asNum)
      continue
    }
    if (seen.has(asNum)) duplicates.push(asNum)
    seen.add(asNum)
    values.push(asNum)
  }
  if (!allowEmpty && values.length === 0 && outOfRange.length === 0 && duplicates.length === 0) {
    throw new DefinitionError(buildError('EMPTY', 'You did not enter any indices.'))
  }
  return { values, duplicates, outOfRange }
}

export class DefinitionError extends Error {
  readonly error: DefError
  constructor(error: DefError) {
    super(error.message)
    this.name = 'DefinitionError'
    this.error = error
  }
}

/**
 * Build a validated FunctionDefinition from an explicit minterm / maxterm /
 * don't-care split. Rejects duplicates, out-of-range values and conflicts.
 */
export function defineFunction(
  variables: readonly string[],
  minterms: readonly number[],
  maxterms: readonly number[],
  dontCares: readonly number[],
): FunctionDefinition {
  const total = 2 ** variables.length

  const check = (list: readonly number[], label: string): void => {
    for (const m of list) {
      if (!isValidRange(m, total)) {
        throw new DefinitionError({
          code: 'OUT_OF_RANGE',
          message: `${label} ${m} is invalid for ${variables.length} variable${variables.length === 1 ? '' : 's'}. Use values 0 to ${total - 1}.`,
        })
      }
    }
    const seen = new Set<number>()
    for (const m of list) {
      if (seen.has(m)) {
        throw new DefinitionError({
          code: 'DUPLICATE',
          message: `${label} ${m} appears more than once.`,
        })
      }
      seen.add(m)
    }
  }

  check(minterms, 'Minterm')
  check(maxterms, 'Maxterm')
  check(dontCares, "Don't-care")

  const mt = new Set(minterms)
  const xt = new Set(maxterms)
  const dc = new Set(dontCares)
  for (const m of minterms) {
    if (xt.has(m) || dc.has(m)) {
      throw new DefinitionError({
        code: 'CONFLICT',
        message: `Cell ${m} cannot be listed as both a ${xt.has(m) ? 'maxterm' : "don't-care"} and a minterm.`,
      })
    }
  }
  for (const m of maxterms) {
    if (dc.has(m)) {
      throw new DefinitionError({
        code: 'CONFLICT',
        message: `Cell ${m} cannot be listed as both a maxterm and a don't-care.`,
      })
    }
  }

  return {
    variables: [...variables],
    minterms: [...mt].sort((a, b) => a - b),
    maxterms: [...xt].sort((a, b) => a - b),
    dontCares: [...dc].sort((a, b) => a - b),
  }
}

/* ------------------------- converters (reuse existing) ------------------------- */

/** Definition → K-map model (reuses the existing truth-table mapper). */
export function definitionToKMap(def: FunctionDefinition): KMapModel {
  return mintermsToKMap({
    variables: def.variables,
    minterms: def.minterms,
    maxterms: def.maxterms,
    dontCares: def.dontCares,
  })
}

/** K-map model → definition (reuses the existing truth-table exporter). */
export function kmapToDefinition(model: KMapModel): FunctionDefinition {
  const { outputs } = kmapToTruthTable(model)
  const ones: number[] = []
  const zeros: number[] = []
  const dc: number[] = []
  outputs.forEach((v, m) => {
    if (v === 1) ones.push(m)
    else if (v === 0) zeros.push(m)
    else if (v === 'X') dc.push(m)
  })
  return { variables: [...model.layout.variables], minterms: ones, maxterms: zeros, dontCares: dc }
}

/** Definition → truth-table outputs (CellValue[]). */
export function definitionToOutputs(def: FunctionDefinition): (CellValue | undefined)[] {
  const total = 2 ** def.variables.length
  const outputs: (CellValue | undefined)[] = Array<CellValue | undefined>(total).fill(undefined)
  for (const m of def.minterms) outputs[m] = 1
  for (const m of def.maxterms) outputs[m] = 0
  for (const m of def.dontCares) outputs[m] = 'X'
  return outputs
}

/** Definition → truth-table outputs with every cell assigned (no undefined). */
export function definitionToNumberOutputs(def: FunctionDefinition): CellValue[] {
  return definitionToOutputs(def).map((v) => v ?? 'X') as CellValue[]
}

/** Build a definition from a truth-table output array. */
export function outputsToDefinition(
  variables: readonly string[],
  outputs: readonly (CellValue | undefined)[],
): FunctionDefinition {
  const ones: number[] = []
  const zeros: number[] = []
  const dc: number[] = []
  outputs.forEach((v, m) => {
    if (v === 1) ones.push(m)
    else if (v === 0) zeros.push(m)
    else if (v === 'X' || v === undefined || v === null) dc.push(m)
  })
  return defineFunction(variables, ones, zeros, dc)
}

/* ------------------------- expression entry point ------------------------- */

/**
 * Build a FunctionDefinition from a Boolean expression string over `variables`.
 * Computes the truth table with the shared parser, then derives minterms /
 * maxterms / don't-cares (all cells not forced by the expression count as
 * don't-care so the K-map remains a faithful representation of the partial
 * function).
 */
export function expressionToDefinition(
  variables: readonly string[],
  expression: string,
): { definition: FunctionDefinition; mode: 'sop' | 'pos'; truthTable: number[] } {
  const tree = parseBooleanExpression(expression)
  const mode = detectMode(tree)
  const truthTable = expressionTruthTable(expression, variables)
  const ones: number[] = []
  const zeros: number[] = []
  const dc: number[] = []
  truthTable.forEach((o, m) => {
    if (o === 1) ones.push(m)
    else if (o === 0) zeros.push(m)
    else dc.push(m)
  })
  // Every expression output is a concrete 0/1; there are no free cells.
  return { definition: defineFunction(variables, ones, zeros, dc), mode, truthTable }
}

export type { KMapModel }