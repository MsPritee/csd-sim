import { describe, it, expect } from 'vitest'
import { orthogonalRoute, junctionPoints } from '../../../simulators/circuit/layout'

describe('orthogonalRoute', () => {
  it('returns a straight segment for level (same-y) wires', () => {
    expect(orthogonalRoute({ x: 0, y: 50 }, { x: 200, y: 50 })).toEqual([
      { x: 0, y: 50 },
      { x: 200, y: 50 },
    ])
  })

  it('returns a straight vertical segment for same-x wires', () => {
    expect(orthogonalRoute({ x: 50, y: 0 }, { x: 50, y: 100 })).toEqual([
      { x: 50, y: 0 },
      { x: 50, y: 100 },
    ])
  })

  it('routes a diagonal pair through right-angle elbows', () => {
    const pts = orthogonalRoute({ x: 0, y: 0 }, { x: 200, y: 100 })
    expect(pts).toHaveLength(4)
    // start and end preserved
    expect(pts[0]).toEqual({ x: 0, y: 0 })
    expect(pts[3]).toEqual({ x: 200, y: 100 })
    // all segments are axis-aligned (horizontal then vertical then horizontal)
    expect(pts[0]!.y).toBe(pts[1]!.y)
    expect(pts[1]!.x).toBe(pts[2]!.x)
    expect(pts[2]!.y).toBe(pts[3]!.y)
    // midpoint is centered
    expect(pts[1]!.x).toBe(100)
  })
})

describe('junctionPoints', () => {
  const resolve = (p: string): { x: number; y: number } | null => {
    switch (p) {
      case 'a':
        return { x: 0, y: 50 }
      case 'b':
        return { x: 200, y: 50 }
      case 'c':
        return { x: 0, y: 100 }
      default:
        return null
    }
  }

  it('returns empty for no wires', () => {
    expect(junctionPoints([], resolve)).toEqual([])
  })

  it('does not flag a single relaxed wire', () => {
    expect(junctionPoints([{ from: 'a', to: 'b' }], resolve)).toEqual([])
  })

  it('marks a shared endpoint where two wires fan out', () => {
    const pts = junctionPoints(
      [
        { from: 'a', to: 'b' },
        { from: 'a', to: 'c' },
      ],
      resolve,
    )
    expect(pts).toHaveLength(1)
    expect(pts[0]).toEqual({ x: 0, y: 50 })
  })

  it('skips ports that fail to resolve', () => {
    expect(junctionPoints([{ from: 'a', to: 'missing' }], resolve)).toEqual([])
  })
})