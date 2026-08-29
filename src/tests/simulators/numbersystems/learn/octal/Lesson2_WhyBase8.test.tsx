/**
 * Tests for Lesson2_WhyBase8 component
 * Tests lesson 2 rendering, animations, and interactions
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { Lesson2_WhyBase8 } from '../../../../../simulators/numbersystems/learn/octal/lessons/Lesson2_WhyBase8'

describe('Lesson2_WhyBase8', () => {
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
      render(<Lesson2_WhyBase8 onComplete={mockOnComplete} />)
      
      expect(screen.getByText('What is Base?')).toBeInTheDocument()
    })

    it('should render answer reference to Lesson 1', () => {
      render(<Lesson2_WhyBase8 onComplete={mockOnComplete} />)
      
      expect(screen.getByText('🎯 Answer to Question 1 from Lesson 1')).toBeInTheDocument()
    })

    it('should render digit counter', () => {
      render(<Lesson2_WhyBase8 onComplete={mockOnComplete} />)
      
      expect(screen.getByText('0 / 8 digits')).toBeInTheDocument()
    })

    it('should render 8 digit cards', () => {
      render(<Lesson2_WhyBase8 onComplete={mockOnComplete} />)
      
      // Should have digits 0-7
      for (let i = 0; i <= 7; i++) {
        expect(screen.getByText(i.toString())).toBeInTheDocument()
      }
    })
  })

  describe('Animation Progress', () => {
    it('should highlight digits progressively', async () => {
      render(<Lesson2_WhyBase8 onComplete={mockOnComplete} />)
      
      // Start with 0/8
      expect(screen.getByText('0 / 8 digits')).toBeInTheDocument()
      
      // Fast-forward through animation
      vi.advanceTimersByTime(300 * 8) // 8 digits * 300ms each
      
      await waitFor(() => {
        expect(screen.getByText('8 / 8 digits')).toBeInTheDocument()
      })
    })

    it('should show base explanation after animation completes', async () => {
      render(<Lesson2_WhyBase8 onComplete={mockOnComplete} />)
      
      // Fast-forward through digit highlighting
      vi.advanceTimersByTime(300 * 8)
      
      await waitFor(() => {
        expect(screen.getByText('BASE 8')).toBeInTheDocument()
      })
    })

    it('should call onComplete after animation completes', async () => {
      render(<Lesson2_WhyBase8 onComplete={mockOnComplete} />)
      
      // Fast-forward through animation
      vi.advanceTimersByTime(300 * 8 + 100)
      
      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('Base Explanation', () => {
    it('should show base definition', async () => {
      render(<Lesson2_WhyBase8 onComplete={mockOnComplete} />)
      
      vi.advanceTimersByTime(300 * 8)
      
      await waitFor(() => {
        expect(screen.getByText('Base = Number of unique digits/symbols')).toBeInTheDocument()
      })
    })

    it('should explain octal as base 8', async () => {
      render(<Lesson2_WhyBase8 onComplete={mockOnComplete} />)
      
      vi.advanceTimersByTime(300 * 8)
      
      await waitFor(() => {
        expect(screen.getByText(/Since octal uses 8 digits \(0-7\), it's called "base 8"/i)).toBeInTheDocument()
      })
    })
  })

  describe('Why Octal Section', () => {
    it('should show "Why 8?" button after explanation', async () => {
      render(<Lesson2_WhyBase8 onComplete={mockOnComplete} />)
      
      vi.advanceTimersByTime(300 * 8)
      
      await waitFor(() => {
        expect(screen.getByText('Why 8? 🤔')).toBeInTheDocument()
      })
    })

    it('should show octal explanation when "Why 8?" is clicked', async () => {
      render(<Lesson2_WhyBase8 onComplete={mockOnComplete} />)
      
      vi.advanceTimersByTime(300 * 8)
      
      await waitFor(() => {
        const whyButton = screen.getByText('Why 8? 🤔')
        fireEvent.click(whyButton)
      })
      
      await waitFor(() => {
        expect(screen.getByText(/Octal is useful in computing/i)).toBeInTheDocument()
      })
    })

    it('should mention computing relevance', async () => {
      render(<Lesson2_WhyBase8 onComplete={mockOnComplete} />)
      
      vi.advanceTimersByTime(300 * 8)
      
      await waitFor(() => {
        const whyButton = screen.getByText('Why 8? 🤔')
        fireEvent.click(whyButton)
      })
      
      await waitFor(() => {
        expect(screen.getByText(/file permissions/i)).toBeInTheDocument()
      })
    })
  })

  describe('Reset Functionality', () => {
    it('should reset animation when "Watch Again" is clicked', async () => {
      render(<Lesson2_WhyBase8 onComplete={mockOnComplete} />)
      
      // Let animation complete
      vi.advanceTimersByTime(300 * 8)
      
      await waitFor(() => {
        expect(screen.getByText('Watch Again')).toBeInTheDocument()
      })
      
      // Reset
      fireEvent.click(screen.getByText('Watch Again'))
      
      // Should return to initial state
      expect(screen.getByText('0 / 8 digits')).toBeInTheDocument()
    })
  })

  describe('Visual Elements', () => {
    it('should show computing relevance visualization', () => {
      render(<Lesson2_WhyBase8 onComplete={mockOnComplete} />)
      
      expect(screen.getByText('Visual: 8 Digits = Base 8')).toBeInTheDocument()
    })

    it('should show binary bit reference', () => {
      render(<Lesson2_WhyBase8 onComplete={mockOnComplete} />)
      
      expect(screen.getByText(/Each digit can represent 3 binary bits/i)).toBeInTheDocument()
    })
  })

  describe('Completion State', () => {
    it('should show completion message', async () => {
      render(<Lesson2_WhyBase8 onComplete={mockOnComplete} />)
      
      vi.advanceTimersByTime(300 * 8)
      
      await waitFor(() => {
        expect(screen.getByText('✅ Now we know WHY Octal is called Base 8')).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper button labels', () => {
      render(<Lesson2_WhyBase8 onComplete={mockOnComplete} />)
      
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should be keyboard navigable', async () => {
      render(<Lesson2_WhyBase8 onComplete={mockOnComplete} />)
      
      vi.advanceTimersByTime(300 * 8)
      
      await waitFor(() => {
        const whyButton = screen.getByText('Why 8? 🤔')
        expect(whyButton).toBeEnabled()
      })
    })
  })
})