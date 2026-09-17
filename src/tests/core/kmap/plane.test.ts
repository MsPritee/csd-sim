import { describe, it, expect } from 'vitest'
import {
  buildPlaneLayout,
  canonicalToPlaneSpace,
  planeCellMinterm,
  planeCells,
  planeGrid,
  planePosition,
  planeSpaceToCanonical,
} from '../../../core/kmap/plane'

const VARS = ['A', 'B', 'C', 'D', 'E']

describe('buildPlaneLayout', () => {
  it('places the plane variable first as the MSB for the default E plane', () => {
    const layout = buildPlaneLayout(VARS, 'E')
    expect(layout.order).toEqual(['E', 'A', 'B', 'C', 'D'])
    expect(layout.planeVariable).toBe('E')
    expect(layout.variables).toEqual(VARS)
    expect(layout.rowVariables).toEqual(['A', 'B'])
    expect(layout.colVariables).toEqual(['C', 'D'])
    expect(layout.rows).toBe(4)
    expect(layout.cols).toBe(4)
    expect(layout.planes).toBe(2)
    expect(layout.rowLabels).toEqual(['00', '01', '11', '10'])
    expect(layout.colLabels).toEqual(['00', '01', '11', '10'])
  })

  it('respects a chosen non-E plane variable by moving it to the MSB', () => {
    const layout = buildPlaneLayout(VARS, 'C')
    expect(layout.order[0]).toBe('C')
    expect(layout.order).toEqual(['C', 'A', 'B', 'D', 'E'])
    expect(layout.rowVariables).toEqual(['A', 'B'])
    expect(layout.colVariables).toEqual(['D', 'E'])
  })

  it('supports a 4-variable plane layout with a single row variable', () => {
    const layout = buildPlaneLayout(['A', 'B', 'C', 'D'], 'D')
    expect(layout.order).toEqual(['D', 'A', 'B', 'C'])
    expect(layout.rowVariables).toEqual(['A'])
    expect(layout.colVariables).toEqual(['B', 'C'])
    expect(layout.rows).toBe(2)
    expect(layout.cols).toBe(4)
    expect(layout.rowLabels).toEqual(['0', '1'])
  })

  it('respects an explicit rowCount override', () => {
    const layout = buildPlaneLayout(VARS, 'E', { rowCount: 1 })
    expect(layout.rowVariables).toEqual(['A'])
    expect(layout.colVariables).toEqual(['B', 'C', 'D'])
    expect(layout.rows).toBe(2)
    expect(layout.cols).toBe(8)
  })

  it('rejects a plane variable that is not among the map variables', () => {
    expect(() => buildPlaneLayout(VARS, 'X')).toThrow(RangeError)
  })

  it('rejects unsupported variable counts', () => {
    expect(() => buildPlaneLayout(['A'], 'A')).toThrow(RangeError)
    expect(() => buildPlaneLayout(['A', 'B', 'C', 'D', 'E', 'F'], 'E')).toThrow(RangeError)
  })

  it('rejects duplicate or invalid variable names', () => {
    expect(() => buildPlaneLayout(['A', 'A', 'C', 'D', 'E'], 'E')).toThrow(RangeError)
    expect(() => buildPlaneLayout(['1A', 'B', 'C', 'D', 'E'], 'E')).toThrow(RangeError)
  })

  it('rejects invalid rowCount values', () => {
    expect(() => buildPlaneLayout(VARS, 'E', { rowCount: 0 })).toThrow(RangeError)
    expect(() => buildPlaneLayout(VARS, 'E', { rowCount: 3 })).toThrow(RangeError)
    expect(() => buildPlaneLayout(VARS, 'E', { rowCount: 4 })).toThrow(RangeError)
  })
})

describe('planeCellMinterm / planeGrid', () => {
  it('renders the standard 4-variable grid in plane 0 for the E plane', () => {
    const layout = buildPlaneLayout(VARS, 'E')
    expect(planeGrid(layout, 0)).toEqual([
      [0, 1, 3, 2],
      [4, 5, 7, 6],
      [12, 13, 15, 14],
      [8, 9, 11, 10],
    ])
  })

  it('offsets plane 1 cells by 1 << (n - 1) = 16', () => {
    const layout = buildPlaneLayout(VARS, 'E')
    const plane0 = planeGrid(layout, 0)
    const plane1 = planeGrid(layout, 1)
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        expect(plane1[row]![col]).toBe(plane0[row]![col]! + 16)
      }
    }
  })

  it('always keeps plane 0 in 0..15 and plane 1 in 16..31 regardless of plane variable', () => {
    for (const planeVar of VARS) {
      const layout = buildPlaneLayout(VARS, planeVar)
      for (const cell of planeCells(layout)) {
        if (cell.plane === 0) {
          expect(cell.minterm).toBeGreaterThanOrEqual(0)
          expect(cell.minterm).toBeLessThanOrEqual(15)
        } else {
          expect(cell.minterm).toBeGreaterThanOrEqual(16)
          expect(cell.minterm).toBeLessThanOrEqual(31)
        }
      }
    }
  })

  it('enumerates exactly 32 unique plane-first minterms', () => {
    for (const planeVar of VARS) {
      const layout = buildPlaneLayout(VARS, planeVar)
      const minterms = planeCells(layout).map((c) => c.minterm)
      expect(minterms).toHaveLength(32)
      expect(new Set(minterms).size).toBe(32)
      expect(minterms.slice().sort((a, b) => a - b)).toEqual(
        Array.from({ length: 32 }, (_, i) => i),
      )
    }
  })
})

describe('planePosition (round trip)', () => {
  it('round-trips cell → position → cell for every plane variable', () => {
    for (const planeVar of VARS) {
      const layout = buildPlaneLayout(VARS, planeVar)
      for (let minterm = 0; minterm < 32; minterm++) {
        const { plane, row, col } = planePosition(layout, minterm)
        expect(planeCellMinterm(layout, row, col, plane)).toBe(minterm)
      }
    }
  })
})

describe('canonicalToPlaneSpace / planeSpaceToCanonical', () => {
  it('promotes the E plane variable from LSB (canonical) to MSB (plane-first)', () => {
    const layout = buildPlaneLayout(VARS, 'E')
    // canonical 5 = binary 00101 → A=0 B=0 C=1 D=0 E=1
    // plane-first order [E,A,B,C,D]: E=1 (bit 4), C=1 (bit 1) → 16 + 2 = 18
    expect(canonicalToPlaneSpace(layout, 5)).toBe(18)
    // round trip: plane-first 18 = E=1 (16) + C=1 (2) → canonical 00101 = 5
    expect(planeSpaceToCanonical(layout, 18)).toBe(5)
  })

  it('maps a canonical minterm of a chosen plane variable correctly', () => {
    // plane variable C: canonical 5 = binary 00101 → C=1
    // plane-first C=1 at bit 4 → 17
    const layout = buildPlaneLayout(VARS, 'C')
    expect(canonicalToPlaneSpace(layout, 5)).toBe(17)
    expect(planeSpaceToCanonical(layout, 17)).toBe(5)
  })

  it('round-trips translations for every plane variable and minterm', () => {
    for (const planeVar of VARS) {
      const layout = buildPlaneLayout(VARS, planeVar)
      for (let m = 0; m < 32; m++) {
        const plane = canonicalToPlaneSpace(layout, m)
        expect(planeSpaceToCanonical(layout, plane)).toBe(m)
      }
    }
  })
})