import { toGrayCode } from '../../core/kmap'

/**
 * Educational explanation of why K-map rows/columns use Gray-code ordering:
 * adjacent positions differ in exactly one bit, so neighbouring cells are
 * logically adjacent.
 */

export interface GrayRow {
  index: number
  binary: string
  gray: string
}

/** The binary vs Gray-code sequences for an n-bit axis. */
export function grayCodeRows(n: number): GrayRow[] {
  return Array.from({ length: 2 ** n }, (_, index) => ({
    index,
    binary: index.toString(2).padStart(n, '0'),
    gray: toGrayCode(index).toString(2).padStart(n, '0'),
  }))
}

export interface GrayExplanation {
  label: string
  rows: readonly GrayRow[]
  summary: string
}

/** Which single bit changes between two adjacent Gray-code labels. */
export function grayBitChanged(rows: readonly GrayRow[], left: number, right: number): number {
  const a = rows[left]!.gray
  const b = rows[right]!.gray
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return i
  }
  return -1
}

export function explainGrayCode(variableCount: number = 2): GrayExplanation {
  const rows = grayCodeRows(variableCount)
  return {
    label: `${variableCount}-bit Gray code`,
    rows,
    summary:
      'Gray-code ordering changes exactly one bit between neighbours, so adjacent K-map cells represent logically adjacent input combinations.',
  }
}