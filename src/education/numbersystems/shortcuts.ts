import type { ConversionShortcut, NumberSystem } from './types'

/**
 * Conversion shortcuts for mental math and quick conversions.
 * These are patterns that students can memorize to work faster.
 */

const BINARY_TO_DECIMAL_SHORTCUTS: ConversionShortcut[] = [
  {
    from: 'binary',
    to: 'decimal',
    name: 'Powers of 2',
    description: 'Memorize powers of 2: 1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024...',
    applicableRange: 'Binary numbers with few 1s',
    examples: [
      {
        input: '1000',
        output: '8',
        explanation: 'Single 1 in the 8s place (2³) = 8',
      },
      {
        input: '100000',
        output: '32',
        explanation: 'Single 1 in the 32s place (2⁵) = 32',
      },
    ],
  },
  {
    from: 'binary',
    to: 'decimal',
    name: 'Counting Method',
    description: 'Start from the right, add the value of each position where there is a 1',
    applicableRange: 'Any binary number',
    examples: [
      {
        input: '1011',
        output: '11',
        explanation: '8 + 0 + 2 + 1 = 11',
      },
      {
        input: '11001',
        output: '25',
        explanation: '16 + 8 + 0 + 0 + 1 = 25',
      },
    ],
  },
]

const DECIMAL_TO_BINARY_SHORTCUTS: ConversionShortcut[] = [
  {
    from: 'decimal',
    to: 'binary',
    name: 'Largest Power First',
    description: 'Find the largest power of 2 less than or equal to the number, subtract, repeat',
    applicableRange: 'Any decimal number',
    examples: [
      {
        input: '13',
        output: '1101',
        explanation: '13 - 8 = 5, 5 - 4 = 1, 1 - 1 = 0 → 8+4+0+1 = 1101',
      },
      {
        input: '25',
        output: '11001',
        explanation: '25 - 16 = 9, 9 - 8 = 1, 1 - 1 = 0 → 16+8+0+0+1 = 11001',
      },
    ],
  },
  {
    from: 'decimal',
    to: 'binary',
    name: 'Division Method',
    description: 'Repeatedly divide by 2, collect remainders from bottom to top',
    applicableRange: 'Any decimal number',
    examples: [
      {
        input: '13',
        output: '1101',
        explanation: '13÷2=6 r1, 6÷2=3 r0, 3÷2=1 r1, 1÷2=0 r1 → read remainders upward: 1101',
      },
    ],
  },
]

const BINARY_TO_HEX_SHORTCUTS: ConversionShortcut[] = [
  {
    from: 'binary',
    to: 'hexadecimal',
    name: 'Group by 4',
    description: 'Group binary digits into sets of 4 (from right), convert each group to hex',
    applicableRange: 'Any binary number',
    examples: [
      {
        input: '11010111',
        output: 'D7',
        explanation: '1101 = D (13), 0111 = 7 (7) → D7',
      },
      {
        input: '10101100',
        output: 'AC',
        explanation: '1010 = A (10), 1100 = C (12) → AC',
      },
    ],
  },
  {
    from: 'binary',
    to: 'hexadecimal',
    name: 'Memorize Nibbles',
    description: 'Memorize the 16 possible 4-bit patterns (0000-1111) and their hex equivalents',
    applicableRange: 'Quick mental conversion',
    examples: [
      {
        input: '1111',
        output: 'F',
        explanation: 'Memorize: 1111 = F (15)',
      },
      {
        input: '1010',
        output: 'A',
        explanation: 'Memorize: 1010 = A (10)',
      },
    ],
  },
]

const HEX_TO_BINARY_SHORTCUTS: ConversionShortcut[] = [
  {
    from: 'hexadecimal',
    to: 'binary',
    name: 'Expand Each Digit',
    description: 'Convert each hex digit to its 4-bit binary equivalent',
    applicableRange: 'Any hexadecimal number',
    examples: [
      {
        input: 'A3',
        output: '10100011',
        explanation: 'A = 1010, 3 = 0011 → 1010 0011',
      },
      {
        input: 'FF',
        output: '11111111',
        explanation: 'F = 1111, F = 1111 → 1111 1111',
      },
    ],
  },
]

const BINARY_TO_OCTAL_SHORTCUTS: ConversionShortcut[] = [
  {
    from: 'binary',
    to: 'octal',
    name: 'Group by 3',
    description: 'Group binary digits into sets of 3 (from right), convert each group to octal',
    applicableRange: 'Any binary number',
    examples: [
      {
        input: '101110',
        output: '56',
        explanation: '101 = 5, 110 = 6 → 56',
      },
      {
        input: '110011',
        output: '63',
        explanation: '110 = 6, 011 = 3 → 63',
      },
    ],
  },
]

