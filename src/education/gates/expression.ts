import type { Bit } from '../../core/gates/types'

/**
 * Tiny Boolean-expression parser + evaluator (LG-08). Lets a challenge accept a
 * student's typed Boolean expression, evaluate it over every input row, and
 * compare the resulting output column to a target gate's truth table. Supports
 * AND (· * &), OR (+ | ∨), XOR (⊕ ^), NOT (! ~ ¬ prefix / ' postfix) and
 * parentheses, with NOT > AND > XOR > OR precedence. Pure TS — no UI.
 */

export const CHALLENGE_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] as const

export type BooleanNode =
  | { readonly kind: 'const'; readonly value: Bit }
  | { readonly kind: 'var'; readonly index: number }
  | { readonly kind: 'not'; readonly child: BooleanNode }
  | { readonly kind: 'and'; readonly children: readonly BooleanNode[] }
  | { readonly kind: 'or'; readonly children: readonly BooleanNode[] }
  | { readonly kind: 'xor'; readonly children: readonly BooleanNode[] }

type Tok =
  | { readonly k: 'LPAR' }
  | { readonly k: 'RPAR' }
  | { readonly k: 'CONST'; readonly v: Bit }
  | { readonly k: 'VAR'; readonly index: number }
  | { readonly k: 'NOT' }
  | { readonly k: 'AND' }
  | { readonly k: 'OR' }
  | { readonly k: 'XOR' }

/** Strips an optional "Y = ..." style left-hand side so pasted expressions parse. */
function stripLhs(input: string): string {
  return input.replace(/^\s*[A-Za-z]\s*[:=→]\s*/, '')
}

function tokenize(input: string): Tok[] {
  const src = stripLhs(input)
  const out: Tok[] = []
  let i = 0
  while (i < src.length) {
    const c = src[i]!
    if (/\s/.test(c) || c === ',') {
      i++
      continue
    }
    if (c === '(') { out.push({ k: 'LPAR' }); i++; continue }
    if (c === ')') { out.push({ k: 'RPAR' }); i++; continue }
    if (c === '0' || c === '1') { out.push({ k: 'CONST', v: c === '1' ? 1 : 0 }); i++; continue }
    if ('¬~!'.includes(c)) { out.push({ k: 'NOT' }); i++; continue }
    if ("'".includes(c)) { out.push({ k: 'NOT' }); i++; continue }
    if ('·*&'.includes(c)) { out.push({ k: 'AND' }); i++; continue }
    if ('+|∨#'.includes(c)) { out.push({ k: 'OR' }); i++; continue }
    if ('⊕^⊻'.includes(c)) { out.push({ k: 'XOR' }); i++; continue }
    if (/[A-Za-z_]/.test(c)) {
      let j = i
      while (j < src.length && /[A-Za-z_]/.test(src[j]!)) j++
      const word = src.slice(i, j).toUpperCase()
      i = j
      if (word === 'NOT') { out.push({ k: 'NOT' }); continue }
      if (word === 'AND') { out.push({ k: 'AND' }); continue }
      if (word === 'OR') { out.push({ k: 'OR' }); continue }
      if (word === 'XOR') { out.push({ k: 'XOR' }); continue }
      if (word === 'TRUE') { out.push({ k: 'CONST', v: 1 }); continue }
      if (word === 'FALSE') { out.push({ k: 'CONST', v: 0 }); continue }
      if (word.length === 1 && CHALLENGE_LABELS.indexOf(word as never) >= 0) {
        out.push({ k: 'VAR', index: CHALLENGE_LABELS.indexOf(word as never) })
        continue
      }
      throw new Error(`Unknown identifier "${word}". Expected a label A–H or AND/OR/XOR/NOT.`)
    }
    throw new Error(`Unexpected character "${c}".`)
  }
  return out
}

interface Cursor {
  readonly toks: readonly Tok[]
  pos: number
}

function peek(c: Cursor): Tok | undefined {
  return c.toks[c.pos]
}

function next(c: Cursor): Tok {
  const t = peek(c)
  if (!t) throw new Error('Unexpected end of expression.')
  c.pos++
  return t
}

