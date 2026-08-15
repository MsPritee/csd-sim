/**
 * Comparison tools for number systems.
 * Enables comparing the same value across different number systems.
 */

import type {
  ComparisonRequest,
  ComparisonResponse,
} from './types'
import type { NumberSystem } from '../../core/numbersystems/types'
import {
  compareAcrossSystems,
  createBitGroupingResult,
  analyzeBitPatterns
} from '../../core/numbersystems'

/**
 * Compares a value across multiple number systems.
 */
export function compareAcrossAllSystems(request: ComparisonRequest): ComparisonResponse {
  const { value, baseSystem, includeSystems = ['decimal', 'binary', 'hexadecimal', 'octal'] } = request

  try {
    // Convert to decimal first (as the common base)
    let decimalValue: number

    if (typeof value === 'number') {
      decimalValue = value
    } else {
      const valueStr = value.toString().trim()
      
      switch (baseSystem) {
        case 'decimal':
          decimalValue = parseInt(valueStr, 10)
          break
        case 'binary':
          if (!/^[01]+$/.test(valueStr)) {
            return {
              success: false,
              baseSystem,
              comparisons: Object.freeze({}),
              error: 'Invalid binary format',
            }
          }
          decimalValue = parseInt(valueStr, 2)
          break
        case 'hexadecimal':
          if (!/^[0-9A-Fa-f]+$/.test(valueStr)) {
            return {
              success: false,
              baseSystem,
              comparisons: Object.freeze({}),
              error: 'Invalid hexadecimal format',
            }
          }
          decimalValue = parseInt(valueStr, 16)
          break
        case 'octal':
          if (!/^[0-7]+$/.test(valueStr)) {
            return {
              success: false,
              baseSystem,
              comparisons: Object.freeze({}),
              error: 'Invalid octal format',
            }
          }
          decimalValue = parseInt(valueStr, 8)
          break
        default:
          return {
            success: false,
            baseSystem,
            comparisons: Object.freeze({}),
            error: 'Unknown base system',
          }
      }
    }

    // Get comparison across all systems
    const comparison = compareAcrossSystems(decimalValue)

    // Build comparisons object for requested systems
    const comparisons: Record<NumberSystem, string> = {
      decimal: comparison.decimal.toString(),
      binary: comparison.binary,
      hexadecimal: comparison.hexadecimal,
      octal: comparison.octal,
    }

    // Filter to only requested systems
    const filteredComparisons: Partial<Record<NumberSystem, string>> = {}
    for (const system of includeSystems) {
      if (comparisons[system as NumberSystem]) {
        filteredComparisons[system as NumberSystem] = comparisons[system as NumberSystem]!
      }
    }

    return {
      success: true,
      baseSystem,
      comparisons: Object.freeze(filteredComparisons),
      bitLength: comparison.bitLength,
    }
  } catch (error) {
    return {
      success: false,
      baseSystem,
      comparisons: Object.freeze({}),
      error: error instanceof Error ? error.message : 'Unknown comparison error',
    }
  }
}

/**
 * Creates a comprehensive comparison table with bit analysis.
 */
export function createComparisonTable(
  value: string | number,
  baseSystem: NumberSystem,
): {
  success: boolean
  data?: {
    decimal: string
    binary: string
    hexadecimal: string
    octal: string
    bitLength: number
    binaryGrouped: string
    nibbles: string[]
    octalGroups: string[]
    onesCount: number
    zerosCount: number
    isPowerOfTwo: boolean
  }
  error?: string
} {
  try {
    // Get basic comparison
    const comparison = compareAcrossAllSystems({ value, baseSystem })
    
    if (!comparison.success) {
      return {
        success: false,
        error: comparison.error,
      }
    }

    // Get decimal value for bit analysis
    const decimalValue = parseInt(comparison.comparisons.decimal!, 10)
    
    // Get bit analysis
    const bitAnalysis = analyzeBitPatterns(decimalValue)
    
    // Get bit grouping
    const bitGrouping = createBitGroupingResult(bitAnalysis.binary)
    
    return {
      success: true,
      data: {
        decimal: comparison.comparisons.decimal!,
        binary: comparison.comparisons.binary!,
        hexadecimal: comparison.comparisons.hexadecimal!,
        octal: comparison.comparisons.octal!,
        bitLength: comparison.bitLength || 0,
        binaryGrouped: bitGrouping.success ? bitGrouping.groupedBinary : '',
        nibbles: bitAnalysis.nibbles,
        octalGroups: bitGrouping.success ? [...bitGrouping.octalGroups] : [],
        onesCount: bitAnalysis.onesCount,
        zerosCount: bitAnalysis.zerosCount,
        isPowerOfTwo: bitAnalysis.isPowerOfTwo,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown comparison error',
    }
  }
}

/**
 * Compares two values across all systems to show their relationship.
 */
export function compareTwoValues(
  value1: string | number,
  value2: string | number,
  system: NumberSystem,
): {
  success: boolean
  comparison?: {
    value1: Readonly<Partial<Record<NumberSystem, string>>>
    value2: Readonly<Partial<Record<NumberSystem, string>>>
    equal: boolean
    difference: number
    relationship: string
  }
  error?: string
} {
  try {
    // Convert both values to decimal for comparison
    const comparison1 = compareAcrossAllSystems({ value: value1, baseSystem: system })
    const comparison2 = compareAcrossAllSystems({ value: value2, baseSystem: system })

    if (!comparison1.success || !comparison2.success) {
      return {
        success: false,
        error: 'Failed to convert one or both values',
      }
    }

    const decimal1 = parseInt(comparison1.comparisons.decimal!, 10)
    const decimal2 = parseInt(comparison2.comparisons.decimal!, 10)

    const equal = decimal1 === decimal2
    const difference = Math.abs(decimal1 - decimal2)

    let relationship = ''
    if (equal) {
      relationship = 'The values are equal'
    } else if (decimal1 < decimal2) {
      relationship = `Value 1 is ${difference} less than Value 2`
    } else {
      relationship = `Value 1 is ${difference} greater than Value 2`
    }

    return {
      success: true,
      comparison: {
        value1: comparison1.comparisons,
        value2: comparison2.comparisons,
        equal,
        difference,
        relationship,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown comparison error',
    }
  }
}

/**
 * Generates a conversion matrix showing all possible conversions for a value.
 */
export function generateConversionMatrix(
  value: string | number,
  baseSystem: NumberSystem,
): {
  success: boolean
  matrix?: Readonly<Record<string, string>>
  error?: string
} {
  try {
    const systems: NumberSystem[] = ['decimal', 'binary', 'hexadecimal', 'octal']
    const matrix: Record<string, string> = {}

    for (const fromSystem of systems) {
      for (const toSystem of systems) {
        const key = `${fromSystem}-to-${toSystem}`
        
        // Convert to the fromSystem first
        let fromValue: string | number
        if (fromSystem === baseSystem) {
          fromValue = value
        } else {
          // Convert from baseSystem to fromSystem
          const conversion = compareAcrossAllSystems({ value, baseSystem })
          if (!conversion.success) {
            matrix[key] = 'Error'
            continue
          }
          fromValue = conversion.comparisons[fromSystem as NumberSystem]!
        }

        // Convert from fromSystem to toSystem
        const toConversion = compareAcrossAllSystems({ value: fromValue, baseSystem: fromSystem })
        if (toConversion.success) {
          matrix[key] = toConversion.comparisons[toSystem as NumberSystem]!
        } else {
          matrix[key] = 'Error'
        }
      }
    }

    return {
      success: true,
      matrix,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown matrix generation error',
    }
  }
}
