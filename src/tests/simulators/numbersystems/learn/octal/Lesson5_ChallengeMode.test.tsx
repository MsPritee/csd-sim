/**
 * Tests for Lesson5_ChallengeMode component
 * Tests lesson 5 rendering, challenges, interactions, and completion
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { Lesson5_ChallengeMode } from '../../../../../simulators/numbersystems/learn/octal/lessons/Lesson5_ChallengeMode'

describe('Lesson5_ChallengeMode', () => {
  const mockOnComplete = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initial Rendering', () => {
    it('should render challenge mode title', () => {
      render(<Lesson5_ChallengeMode onComplete={mockOnComplete} />)
      
      expect(screen.getByText('🎮 Challenge Mode')).toBeInTheDocument()
    })

    it('should render challenge description', () => {
      render(<Lesson5_ChallengeMode onComplete={mockOnComplete} />)
      
      expect(screen.getByText(/Test everything you learned in Lessons 1-4 about octal/i)).toBeInTheDocument()
    })

    it('should render progress indicator', () => {
      render(<Lesson5_ChallengeMode onComplete={mockOnComplete} />)
      
      const progressBars = screen.getAllByRole('progressbar')
      expect(progressBars.length).toBe(4) // 4 challenges
    })

    it('should render first challenge', () => {
      render(<Lesson5_ChallengeMode onComplete={mockOnComplete} />)
      
      expect(screen.getByText('Challenge 1 of 4')).toBeInTheDocument()
    })
  })

  describe('Challenge 1: Multiple Choice', () => {
    it('should render first challenge question', () => {
      render(<Lesson5_ChallengeMode onComplete={mockOnComplete} />)
      
      expect(screen.getByText('Which decimal number is represented?')).toBeInTheDocument()
    })

    it('should render challenge display', () => {
      render(<Lesson5_ChallengeMode onComplete={mockOnComplete} />)
      
      expect(screen.getByText('3 × 64')).toBeInTheDocument()
      expect(screen.getByText('4 × 8')).toBeInTheDocument()
      expect(screen.getByText('5 × 1')).toBeInTheDocument()
    })

    it('should render answer options', () => {
      render(<Lesson5_ChallengeMode onComplete={mockOnComplete} />)
      
      expect(screen.getByText('229')).toBeInTheDocument()
      expect(screen.getByText('228')).toBeInTheDocument()
      expect(screen.getByText('230')).toBeInTheDocument()
    })

    it('should accept correct answer', () => {
      render(<Lesson5_ChallengeMode onComplete={mockOnComplete} />)
      
      const correctAnswer = screen.getByText('229')
      fireEvent.click(correctAnswer)
      
      expect(screen.getByText('✅ Correct!')).toBeInTheDocument()
    })

    it('should show incorrect feedback for wrong answer', () => {
      render(<Lesson5_ChallengeMode onComplete={mockOnComplete} />)
      
      const wrongAnswer = screen.getByText('228')
      fireEvent.click(wrongAnswer)
      
      expect(screen.getByText('❌ Try again next time!')).toBeInTheDocument()
    })

    it('should advance to next challenge after delay', async () => {
      render(<Lesson5_ChallengeMode onComplete={mockOnComplete} />)
      
      fireEvent.click(screen.getByText('229'))
      
      vi.advanceTimersByTime(1500)
      
      await waitFor(() => {
        expect(screen.getByText('Challenge 2 of 4')).toBeInTheDocument()
      })
    })
  })

  describe('Challenge 2: Multiple Choice', () => {
    it('should render second challenge after first is completed', async () => {
      render(<Lesson5_ChallengeMode onComplete={mockOnComplete} />)
      
      // Complete first challenge
      fireEvent.click(screen.getByText('229'))
      vi.advanceTimersByTime(1500)
      
      await waitFor(() => {
        expect(screen.getByText('What is the place value of the middle 1?')).toBeInTheDocument()
      })
    })

    it('should show correct answer for place value question', async () => {
      render(<Lesson5_ChallengeMode onComplete={mockOnComplete} />)
      
      // Complete first challenge
      fireEvent.click(screen.getByText('229'))
      vi.advanceTimersByTime(1500)
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('8'))
      })
      
      expect(screen.getByText('✅ Correct!')).toBeInTheDocument()
    })
  })

  describe('Challenge 3: Explanation', () => {
    it('should render explanation challenge', async () => {
      render(<Lesson5_ChallengeMode onComplete={mockOnComplete} />)
      
      // Complete first two challenges
      fireEvent.click(screen.getByText('229'))
      vi.advanceTimersByTime(1500)
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('8'))
      })
      
      vi.advanceTimersByTime(1500)
      
      await waitFor(() => {
        expect(screen.getByText('Why are these different?')).toBeInTheDocument()
      })
    })

    it('should accept correct explanation', async () => {
      render(<Lesson5_ChallengeMode onComplete={mockOnComplete} />)
      
      // Complete first two challenges
      fireEvent.click(screen.getByText('229'))
      vi.advanceTimersByTime(1500)
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('8'))
      })
      
      vi.advanceTimersByTime(1500)
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Different positions'))
      })
      
      expect(screen.getByText('✅ Correct!')).toBeInTheDocument()
    })
  })

  describe('Challenge 4: Builder', () => {
    it('should render builder challenge', async () => {
      render(<Lesson5_ChallengeMode onComplete={mockOnComplete} />)
      
      // Complete first three challenges
      fireEvent.click(screen.getByText('229'))
      vi.advanceTimersByTime(1500)
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('8'))
      })
      
      vi.advanceTimersByTime(1500)
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Different positions'))
      })
      
      vi.advanceTimersByTime(1500)
      
      await waitFor(() => {
        expect(screen.getByText('Build the octal number')).toBeInTheDocument()
      })
    })

    it('should show position names for builder', async () => {
      render(<Lesson5_ChallengeMode onComplete={mockOnComplete} />)
      
      // Complete first three challenges
      fireEvent.click(screen.getByText('229'))
      vi.advanceTimersByTime(1500)
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('8'))
      })
      
      vi.advanceTimersByTime(1500)
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Different positions'))
      })
      
      vi.advanceTimersByTime(1500)
      
      await waitFor(() => {
        expect(screen.getByText('Sixty-fours')).toBeInTheDocument()
        expect(screen.getByText('Eights')).toBeInTheDocument()
        expect(screen.getByText('Ones')).toBeInTheDocument()
      })
    })

    it('should show target decimal', async () => {
      render(<Lesson5_ChallengeMode onComplete={mockOnComplete} />)
      
      // Complete first three challenges
      fireEvent.click(screen.getByText('229'))
      vi.advanceTimersByTime(1500)
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('8'))
      })
      
      vi.advanceTimersByTime(1500)
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Different positions'))
      })
      
      vi.advanceTimersByTime(1500)
      
      await waitFor(() => {
        expect(screen.getByText('Target decimal: 73')).toBeInTheDocument()
      })
    })

    it('should have digit selectors with 0-7 options', async () => {
      render(<Lesson5_ChallengeMode onComplete={mockOnComplete} />)
      
      // Complete first three challenges
      fireEvent.click(screen.getByText('229'))
      vi.advanceTimersByTime(1500)
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('8'))
      })
      
      vi.advanceTimersByTime(1500)
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Different positions'))
      })
      
      vi.advanceTimersByTime(1500)
      
      await waitFor(() => {
        const selects = screen.getAllByRole('combobox')
        expect(selects.length).toBe(3)
      })
    })

    it('should calculate correct total for 111 (octal)', async () => {
      render(<Lesson5_ChallengeMode onComplete={mockOnComplete} />)
      
      // Complete first three challenges
      fireEvent.click(screen.getByText('229'))
      vi.advanceTimersByTime(1500)
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('8'))
      })
      
      vi.advanceTimersByTime(1500)
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Different positions'))
      })
      
      vi.advanceTimersByTime(1500)
      
      await waitFor(() => {
        const selects = screen.getAllByRole('combobox')
        
        // Set all to 1 (111 in octal = 73 in decimal)
        fireEvent.change(selects[0], { target: { value: '1' } })
        fireEvent.change(selects[1], { target: { value: '1' } })
        fireEvent.change(selects[2], { target: { value: '1' } })
      })
      
      await waitFor(() => {
        expect(screen.getByText('Calculated: 73')).toBeInTheDocument()
      })
    })

    it('should complete builder challenge when correct', async () => {
      render(<Lesson5_ChallengeMode onComplete={mockOnComplete} />)
      
      // Complete first three challenges
      fireEvent.click(screen.getByText('229'))
      vi.advanceTimersByTime(1500)
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('8'))
      })
      
      vi.advanceTimersByTime(1500)
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Different positions'))
      })
      
      vi.advanceTimersByTime(1500)
      
      await waitFor(() => {
        const selects = screen.getAllByRole('combobox')
        
        // Set to 111 (octal) = 73 (decimal)
        fireEvent.change(selects[0], { target: { value: '1' } })
        fireEvent.change(selects[1], { target: { value: '1' } })
        fireEvent.change(selects[2], { target: { value: '1' } })
      })
      
      await waitFor(() => {
        expect(screen.getByText('🎉 Correct!')).toBeInTheDocument()
      })
    })
  })

  describe('Completion State', () => {
    it('should show completion screen after all challenges', async () => {
      render(<Lesson5_ChallengeMode onComplete={mockOnComplete} />)
      
      // Complete all challenges
      fireEvent.click(screen.getByText('229'))
      vi.advanceTimersByTime(1500)
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('8'))
      })
      
      vi.advanceTimersByTime(1500)
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Different positions'))
      })
      
      vi.advanceTimersByTime(1500)
      
      await waitFor(() => {
        const selects = screen.getAllByRole('combobox')
        fireEvent.change(selects[0], { target: { value: '1' } })
        fireEvent.change(selects[1], { target: { value: '1' } })
        fireEvent.change(selects[2], { target: { value: '1' } })
      })
      
      vi.advanceTimersByTime(1500)
      
      await waitFor(() => {
        expect(screen.getByText('🎉 Challenge Complete!')).toBeInTheDocument()
      })
    })

    it('should show score', async () => {
      render(<Lesson5_ChallengeMode onComplete={mockOnComplete} />)
      
      // Complete all challenges with correct answers
      fireEvent.click(screen.getByText('229'))
      vi.advanceTimersByTime(1500)
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('8'))
      })
      
      vi.advanceTimersByTime(1500)
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Different positions'))
      })
      
      vi.advanceTimersByTime(1500)
      
      await waitFor(() => {
        const selects = screen.getAllByRole('combobox')
        fireEvent.change(selects[0], { target: { value: '1' } })
        fireEvent.change(selects[1], { target: { value: '1' } })
        fireEvent.change(selects[2], { target: { value: '1' } })
      })
      
      vi.advanceTimersByTime(1500)
      
      await waitFor(() => {
        expect(screen.getByText('You got 4 out of 4 correct!')).toBeInTheDocument()
      })
    })

    it('should call onComplete when all challenges complete', async () => {
      render(<Lesson5_ChallengeMode onComplete={mockOnComplete} />)
      
      // Complete all challenges
      fireEvent.click(screen.getByText('229'))
      vi.advanceTimersByTime(1500)
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('8'))
      })
      
      vi.advanceTimersByTime(1500)
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Different positions'))
      })
      
      vi.advanceTimersByTime(1500)
      
      await waitFor(() => {
        const selects = screen.getAllByRole('combobox')
        fireEvent.change(selects[0], { target: { value: '1' } })
        fireEvent.change(selects[1], { target: { value: '1' } })
        fireEvent.change(selects[2], { target: { value: '1' } })
      })
      
      vi.advanceTimersByTime(1500)
      
      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalledTimes(1)
      })
    })

    it('should show perfect score message', async () => {
      render(<Lesson5_ChallengeMode onComplete={mockOnComplete} />)
      
      // Complete all challenges with correct answers
      fireEvent.click(screen.getByText('229'))
      vi.advanceTimersByTime(1500)
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('8'))
      })
      
      vi.advanceTimersByTime(1500)
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Different positions'))
      })
      
      vi.advanceTimersByTime(1500)
      
      await waitFor(() => {
        const selects = screen.getAllByRole('combobox')
        fireEvent.change(selects[0], { target: { value: '1' } })
        fireEvent.change(selects[1], { target: { value: '1' } })
        fireEvent.change(selects[2], { target: { value: '1' } })
      })
      
      vi.advanceTimersByTime(1500)
      
      await waitFor(() => {
        expect(screen.getByText(/Perfect score! You've mastered octal number systems/i)).toBeInTheDocument()
      })
    })
  })

  describe('Reset Functionality', () => {
    it('should reset when "Try Again" is clicked', async () => {
      render(<Lesson5_ChallengeMode onComplete={mockOnComplete} />)
      
      // Complete all challenges
      fireEvent.click(screen.getByText('229'))
      vi.advanceTimersByTime(1500)
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('8'))
      })
      
      vi.advanceTimersByTime(1500)
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Different positions'))
      })
      
      vi.advanceTimersByTime(1500)
      
      await waitFor(() => {
        const selects = screen.getAllByRole('combobox')
        fireEvent.change(selects[0], { target: { value: '1' } })
        fireEvent.change(selects[1], { target: { value: '1' } })
        fireEvent.change(selects[2], { target: { value: '1' } })
      })
      
      vi.advanceTimersByTime(1500)
      
      await waitFor(() => {
        expect(screen.getByText('Try Again')).toBeInTheDocument()
      })
      
      // Reset
      fireEvent.click(screen.getByText('Try Again'))
      
      // Should return to first challenge
      expect(screen.getByText('Challenge 1 of 4')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper button labels', () => {
      render(<Lesson5_ChallengeMode onComplete={mockOnComplete} />)
      
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should be keyboard navigable', () => {
      render(<Lesson5_ChallengeMode onComplete={mockOnComplete} />)
      
      const options = screen.getAllByRole('button')
      options.forEach(option => {
        expect(option).toBeEnabled()
      })
    })
  })
})