function parseExpression(c: Cursor): BooleanNode {
  const node = parseOr(c)
  if (c.pos !== c.toks.length) throw new Error('Unexpected trailing tokens after expression.')
  return node
}

function parseOr(c: Cursor): BooleanNode {
  const children: BooleanNode[] = [parseXor(c)]
  while (peek(c)?.k === 'OR') {
    next(c)
    children.push(parseXor(c))
  }
  return children.length === 1 ? children[0]! : { kind: 'or', children }
}

function parseXor(c: Cursor): BooleanNode {
  const children: BooleanNode[] = [parseAnd(c)]
  while (peek(c)?.k === 'XOR') {
    next(c)
    children.push(parseAnd(c))
  }
  return children.length === 1 ? children[0]! : { kind: 'xor', children }
}

function parseAnd(c: Cursor): BooleanNode {
  const children: BooleanNode[] = [parseUnary(c)]
  while (peek(c)?.k === 'AND') {
    next(c)
    children.push(parseUnary(c))
  }
  return children.length === 1 ? children[0]! : { kind: 'and', children }
}

function parseUnary(c: Cursor): BooleanNode {
  if (peek(c)?.k === 'NOT') {
    next(c)
    return { kind: 'not', child: parseUnary(c) }
  }
  return parseAtom(c)
}

/** Handles a value/variable/group plus any postfix "'" NOTs (tightest binding). */
function parseAtom(c: Cursor): BooleanNode {
  const t = next(c)
  let node: BooleanNode
  switch (t.k) {
    case 'CONST':
      node = { kind: 'const', value: t.v }
      break
    case 'VAR':
      node = { kind: 'var', index: t.index }
      break
    case 'LPAR': {
      node = parseOr(c)
      const close = next(c)
      if (close.k !== 'RPAR') throw new Error('Expected ")".')
      break
    }
    default:
      throw new Error('Expected a value, variable, or "(".')
  }
  while (peek(c)?.k === 'NOT') {
    next(c)
    node = { kind: 'not', child: node }
  }
  return node
}

/** Parses an expression into its AST. Throws with a readable message on error. */
export function parseBooleanExpression(expression: string): BooleanNode {
  return parseExpression({ toks: tokenize(expression), pos: 0 })
}

/** Evaluates a parsed AST given bit values indexed by input-label order. */
export function evaluateBooleanNode(node: BooleanNode, values: readonly Bit[]): Bit {
  switch (node.kind) {
    case 'const':
      return node.value
    case 'var':
      return values[node.index] ?? 0
    case 'not':
      return evaluateBooleanNode(node.child, values) === 1 ? 0 : 1
    case 'and':
      return node.children.every((ch) => evaluateBooleanNode(ch, values) === 1) ? 1 : 0
    case 'or':
      return node.children.some((ch) => evaluateBooleanNode(ch, values) === 1) ? 1 : 0
    case 'xor': {
      const count = node.children.reduce<number>(
        (acc, ch) => acc + evaluateBooleanNode(ch, values),
        0,
      )
      return count % 2 === 1 ? 1 : 0
    }
  }
}

/** Evaluates a string expression directly. Throws with a readable message on error. */
export function evaluateBooleanExpression(expression: string, values: readonly Bit[]): Bit {
  return evaluateBooleanNode(parseBooleanExpression(expression), values)
}

/**
 * Output column for an expression over `inputCount` inputs, ordered MSB-first
 * (row 0 = 0…0, last = 1…1) to match `generateTruthTable`.
 */
export function truthTableForExpression(
  expression: string,
  inputCount: number,
  inputLabels: readonly string[] = CHALLENGE_LABELS,
): Bit[] {
  const node = parseBooleanExpression(expression)
  const column: Bit[] = []
  const total = 2 ** inputCount
  for (let n = 0; n < total; n++) {
    const values = inputLabels.slice(0, inputCount).map((_, i) =>
      ((n >> (inputCount - 1 - i)) & 1) as Bit,
    )
    column.push(evaluateBooleanNode(node, values))
  }
  return column
}