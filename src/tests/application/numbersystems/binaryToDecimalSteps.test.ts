/**
 * Tests for binary-to-decimal step generation logic
 * Tests the application layer function that generates visual conversion steps
 */

import { generateBinaryToDecimalSteps } from '../../../application/numbersystems/conversion'

describe('generateBinaryToDecimalSteps', () => {
  describe('Basic Functionality', () => {
    it('should generate steps for 11001000', () => {
      const result = generateBinaryToDecimalSteps('11001000')
      
      expect(result.success).toBe(true)
      expect(result.binaryInput).toBe('11001000')
      expect(result.decimalResult).toBe(200)
      expect(result.steps.length).toBeGreaterThan(0)
    })

    it('should generate steps for 1010', () => {
      const result = generateBinaryToDecimalSteps('1010')
      
      expect(result.success).toBe(true)
      expect(result.binaryInput).toBe('1010')
      expect(result.decimalResult).toBe(10)
      expect(result.steps.length).toBeGreaterThan(0)
    })

    it('should generate steps for 1', () => {
      const result = generateBinaryToDecimalSteps('1')
      
      expect(result.success).toBe(true)
      expect(result.binaryInput).toBe('1')
      expect(result.decimalResult).toBe(1)
    })

    it('should generate steps for 0', () => {
      const result = generateBinaryToDecimalSteps('0')
      
      expect(result.success).toBe(true)
      expect(result.binaryInput).toBe('0')
      expect(result.decimalResult).toBe(0)
    })
  })

  describe('Decimal Conversion Accuracy', () => {
    it('should correctly convert 11001000 to 200', () => {
      const result = generateBinaryToDecimalSteps('11001000')
      expect(result.decimalResult).toBe(200)
    })

    it('should correctly convert 1010 to 10', () => {
      const result = generateBinaryToDecimalSteps('1010')
      expect(result.decimalResult).toBe(10)
    })

    it('should correctly convert 1111 to 15', () => {
      const result = generateBinaryToDecimalSteps('1111')
      expect(result.decimalResult).toBe(15)
    })

    it('should correctly convert 00001010 to 10', () => {
      const result = generateBinaryToDecimalSteps('00001010')
      expect(result.decimalResult).toBe(10)
    })

    it('should correctly convert 11111111 to 255', () => {
      const result = generateBinaryToDecimalSteps('11111111')
      expect(result.decimalResult).toBe(255)
    })
  })

  describe('Step Structure', () => {
    it('should have correct step properties', () => {
      const result = generateBinaryToDecimalSteps('1010')
      
      result.steps.forEach((step, _index) => {
        expect(step).toHaveProperty('stepNumber')
        expect(step).toHaveProperty('phase')
        expect(step).toHaveProperty('bit')
        expect(step).toHaveProperty('position')
        expect(step).toHaveProperty('exponent')
        expect(step).toHaveProperty('powerValue')
        expect(step).toHaveProperty('weight')
        expect(step).toHaveProperty('multiplication')
        expect(step).toHaveProperty('contribution')
        expect(step).toHaveProperty('runningTotal')
        expect(step).toHaveProperty('explanation')
        expect(step).toHaveProperty('isCompleted')
        expect(step).toHaveProperty('isCurrent')
      })
    })

    it('should have sequential step numbers', () => {
      const result = generateBinaryToDecimalSteps('1010')
      
      result.steps.forEach((step, index) => {
        expect(step.stepNumber).toBe(index + 1)
      })
    })

    it('should have correct phases', () => {
      const result = generateBinaryToDecimalSteps('11001000')
      
      const phases = result.steps.map(s => s.phase)
      expect(phases).toContain('identify')
      expect(phases).toContain('powers')
      expect(phases).toContain('weights')
      expect(phases).toContain('multiply')
      expect(phases).toContain('add')
      expect(phases).toContain('result')
    })
  })

  describe('Position and Exponent Calculation', () => {
    it('should calculate correct positions for 11001000', () => {
      const result = generateBinaryToDecimalSteps('11001000')
      
      const positions = result.steps.slice(0, -1).map(s => s.position)
      expect(positions).toEqual([7, 6, 5, 4, 3, 2, 1, 0])
    })

    it('should calculate correct exponents for 1010', () => {
      const result = generateBinaryToDecimalSteps('1010')
      
      const exponents = result.steps.slice(0, -1).map(s => s.exponent)
      expect(exponents).toEqual([3, 2, 1, 0])
    })

    it('should have exponents equal to positions', () => {
      const result = generateBinaryToDecimalSteps('1010')
      
      result.steps.slice(0, -1).forEach(step => {
        expect(step.exponent).toBe(step.position)
      })
    })
  })

  describe('Power Value and Weight Calculation', () => {
    it('should calculate correct power values for 11001000', () => {
      const result = generateBinaryToDecimalSteps('11001000')
      
      const powerValues = result.steps.slice(0, -1).map(s => s.powerValue)
      expect(powerValues).toEqual([128, 64, 32, 16, 8, 4, 2, 1])
    })

    it('should calculate correct weights for 1010', () => {
      const result = generateBinaryToDecimalSteps('1010')
      
      const weights = result.steps.slice(0, -1).map(s => s.weight)
      expect(weights).toEqual([8, 4, 2, 1])
    })

    it('should have power values equal to weights', () => {
      const result = generateBinaryToDecimalSteps('1010')
      
      result.steps.slice(0, -1).forEach(step => {
        expect(step.powerValue).toBe(step.weight)
      })
    })
  })

  describe('Multiplication and Contribution', () => {
    it('should calculate correct contributions for 11001000', () => {
      const result = generateBinaryToDecimalSteps('11001000')
      
      const contributions = result.steps.slice(0, -1).map(s => s.contribution)
      expect(contributions).toEqual([128, 64, 0, 0, 8, 0, 0, 0])
    })

    it('should calculate correct contributions for 1010', () => {
      const result = generateBinaryToDecimalSteps('1010')
      
      const contributions = result.steps.slice(0, -1).map(s => s.contribution)
      expect(contributions).toEqual([8, 0, 2, 0])
    })

    it('should generate correct multiplication strings', () => {
      const result = generateBinaryToDecimalSteps('1010')
      
      const multiplications = result.steps.slice(0, -1).map(s => s.multiplication)
      expect(multiplications).toEqual([
        '1 × 8 = 8',
        '0 × 4 = 0',
        '1 × 2 = 2',
        '0 × 1 = 0'
      ])
    })

    it('should have zero contribution for bit 0', () => {
      const result = generateBinaryToDecimalSteps('1010')
      
      result.steps.slice(0, -1).forEach(step => {
        if (step.bit === '0') {
          expect(step.contribution).toBe(0)
        }
      })
    })

    it('should have non-zero contribution for bit 1', () => {
      const result = generateBinaryToDecimalSteps('1010')
      
      result.steps.slice(0, -1).forEach(step => {
        if (step.bit === '1') {
          expect(step.contribution).toBeGreaterThan(0)
        }
      })
    })
  })

  describe('Running Total Calculation', () => {
    it('should calculate correct running totals for 11001000', () => {
      const result = generateBinaryToDecimalSteps('11001000')
      
      const runningTotals = result.steps.map(s => s.runningTotal)
      expect(runningTotals).toEqual([128, 192, 192, 192, 200, 200, 200, 200, 200])
    })

    it('should calculate correct running totals for 1010', () => {
      const result = generateBinaryToDecimalSteps('1010')
      
      const runningTotals = result.steps.map(s => s.runningTotal)
      expect(runningTotals).toEqual([8, 8, 10, 10, 10])
    })

    it('should have final running total equal to decimal result', () => {
      const result = generateBinaryToDecimalSteps('1010')
      
      const finalStep = result.steps[result.steps.length - 1]
      expect(finalStep.runningTotal).toBe(result.decimalResult)
    })
  })

  describe('Explanations', () => {
    it('should provide explanations for each step', () => {
      const result = generateBinaryToDecimalSteps('1010')
      
      result.steps.forEach(step => {
        expect(step.explanation).toBeTruthy()
        expect(typeof step.explanation).toBe('string')
        expect(step.explanation.length).toBeGreaterThan(0)
      })
    })

    it('should have different explanations for different phases', () => {
      const result = generateBinaryToDecimalSteps('1010')
      
      const explanations = result.steps.map(s => s.explanation)
      const uniqueExplanations = new Set(explanations)
      
      // Should have some variety in explanations
      expect(uniqueExplanations.size).toBeGreaterThan(1)
    })
  })

  describe('Phases Definition', () => {
    it('should define all required phases', () => {
      const result = generateBinaryToDecimalSteps('1010')
      
      expect(result.phases.length).toBe(5)
      
      const phaseNames = result.phases.map(p => p.name)
      expect(phaseNames).toContain('Identify Binary Digits')
      expect(phaseNames).toContain('Assign Powers of 2')
      expect(phaseNames).toContain('Calculate Weights')
      expect(phaseNames).toContain('Multiply and Add')
      expect(phaseNames).toContain('Final Result')
    })

    it('should have phase descriptions', () => {
      const result = generateBinaryToDecimalSteps('1010')
      
      result.phases.forEach(phase => {
        expect(phase.description).toBeTruthy()
        expect(typeof phase.description).toBe('string')
        expect(phase.description.length).toBeGreaterThan(0)
      })
    })

    it('should have valid step ranges for phases', () => {
      const result = generateBinaryToDecimalSteps('1010')
      
      result.phases.forEach(phase => {
        expect(phase.stepRange).toHaveLength(2)
        expect(phase.stepRange[0]).toBeGreaterThanOrEqual(1)
        expect(phase.stepRange[1]).toBeGreaterThanOrEqual(phase.stepRange[0])
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle empty input', () => {
      const result = generateBinaryToDecimalSteps('')
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('empty')
    })

    it('should handle invalid binary characters', () => {
      const result = generateBinaryToDecimalSteps('102')
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid binary format')
    })

    it('should handle non-string input', () => {
      const result = generateBinaryToDecimalSteps(123 as any)
      
      expect(result.success).toBe(false)
    })

    it('should handle whitespace in input', () => {
      const result = generateBinaryToDecimalSteps(' 1010 ')
      
      expect(result.success).toBe(true)
      expect(result.binaryInput).toBe('1010')
    })
  })

  describe('Leading Zeros', () => {
    it('should preserve leading zeros in input', () => {
      const result = generateBinaryToDecimalSteps('00001010')
      
      expect(result.binaryInput).toBe('00001010')
    })

    it('should calculate correct result despite leading zeros', () => {
      const result = generateBinaryToDecimalSteps('00001010')
      
      expect(result.decimalResult).toBe(10)
    })

    it('should generate correct number of steps for leading zeros', () => {
      const result1 = generateBinaryToDecimalSteps('1010')
      const result2 = generateBinaryToDecimalSteps('00001010')
      
      // Should have more steps for leading zeros version
      expect(result2.steps.length).toBeGreaterThan(result1.steps.length)
    })
  })

  describe('Edge Cases', () => {
    it('should handle single bit 1', () => {
      const result = generateBinaryToDecimalSteps('1')
      
      expect(result.success).toBe(true)
      expect(result.decimalResult).toBe(1)
      expect(result.steps.length).toBe(2) // 1 bit step + 1 result step
    })

    it('should handle single bit 0', () => {
      const result = generateBinaryToDecimalSteps('0')
      
      expect(result.success).toBe(true)
      expect(result.decimalResult).toBe(0)
      expect(result.steps.length).toBe(2) // 1 bit step + 1 result step
    })

    it('should handle all ones', () => {
      const result = generateBinaryToDecimalSteps('1111')
      
      expect(result.success).toBe(true)
      expect(result.decimalResult).toBe(15)
    })

    it('should handle all zeros', () => {
      const result = generateBinaryToDecimalSteps('0000')
      
      expect(result.success).toBe(true)
      expect(result.decimalResult).toBe(0)
    })

    it('should handle large binary numbers', () => {
      const result = generateBinaryToDecimalSteps('1111111111111111')
      
      expect(result.success).toBe(true)
      expect(result.decimalResult).toBe(65535)
    })
  })

  describe('Bit Position Mapping', () => {
    it('should map leftmost bit to highest position', () => {
      const result = generateBinaryToDecimalSteps('1010')
      
      const firstStep = result.steps[0]
      expect(firstStep.position).toBe(3) // For 4-bit number
    })

    it('should map rightmost bit to position 0', () => {
      const result = generateBinaryToDecimalSteps('1010')
      
      const bitSteps = result.steps.slice(0, -1)
      const lastBitStep = bitSteps[bitSteps.length - 1]
      expect(lastBitStep.position).toBe(0)
    })

    it('should correctly identify MSB position', () => {
      const result = generateBinaryToDecimalSteps('11001000')
      
      const firstStep = result.steps[0]
      expect(firstStep.position).toBe(7) // For 8-bit number
    })

    it('should correctly identify LSB position', () => {
      const result = generateBinaryToDecimalSteps('11001000')
      
      const bitSteps = result.steps.slice(0, -1)
      const lastBitStep = bitSteps[bitSteps.length - 1]
      expect(lastBitStep.position).toBe(0)
    })
  })
})
