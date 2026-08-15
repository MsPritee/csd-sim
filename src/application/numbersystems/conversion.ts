/**
 * Cross-system conversion orchestration service.
 * Coordinates core conversion engine with educational explanations.
 */

import type {
  ConversionRequest,
  ConversionResponse,
  PositionValueResult,
} from './types'
import type { NumberSystem, PositionValue } from '../../core/numbersystems/types'
import type { ConversionShortcut } from '../../education/numbersystems/types'
import { convertBetweenSystems } from '../../core/numbersystems'
import { generateDivisionSteps } from '../../core/numbersystems/binary'
import { explainConversion } from '../../education/numbersystems'

/**
 * Orchestrates conversion between number systems with optional educational content.
 */
export function orchestrateConversion(request: ConversionRequest): ConversionResponse {
  const { value, fromSystem, toSystem, showSteps = false, useShortcuts = false } = request

  try {
    // Perform the core conversion
    const conversion = convertBetweenSystems(value, fromSystem, toSystem)

    if (!conversion.success) {
      return {
        success: false,
        fromSystem,
        toSystem,
        error: conversion.error,
      }
    }

    // Build base response
    const baseResponse = {
      success: true as const,
      result: conversion.result as string,
      fromSystem,
      toSystem,
    }

    // Add steps if requested
    const steps = showSteps && conversion.intermediateSteps ? conversion.intermediateSteps : undefined

    // Add division steps for decimal to other base conversions
    let divisionSteps: ConversionResponse['divisionSteps'] = undefined
    if (showSteps && fromSystem === 'decimal' && (toSystem === 'binary' || toSystem === 'octal' || toSystem === 'hexadecimal')) {
      const decimalValue = typeof value === 'number' ? value : parseInt(String(value), 10)
      const targetBase = toSystem === 'binary' ? 2 : toSystem === 'octal' ? 8 : 16

      const generatedDivisionSteps = generateDivisionSteps(decimalValue, targetBase)
      if (generatedDivisionSteps.success) {
        divisionSteps = {
          targetBase,
          decimalValue,
          steps: generatedDivisionSteps.steps,
          result: generatedDivisionSteps.result,
        }
      }
    }

    // Add educational explanation if requested
    let explanation: string | undefined = undefined
    if (showSteps) {
      const educational = explainConversion(value, fromSystem, toSystem)
      if (educational.success && educational.explanation) {
        explanation = `${educational.explanation.what}\n${educational.explanation.why}\nRule: ${educational.explanation.rule}`
      }
    }

    // Add shortcuts if requested
    let shortcuts: readonly ConversionShortcut[] | undefined = undefined
    if (useShortcuts) {
      const educational = explainConversion(value, fromSystem, toSystem)
      if (educational.success && educational.shortcuts) {
        shortcuts = educational.shortcuts
      }
    }

    // Build final response with all optional fields
    return {
      ...baseResponse,
      steps,
      divisionSteps,
      explanation,
      shortcuts,
    }
  } catch (error) {
    return {
      success: false,
      fromSystem,
      toSystem,
      error: error instanceof Error ? error.message : 'Unknown conversion error',
    }
  }
}

/**
 * Batch conversion - converts a value to all other systems.
 */
export function convertToAllSystems(
  value: string | number,
  fromSystem: NumberSystem,
): ConversionResponse[] {
  const systems: NumberSystem[] = ['decimal', 'binary', 'hexadecimal', 'octal']
  const results: ConversionResponse[] = []

  for (const toSystem of systems) {
    if (toSystem === fromSystem) continue

    const response = orchestrateConversion({
      value,
      fromSystem,
      toSystem,
      showSteps: true,
    })
    results.push(response)
  }

  return results
}

/**
 * Quick conversion without educational content.
 */
export function quickConvert(
  value: string | number,
  fromSystem: NumberSystem,
  toSystem: NumberSystem,
): ConversionResponse {
  return orchestrateConversion({
    value,
    fromSystem,
    toSystem,
    showSteps: false,
    useShortcuts: false,
  })
}

/**
 * Educational conversion with full explanations.
 */
export function educationalConvert(
  value: string | number,
  fromSystem: NumberSystem,
  toSystem: NumberSystem,
): ConversionResponse {
  return orchestrateConversion({
    value,
    fromSystem,
    toSystem,
    showSteps: true,
    useShortcuts: true,
  })
}

/**
 * Validates if a conversion is possible and returns intermediate representation.
 */
