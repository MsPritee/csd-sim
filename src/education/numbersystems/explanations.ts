import type { ConversionExplanation, EducationalConversionResult, NumberSystem } from './types'
import { convertBetweenSystems } from '../../core/numbersystems/converters'
import { getShortcutsForConversion } from './shortcuts'

/**
 * Generates an educational explanation for a conversion between number systems.
 */
export function explainConversion(
  value: string | number,
  fromSystem: NumberSystem,
  toSystem: NumberSystem,
): EducationalConversionResult {
  // Perform the conversion
  const conversion = convertBetweenSystems(value, fromSystem, toSystem)
  
  if (!conversion.success) {
    return {
      success: false,
      fromSystem,
      toSystem,
      error: conversion.error,
    }
  }

  // Generate explanation
  const explanation = generateExplanation(value, fromSystem, toSystem, conversion.result!.toString(), conversion.intermediateSteps || [])
  
  // Get relevant shortcuts
  const shortcuts = getShortcutsForConversion(fromSystem, toSystem)

  return {
    success: true,
    fromSystem,
    toSystem,
    result: conversion.result?.toString(),
    explanation,
    shortcuts,
  }
}

/**
 * Generates a detailed explanation for a conversion.
 */
function generateExplanation(
  value: string | number,
  fromSystem: NumberSystem,
  toSystem: NumberSystem,
  result: string,
  intermediateSteps: string[],
): ConversionExplanation {
  const valueStr = typeof value === 'number' ? value.toString() : value.toString()
  
  let what = ''
  let why = ''
  let rule = ''
  const notice: string[] = []

  switch (fromSystem) {
    case 'decimal':
      switch (toSystem) {
        case 'binary':
          what = `Decimal ${valueStr} → Binary ${result}`
          why = `We convert decimal to binary by repeatedly dividing by 2 and collecting remainders. Each remainder becomes a binary digit (bit), read from bottom to top.`
          rule = 'Repeated division by 2: remainder 0 → bit 0, remainder 1 → bit 1'
          notice.push('Binary uses only 0s and 1s', 'Each position is a power of 2 (1, 2, 4, 8, 16...)')
          break
        case 'hexadecimal':
          what = `Decimal ${valueStr} → Hexadecimal ${result}`
          why = `We convert decimal to hexadecimal by repeatedly dividing by 16 and collecting remainders. Each remainder becomes a hex digit (0-9, A-F).`
          rule = 'Repeated division by 16: remainders 10-15 become A-F'
          notice.push('Hexadecimal uses 16 digits: 0-9 and A-F', 'Each hex digit represents 4 binary bits')
          break
        case 'octal':
          what = `Decimal ${valueStr} → Octal ${result}`
          why = `We convert decimal to octal by repeatedly dividing by 8 and collecting remainders. Each remainder becomes an octal digit (0-7).`
          rule = 'Repeated division by 8: remainders must be 0-7'
          notice.push('Octal uses only digits 0-7', 'Each octal digit represents 3 binary bits')
          break
      }
      break
    
    case 'binary':
      switch (toSystem) {
        case 'decimal':
          what = `Binary ${valueStr} → Decimal ${result}`
          why = `We convert binary to decimal by adding the value of each position where there is a 1. Each position represents a power of 2, starting from 1 on the right.`
          rule = 'Sum of powers of 2: for each 1, add 2^(position from right)'
          notice.push('Binary position values: 1, 2, 4, 8, 16, 32...', 'Only positions with 1 contribute to the sum')
          break
        case 'hexadecimal':
          what = `Binary ${valueStr} → Hexadecimal ${result}`
          why = `We convert binary to hexadecimal by grouping bits into sets of 4 (starting from the right). Each group of 4 bits corresponds to exactly one hex digit.`
          rule = 'Group bits into 4s, convert each group to hex (0000=0, 1111=F)'
          notice.push('1 hex digit = 4 binary bits (a nibble)', 'Pad with leading zeros if needed to make complete groups')
          break
        case 'octal':
          what = `Binary ${valueStr} → Octal ${result}`
          why = `We convert binary to octal by grouping bits into sets of 3 (starting from the right). Each group of 3 bits corresponds to exactly one octal digit.`
          rule = 'Group bits into 3s, convert each group to octal (000=0, 111=7)'
          notice.push('1 octal digit = 3 binary bits', 'Pad with leading zeros if needed to make complete groups')
          break
      }
      break
    
    case 'hexadecimal':
      switch (toSystem) {
        case 'decimal':
          what = `Hexadecimal ${valueStr} → Decimal ${result}`
          why = `We convert hexadecimal to decimal by multiplying each digit by 16 to the power of its position, then summing the results. Letters A-F represent values 10-15.`
          rule = 'Sum of (digit × 16^position): A=10, B=11, C=12, D=13, E=14, F=15'
          notice.push('Hexadecimal position values: 1, 16, 256, 4096...', 'Letters A-F are just numbers 10-15')
          break
        case 'binary':
          what = `Hexadecimal ${valueStr} → Binary ${result}`
          why = `We convert hexadecimal to binary by replacing each hex digit with its 4-bit binary equivalent. This is the reverse of grouping binary into hex.`
          rule = 'Replace each hex digit with 4 bits: 0=0000, F=1111'
          notice.push('Each hex digit expands to exactly 4 binary bits', 'This makes hex a compact way to write binary')
          break
        case 'octal':
          what = `Hexadecimal ${valueStr} → Octal ${result}`
          why = `We convert hexadecimal to octal by first converting to binary (each hex digit → 4 bits), then grouping the binary into 3-bit groups for octal.`
          rule = 'Hex → binary (4 bits each) → octal (group by 3 bits)'
          notice.push('This is a two-step process via binary', 'Binary acts as the bridge between hex and octal')
          break
      }
      break
    
    case 'octal':
      switch (toSystem) {
        case 'decimal':
          what = `Octal ${valueStr} → Decimal ${result}`
          why = `We convert octal to decimal by multiplying each digit by 8 to the power of its position, then summing the results.`
          rule = 'Sum of (digit × 8^position): digits must be 0-7'
          notice.push('Octal position values: 1, 8, 64, 512...', 'Octal cannot use digits 8 or 9')
          break
        case 'binary':
          what = `Octal ${valueStr} → Binary ${result}`
          why = `We convert octal to binary by replacing each octal digit with its 3-bit binary equivalent. This is the reverse of grouping binary into octal.`
          rule = 'Replace each octal digit with 3 bits: 0=000, 7=111'
          notice.push('Each octal digit expands to exactly 3 binary bits', 'This makes octal a compact way to write binary')
          break
        case 'hexadecimal':
          what = `Octal ${valueStr} → Hexadecimal ${result}`
          why = `We convert octal to hexadecimal by first converting to binary (each octal digit → 3 bits), then grouping the binary into 4-bit groups for hex.`
          rule = 'Octal → binary (3 bits each) → hex (group by 4 bits)'
          notice.push('This is a two-step process via binary', 'Binary acts as the bridge between octal and hex')
          break
      }
      break
  }

  // Add intermediate steps to the explanation if available
  if (intermediateSteps.length > 0) {
    notice.push(`Step-by-step: ${intermediateSteps.join(' → ')}`)
  }

  return {
    what,
    why,
    rule,
    notice,
  }
}

