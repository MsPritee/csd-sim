export function toGrayCode(value: number): number {
  return value ^ (value >> 1)
}

export function fromGrayCode(gray: number): number {
  let value = gray
  let mask = gray >> 1
  while (mask !== 0) {
    value = value ^ mask
    mask = mask >> 1
  }
  return value
}

export function toBinaryString(value: number, bits: number): string {
  return value.toString(2).padStart(bits, '0')
}

/**
 * Generates the n-bit Gray-code sequence (reflected / binary-reflected).
 * A Gray code of `bits` bits contains exactly 2^bits entries; the first
 * entry is zero and consecutive entries differ in exactly one bit.
 */
export function generateGrayCode(bits: number): number[] {
  if (!Number.isInteger(bits) || bits < 0) {
    throw new RangeError('bit count must be a non-negative integer')
  }
  const count = 2 ** bits
  const sequence: number[] = []
  for (let i = 0; i < count; i++) {
    sequence.push(toGrayCode(i))
  }
  return sequence
}

export function grayString(value: number, bits: number): string {
  return toBinaryString(value, bits)
}

export function hammingDistance(a: number, b: number): number {
  let diff = a ^ b
  let count = 0
  while (diff !== 0) {
    count += diff & 1
    diff = diff >>> 1
  }
  return count
}

/** Validates that consecutive entries differ in exactly one bit. */
export function isAdjacentSequence(sequence: readonly number[]): boolean {
  for (let i = 1; i < sequence.length; i++) {
    if (hammingDistance(sequence[i - 1]!, sequence[i]!) !== 1) return false
  }
  return true
}