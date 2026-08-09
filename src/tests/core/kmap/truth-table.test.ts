import { describe, expect, it } from 'vitest'
import {
  createTruthTable,
  kmapToTruthTable,
  mintermsToKMap,
  truthTableToKMap,
} from '../../../core/kmap/truth-table'
import { valueAt } from '../../../core/kmap/model'

describe('createTruthTable', () => {
  it('accepts a full truth table', () => {
    const table = createTruthTable(['A', 'B', 'C'], [0, 0, 0, 1, 0, 1, 1, 1])
    expect(table.outputs).toHaveLength(8)
    expect(table.variables).toEqual(['A', 'B', 'C'])
  })

  it('rejects a table with the wrong row count', () => {
    expect(() => createTruthTable(['A', 'B', 'C'], [0, 1, 0])).toThrow()
  })
})

describe('truthTableToKMap', () => {
  it('maps determinantistically for a 3-variable table', () => {
    // F = minterms 3, 5, 6, 7 -> identity at those rows
    const table = createTruthTable(
      ['A', 'B', 'C'],
      [0, 0, 0, 1, 0, 1, 1, 1],
    )
    const kmap = truthTableToKMap(table)
    expect(valueAt(kmap, 0)).toBe(0)
    expect(valueAt(kmap, 3)).toBe(1)
    expect(valueAt(kmap, 5)).toBe(1)
    expect(valueAt(kmap, 6)).toBe(1)
    expect(valueAt(kmap, 7)).toBe(1)
  })

  it('places minterms in the correct grid cells', () => {
    const table = createTruthTable(['A', 'B', 'C'], [0, 0, 0, 1, 0, 1, 1, 1])
    const kmap = truthTableToKMap(table)
    // minterm 3 (A=0,B=1,C=1) sits at row 0, col 2 in a 3-variable map
    expect(kmap.cells[0]![2]!.minterm).toBe(3)
    expect(kmap.cells[0]![2]!.value).toBe(1)
    // minterm 7 (A=1,B=1,C=1) sits at row 1, col 2
    expect(kmap.cells[1]![2]!.minterm).toBe(7)
    expect(kmap.cells[1]![2]!.value).toBe(1)
  })

  it('handles a 2-variable table', () => {
    const table = createTruthTable(['A', 'B'], [0, 1, 1, 0])
    const kmap = truthTableToKMap(table)
    expect(valueAt(kmap, 1)).toBe(1)
    expect(valueAt(kmap, 2)).toBe(1)
    expect(valueAt(kmap, 0)).toBe(0)
    expect(valueAt(kmap, 3)).toBe(0)
  })
})

describe('mintermsToKMap', () => {
  it('builds a map from a minterm list', () => {
    const kmap = mintermsToKMap({ variables: ['A', 'B', 'C'], minterms: [3, 5, 7] })
    expect(valueAt(kmap, 3)).toBe(1)
    expect(valueAt(kmap, 5)).toBe(1)
    expect(valueAt(kmap, 7)).toBe(1)
    expect(valueAt(kmap, 0)).toBeNull()
  })

  it('marks maxterms with 0 and dontcares with X', () => {
    const kmap = mintermsToKMap({
      variables: ['A', 'B'],
      minterms: [1],
      maxterms: [2],
      dontCares: [3],
    })
    expect(valueAt(kmap, 1)).toBe(1)
    expect(valueAt(kmap, 2)).toBe(0)
    expect(valueAt(kmap, 3)).toBe('X')
  })

  it('lets dont-cares win over maxterms on conflict', () => {
    const kmap = mintermsToKMap({
      variables: ['A', 'B'],
      minterms: [],
      maxterms: [3],
      dontCares: [3],
    })
    expect(valueAt(kmap, 3)).toBe('X')
  })
})

describe('kmapToTruthTable', () => {
  it('round-trips a truth table through the map', () => {
    const table = createTruthTable(['A', 'B', 'C'], [0, 1, 0, 1, 1, 0, 1, 0])
    const back = kmapToTruthTable(truthTableToKMap(table))
    expect(back.variables).toEqual(table.variables)
    expect(back.outputs).toEqual(table.outputs)
  })
})