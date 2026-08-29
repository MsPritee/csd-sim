/**
 * Tests for OctalDigitCard component
 * Tests digit card rendering, states, and interactions
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import { OctalDigitCard } from '../../../../../simulators/numbersystems/learn/octal/components/OctalDigitCard'

describe('OctalDigitCard', () => {
  const defaultProps = {
    digit: 5,
    onClick: vi.fn()
  }

  describe('Rendering', () => {
    it('should render digit correctly', () => {
      render(<OctalDigitCard {...defaultProps} digit={7} />)
      expect(screen.getByText('7')).toBeInTheDocument()
    })

    it('should render different digit values', () => {
      const { rerender } = render(<OctalDigitCard {...defaultProps} digit={0} />)
      expect(screen.getByText('0')).toBeInTheDocument()

      rerender(<OctalDigitCard {...defaultProps} digit={4} />)
      expect(screen.getByText('4')).toBeInTheDocument()

      rerender(<OctalDigitCard {...defaultProps} digit={7} />)
      expect(screen.getByText('7')).toBeInTheDocument()
    })

    it('should have proper ARIA label', () => {
      render(<OctalDigitCard {...defaultProps} digit={3} />)
      expect(screen.getByLabelText('Octal digit 3')).toBeInTheDocument()
    })
  })

  describe('Size Variants', () => {
    it('should render small size by default', () => {
      render(<OctalDigitCard {...defaultProps} size="small" />)
      const button = screen.getByLabelText('Octal digit 5')
      expect(button).toHaveClass('w-12', 'h-12', 'text-xl')
    })

    it('should render medium size', () => {
      render(<OctalDigitCard {...defaultProps} size="medium" />)
      const button = screen.getByLabelText('Octal digit 5')
      expect(button).toHaveClass('w-16', 'h-16', 'text-2xl')
    })

    it('should render large size', () => {
      render(<OctalDigitCard {...defaultProps} size="large" />)
      const button = screen.getByLabelText('Octal digit 5')
      expect(button).toHaveClass('w-20', 'h-20', 'text-3xl')
    })
  })

  describe('States', () => {
    it('should render in selected state', () => {
      render(<OctalDigitCard {...defaultProps} selected={true} />)
      const button = screen.getByLabelText('Octal digit 5')
      expect(button).toHaveAttribute('aria-pressed', 'true')
    })

    it('should render in highlighted state', () => {
      render(<OctalDigitCard {...defaultProps} highlighted={true} />)
      const button = screen.getByLabelText('Octal digit 5')
      expect(button).toBeInTheDocument()
    })

    it('should render in default state when no special state', () => {
      render(<OctalDigitCard {...defaultProps} />)
      const button = screen.getByLabelText('Octal digit 5')
      expect(button).toHaveAttribute('aria-pressed', 'false')
    })
  })

  describe('Interactions', () => {
    it('should call onClick when clicked', () => {
      const onClick = vi.fn()
      render(<OctalDigitCard {...defaultProps} onClick={onClick} />)

      const button = screen.getByLabelText('Octal digit 5')
      fireEvent.click(button)

      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('should not call onClick when disabled', () => {
      const onClick = vi.fn()
      render(<OctalDigitCard {...defaultProps} onClick={onClick} disabled={true} />)

      const button = screen.getByLabelText('Octal digit 5')
      fireEvent.click(button)

      expect(onClick).not.toHaveBeenCalled()
    })

    it('should be disabled when disabled prop is true', () => {
      render(<OctalDigitCard {...defaultProps} disabled={true} />)
      const button = screen.getByLabelText('Octal digit 5')
      expect(button).toBeDisabled()
    })
  })

  describe('Accessibility', () => {
    it('should be keyboard accessible', () => {
      render(<OctalDigitCard {...defaultProps} />)
      const button = screen.getByLabelText('Octal digit 5')
      expect(button).toHaveAttribute('type', 'button')
    })

    it('should have focus ring styles', () => {
      render(<OctalDigitCard {...defaultProps} />)
      const button = screen.getByLabelText('Octal digit 5')
      expect(button).toHaveClass('focus:outline-none', 'focus:ring-2')
    })
  })

  describe('Octal Specific Behavior', () => {
    it('should handle all octal digits (0-7)', () => {
      const octalDigits = [0, 1, 2, 3, 4, 5, 6, 7]
      
      octalDigits.forEach(digit => {
        const { unmount } = render(<OctalDigitCard {...defaultProps} digit={digit} />)
        expect(screen.getByText(digit.toString())).toBeInTheDocument()
        unmount()
      })
    })

    it('should maintain consistent styling across different digits', () => {
      const { rerender } = render(<OctalDigitCard {...defaultProps} digit={0} />)
      const button0 = screen.getByLabelText('Octal digit 0')
      
      rerender(<OctalDigitCard {...defaultProps} digit={7} />)
      const button7 = screen.getByLabelText('Octal digit 7')
      
      // Both should have the same base classes
      expect(button0).toHaveClass('rounded-xl', 'font-bold', 'transition-all')
      expect(button7).toHaveClass('rounded-xl', 'font-bold', 'transition-all')
    })
  })
})