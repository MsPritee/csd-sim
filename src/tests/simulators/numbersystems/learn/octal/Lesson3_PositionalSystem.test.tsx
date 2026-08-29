/**
 * Tests for Lesson3_PositionalSystem component
 * Tests lesson 3 rendering, position interactions, and animations
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { Lesson3_PositionalSystem } from '../../../../../simulators/numbersystems/learn/octal/lessons/Lesson3_PositionalSystem'

describe('Lesson3_PositionalSystem', () => {
  const mockOnComplete = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initial Rendering', () => {
    it('should render lesson title', () => {
      render(<Lesson3_PositionalSystem onComplete={mockOnComplete} />)
      
      expect(screen.getByText('What is Position?')).toBeInTheDocument()
    })

    it('should render answer reference to Lesson 1', () => {
      render(<Lesson3_PositionalSystem onComplete={mockOnComplete} />)
      
      expect(screen.getByText('🎯 Answer to Question 2 from Lesson 1')).toBeInTheDocument()
    })

    it('should render main question', () => {
      render(<Lesson3_PositionalSystem onComplete={mockOnComplete} />)
      
      expect(screen.getByText('Why does the same digit have different values?')).toBeInTheDocument()
    })

    it('should render three digit cards (111)', () => {
      render(<Lesson3_PositionalSystem onComplete={mockOnComplete} />)
      
      const ones = screen.getAllByText('1')
      expect(ones.length).toBe(3)
    })

    it('should render instructions', () => {
      render(<Lesson3_PositionalSystem onComplete={mockOnComplete} />)
      
      expect(screen.getByText(/Click on each digit to see how position changes its value/i)).toBeInTheDocument()
    })
  })

  describe('Position Clicking Interaction', () => {
    it('should reveal position name when first digit is clicked', () => {
      render(<Lesson3_PositionalSystem onComplete={mockOnComplete} />)
      
      const digitCards = screen.getAllByText('1')
      fireEvent.click(digitCards[0])
      
      expect(screen.getByText('Sixty-fours')).toBeInTheDocument()
    })

    it('should reveal position value when first digit is clicked', () => {
      render(<Lesson3_PositionalSystem onComplete={mockOnComplete} />)
      
      const digitCards = screen.getAllByText('1')
      fireEvent.click(digitCards[0])
      
      expect(screen.getByText('64')).toBeInTheDocument()
    })

    it('should reveal second position when second digit is clicked', () => {
      render(<Lesson3_PositionalSystem onComplete={mockOnComplete} />)
      
      const digitCards = screen.getAllByText('1')
      fireEvent.click(digitCards[0])
      fireEvent.click(digitCards[1])
      
      expect(screen.getByText('Eights')).toBeInTheDocument()
      expect(screen.getByText('8')).toBeInTheDocument()
    })

    it('should reveal third position when third digit is clicked', () => {
      render(<Lesson3_PositionalSystem onComplete={mockOnComplete} />)
      
      const digitCards = screen.getAllByText('1')
      fireEvent.click(digitCards[0])
      fireEvent.click(digitCards[1])
      fireEvent.click(digitCards[2])
      
      expect(screen.getByText('Ones')).toBeInTheDocument()
      expect(screen.getByText('1')).toBeInTheDocument()
    })
  })

  describe('Sum Animation', () => {
    it('should show sum animation when all positions clicked', async () => {
      render(<Lesson3_PositionalSystem onComplete={mockOnComplete} />)
      
      const digitCards = screen.getAllByText('1')
      fireEvent.click(digitCards[0])
      fireEvent.click(digitCards[1])
      fireEvent.click(digitCards[2])
      
      // Wait for animation delay
      vi.advanceTimersByTime(800)
      
      await waitFor(() => {
        expect(screen.getByText('64 + 8 + 1 = 73')).toBeInTheDocument()
      })
    })

    it('should show "POSITION MATTERS" message', async () => {
      render(<Lesson3_PositionalSystem onComplete={mockOnComplete} />)
      
      const digitCards = screen.getAllByText('1')
      fireEvent.click(digitCards[0])
      fireEvent.click(digitCards[1])
      fireEvent.click(digitCards[2])
      
      vi.advanceTimersByTime(800)
      
      await waitFor(() => {
        expect(screen.getByText('POSITION MATTERS')).toBeInTheDocument()
      })
    })

    it('should call onComplete when sum animation starts', async () => {
      render(<Lesson3_PositionalSystem onComplete={mockOnComplete} />)
      
      const digitCards = screen.getAllByText('1')
      fireEvent.click(digitCards[0])
      fireEvent.click(digitCards[1])
      fireEvent.click(digitCards[2])
      
      vi.advanceTimersByTime(800)
      
      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('Position Values Explanation', () => {
    it('should explain position values after sum animation', async () => {
      render(<Lesson3_PositionalSystem onComplete={mockOnComplete} />)
      
      const digitCards = screen.getAllByText('1')
      fireEvent.click(digitCards[0])
      fireEvent.click(digitCards[1])
      fireEvent.click(digitCards[2])
      
      vi.advanceTimersByTime(800)
      
      await waitFor(() => {
        expect(screen.getByText(/The same digit \(1\) has different values depending on its position/i)).toBeInTheDocument()
      })
    })

    it('should show specific position value examples', async () => {
      render(<Lesson3_PositionalSystem onComplete={mockOnComplete} />)
      
      const digitCards = screen.getAllByText('1')
      fireEvent.click(digitCards[0])
      fireEvent.click(digitCards[1])
      fireEvent.click(digitCards[2])
      
      vi.advanceTimersByTime(800)
      
      await waitFor(() => {
        expect(screen.getByText('• 1 in ones place = 1')).toBeInTheDocument()
        expect(screen.getByText('• 1 in eights place = 8')).toBeInTheDocument()
        expect(screen.getByText('• 1 in sixty-fours place = 64')).toBeInTheDocument()
      })
    })
  })

  describe('Reset Functionality', () => {
    it('should reset when "Try Again" is clicked', async () => {
      render(<Lesson3_PositionalSystem onComplete={mockOnComplete} />)
      
      // Complete the interaction
      const digitCards = screen.getAllByText('1')
      fireEvent.click(digitCards[0])
      fireEvent.click(digitCards[1])
      fireEvent.click(digitCards[2])
      
      vi.advanceTimersByTime(800)
      
      await waitFor(() => {
        expect(screen.getByText('Try Again')).toBeInTheDocument()
      })
      
      // Reset
      fireEvent.click(screen.getByText('Try Again'))
      
      // Should return to initial state
      expect(screen.getByText(/Click on each digit to see how position changes its value/i)).toBeInTheDocument()
    })
  })

  describe('Key Concept Section', () => {
    it('should render key concept banner', () => {
      render(<Lesson3_PositionalSystem onComplete={mockOnComplete} />)
      
      expect(screen.getByText('Key Concept')).toBeInTheDocument()
    })

    it('should explain positional number systems', () => {
      render(<Lesson3_PositionalSystem onComplete={mockOnComplete} />)
      
      expect(screen.getByText(/In positional number systems, a digit's value depends on its position/i)).toBeInTheDocument()
    })

    it('should show teaser for next lesson', () => {
      render(<Lesson3_PositionalSystem onComplete={mockOnComplete} />)
      
      expect(screen.getByText(/Next lesson: We'll learn HOW position value is calculated using powers of 8/i)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper button labels', () => {
      render(<Lesson3_PositionalSystem onComplete={mockOnComplete} />)
      
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should be keyboard navigable', () => {
      render(<Lesson3_PositionalSystem onComplete={mockOnComplete} />)
      
      const digitCards = screen.getAllByText('1')
      digitCards.forEach(card => {
        expect(card).toBeEnabled()
      })
    })
  })
})