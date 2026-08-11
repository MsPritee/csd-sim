import { describe, expect, it } from 'vitest'
import type { InputState } from '../../../simulators/kmap/concepts/sop-pos'
import {
  andGateInputs,
  binaryString,
  cellCoordinates,
  inputToMintermNumber,
  maxtermCellFor,
  maxtermFor,
  mintermCellFor,
  mintermFor,
  orGateInputs,
} from '../../../simulators/kmap/concepts/sop-pos/logic'
import {
  LESSON_STEPS,
  SOP_INPUT,
  POS_INPUT,
  SOP_TRUTH_TABLE,
  POS_TRUTH_TABLE,
  lessonStepIndex,
} from '../../../simulators/kmap/concepts/sop-pos/steps'
import { truthTableToKMap, valueAt } from '../../../core/kmap'

const input = (bits: readonly number[]): InputState => ({ variables: ['A', 'B'], bits })

describe('mintermFor (SOP)', () => {
  it('maps A=0,B=1 to the minterm A\'B', () => {
    expect(mintermFor(input([0, 1]))).toBe("A'B")
  })

  it('maps A=1,B=0 to the minterm AB\'', () => {
    expect(mintermFor(input([1, 0]))).toBe("AB'")
  })

  it('maps A=1,B=1 to the minterm AB', () => {
    expect(mintermFor(input([1, 1]))).toBe('AB')
  })

  it('maps A=0,B=0 to the minterm A\'B\'', () => {
    expect(mintermFor(input([0, 0]))).toBe("A'B'")
  })
})

describe('maxtermFor (POS)', () => {
  it('maps A=0,B=1 to the maxterm A + B\'', () => {
    expect(maxtermFor(input([0, 1]))).toBe("A + B'")
  })

  it('maps A=1,B=0 to the maxterm A\' + B', () => {
    expect(maxtermFor(input([1, 0]))).toBe("A' + B")
  })

  it('maps A=0,B=0 to the maxterm A + B', () => {
    expect(maxtermFor(input([0, 0]))).toBe('A + B')
  })

  it('maps A=1,B=1 to the maxterm A\' + B\'', () => {
    expect(maxtermFor(input([1, 1]))).toBe("A' + B'")
  })
})

describe('minterm/maxterm → K-map cell', () => {
  it('minterm A=0,B=1 is cell m1', () => {
    expect(mintermCellFor(input([0, 1]))).toBe(1)
    expect(cellCoordinates(1)).toEqual({ row: 0, col: 1 })
  })

  it('maxterm A=0,B=1 is the same cell m1', () => {
    expect(maxtermCellFor(input([0, 1]))).toBe(1)
  })

  it('mintermCellFor and maxtermCellFor agree for every combination', () => {
    for (let m = 0; m < 4; m++) {
      const bits = [m >> 1, m & 1]
      expect(mintermCellFor(input(bits))).toBe(maxtermCellFor(input(bits)))
    }
  })
})

describe('gate inputs', () => {
  it('SOP needs every AND input to be 1', () => {
    expect(andGateInputs(input([0, 1]))).toEqual([1, 1])
    expect(andGateInputs(input([1, 0]))).toEqual([1, 1])
  })

  it('POS needs every OR input to be 0', () => {
    expect(orGateInputs(input([0, 1]))).toEqual([0, 0])
    expect(orGateInputs(input([1, 0]))).toEqual([0, 0])
  })
})

describe('SOP → 1 / POS → 0 linkage', () => {
  it('the SOP truth table row is realised as a 1 in the K-map', () => {
    const model = truthTableToKMap({
      variables: [...SOP_TRUTH_TABLE.variables],
      outputs: [...SOP_TRUTH_TABLE.outputs],
    })
    expect(valueAt(model, 1)).toBe(1)
  })

  it('the POS truth table row is realised as a 0 in the K-map', () => {
    const model = truthTableToKMap({
      variables: [...POS_TRUTH_TABLE.variables],
      outputs: [...POS_TRUTH_TABLE.outputs],
    })
    expect(valueAt(model, 1)).toBe(0)
  })

  it('the SOP example minterm is the term whose cell holds 1', () => {
    expect(mintermFor(SOP_INPUT)).toBe("A'B")
    expect(inputToMintermNumber(SOP_INPUT)).toBe(1)
  })

  it('the POS example maxterm is the term whose cell holds 0', () => {
    expect(maxtermFor(POS_INPUT)).toBe("A + B'")
    expect(inputToMintermNumber(POS_INPUT)).toBe(1)
  })
})

describe('binaryString', () => {
  it('formats bits to a fixed-width binary string', () => {
    expect(binaryString(input([0, 1]))).toBe('01')
    expect(binaryString(input([1, 1]))).toBe('11')
  })
})

describe('lesson steps', () => {
  it('contains the full SOP → POS → comparison → bridge flow', () => {
    expect(LESSON_STEPS[0]?.kind).toBe('truth-table-intro')
    expect(LESSON_STEPS.at(-1)?.kind).toBe('bridge')
    expect(LESSON_STEPS.some((s) => s.kind === 'comparison')).toBe(true)
    expect(LESSON_STEPS.some((s) => s.kind === 'sop-group-ones')).toBe(true)
    expect(LESSON_STEPS.some((s) => s.kind === 'pos-group-zeros')).toBe(true)
  })

  it('finds a jump-in step index', () => {
    expect(lessonStepIndex('sop-group-ones')).toBeGreaterThan(0)
    expect(lessonStepIndex('comparison')).toBeGreaterThan(0)
    expect(lessonStepIndex('unknown')).toBe(0)
  })
})