import { describe, expect, it } from 'vitest'
import {
  parseBooleanExpression,
  expressionTruthTable,
  expressionMinterms,
  expressionMaxterms,
  detectMode,
  sopTermLists,
  normalizedForm,
  variablesOf,
  termCounts,
  productTermString,
  ExpressionError,
} from '../../../core/boolean/expression'
import { truthTableFromSop } from '../../../core/boolean/evaluate'

describe('Boolean expression parser — simple SOP', () => {
  it('parses A\'B + BC', () => {
    const tree = parseBooleanExpression("A'B + BC")
    expect(detectMode(tree)).toBe('sop')
    const terms = sopTermLists(tree).map((t) => productTermString(t))
    expect(terms).toEqual(["A'B", 'BC'])
  })

  it('parses basic terms joined by +', () => {
    const tree = parseBooleanExpression('AB + A\'C')
    expect(sopTermLists(tree).map((t) => productTermString(t))).toEqual(['AB', "A'C"])
  })
})

describe('Boolean expression parser — simple POS', () => {
  it('parses (A + B)(B + C) as POS', () => {
    const tree = parseBooleanExpression('(A + B)(B + C)')
    expect(detectMode(tree)).toBe('pos')
  })

  it('produces correct truth table for (A + B)(B + C)', () => {
    const tt = expressionTruthTable('(A + B)(B + C)', ['A', 'B', 'C'])
    // rows where output = 1
    const ones = tt.map((o, m) => (o === 1 ? m : -1)).filter((m) => m >= 0)
    expect(ones).toEqual([2, 3, 5, 6, 7])
  })
})

describe('Boolean expression parser — parentheses and complement', () => {
  it('handles nested parentheses and juxtaposition', () => {
    const tt = expressionTruthTable('A(B + C)', ['A', 'B', 'C'])
    const ones = tt.map((o, m) => (o === 1 ? m : -1)).filter((m) => m >= 0)
    // A(B+C) true when A=1 and (B or C) → m5(101),m6(110),m7(111)
    expect(ones).toEqual([5, 6, 7])
  })

  it('supports multiple complement notations', () => {
    const t1 = expressionTruthTable("A'", ['A', 'B'])
    const t2 = expressionTruthTable('A!', ['A', 'B'])
    expect(t1).toEqual(t2)
  })

  it('detects single-expression reorder equivalence', () => {
    const a = expressionTruthTable("A'B + BC", ['A', 'B', 'C'])
    const b = expressionTruthTable('BC + A\'B', ['A', 'B', 'C'])
    expect(a).toEqual(b)
    const ones = a.map((o, m) => (o === 1 ? m : -1)).filter((m) => m >= 0)
    expect(ones).toEqual([2, 3, 7])
  })
})

describe('Boolean expression parser — invalid input', () => {
  it('throws on an empty expression', () => {
    expect(() => parseBooleanExpression('   ')).toThrow(ExpressionError)
  })
  it('throws on a trailing operator', () => {
    expect(() => parseBooleanExpression('A +')).toThrow(ExpressionError)
  })
  it('throws on an unmatched parenthesis', () => {
    expect(() => parseBooleanExpression('(A + B')).toThrow(ExpressionError)
    expect(() => parseBooleanExpression('A + B)')).toThrow(ExpressionError)
  })
  it('throws on unexpected characters', () => {
    expect(() => parseBooleanExpression('A + 2')).toThrow(ExpressionError)
  })
})

describe('Expression evaluation', () => {
  it('matches the existing truthTableFromSop for A\'B + BC', () => {
    const viaParser = expressionTruthTable("A'B + BC", ['A', 'B', 'C'])
    const viaExisting = truthTableFromSop(['A', 'B', 'C'], ["A'B", 'BC'])
    expect(viaParser).toEqual(viaExisting)
  })

  it('computes minterms and maxterms', () => {
    expect(expressionMinterms("A'B + BC", ['A', 'B', 'C'])).toEqual([2, 3, 7])
    expect(expressionMaxterms("A'B + BC", ['A', 'B', 'C'])).toEqual([0, 1, 4, 5, 6])
  })

  it('applies the absorption law A + A\'B = A + B', () => {
    const a = expressionTruthTable('A + A\'B', ['A', 'B'])
    const b = expressionTruthTable('A + B', ['A', 'B'])
    expect(a).toEqual(b)
  })
})

describe('Normalized forms and cost', () => {
  it('normalizes an SOP expression', () => {
    expect(normalizedForm(parseBooleanExpression("A'B + BC"))).toBe("A'B + BC")
  })
  it('counts terms and literals', () => {
    const c = termCounts(parseBooleanExpression("A'B + BC"))
    expect(c.terms).toBe(2)
    expect(c.literals).toBe(4)
  })
})

describe('Constant expressions (0 / 1)', () => {
  const vars = ['A', 'B']
  it('parses a constant 0 and yields no ON rows', () => {
    const node = parseBooleanExpression('0')
    expect(detectMode(node)).toBe('sop')
    expect(expressionTruthTable('0', vars)).toEqual([0, 0, 0, 0])
    expect(expressionMinterms('0', vars)).toEqual([])
    expect(normalizedForm(node)).toBe('0')
  })
  it('parses a constant 1 and yields all ON rows', () => {
    const node = parseBooleanExpression('1')
    expect(expressionTruthTable('1', vars)).toEqual([1, 1, 1, 1])
    expect(expressionMinterms('1', vars)).toEqual([0, 1, 2, 3])
    expect(normalizedForm(node)).toBe('1')
    expect(variablesOf(node)).toEqual([])
  })
  it('supports constants inside expressions', () => {
    expect(expressionTruthTable('1 + A', vars)).toEqual([1, 1, 1, 1])
    expect(expressionTruthTable('0 · A', vars)).toEqual([0, 0, 0, 0])
  })
  it('counts cost of constants without throwing', () => {
    expect(termCounts(parseBooleanExpression('0')).terms).toBe(0)
    expect(termCounts(parseBooleanExpression('0')).literals).toBe(0)
  })
})