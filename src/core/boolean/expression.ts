/**
 * P3 — Boolean expression parser & evaluator.
 *
 * A small recursive-descent parser for Boolean expressions written in the
 * notation the project already uses (`A'B + BC`, `(A + B)(B + C)`), kept fully
 * independent of React. It extends the existing `boolean/terms` primitives
 * (`parseTerm`, `termToString`) rather than re-implementing literal handling.
 *
 * Supported syntax:
 *   - variables: single letters (A…E recommended)
 *   - OR:  `+` or `|`
 *   - AND: `·`/`.` or adjacent juxtaposition (`AB`)
 *   - complement: trailing `'`, `!` or `¯` after a factor
 *   - parentheses for explicit grouping
 *
 * The tree is evaluated directly into a truth table, so nested or mixed forms
 * work. We also expose term splitting for SOP/POS cost and explanation.
 */

export class ExpressionError extends Error {
  readonly position: number
  constructor(message: string, position = -1) {
    super(message)
    this.name = 'ExpressionError'
    this.position = position
  }
}

/** A single literal (a variable possibly complemented). */
export interface BoolLiteral {
  readonly name: string
  readonly negated: boolean
}

export type BoolNode =
  | { readonly type: 'lit'; readonly literal: BoolLiteral; readonly pos: number }
  | { readonly type: 'and'; readonly kids: readonly BoolNode[]; readonly pos: number }
  | { readonly type: 'or'; readonly kids: readonly BoolNode[]; readonly pos: number }
  | { readonly type: 'const'; readonly value: 0 | 1; readonly pos: number }

export function literalString(l: BoolLiteral): string {
  return l.negated ? `${l.name}'` : l.name
}

export function nodeToString(node: BoolNode): string {
  switch (node.type) {
    case 'lit':
      return literalString(node.literal)
    case 'const':
      return String(node.value)
    case 'or':
      return node.kids.map(nodeToString).join(' + ')
    case 'and':
      return node.kids.map((k) => (k.type === 'or' ? `(${nodeToString(k)})` : nodeToString(k))).join('')
  }
}

/* ----------------------------- tokenizer ----------------------------- */

type Token =
  | { kind: 'var'; name: string; pos: number; negations: boolean }
  | { kind: 'const'; value: 0 | 1; pos: number }
  | { kind: 'or'; pos: number }
  | { kind: 'and'; pos: number }
  | { kind: 'lparen'; pos: number }
  | { kind: 'rparen'; pos: number }
  | { kind: 'eof'; pos: number }

const COMPLEMENT_CHARS = new Set(["'", '!', '\u00af', '\u0305'])

function tokenize(input: string): Token[] {
  const tokens: Token[] = []
  let i = 0
  const n = input.length
  while (i < n) {
    const ch = input[i]!
    if (/\s/.test(ch)) {
      i++
      continue
    }
    if (ch === '+' || ch === '|') {
      tokens.push({ kind: 'or', pos: i })
      i++
      continue
    }
    if (ch === '\u00b7' || ch === '.' || ch === '*') {
      tokens.push({ kind: 'and', pos: i })
      i++
      continue
    }
    if (ch === '(') {
      tokens.push({ kind: 'lparen', pos: i })
      i++
      continue
    }
    if (ch === ')') {
      tokens.push({ kind: 'rparen', pos: i })
      i++
      continue
    }
    if (/[A-Za-z]/.test(ch)) {
      const start = i
      let negations = false
      i++
      // Allow multi-char variable names ending in digits (x0, y1...) but keep
      // single letters as the primary case.
      while (i < n && COMPLEMENT_CHARS.has(input[i]!)) {
        negations = true
        i++
      }
      tokens.push({ kind: 'var', name: ch, pos: start, negations })
      continue
    }
    if (ch === '0' || ch === '1') {
      tokens.push({ kind: 'const', value: ch === '1' ? 1 : 0, pos: i })
      i++
      continue
    }
    throw new ExpressionError(`Unexpected character "${ch}" in expression.`, i)
  }
  tokens.push({ kind: 'eof', pos: n })
  return tokens
}

/* ----------------------------- parser ----------------------------- */

export class Parser {
  private readonly tokens: Token[]
  private index = 0

  constructor(input: string) {
    this.tokens = tokenize(input)
  }

