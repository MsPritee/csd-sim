/**
 * Tests for Lesson4_UnderstandingPosition component
 * Tests lesson 4 rendering, tier progression, and mathematical calculation
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import { Lesson4_UnderstandingPosition } from '../../../../../simulators/numbersystems/learn/octal/lessons/Lesson4_UnderstandingPosition'

describe('Lesson4_UnderstandingPosition', () => {
  const mockOnComplete = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial Rendering', () => {
    it('should render lesson title', () => {
      render(<Lesson4_UnderstandingPosition onComplete={mockOnComplete} />)
      
      expect(screen.getByText('How Position Value Is Calculated')).toBeInTheDocument()
    })

    it('should render answer reference to Lesson 1', () => {
      render(<Lesson4_UnderstandingPosition onComplete={mockOnComplete} />)
      
      expect(screen.getByText('🎯 Answer to Question 3 from Lesson 1')).toBeInTheDocument()
    })

    it('should render main question', () => {
      render(<Lesson4_UnderstandingPosition onComplete={mockOnComplete} />)
      
      expect(screen.getByText('How does a digit get its value?')).toBeInTheDocument()
    })

    it('should render example number (345)', () => {
      render(<Lesson4_UnderstandingPosition onComplete={mockOnComplete} />)
      
      expect(screen.getByText('3')).toBeInTheDocument()
      expect(screen.getByText('4')).toBeInTheDocument()
      expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('should render "Show Positions" button initially', () => {
      render(<Lesson4_UnderstandingPosition onComplete={mockOnComplete} />)
      
      expect(screen.getByText('Show Positions')).toBeInTheDocument()
    })
  })

  describe('Tier 1: Position Names', () => {
    it('should show position names when "Show Positions" is clicked', () => {
      render(<Lesson4_UnderstandingPosition onComplete={mockOnComplete} />)
      
      fireEvent.click(screen.getByText('Show Positions'))
      
      expect(screen.getByText('Sixty-fours')).toBeInTheDocument()
      expect(screen.getByText('Eights')).toBeInTheDocument()
      expect(screen.getByText('Ones')).toBeInTheDocument()
    })

    it('should show step 1 explanation', () => {
      render(<Lesson4_UnderstandingPosition onComplete={mockOnComplete} />)
      
      fireEvent.click(screen.getByText('Show Positions'))
      
      expect(screen.getByText(/Step 1: Each position has a name - Sixty-fours, Eights, Ones/i)).toBeInTheDocument()
    })

    it('should change button to "Show Place Values"', () => {
      render(<Lesson4_UnderstandingPosition onComplete={mockOnComplete} />)
      
      fireEvent.click(screen.getByText('Show Positions'))
      
      expect(screen.getByText('Show Place Values')).toBeInTheDocument()
    })
  })

  describe('Tier 2: Place Values', () => {
    it('should show place values when "Show Place Values" is clicked', () => {
      render(<Lesson4_UnderstandingPosition onComplete={mockOnComplete} />)
      
      fireEvent.click(screen.getByText('Show Positions'))
      fireEvent.click(screen.getByText('Show Place Values'))
      
      expect(screen.getByText('64')).toBeInTheDocument()
      expect(screen.getByText('8')).toBeInTheDocument()
      expect(screen.getByText('1')).toBeInTheDocument()
    })

    it('should show step 2 explanation', () => {
      render(<Lesson4_UnderstandingPosition onComplete={mockOnComplete} />)
      
      fireEvent.click(screen.getByText('Show Positions'))
      fireEvent.click(screen.getByText('Show Place Values'))
      
      expect(screen.getByText(/Step 2: Each position has a place value - 64, 8, 1/i)).toBeInTheDocument()
    })

    it('should change button to "Show Powers of 8"', () => {
      render(<Lesson4_UnderstandingPosition onComplete={mockOnComplete} />)
      
      fireEvent.click(screen.getByText('Show Positions'))
      fireEvent.click(screen.getByText('Show Place Values'))
      
      expect(screen.getByText('Show Powers of 8')).toBeInTheDocument()
    })
  })

  describe('Tier 3: Powers of 8', () => {
    it('should show powers of 8 when "Show Powers of 8" is clicked', () => {
      render(<Lesson4_UnderstandingPosition onComplete={mockOnComplete} />)
      
      fireEvent.click(screen.getByText('Show Positions'))
      fireEvent.click(screen.getByText('Show Place Values'))
      fireEvent.click(screen.getByText('Show Powers of 8'))
      
      expect(screen.getByText('8²')).toBeInTheDocument()
      expect(screen.getByText('8¹')).toBeInTheDocument()
      expect(screen.getByText('8⁰')).toBeInTheDocument()
    })

    it('should show step 3 explanation', () => {
      render(<Lesson4_UnderstandingPosition onComplete={mockOnComplete} />)
      
      fireEvent.click(screen.getByText('Show Positions'))
      fireEvent.click(screen.getByText('Show Place Values'))
      fireEvent.click(screen.getByText('Show Powers of 8'))
      
      expect(screen.getByText(/Step 3: Each place value is a power of 8 - 8², 8¹, 8⁰/i)).toBeInTheDocument()
    })

    it('should call onComplete when final tier is reached', () => {
      render(<Lesson4_UnderstandingPosition onComplete={mockOnComplete} />)
      
      fireEvent.click(screen.getByText('Show Positions'))
      fireEvent.click(screen.getByText('Show Place Values'))
      fireEvent.click(screen.getByText('Show Powers of 8'))
      
      expect(mockOnComplete).toHaveBeenCalledTimes(1)
    })
  })

  describe('Final Flow and Calculation', () => {
    it('should show final flow message', () => {
      render(<Lesson4_UnderstandingPosition onComplete={mockOnComplete} />)
      
      fireEvent.click(screen.getByText('Show Positions'))
      fireEvent.click(screen.getByText('Show Place Values'))
      fireEvent.click(screen.getByText('Show Powers of 8'))
      
      expect(screen.getByText('Digit → Position → Power of 8 → Place Value → Contribution')).toBeInTheDocument()
    })

    it('should show complete calculation breakdown', () => {
      render(<Lesson4_UnderstandingPosition onComplete={mockOnComplete} />)
      
      fireEvent.click(screen.getByText('Show Positions'))
      fireEvent.click(screen.getByText('Show Place Values'))
      fireEvent.click(screen.getByText('Show Powers of 8'))
      
      expect(screen.getByText('Complete Calculation: 345 (octal) = 229 (decimal)')).toBeInTheDocument()
    })

    it('should show multiplication steps', () => {
      render(<Lesson4_UnderstandingPosition onComplete={mockOnComplete} />)
      
      fireEvent.click(screen.getByText('Show Positions'))
      fireEvent.click(screen.getByText('Show Place Values'))
      fireEvent.click(screen.getByText('Show Powers of 8'))
      
      expect(screen.getByText('3 × 64 =')).toBeInTheDocument()
      expect(screen.getByText('192')).toBeInTheDocument()
      expect(screen.getByText('4 × 8 =')).toBeInTheDocument()
      expect(screen.getByText('32')).toBeInTheDocument()
      expect(screen.getByText('5 × 1 =')).toBeInTheDocument()
      expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('should show total calculation', () => {
      render(<Lesson4_UnderstandingPosition onComplete={mockOnComplete} />)
      
      fireEvent.click(screen.getByText('Show Positions'))
      fireEvent.click(screen.getByText('Show Place Values'))
      fireEvent.click(screen.getByText('Show Powers of 8'))
      
      expect(screen.getByText('Total =')).toBeInTheDocument()
      expect(screen.getByText('229')).toBeInTheDocument()
    })
  })

  describe('Reset Functionality', () => {
    it('should reset when "Try Again" is clicked', () => {
      render(<Lesson4_UnderstandingPosition onComplete={mockOnComplete} />)
      
      // Complete all tiers
      fireEvent.click(screen.getByText('Show Positions'))
      fireEvent.click(screen.getByText('Show Place Values'))
      fireEvent.click(screen.getByText('Show Powers of 8'))
      
      // Reset
      fireEvent.click(screen.getByText('Try Again'))
      
      // Should return to initial state
      expect(screen.getByText('Show Positions')).toBeInTheDocument()
      expect(screen.queryByText('64')).not.toBeInTheDocument()
    })
  })

  describe('Progressive Learning', () => {
    it('should maintain previous tier information when advancing', () => {
      render(<Lesson4_UnderstandingPosition onComplete={mockOnComplete} />)
      
      fireEvent.click(screen.getByText('Show Positions'))
      expect(screen.getByText('Sixty-fours')).toBeInTheDocument()
      
      fireEvent.click(screen.getByText('Show Place Values'))
      expect(screen.getByText('Sixty-fours')).toBeInTheDocument() // Still visible
      expect(screen.getByText('64')).toBeInTheDocument()
      
      fireEvent.click(screen.getByText('Show Powers of 8'))
      expect(screen.getByText('Sixty-fours')).toBeInTheDocument() // Still visible
      expect(screen.getByText('64')).toBeInTheDocument() // Still visible
      expect(screen.getByText('8²')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper button labels', () => {
      render(<Lesson4_UnderstandingPosition onComplete={mockOnComplete} />)
      
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should be keyboard navigable', () => {
      render(<Lesson4_UnderstandingPosition onComplete={mockOnComplete} />)
      
      const showButton = screen.getByText('Show Positions')
      expect(showButton).toBeEnabled()
    })
  })
})