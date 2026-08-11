import { describe, it, expect } from 'vitest'
import { explainRow, mintermMatchesEngine } from '../../education/explanations/minterm-maxterm'
import { grayCodeRows, explainGrayCode, grayBitChanged } from '../../education/explanations/gray-code'
import { MISCONCEPTIONS, misconceptionById, misconceptionForIssue } from '../../education/misconceptions'

describe('explainRow (minterm/maxterm)', () => {
  it('generates the minterm and maxterm for row 5 with dynamic literals', () => {
    const exp = explainRow(['A', 'B', 'C'], 5) // 101
    expect(exp.binary).toBe('101')
    expect(exp.mintermTerm).toBe("AB'C")
    expect(exp.maxtermSum).toBe("A' + B + C'")
    expect(exp.reasons).toHaveLength(3)

    const a = exp.reasons[0]!
    expect(a.mintermLiteral).toBe('A')
    expect(a.maxtermLiteral).toBe("A'")
    expect(a.mintermReason).toContain('needs a 1')
    expect(a.maxtermReason).toContain('needs a 0')
  })

  it('matches the shared engine for every 1-minterm over 3 variables', () => {
    for (let m = 0; m < 8; m++) {
      expect(mintermMatchesEngine(['A', 'B', 'C'], m)).toBe(true)
    }
  })
})

describe('grayCodeRows / explainGrayCode', () => {
  it('produces the canonical 2-bit Gray sequence', () => {
    const rows = grayCodeRows(2)
    expect(rows.map((r) => r.gray)).toEqual(['00', '01', '11', '10'])
    // Binary neighbours only ever flip one bit in Gray order.
    for (let i = 1; i < rows.length; i++) {
      expect(grayBitChanged(rows, i - 1, i)).toBeGreaterThanOrEqual(0)
    }
  })

  it('describes why Gray order is used', () => {
    const g = explainGrayCode(2)
    expect(g.rows).toHaveLength(4)
    expect(g.summary.toLowerCase()).toContain('one bit')
  })
})

describe('misconception detector', () => {
  it('has the documented error catalogue', () => {
    expect(MISCONCEPTIONS.some((m) => m.id === 'diagonal-grouping')).toBe(true)
    expect(MISCONCEPTIONS.some((m) => m.id === 'wrong-mode-value')).toBe(true)
    expect(MISCONCEPTIONS.some((m) => m.id === 'uncovered-required')).toBe(true)
  })

  it('matches a group issue message to a misconception', () => {
    expect(misconceptionById('diagonal-grouping')?.hint).toContain('one variable')
    expect(misconceptionForIssue('A group of 3 cells is not allowed.')).toBeDefined()
    expect(misconceptionForIssue('Cell 2 holds 0 and cannot be part of a 1-group.')).toMatchObject({
      id: 'wrong-mode-value',
    })
  })
})