  private peek(): Token {
    return this.tokens[this.index]!
  }
  private next(): Token {
    return this.tokens[this.index++]!
  }
  private expectRparen(): void {
    const t = this.next()
    if (t.kind !== 'rparen') {
      throw new ExpressionError("Missing closing parenthesis ')' in expression.", t.pos)
    }
  }

  /** expression := orExpr */
  parse(): BoolNode {
    const node = this.parseOr()
    // Trailing garbage check.
    const t = this.peek()
    if (t.kind !== 'eof') {
      throw new ExpressionError(`Unexpected token after expression at position ${t.pos}.`, t.pos)
    }
    return node
  }

  /** orExpr := andExpr (('+'|'|') andExpr)* */
  private parseOr(): BoolNode {
    const first = this.parseAnd()
    const kids: BoolNode[] = [first]
    while (this.peek().kind === 'or') {
      this.next()
      kids.push(this.parseAnd())
    }
    return kids.length === 1 ? first : { type: 'or', kids, pos: kids[0]!.pos }
  }

  /** andExpr := factor (juxtaposition | '·' )*  */
  private parseAnd(): BoolNode {
    const first = this.parseFactor()
    const kids: BoolNode[] = [first]
    for (;;) {
      const t = this.peek()
      if (t.kind === 'and') {
        this.next()
        kids.push(this.parseFactor())
      } else if (t.kind === 'var' || t.kind === 'lparen' || t.kind === 'const') {
        kids.push(this.parseFactor())
      } else {
        break
      }
    }
    return kids.length === 1 ? first : { type: 'and', kids, pos: kids[0]!.pos }
  }

  /** factor := (IDENT | '(' orExpr ')') complement* */
  private parseFactor(): BoolNode {
    const t = this.peek()
    if (t.kind === 'lparen') {
      this.next()
      const inner = this.parseOr()
      this.expectRparen()
      const after = this.peek()
      if (after.kind === 'var' && after.negations) {
        throw new ExpressionError(
          "Complement of a parenthesised group like (A+B)' is not supported yet.",
          after.pos,
        )
      }
      return inner
    }
    if (t.kind === 'var') {
      this.next()
      const node: BoolNode = {
        type: 'lit',
        literal: { name: t.name, negated: t.negations },
        pos: t.pos,
      }
      return node
    }
    if (t.kind === 'const') {
      this.next()
      const node: BoolNode = { type: 'const', value: t.value, pos: t.pos }
      return node
    }
    throw new ExpressionError(`Expected a variable or '(' at position ${t.pos}, found ${describeToken(t)}.`, t.pos)
  }
}

function describeToken(t: Token): string {
  switch (t.kind) {
    case 'eof':
      return 'the end of the expression'
    case 'rparen':
      return "')'"
    case 'lparen':
      return "'('"
    default:
      return "invalid input"
  }
}

/** Parse a full Boolean expression string into its tree. */
export function parseBooleanExpression(input: string): BoolNode {
  if (input.trim() === '') {
    throw new ExpressionError('Expression is empty.')
  }
  return new Parser(input).parse()
}

/* ----------------------------- evaluation ----------------------------- */

export function variablesOf(node: BoolNode): string[] {
  const set = new Set<string>()
  const walk = (n: BoolNode) => {
    if (n.type === 'lit') set.add(n.literal.name)
    else if (n.type !== 'const') for (const k of n.kids) walk(k)
  }
  walk(node)
  return [...set]
}

function evalNode(node: BoolNode, bits: ReadonlyMap<string, 0 | 1>): 0 | 1 {
  switch (node.type) {
    case 'const':
      return node.value
    case 'lit': {
      if (node.literal.name === '\u0000') return 0
      const bit = bits.get(node.literal.name) ?? 0
      return node.literal.negated ? ((1 - bit) as 0 | 1) : bit
    }
    case 'and': {
      let result: 0 | 1 = 1
      for (const k of node.kids) result = ((result & evalNode(k, bits)) as 0 | 1)
      return result
    }
    case 'or': {
      let result: 0 | 1 = 0
      for (const k of node.kids) result = ((result | evalNode(k, bits)) as 0 | 1)
      return result
    }
  }
}

function bitsOf(minterm: number, variables: readonly string[]): ReadonlyMap<string, 0 | 1> {
  const map = new Map<string, 0 | 1>()
  const n = variables.length
  variables.forEach((v, i) => {
    map.set(v, ((minterm >> (n - 1 - i)) & 1) as 0 | 1)
  })
  return map
}

