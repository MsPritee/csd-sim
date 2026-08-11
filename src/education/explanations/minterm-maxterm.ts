import { mintermToString } from '../../core/boolean'

/**
 * Dynamic minterm/maxterm explanation for a single truth-table row.
 * For every variable it shows why the literal is complemented or kept, from
 * the requirement that a minterm AND equals 1 and a maxterm OR equals 0.
 */

export interface RowLiteralReason {
  variable: string
  bit: number
  /** Literal used in the SOP minterm (complements 0s). */
  mintermLiteral: string
  /** Literal used in the POS maxterm (complements 1s). */
  maxtermLiteral: string
  /** Why the minterm literal is written this way. */
  mintermReason: string
  /** Why the maxterm literal is written this way. */
  maxtermReason: string
}

export interface RowExplanation {
  minterm: number
  binary: string
  mintermTerm: string
  maxtermSum: string
  reasons: readonly RowLiteralReason[]
}

function bitsOf(minterm: number, n: number): number[] {
  const bits: number[] = []
  for (let i = 0; i < n; i++) bits.push((minterm >> (n - 1 - i)) & 1)
  return bits
}

export function explainRow(variables: readonly string[], minterm: number): RowExplanation {
  const n = variables.length
  const bits = bitsOf(minterm, n)

  const reasons = variables.map((variable, i) => {
    const bit = bits[i]!
    return {
      variable,
      bit,
      mintermLiteral: bit === 1 ? variable : `${variable}'`,
      maxtermLiteral: bit === 0 ? variable : `${variable}'`,
      mintermReason:
        bit === 1
          ? `keep ${variable} (the AND input needs a 1)`
          : `complement → ${variable}' (AND needs a 1, but ${variable} is 0)`,
      maxtermReason:
        bit === 0
          ? `keep ${variable} (the OR input needs a 0)`
          : `complement → ${variable}' (OR needs a 0, but ${variable} is 1)`,
    }
  })

  const mintermTerm = reasons.map((r) => r.mintermLiteral).join('')
  const maxtermSum = reasons.map((r) => r.maxtermLiteral).join(' + ')

  return {
    minterm,
    binary: minterm.toString(2).padStart(n, '0'),
    mintermTerm,
    maxtermSum,
    reasons,
  }
}

/** Cross-check helper: the generated minterm must equal the shared engine's. */
export function mintermMatchesEngine(variables: readonly string[], minterm: number): boolean {
  return explainRow(variables, minterm).mintermTerm === mintermToString(variables, minterm)
}