const OCTAL_TO_BINARY_SHORTCUTS: ConversionShortcut[] = [
  {
    from: 'octal',
    to: 'binary',
    name: 'Expand Each Digit',
    description: 'Convert each octal digit to its 3-bit binary equivalent',
    applicableRange: 'Any octal number',
    examples: [
      {
        input: '75',
        output: '111101',
        explanation: '7 = 111, 5 = 101 → 111 101',
      },
      {
        input: '17',
        output: '001111',
        explanation: '1 = 001, 7 = 111 → 001 111',
      },
    ],
  },
]

const DECIMAL_TO_HEX_SHORTCUTS: ConversionShortcut[] = [
  {
    from: 'decimal',
    to: 'hexadecimal',
    name: 'Via Binary',
    description: 'Convert decimal to binary first, then group bits into hex',
    applicableRange: 'When you know binary well',
    examples: [
      {
        input: '255',
        output: 'FF',
        explanation: '255 = 11111111 binary → group as 1111 1111 → FF',
      },
    ],
  },
  {
    from: 'decimal',
    to: 'hexadecimal',
    name: 'Division by 16',
    description: 'Repeatedly divide by 16, collect remainders',
    applicableRange: 'Any decimal number',
    examples: [
      {
        input: '255',
        output: 'FF',
        explanation: '255÷16=15 r15(F), 15÷16=0 r15(F) → read remainders: FF',
      },
    ],
  },
]

const HEX_TO_DECIMAL_SHORTCUTS: ConversionShortcut[] = [
  {
    from: 'hexadecimal',
    to: 'decimal',
    name: 'Positional Values',
    description: 'Multiply each digit by 16 to the power of its position',
    applicableRange: 'Any hexadecimal number',
    examples: [
      {
        input: '2A',
        output: '42',
        explanation: '2×16¹ + 10×16⁰ = 32 + 10 = 42',
      },
      {
        input: 'FF',
        output: '255',
        explanation: '15×16¹ + 15×16⁰ = 240 + 15 = 255',
      },
    ],
  },
]

const DECIMAL_TO_OCTAL_SHORTCUTS: ConversionShortcut[] = [
  {
    from: 'decimal',
    to: 'octal',
    name: 'Division by 8',
    description: 'Repeatedly divide by 8, collect remainders',
    applicableRange: 'Any decimal number',
    examples: [
      {
        input: '64',
        output: '100',
        explanation: '64÷8=8 r0, 8÷8=1 r0, 1÷8=0 r1 → read remainders: 100',
      },
    ],
  },
]

const OCTAL_TO_DECIMAL_SHORTCUTS: ConversionShortcut[] = [
  {
    from: 'octal',
    to: 'decimal',
    name: 'Positional Values',
    description: 'Multiply each digit by 8 to the power of its position',
    applicableRange: 'Any octal number',
    examples: [
      {
        input: '75',
        output: '61',
        explanation: '7×8¹ + 5×8⁰ = 56 + 5 = 61',
      },
    ],
  },
]

/** All conversion shortcuts organized by (from, to) system. */
export const CONVERSION_SHORTCUTS: Readonly<Record<string, readonly ConversionShortcut[]>> = {
  'binary-decimal': BINARY_TO_DECIMAL_SHORTCUTS,
  'decimal-binary': DECIMAL_TO_BINARY_SHORTCUTS,
  'binary-hexadecimal': BINARY_TO_HEX_SHORTCUTS,
  'hexadecimal-binary': HEX_TO_BINARY_SHORTCUTS,
  'binary-octal': BINARY_TO_OCTAL_SHORTCUTS,
  'octal-binary': OCTAL_TO_BINARY_SHORTCUTS,
  'decimal-hexadecimal': DECIMAL_TO_HEX_SHORTCUTS,
  'hexadecimal-decimal': HEX_TO_DECIMAL_SHORTCUTS,
  'decimal-octal': DECIMAL_TO_OCTAL_SHORTCUTS,
  'octal-decimal': OCTAL_TO_DECIMAL_SHORTCUTS,
}

/** Get shortcuts for a specific conversion path. */
export function getShortcutsForConversion(from: NumberSystem, to: NumberSystem): readonly ConversionShortcut[] {
  const key = `${from}-${to}`
  return CONVERSION_SHORTCUTS[key] || []
}