export function validateConversionPath(
  fromSystem: NumberSystem,
  toSystem: NumberSystem,
): { valid: boolean; path: NumberSystem[]; reason?: string } {
  if (fromSystem === toSystem) {
    return { valid: true, path: [fromSystem] }
  }

  // All conversions are supported via the core engine
  // The engine uses decimal as intermediate, but this is transparent
  return {
    valid: true,
    path: [fromSystem, 'decimal', toSystem],
    reason: 'All conversions are supported via decimal as intermediate',
  }
}

/**
 * Generates detailed visual steps for binary-to-decimal conversion.
 * This provides the step-by-step educational breakdown for the visual simulator.
 */
export function generateBinaryToDecimalSteps(
  binaryInput: string,
): {
  success: boolean
  binaryInput: string
  decimalResult: number
  steps: readonly {
    stepNumber: number
    phase: 'identify' | 'powers' | 'weights' | 'multiply' | 'add' | 'result'
    bit: string
    position: number
    exponent: number
    powerValue: number
    weight: number
    multiplication: string
    contribution: number
    runningTotal: number
    explanation: string
    isCompleted: boolean
    isCurrent: boolean
  }[]
  phases: readonly {
    name: string
    stepRange: readonly [number, number]
    description: string
  }[]
  error?: string
} {
  try {
    // Validate binary input
    const trimmed = binaryInput.trim()
    if (trimmed === '') {
      return {
        success: false,
        binaryInput: '',
        decimalResult: 0,
        steps: [],
        phases: [],
        error: 'Input cannot be empty',
      }
    }

    // Allow leading zeros for educational purposes
    if (!/^[01]+$/.test(trimmed)) {
      return {
        success: false,
        binaryInput: trimmed,
        decimalResult: 0,
        steps: [],
        phases: [],
        error: 'Invalid binary format: must contain only 0s and 1s',
      }
    }

    const bits = trimmed.split('')
    const steps: {
      stepNumber: number
      phase: 'identify' | 'powers' | 'weights' | 'multiply' | 'add' | 'result'
      bit: string
      position: number
      exponent: number
      powerValue: number
      weight: number
      multiplication: string
      contribution: number
      runningTotal: number
      explanation: string
      isCompleted: boolean
      isCurrent: boolean
    }[] = []
    let runningTotal = 0
    let stepNumber = 1

    // Process each bit from left to right (MSB to LSB)
    for (let i = 0; i < bits.length; i++) {
      const bit = bits[i]!
      const position = bits.length - 1 - i // Position from right (0 = LSB)
      const exponent = position
      const powerValue = Math.pow(2, exponent)
      const weight = powerValue
      const contribution = bit === '1' ? weight : 0
      const multiplication = `${bit} × ${weight} = ${contribution}`

      // Update running total
      runningTotal += contribution

      // Determine phase for this step
      let phase: 'identify' | 'powers' | 'weights' | 'multiply' | 'add' | 'result'
      if (i === 0) {
        phase = 'identify'
      } else if (i === 1) {
        phase = 'powers'
      } else if (i === 2) {
        phase = 'weights'
      } else if (i < bits.length - 1) {
        phase = 'multiply'
      } else {
        phase = 'add'
      }

      // Generate explanation
      let explanation: string
      if (phase === 'identify') {
        explanation = `Starting with the most significant bit (MSB) at position ${position}. This is the leftmost bit.`
      } else if (phase === 'powers') {
        explanation = `Position ${position} corresponds to 2^${exponent} = ${powerValue}. Starting from the right, the exponent begins at 0 and increases by 1 as we move left.`
      } else if (phase === 'weights') {
        explanation = `The decimal weight of position ${position} is ${weight}. This is the value this position contributes if the bit is 1.`
      } else if (phase === 'multiply') {
        if (bit === '1') {
          explanation = `Bit is 1, so this position contributes ${weight} to the total. 1 × ${weight} = ${contribution}.`
        } else {
          explanation = `Bit is 0, so this position contributes 0 to the total. 0 × ${weight} = ${contribution}.`
        }
      } else {
        explanation = `Adding the contribution: ${contribution}. Running total is now ${runningTotal}.`
      }

      steps.push({
        stepNumber,
        phase,
        bit,
        position,
        exponent,
        powerValue,
        weight,
        multiplication,
        contribution,
        runningTotal,
        explanation,
        isCompleted: false,
        isCurrent: false,
      })

      stepNumber++
    }

    // Add final result step
    steps.push({
      stepNumber,
      phase: 'result',
      bit: '',
      position: -1,
      exponent: -1,
      powerValue: 0,
      weight: 0,
      multiplication: '',
      contribution: 0,
      runningTotal,
      explanation: `Conversion complete! ${trimmed}₂ = ${runningTotal}₁₀. The binary digits tell us which powers of 2 are included. Add the values of the positions containing 1.`,
      isCompleted: false,
      isCurrent: false,
    })

    // Define phases for the timeline
    const phases = [
      {
        name: 'Identify Binary Digits',
        stepRange: [1, 1] as const,
        description: 'Show the binary number and identify each bit position',
      },
      {
        name: 'Assign Powers of 2',
        stepRange: [2, Math.min(2, bits.length)] as const,
        description: 'Show the power of 2 for each bit position',
      },
      {
        name: 'Calculate Weights',
        stepRange: [3, Math.min(3, bits.length)] as const,
        description: 'Convert powers of 2 to decimal weights',
      },
      {
        name: 'Multiply and Add',
        stepRange: [4, bits.length] as const,
        description: 'Multiply each bit by its weight and add contributions',
      },
      {
        name: 'Final Result',
        stepRange: [bits.length + 1, bits.length + 1] as const,
        description: 'Show the final decimal result',
      },
    ]

    return {
      success: true,
      binaryInput: trimmed,
      decimalResult: runningTotal,
      steps,
      phases,
    }
  } catch (error) {
    return {
      success: false,
      binaryInput: binaryInput,
      decimalResult: 0,
      steps: [],
      phases: [],
      error: error instanceof Error ? error.message : 'Unknown error generating binary-to-decimal steps',
    }
  }
}

