export interface Literal {
  readonly name: string
  readonly negated: boolean
}

export type Term = readonly Literal[]

const LITERAL_RE = /([A-Za-z])(\u2032|'|!|\u00af)?/g

export function literalToString(literal: Literal): string {
  return literal.negated ? `${literal.name}'` : literal.name
}

export function termToString(term: Term): string {
  return term.map(literalToString).join('')
}

export function parseTerm(expression: string): Term {
  const literals: Literal[] = []
  for (const match of expression.matchAll(LITERAL_RE)) {
    const name = match[1]!
    if (name.trim() === '') continue
    const negated = match[2] !== undefined
    if (literals.some((l) => l.name === name)) {
      throw new Error(`duplicate literal "${name}" in "${expression}"`)
    }
    literals.push({ name, negated })
  }
  return literals
}

export function sortTerm(term: Term): Term {
  return [...term].sort((a, b) => a.name.localeCompare(b.name))
}

/** Term equality regardless of literal order. */
export function termsEqual(a: Term, b: Term): boolean {
  if (a.length !== b.length) return false
  const normalized = new Map<string, boolean>(sortTerm(a).map((l) => [l.name, l.negated]))
  return sortTerm(b).every((l) => normalized.get(l.name) === l.negated)
}

/**
 * Converts a decimal minterm into the full product term using `variables`
 * (variable[0] is the most significant bit).
 * Example: minterm 6 with [A,B,C] (110) → ABC (A B C').
 */
export function mintermToTerm(variables: readonly string[], minterm: number): Term {
  const n = variables.length
  if (minterm < 0 || minterm >= 2 ** n) {
    throw new RangeError(`minterm ${minterm} is out of range for ${n} variables`)
  }
  const term: Literal[] = []
  for (let i = 0; i < n; i++) {
    const bit = (minterm >> (n - 1 - i)) & 1
    term.push({ name: variables[i]!, negated: bit === 0 })
  }
  return term
}

/** Maps a minterm to a formatted string product term. */
export function mintermToString(variables: readonly string[], minterm: number): string {
  return termToString(mintermToTerm(variables, minterm))
}

function hasAllDontCares(minterms: ReadonlySet<number>, dontCares: ReadonlySet<number>): boolean {
  return minterms.size > 0 && [...minterms].every((m) => dontCares.has(m))
}

/**
 * Boolean term extraction from a K-map group:
 * `variables` are needed to know bit positions, and `minterms` are the cells
 * being grouped. A variable that takes both values across the group is
 * eliminated (it absorbs out); a variable that is constant becomes a literal
 * (barred when it is 0). Cells in `dontCares` are treated as flexible.
 */
export function termForGroup(
  variables: readonly string[],
  minterms: readonly number[],
  dontCares?: ReadonlySet<number>,
): Term {
  const dc = dontCares ?? new Set<number>()
  const n = variables.length
  const selected = [...new Set(minterms)]
  const bits: { high: boolean; low: boolean }[] = Array.from({ length: n }, () => ({
    high: false,
    low: false,
  }))

  for (const minterm of selected) {
    for (let i = 0; i < n; i++) {
      const positionalBit = (minterm >> (n - 1 - i)) & 1
      if (positionalBit === 1) bits[i].high = true
      else bits[i].low = true
    }
  }

  if (hasAllDontCares(new Set(selected), dc)) return []

  const termLiterals: Literal[] = []
  for (let i = 0; i < n; i++) {
    const constant = bits[i]!.high !== bits[i]!.low
    if (!constant) {
      // variable varies (or every cell for that bit is either all high or all low)
      continue
    }
    const isHighConstant = bits[i]!.high && !bits[i]!.low
    const value = isHighConstant ? 1 : 0
    if (value === 1) {
      termLiterals.push({ name: variables[i]!, negated: false })
    } else {
      termLiterals.push({ name: variables[i]!, negated: true })
    }
  }
  return termLiterals
}

/** Human-friendly term string for a given group of minterms. */
export function groupToTermString(
  variables: readonly string[],
  minterms: readonly number[],
  dontCareMinterms?: ReadonlySet<number>,
): string {
  const term = termForGroup(variables, minterms, dontCareMinterms)
  return termToString(sortTerm(term))
}