/**
 * Truth table (output per minterm) implied by the expression for `variables`.
 * A variable absent from the expression but listed in `variables` simply gets
 * bit values from the input row, which is ignored unless referenced.
 */
export function expressionTruthTable(
  input: string,
  variables: readonly string[],
): number[] {
  const node = parseBooleanExpression(input)
  return expressionTruthTableFromNode(node, variables)
}

export function expressionTruthTableFromNode(
  node: BoolNode,
  variables: readonly string[],
): number[] {
  const total = 2 ** variables.length
  return Array.from({ length: total }, (_, m) => evalNode(node, bitsOf(m, variables)))
}

/** Minterms (rows where output is 1). */
export function expressionMinterms(
  input: string,
  variables: readonly string[],
): number[] {
  return expressionTruthTable(input, variables)
    .map((o, m) => (o === 1 ? m : -1))
    .filter((m) => m >= 0)
}

/** Maxterms (rows where output is 0). */
export function expressionMaxterms(
  input: string,
  variables: readonly string[],
): number[] {
  return expressionTruthTable(input, variables)
    .map((o, m) => (o === 0 ? m : -1))
    .filter((m) => m >= 0)
}

/* ----------------------------- mode + term splitting ----------------------------- */

export type FormMode = 'sop' | 'pos'

/**
 * Decide whether an expression is best read as SOP or POS.
 * A root OR of AND-clusters is SOP; a root AND of OR-clusters is POS; a bare
 * literal/AND product defaults to SOP.
 */
export function detectMode(node: BoolNode): FormMode {
  if (node.type === 'const') return 'sop'
  if (node.type === 'or') return 'sop'
  if (node.type === 'and' && node.kids.every((k) => k.type === 'or')) return 'pos'
  if (node.type === 'and') return 'sop'
  return 'sop'
}

/** Normalize an SOP node into product-term literal lists (outer OR split). */
export function sopTermLists(node: BoolNode): readonly (readonly BoolLiteral[])[] {
  if (node.type === 'const') return node.value === 1 ? [[]] : []
  const base = node.type === 'or' ? node.kids : [node]
  return base.map((termNode) => {
    const literals: BoolLiteral[] = []
    const collect = (n: BoolNode) => {
      if (n.type === 'lit') literals.push(n.literal)
      else if (n.type === 'and') for (const k of n.kids) collect(k)
      else if (n.type === 'or') for (const k of n.kids) collect(k)
    }
    collect(termNode)
    return literals
  })
}

/** Normalize a POS node into sum-term literal lists (outer AND split). */
export function posSumLists(node: BoolNode): readonly (readonly BoolLiteral[])[] {
  if (node.type === 'const') return node.value === 0 ? [[]] : []
  const base = node.type === 'and' ? node.kids : [node]
  return base.map((sumNode) => {
    const literals: BoolLiteral[] = []
    const collect = (n: BoolNode) => {
      if (n.type === 'lit') literals.push(n.literal)
      else if (n.type === 'and') for (const k of n.kids) collect(k)
    }
    collect(sumNode)
    return literals
  })
}

export function productTermString(literals: readonly BoolLiteral[]): string {
  return literals.map(literalString).join('')
}

export function sumTermString(literals: readonly BoolLiteral[]): string {
  const joined = literals.map(literalString).join(' + ')
  return literals.length === 0 ? '0' : joined
}

export interface TermCounts {
  readonly terms: number
  readonly literals: number
}

/** Cost (term count + literal count) in the detected mode. */
export function termCounts(node: BoolNode): TermCounts {
  const mode = detectMode(node)
  if (mode === 'pos') {
    const sums = posSumLists(node)
    return { terms: sums.length, literals: sums.reduce((a, s) => a + s.length, 0) }
  }
  const terms = sopTermLists(node)
  return { terms: terms.length, literals: terms.reduce((a, s) => a + s.length, 0) }
}

/** Human-readable normalized form string (SOP or POS). */
export function normalizedForm(node: BoolNode): string {
  if (node.type === 'const') return String(node.value)
  const mode = detectMode(node)
  if (mode === 'pos') {
    return posSumLists(node).map((s) => (s.length === 0 ? '0' : `(${sumTermString(s)})`)).join('')
  }
  return sopTermLists(node).map((t) => (t.length === 0 ? '1' : productTermString(t))).join(' + ')
}