/**
 * Calculates position values for binary/octal/hexadecimal to decimal conversion.
 * This provides the educational breakdown of how each digit contributes to the final value.
 */
export function calculatePositionValues(
  value: string,
  fromSystem: NumberSystem,
): PositionValueResult {
  try {
    // Validate input based on system
    const trimmedValue = value.trim()
    if (trimmedValue === '') {
      return {
        success: false,
        fromSystem,
        inputValue: value,
        decimalResult: 0,
        positions: [],
        calculation: '',
        error: 'Input cannot be empty',
      }
    }

    // Get the base for the source system
    let base: number
    let validPattern: RegExp
    switch (fromSystem) {
      case 'binary':
        base = 2
        validPattern = /^[01]+$/
        break
      case 'octal':
        base = 8
        validPattern = /^[0-7]+$/
        break
      case 'hexadecimal':
        base = 16
        validPattern = /^[0-9A-Fa-f]+$/
        break
      case 'decimal':
        // For decimal, we don't typically show position values since it's the target
        return {
          success: false,
          fromSystem,
          inputValue: value,
          decimalResult: 0,
          positions: [],
          calculation: '',
          error: 'Position values are shown for conversions TO decimal, not FROM decimal',
        }
      default:
        return {
          success: false,
          fromSystem,
          inputValue: value,
          decimalResult: 0,
          positions: [],
          calculation: '',
          error: 'Unknown number system',
        }
    }

    // Validate input format
    if (!validPattern.test(trimmedValue)) {
      return {
        success: false,
        fromSystem,
        inputValue: value,
        decimalResult: 0,
        positions: [],
        calculation: '',
        error: `Invalid ${fromSystem} format`,
      }
    }

    // Calculate position values
    const digits = trimmedValue.toUpperCase().split('')
    const positions: PositionValue[] = []
    let total = 0

    // Process from right to left (least significant to most significant)
    for (let i = digits.length - 1; i >= 0; i--) {
      const digit = digits[i]
      const position = digits.length - 1 - i
      const positionValue = Math.pow(base, position)
      
      // Convert digit to decimal value
      let digitValue: number
      if (fromSystem === 'hexadecimal') {
        digitValue = parseInt(digit, 16)
      } else {
        digitValue = parseInt(digit, base)
      }

      const contribution = digitValue * positionValue
      total += contribution

      positions.push({
        digit,
        position,
        base,
        positionValue,
        calculation: `${digitValue} × ${positionValue} = ${contribution}`,
        contribution,
      })
    }

    // Build calculation string
    const calculationParts = positions
      .map(p => p.contribution)
      .filter(c => c > 0)
      .join(' + ')
    
    const calculation = positions.length > 0 
      ? `${calculationParts} = ${total}`
      : `0 = 0`

    return {
      success: true,
      fromSystem,
      inputValue: trimmedValue,
      decimalResult: total,
      positions: positions.reverse(), // Reverse to show most significant first
      calculation,
    }
  } catch (error) {
    return {
      success: false,
      fromSystem,
      inputValue: value,
      decimalResult: 0,
      positions: [],
      calculation: '',
      error: error instanceof Error ? error.message : 'Unknown error calculating position values',
    }
  }
}
