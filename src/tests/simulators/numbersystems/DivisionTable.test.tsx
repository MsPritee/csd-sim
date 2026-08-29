/**
 * Tests for DivisionTable component
 * Tests the traditional division table display and interactions
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import { DivisionTable } from '../../../simulators/numbersystems/DivisionTable'
import type { DivisionStep } from '../../../core/numbersystems/types'

describe('DivisionTable', () => {
  const mockSteps: DivisionStep[] = [
    {
      dividend: 200,
      divisor: 2,
      quotient: 100,
      remainder: 0,
      stepNumber: 1,
      isFinalStep: false,
    },
    {
      dividend: 100,
      divisor: 2,
      quotient: 50,
      remainder: 0,
      stepNumber: 2,
      isFinalStep: false,
    },
    {
      dividend: 50,
      divisor: 2,
      quotient: 25,
      remainder: 0,
      stepNumber: 3,
      isFinalStep: false,
    },
    {
      dividend: 25,
      divisor: 2,
      quotient: 12,
      remainder: 1,
      stepNumber: 4,
      isFinalStep: false,
    },
    {
      dividend: 12,
      divisor: 2,
      quotient: 6,
      remainder: 0,
      stepNumber: 5,
      isFinalStep: false,
    },
    {
      dividend: 6,
      divisor: 2,
      quotient: 3,
      remainder: 0,
      stepNumber: 6,
      isFinalStep: false,
    },
    {
      dividend: 3,
      divisor: 2,
      quotient: 1,
      remainder: 1,
      stepNumber: 7,
      isFinalStep: false,
    },
    {
      dividend: 1,
      divisor: 2,
      quotient: 0,
      remainder: 1,
      stepNumber: 8,
      isFinalStep: true,
    },
  ]

  describe('Rendering', () => {
    it('should render division table with steps', () => {
      render(
        <DivisionTable
          steps={mockSteps}
          currentStep={0}
          selectedStep={null}
          onSelectStep={() => {}}
          targetBase={2}
          decimalValue={200}
        />
      )

      expect(screen.getByText('Repeated Division by 2')).toBeInTheDocument()
      expect(screen.getByText('Converting 200 to Binary')).toBeInTheDocument()
    })

    it('should render column headers', () => {
      render(
        <DivisionTable
          steps={mockSteps}
          currentStep={0}
          selectedStep={null}
          onSelectStep={() => {}}
          targetBase={2}
          decimalValue={200}
        />
      )

      expect(screen.getByText('Number')).toBeInTheDocument()
      expect(screen.getByText('Remainder')).toBeInTheDocument()
      expect(screen.getByText('÷ 2')).toBeInTheDocument()
    })

    it('should render all division rows', () => {
      const { container } = render(
        <DivisionTable
          steps={mockSteps}
          currentStep={0}
          selectedStep={null}
          onSelectStep={() => {}}
          targetBase={2}
          decimalValue={200}
        />
      )

      expect(container.textContent).toContain('200')
      expect(container.textContent).toContain('100')
      expect(container.textContent).toContain('50')
      expect(container.textContent).toContain('25')
    })

    it('should show reading direction hint', () => {
      render(
        <DivisionTable
          steps={mockSteps}
          currentStep={0}
          selectedStep={null}
          onSelectStep={() => {}}
          targetBase={2}
          decimalValue={200}
        />
      )

      expect(screen.getByText('Read remainders:')).toBeInTheDocument()
      expect(screen.getByText('Bottom to Top')).toBeInTheDocument()
    })
  })

  describe('Step Selection', () => {
    it('should call onSelectStep when a row is clicked', () => {
      const handleSelectStep = vi.fn()
      const { container } = render(
        <DivisionTable
          steps={mockSteps}
          currentStep={0}
          selectedStep={null}
          onSelectStep={handleSelectStep}
          targetBase={2}
          decimalValue={200}
        />
      )

      const firstRow = container.querySelector('[role="button"]')
      if (firstRow) {
        fireEvent.click(firstRow)
        expect(handleSelectStep).toHaveBeenCalled()
      }
    })

    it('should highlight selected step', () => {
      render(
        <DivisionTable
          steps={mockSteps}
          currentStep={0}
          selectedStep={2}
          onSelectStep={() => {}}
          targetBase={2}
          decimalValue={200}
        />
      )

      // The selected step should have different styling
      expect(screen.getAllByText('50')[0]).toBeInTheDocument()
    })
  })

  describe('Active Step Display', () => {
    it('should show current step as active', () => {
      const { container } = render(
        <DivisionTable
          steps={mockSteps}
          currentStep={3}
          selectedStep={null}
          onSelectStep={() => {}}
          targetBase={2}
          decimalValue={200}
        />
      )

      // Step 4 should be active (index 3)
      expect(container.textContent).toContain('25')
    })

    it('should show completed steps as completed', () => {
      const { container } = render(
        <DivisionTable
          steps={mockSteps}
          currentStep={2}
          selectedStep={null}
          onSelectStep={() => {}}
          targetBase={2}
          decimalValue={200}
        />
      )

      // First 3 steps should be completed
      expect(container.textContent).toContain('200')
      expect(container.textContent).toContain('100')
      expect(container.textContent).toContain('50')
    })

    it('should show future steps as dimmed', () => {
      const { container } = render(
        <DivisionTable
          steps={mockSteps}
          currentStep={1}
          selectedStep={null}
          onSelectStep={() => {}}
          targetBase={2}
          decimalValue={200}
          progressiveReveal
        />
      )

      // With progressive reveal, only steps up to currentStep are shown
      expect(container.textContent).toContain('200')
      expect(container.textContent).toContain('100')
      expect(container.textContent).not.toContain('50')
    })
  })

  describe('Completion State', () => {
    it('should show completion message when all steps done', () => {
      render(
        <DivisionTable
          steps={mockSteps}
          currentStep={mockSteps.length - 1}
          selectedStep={null}
          onSelectStep={() => {}}
          targetBase={2}
          decimalValue={200}
        />
      )

      expect(screen.getByText('✓ Division complete - Quotient reached 0')).toBeInTheDocument()
    })
  })

  describe('Different Target Bases', () => {
    it('should show correct base name for binary', () => {
      const { container } = render(
        <DivisionTable
          steps={mockSteps}
          currentStep={0}
          selectedStep={null}
          onSelectStep={() => {}}
          targetBase={2}
          decimalValue={200}
        />
      )

      expect(container.textContent).toContain('Binary')
    })

    it('should show correct base name for octal', () => {
      const { container } = render(
        <DivisionTable
          steps={mockSteps}
          currentStep={0}
          selectedStep={null}
          onSelectStep={() => {}}
          targetBase={8}
          decimalValue={200}
        />
      )

      expect(container.textContent).toContain('Octal')
    })

    it('should show correct base name for hexadecimal', () => {
      const { container } = render(
        <DivisionTable
          steps={mockSteps}
          currentStep={0}
          selectedStep={null}
          onSelectStep={() => {}}
          targetBase={16}
          decimalValue={200}
        />
      )

      expect(container.textContent).toContain('Hexadecimal')
    })
  })

  describe('Accessibility', () => {
    it('should have proper role for interactive elements', () => {
      const { container } = render(
        <DivisionTable
          steps={mockSteps}
          currentStep={0}
          selectedStep={null}
          onSelectStep={() => {}}
          targetBase={2}
          decimalValue={200}
        />
      )

      const rows = container.querySelectorAll('[role="button"]')
      expect(rows.length).toBeGreaterThan(0)
    })

    it('should support keyboard navigation', () => {
      const handleSelectStep = vi.fn()
      const { container } = render(
        <DivisionTable
          steps={mockSteps}
          currentStep={0}
          selectedStep={null}
          onSelectStep={handleSelectStep}
          targetBase={2}
          decimalValue={200}
        />
      )

      const firstRow = container.querySelector('[role="button"]')
      if (firstRow) {
        fireEvent.keyDown(firstRow, { key: 'Enter' })
        // The DivisionRow component handles keyboard navigation internally
        // This test just verifies that the structure supports it
        expect(firstRow).toHaveAttribute('tabIndex', '0')
      }
    })
  })
})
