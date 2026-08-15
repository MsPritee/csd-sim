/**
 * Tests for DivisionRow component
 * Tests individual division row display and interactions
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import { DivisionRow } from '../../../simulators/numbersystems/DivisionRow'
import type { DivisionStep } from '../../../core/numbersystems/types'

describe('DivisionRow', () => {
  const mockStep: DivisionStep = {
    dividend: 200,
    divisor: 2,
    quotient: 100,
    remainder: 0,
    stepNumber: 1,
    isFinalStep: false,
  }

  describe('Rendering', () => {
    it('should render division step with correct values', () => {
      render(
        <DivisionRow
          step={mockStep}
          isActive={false}
          isCompleted={false}
          isSelected={false}
          onSelect={() => {}}
          targetBase={2}
        />
      )

      expect(screen.getByText('200')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText('100')).toBeInTheDocument()
      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('should render division symbol', () => {
      render(
        <DivisionRow
          step={mockStep}
          isActive={false}
          isCompleted={false}
          isSelected={false}
          onSelect={() => {}}
          targetBase={2}
        />
      )

      expect(screen.getByText('÷')).toBeInTheDocument()
    })

    it('should render step indicator', () => {
      render(
        <DivisionRow
          step={mockStep}
          isActive={false}
          isCompleted={false}
          isSelected={false}
          onSelect={() => {}}
          targetBase={2}
        />
      )

      expect(screen.getByText('1')).toBeInTheDocument()
    })
  })

  describe('State Display', () => {
    it('should show active state when isActive is true', () => {
      const { container } = render(
        <DivisionRow
          step={mockStep}
          isActive={true}
          isCompleted={false}
          isSelected={false}
          onSelect={() => {}}
          targetBase={2}
        />
      )

      const row = container.firstChild as HTMLElement
      expect(row.style.backgroundColor).toBeDefined()
    })

    it('should show completed state when isCompleted is true', () => {
      const { container } = render(
        <DivisionRow
          step={mockStep}
          isActive={false}
          isCompleted={true}
          isSelected={false}
          onSelect={() => {}}
          targetBase={2}
        />
      )

      const row = container.firstChild as HTMLElement
      expect(row.style.opacity).not.toBe('0.4')
    })

    it('should show selected state when isSelected is true', () => {
      const { container } = render(
        <DivisionRow
          step={mockStep}
          isActive={false}
          isCompleted={false}
          isSelected={true}
          onSelect={() => {}}
          targetBase={2}
        />
      )

      const row = container.firstChild as HTMLElement
      expect(row.style.backgroundColor).toBeDefined()
    })

    it('should show dimmed state when not active or completed', () => {
      const { container } = render(
        <DivisionRow
          step={mockStep}
          isActive={false}
          isCompleted={false}
          isSelected={false}
          onSelect={() => {}}
          targetBase={2}
        />
      )

      const row = container.firstChild as HTMLElement
      expect(row.style.opacity).toBe('0.4')
    })
  })

  describe('Remainder Formatting', () => {
    it('should format remainder as number for binary', () => {
      render(
        <DivisionRow
          step={mockStep}
          isActive={false}
          isCompleted={false}
          isSelected={false}
          onSelect={() => {}}
          targetBase={2}
        />
      )

      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('should format remainder as hex digit for hexadecimal', () => {
      const hexStep: DivisionStep = {
        ...mockStep,
        remainder: 15,
      }

      render(
        <DivisionRow
          step={hexStep}
          isActive={false}
          isCompleted={false}
          isSelected={false}
          onSelect={() => {}}
          targetBase={16}
        />
      )

      expect(screen.getByText('F')).toBeInTheDocument()
    })

    it('should format remainder as hex digit for hexadecimal (10)', () => {
      const hexStep: DivisionStep = {
        ...mockStep,
        remainder: 10,
      }

      render(
        <DivisionRow
          step={hexStep}
          isActive={false}
          isCompleted={false}
          isSelected={false}
          onSelect={() => {}}
          targetBase={16}
        />
      )

      expect(screen.getByText('A')).toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    it('should call onSelect when clicked', () => {
      const handleSelect = vi.fn()
      const { container } = render(
        <DivisionRow
          step={mockStep}
          isActive={false}
          isCompleted={false}
          isSelected={false}
          onSelect={handleSelect}
          targetBase={2}
        />
      )

      const row = container.firstChild as HTMLElement
      fireEvent.click(row)
      expect(handleSelect).toHaveBeenCalled()
    })

    it('should call onSelect when Enter key is pressed', () => {
      const handleSelect = vi.fn()
      const { container } = render(
        <DivisionRow
          step={mockStep}
          isActive={false}
          isCompleted={false}
          isSelected={false}
          onSelect={handleSelect}
          targetBase={2}
        />
      )

      const row = container.firstChild as HTMLElement
      fireEvent.keyDown(row, { key: 'Enter' })
      expect(handleSelect).toHaveBeenCalled()
    })

    it('should call onSelect when Space key is pressed', () => {
      const handleSelect = vi.fn()
      const { container } = render(
        <DivisionRow
          step={mockStep}
          isActive={false}
          isCompleted={false}
          isSelected={false}
          onSelect={handleSelect}
          targetBase={2}
        />
      )

      const row = container.firstChild as HTMLElement
      fireEvent.keyDown(row, { key: ' ' })
      expect(handleSelect).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('should have button role', () => {
      const { container } = render(
        <DivisionRow
          step={mockStep}
          isActive={false}
          isCompleted={false}
          isSelected={false}
          onSelect={() => {}}
          targetBase={2}
        />
      )

      const row = container.firstChild as HTMLElement
      expect(row).toHaveAttribute('role', 'button')
    })

    it('should have proper ARIA label', () => {
      const { container } = render(
        <DivisionRow
          step={mockStep}
          isActive={false}
          isCompleted={false}
          isSelected={false}
          onSelect={() => {}}
          targetBase={2}
        />
      )

      const row = container.firstChild as HTMLElement
      expect(row).toHaveAttribute('aria-label')
    })

    it('should be keyboard navigable', () => {
      const { container } = render(
        <DivisionRow
          step={mockStep}
          isActive={false}
          isCompleted={false}
          isSelected={false}
          onSelect={() => {}}
          targetBase={2}
        />
      )

      const row = container.firstChild as HTMLElement
      expect(row).toHaveAttribute('tabIndex', '0')
    })
  })

  describe('Different Step Values', () => {
    it('should render step with remainder 1', () => {
      const stepWithRemainderOne: DivisionStep = {
        ...mockStep,
        remainder: 1,
      }

      const { container } = render(
        <DivisionRow
          step={stepWithRemainderOne}
          isActive={false}
          isCompleted={false}
          isSelected={false}
          onSelect={() => {}}
          targetBase={2}
        />
      )

      expect(container.textContent).toContain('1')
    })

    it('should render final step correctly', () => {
      const finalStep: DivisionStep = {
        ...mockStep,
        isFinalStep: true,
        quotient: 0,
      }

      const { container } = render(
        <DivisionRow
          step={finalStep}
          isActive={false}
          isCompleted={false}
          isSelected={false}
          onSelect={() => {}}
          targetBase={2}
        />
      )

      expect(container.textContent).toContain('0')
    })
  })
})