/**
 * Generates a comparison explanation showing the same value in all systems.
 */
export function explainAllSystems(decimal: number): {
  decimal: string
  binary: string
  hexadecimal: string
  octal: string
  explanation: string[]
} {
  const binary = decimal.toString(2)
  const hexadecimal = decimal.toString(16).toUpperCase()
  const octal = decimal.toString(8)

  const explanation: string[] = [
    `The number ${decimal} can be represented in different number systems:`,
    `• Decimal (base-10): ${decimal} — uses digits 0-9, each position is a power of 10`,
    `• Binary (base-2): ${binary} — uses digits 0-1, each position is a power of 2`,
    `• Hexadecimal (base-16): ${hexadecimal} — uses digits 0-9 and A-F, each position is a power of 16`,
    `• Octal (base-8): ${octal} — uses digits 0-7, each position is a power of 8`,
    '',
    `Key relationships:`,
    `• Binary ↔ Hexadecimal: Group binary into 4-bit sets (nibbles) for hex`,
    `• Binary ↔ Octal: Group binary into 3-bit sets for octal`,
    `• Hexadecimal ↔ Octal: Convert via binary as the bridge`,
    '',
    `Why these systems matter:`,
    `• Decimal: Human-friendly for everyday counting`,
    `• Binary: Fundamental to digital circuits and computing`,
    `• Hexadecimal: Compact representation of binary data (4 bits per digit)`,
    `• Octal: Historical use in some computing systems (3 bits per digit)`,
  ]

  return {
    decimal: decimal.toString(),
    binary,
    hexadecimal,
    octal,
    explanation,
  }
}

/**
 * Explains why a specific conversion shortcut works.
 */
export function explainShortcut(shortcutName: string): string {
  const explanations: Record<string, string> = {
    'Powers of 2': 'This shortcut works because binary is base-2, so each position represents a power of 2. Memorizing powers of 2 lets you instantly recognize the value of binary numbers with single 1s.',
    'Counting Method': 'This works because binary is positional: each 1 contributes its position value to the total. By adding these values, you get the decimal equivalent.',
    'Largest Power First': 'This method works by repeatedly subtracting the largest possible power of 2, effectively building the binary representation from left to right.',
    'Division Method': 'Repeated division by 2 works because the remainders (0 or 1) directly give you the binary digits, from least significant to most significant.',
    'Group by 4': 'Since 16 = 2⁴, each hexadecimal digit corresponds to exactly 4 binary digits. Grouping by 4 makes conversion systematic and fast.',
    'Memorize Nibbles': 'Memorizing the 16 possible 4-bit patterns (0000 through 1111) and their hex equivalents enables instant conversion without calculation.',
    'Expand Each Digit': 'Since each hex digit represents exactly 4 bits, expanding each digit to its 4-bit binary equivalent reconstructs the original binary number.',
    'Group by 3': 'Since 8 = 2³, each octal digit corresponds to exactly 3 binary digits. Grouping by 3 makes conversion systematic.',
    'Via Binary': 'Converting through binary works because binary is the common denominator — both hex (4 bits) and octal (3 bits) are based on powers of 2.',
    'Division by 16': 'Repeated division by 16 works for the same reason as division by 2 for binary — the remainders give you the digits in the target base.',
    'Positional Values': 'All number systems are positional: each digit\'s value depends on its position. Multiplying by the base raised to the position power gives the contribution of each digit.',
  }

  return explanations[shortcutName] || 'This shortcut works by exploiting the mathematical relationship between the number systems.'
}
