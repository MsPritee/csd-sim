import type { NumberSystem, NumberSystemConcept } from './types'

/**
 * Per-number-system learning concepts. Each record follows the master plan's
 * concept schema and explains WHY the system works, not just how to convert.
 */

const DECIMAL: NumberSystemConcept = {
  id: 'decimal',
  title: 'Decimal (Base-10)',
  objective: 'Understand that decimal uses 10 digits (0-9) and each position represents a power of 10.',
  prerequisites: ['Basic counting and arithmetic.'],
  explanation: [
    'Decimal is the number system we use every day. It uses 10 digits: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9.',
    'Each position in a decimal number represents a power of 10. The rightmost digit is ones (10⁰), the next is tens (10¹), then hundreds (10²), and so on.',
    'For example, 234 means 2 hundreds + 3 tens + 4 ones: 2×100 + 3×10 + 4×1 = 200 + 30 + 4 = 234.',
    'We use decimal because humans have 10 fingers, making it natural for counting.',
  ],
  visualization: [
    'Show the place values: hundreds, tens, ones.',
    'Demonstrate how carrying works when a digit exceeds 9.',
  ],
  interaction: ['Enter numbers and see the place value breakdown.'],
  commonMistakes: [
    'Forgetting that each position is a power of 10.',
    'Confusing place value when numbers have zeros.',
  ],
  hints: ['Think "times 10" each time you move left one position.'],
  assessment: [
    'What does the digit 5 represent in the number 523?',
    'Why do we carry when adding 9 + 3?',
  ],
}

const BINARY: NumberSystemConcept = {
  id: 'binary',
  title: 'Binary (Base-2)',
  objective: 'Understand that binary uses only 2 digits (0 and 1) and each position represents a power of 2.',
  prerequisites: ['Decimal place value understanding.'],
  explanation: [
    'Binary uses only 2 digits: 0 and 1. Each position represents a power of 2.',
    'The rightmost digit is ones (2⁰), the next is twos (2¹), then fours (2²), eights (2³), and so on.',
    'For example, 1011 means 1 eight + 0 fours + 1 two + 1 one: 1×8 + 0×4 + 1×2 + 1×1 = 8 + 0 + 2 + 1 = 11 in decimal.',
    'Computers use binary because digital circuits have two states: on (1) and off (0).',
  ],
  visualization: [
    'Show the place values: 8, 4, 2, 1.',
    'Toggle bits and watch the decimal value change.',
  ],
  interaction: ['Toggle individual bits and see the decimal equivalent.'],
  commonMistakes: [
    'Treating binary like decimal (reading 1011 as "one thousand eleven").',
    'Forgetting that each position doubles, not increases by 10.',
  ],
  hints: ['Think "times 2" each time you move left one position.'],
  assessment: [
    'What is binary 1010 in decimal?',
    'Why do computers use binary instead of decimal?',
  ],
}

const HEXADECIMAL: NumberSystemConcept = {
  id: 'hexadecimal',
  title: 'Hexadecimal (Base-16)',
  objective: 'Understand that hexadecimal uses 16 digits (0-9 and A-F) and each digit represents exactly 4 bits.',
  prerequisites: ['Binary understanding.', 'Decimal place value understanding.'],
  explanation: [
    'Hexadecimal uses 16 digits: 0-9 and A-F (where A=10, B=11, C=12, D=13, E=14, F=15).',
    'Each hexadecimal digit represents exactly 4 binary digits (bits). This makes it perfect for representing binary data compactly.',
    'For example, hex 2F means 2×16 + 15×1 = 32 + 15 = 47 in decimal. In binary, 47 is 0010 1111, which is exactly the 4-bit groups for 2 and F.',
    'Hexadecimal is widely used in computing for memory addresses, color codes, and representing binary data in a readable form.',
  ],
  visualization: [
    'Show the relationship: 1 hex digit = 4 bits.',
    'Display binary numbers grouped into nibbles with their hex equivalents.',
  ],
  interaction: ['Enter binary and see it grouped into hex digits automatically.'],
  commonMistakes: [
    'Treating A-F as letters instead of numbers 10-15.',
    'Forgetting that each hex digit represents 4 bits, not 3 or 5.',
  ],
  hints: ['Group binary into sets of 4 bits, then convert each group to one hex digit.'],
  assessment: [
    'What is hex A in decimal?',
    'How many bits does the hex number 3F represent?',
  ],
}

const OCTAL: NumberSystemConcept = {
  id: 'octal',
  title: 'Octal (Base-8)',
  objective: 'Understand that octal uses 8 digits (0-7) and each digit represents exactly 3 bits.',
  prerequisites: ['Binary understanding.', 'Decimal place value understanding.'],
  explanation: [
    'Octal uses 8 digits: 0, 1, 2, 3, 4, 5, 6, 7. Each digit represents exactly 3 binary digits (bits).',
    'For example, octal 37 means 3×8 + 7×1 = 24 + 7 = 31 in decimal. In binary, 31 is 011 111, which is exactly the 3-bit groups for 3 and 7.',
    'Octal was historically used in computing because some systems used 6-bit, 12-bit, or 24-bit words, which are divisible by 3.',
    'While less common today, octal is still used in some contexts like Unix file permissions.',
  ],
  visualization: [
    'Show the relationship: 1 octal digit = 3 bits.',
    'Display binary numbers grouped into 3-bit groups with their octal equivalents.',
  ],
  interaction: ['Enter binary and see it grouped into octal digits automatically.'],
  commonMistakes: [
    'Using digits 8 or 9 in octal (invalid).',
    'Forgetting that each octal digit represents 3 bits, not 4.',
  ],
  hints: ['Group binary into sets of 3 bits, then convert each group to one octal digit.'],
  assessment: [
    'What is octal 10 in decimal?',
    'How many bits does the octal number 17 represent?',
  ],
}

/** Complete concept catalog keyed by number system id. */
export const NUMBER_SYSTEM_CONCEPTS: Readonly<Record<NumberSystem, NumberSystemConcept>> = {
  decimal: DECIMAL,
  binary: BINARY,
  hexadecimal: HEXADECIMAL,
  octal: OCTAL,
}

/** Look up a number system concept; throws for unknown ids. */
export function getNumberSystemConcept(id: NumberSystem): NumberSystemConcept {
  const concept = NUMBER_SYSTEM_CONCEPTS[id]
  if (!concept) throw new RangeError(`unknown number system concept "${id}"`)
  return concept
}

/** All concepts in teaching order. */
export const NUMBER_SYSTEM_CONCEPT_LIST: readonly NumberSystemConcept[] = [
  DECIMAL,
  BINARY,
  HEXADECIMAL,
  OCTAL,
]
