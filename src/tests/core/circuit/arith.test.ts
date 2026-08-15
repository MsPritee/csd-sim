import { describe, test, expect } from 'vitest'
import { addBuses, subBuses, negateNet, compareBuses, evalSourceComponent } from '../../../core/circuit/arith'
import { netFromNumber, packedValue, netToString } from '../../../core/circuit/value'
import type { NetValue } from '../../../core/circuit/value'

function num(a: number, w = 8): NetValue {
  return netFromNumber(w, a)
}

describe('addBuses', () => {
  test('adds two 8-bit values with no carry', () => {
    const [sum, cout] = addBuses(num(0x0f), num(0x10), undefined, 8)
    expect(packedValue(sum)).toBe(0x1f)
    expect(packedValue(cout)).toBe(0)
  })

  test('wraps at width and reports carry-out', () => {
    const [sum, cout] = addBuses(num(0xff), num(0x01), undefined, 8)
    expect(packedValue(sum)).toBe(0x00)
    expect(packedValue(cout)).toBe(1)
  })

  test('honours carry-in', () => {
    const [sum] = addBuses(num(0x05), num(0x03), num(1), 8)
    expect(packedValue(sum)).toBe(0x09)
  })

  test('floats undefined operands', () => {
    const [sum] = addBuses(undefined, num(1), undefined, 8)
    expect(sum).toBeUndefined()
  })

  test('errors on width mismatch', () => {
    const [sum] = addBuses(num(1, 8), num(1, 4), undefined, 8)
    expect(sum).toBe('E')
  })
})

describe('subBuses', () => {
  test('subtracts and wraps', () => {
    const [diff, borrow] = subBuses(num(0x12), num(0x02), undefined, 8)
    expect(packedValue(diff)).toBe(0x10)
    expect(packedValue(borrow)).toBe(0)
  })

  test('borrows at underflow', () => {
    const [diff, borrow] = subBuses(num(0x02), num(0x12), undefined, 8)
    expect(packedValue(diff)).toBe(0xf0)
    expect(packedValue(borrow)).toBe(1)
  })

  test('honours borrow-in', () => {
    const [diff] = subBuses(num(0x05), num(0x03), num(1), 8)
    expect(packedValue(diff)).toBe(0x01)
  })
})

describe('negateNet', () => {
  test('two’s-complement negation', () => {
    expect(packedValue(negateNet(num(5, 8), 8))).toBe(0xfb)
    expect(packedValue(negateNet(num(0, 8), 8))).toBe(0)
  })

  test('errors on unknown input', () => {
    expect(negateNet('E', 8)).toBe('E')
  })
})

describe('compareBuses', () => {
  test('greater', () => {
    const [gt, eq, lt] = compareBuses(num(9), num(3), 8)
    expect(packedValue(gt)).toBe(1)
    expect(packedValue(eq)).toBe(0)
    expect(packedValue(lt)).toBe(0)
  })

  test('equal', () => {
    const [gt, eq, lt] = compareBuses(num(7), num(7), 8)
    expect(packedValue(gt)).toBe(0)
    expect(packedValue(eq)).toBe(1)
    expect(packedValue(lt)).toBe(0)
  })

  test('less', () => {
    const [gt, eq, lt] = compareBuses(num(2), num(6), 8)
    expect(packedValue(gt)).toBe(0)
    expect(packedValue(eq)).toBe(0)
    expect(packedValue(lt)).toBe(1)
  })
})

describe('evalSourceComponent', () => {
  test('constant emits its bus value', () => {
    const [out] = evalSourceComponent('constant', { width: 8, value: 0x42 }, [])!
    expect(packedValue(out)).toBe(0x42)
  })

  test('tunnel relays its input', () => {
    const [out] = evalSourceComponent('tunnel', {}, [num(0x2a)])!
    expect(packedValue(out)).toBe(0x2a)
  })

  test('adder is dispatchable through the evaluator', () => {
    const [sum] = evalSourceComponent('adder', { width: 8 }, [num(1), num(2), undefined])!
    expect(packedValue(sum)).toBe(3)
  })

  test('unknown types are left to the simulator', () => {
    expect(evalSourceComponent('and', {}, [])).toBeNull()
    expect(evalSourceComponent('led', {}, [])).toBeNull()
  })
})

test('netToString renders a bus value', () => {
  expect(netToString(num(0xab))).toBeTruthy()
})