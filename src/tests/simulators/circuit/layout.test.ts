import { describe, it, expect } from 'vitest'
import {
  orthogonalRoute,
  junctionPoints,
  centerRow,
  inputPinPortLocal,
  pinLabelPosition,
  portLocalPos,
} from '../../../simulators/circuit/layout'
import type { Component } from '../../../core/circuit'

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

describe('centerRow', () => {
  it('centers a single pin in the box', () => {
    expect(centerRow(0, 1)).toBe(50)
  })

  it('keeps the classic two-pin positions', () => {
    expect(centerRow(0, 2)).toBe(32)
    expect(centerRow(1, 2)).toBe(68)
  })

  it('is symmetric about the center for every pin count', () => {
    for (const count of [2, 3, 4, 5, 8]) {
      for (let i = 0; i < count; i++) {
        expect(centerRow(i, count) + centerRow(count - 1 - i, count)).toBe(100)
      }
    }
  })

  it('keeps odd counts centered on y=50', () => {
    expect(centerRow(1, 3)).toBe(50)
    expect(centerRow(2, 5)).toBe(50)
    expect(centerRow(4, 9)).toBe(50)
  })

  it('stays inside the 100px-tall box', () => {
    for (const count of [2, 3, 4, 5, 6, 8, 12]) {
      for (let i = 0; i < count; i++) {
        expect(centerRow(i, count)).toBeGreaterThanOrEqual(0)
        expect(centerRow(i, count)).toBeLessThanOrEqual(100)
      }
    }
  })

  it('scales spacing down so larger pin counts still fit', () => {
    expect(centerRow(0, 5)).toBe(20)
    expect(centerRow(4, 5)).toBe(80)
    expect(centerRow(1, 8) - centerRow(0, 8)).toBeGreaterThan(0)
  })
})

describe('inputPinPortLocal', () => {
  it('places the connection dot on the chosen side of the inner square', () => {
    expect(inputPinPortLocal('east')).toEqual({ x: 68, y: 45 })
    expect(inputPinPortLocal('west')).toEqual({ x: 34, y: 45 })
    expect(inputPinPortLocal('north')).toEqual({ x: 51, y: 28 })
    expect(inputPinPortLocal('south')).toEqual({ x: 51, y: 62 })
  })
})

describe('pinLabelPosition', () => {
  it('anchors the label outside the input-pin square for every option', () => {
    expect(pinLabelPosition('left')).toEqual({ x: 22, y: 45, anchor: 'end' })
    expect(pinLabelPosition('right')).toEqual({ x: 80, y: 45, anchor: 'start' })
    expect(pinLabelPosition('top')).toEqual({ x: 51, y: 16, anchor: 'middle' })
    expect(pinLabelPosition('bottom')).toEqual({ x: 51, y: 74, anchor: 'middle' })
  })
})

describe('portLocalPos', () => {
  const inputPin = (facing: string) =>
    ({
      id: 'i',
      type: 'input',
      attrs: { label: '', width: 1, facing },
      x: 0,
      y: 0,
      rotation: 0,
    }) as unknown as Component

  it('moves an input pin wire port to its facing side', () => {
    expect(portLocalPos('i:out:0', inputPin('east'))).toEqual({ x: 68, y: 45 })
    expect(portLocalPos('i:out:0', inputPin('west'))).toEqual({ x: 34, y: 45 })
    expect(portLocalPos('i:out:0', inputPin('north'))).toEqual({ x: 51, y: 28 })
    expect(portLocalPos('i:out:0', inputPin('south'))).toEqual({ x: 51, y: 62 })
  })

  it('defaults to east when facing is missing', () => {
    expect(portLocalPos('i:out:0', inputPin(''))).toEqual({ x: 68, y: 45 })
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