import { describe, it, expect } from 'vitest'
import {
  getDescriptor,
  isGateComponentType,
  gateForType,
  isStatefulType,
  portCountOf,
  defaultAttrs,
  normalizeAttrs,
  attrString,
  attrNumber,
} from '../../../core/circuit'

describe('component descriptors', () => {
  it('throws for an unknown component type', () => {
    expect(() => getDescriptor('bogus')).toThrow(RangeError)
    expect(() => defaultAttrs('bogus')).toThrow(RangeError)
  })

  it('classifies gate types', () => {
    expect(isGateComponentType('AND')).toBe(true)
    expect(isGateComponentType('NOT')).toBe(true)
    expect(isGateComponentType('input')).toBe(false)
    expect(gateForType('XOR')).toBe('XOR')
    expect(gateForType('output')).toBeNull()
  })

  it('flags only sequential kinds as stateful', () => {
    expect(isStatefulType('dff')).toBe(true)
    expect(isStatefulType('AND')).toBe(false)
    expect(isStatefulType('input')).toBe(false)
    expect(isStatefulType('subcircuit')).toBe(false)
  })

  it('fills schema defaults and merges partials', () => {
    expect(defaultAttrs('AND')).toEqual({ width: 1, inputs: 5, labelLocation: 'bottom' })
    expect(defaultAttrs('NOT')).toEqual({ width: 1, labelLocation: 'bottom' })
    expect(defaultAttrs('input')).toEqual({ label: 'A', width: 1 })
    expect(normalizeAttrs('input', { label: 'X' })).toEqual({ label: 'X', width: 1 })
    expect(normalizeAttrs('subcircuit', {})).toEqual({ libraryId: '' })
    expect(defaultAttrs('splitter')).toEqual({ width: 8, fanOut: 8 })
    expect(defaultAttrs('pull')).toEqual({ pull: 1 })
  })

  it('resolves port counts from attrs and descriptors', () => {
    expect(portCountOf('AND', defaultAttrs('AND'))).toEqual({ inputs: 5, outputs: 1 })
    expect(portCountOf('AND', normalizeAttrs('AND', { inputs: 4 }))).toEqual({ inputs: 4, outputs: 1 })
    expect(portCountOf('NOT', defaultAttrs('NOT'))).toEqual({ inputs: 1, outputs: 1 })
    expect(portCountOf('input', defaultAttrs('input'))).toEqual({ inputs: 0, outputs: 1 })
    expect(portCountOf('output', defaultAttrs('output'))).toEqual({ inputs: 1, outputs: 0 })
    expect(portCountOf('dff', defaultAttrs('dff'))).toEqual({ inputs: 2, outputs: 2 })
    expect(portCountOf('text', defaultAttrs('text'))).toEqual({ inputs: 0, outputs: 0 })
    expect(portCountOf('splitter', defaultAttrs('splitter'))).toEqual({ inputs: 9, outputs: 9 })
    expect(portCountOf('pull', defaultAttrs('pull'))).toEqual({ inputs: 1, outputs: 1 })
  })

  it('uses library arity for subcircuit instances', () => {
    const base = defaultAttrs('subcircuit')
    expect(portCountOf('subcircuit', base)).toEqual({ inputs: 2, outputs: 1 })
    expect(portCountOf('subcircuit', base, { inputs: 3, outputs: 2 })).toEqual({ inputs: 3, outputs: 2 })
  })

  it('reads string and numeric attributes with fallbacks', () => {
    expect(attrString({ label: 'A' }, 'label', '')).toBe('A')
    expect(attrString({}, 'label', 'fallback')).toBe('fallback')
    expect(attrNumber({ width: 4 }, 'width', 1)).toBe(4)
    expect(attrNumber({}, 'width', 1)).toBe(1)
  })
})