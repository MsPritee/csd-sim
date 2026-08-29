/**
 * Tests for Lesson1_WhatIsOctal component
 * Tests lesson 1 rendering, interactions, and completion
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { Lesson1_WhatIsOctal } from '../../../../../simulators/numbersystems/learn/octal/lessons/Lesson1_WhatIsOctal'

describe('Lesson1_WhatIsOctal', () => {
  const mockOnComplete = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial Rendering', () => {
    it('should render lesson title', () => {
      render(<Lesson1_WhatIsOctal onComplete={mockOnComplete} />)
      
      expect(screen.getByText('Meet the Octal Number System')).toBeInTheDocument()
    })

    it('should render everyday octal examples', () => {
      render(<Lesson1_WhatIsOctal onComplete={mockOnComplete} />)
      
      expect(screen.getByText('7')).toBeInTheDocument()
      expect(screen.getByText('15')).toBeInTheDocument()
      expect(screen.getByText('42')).toBeInTheDocument()
      expect(screen.getByText('177')).toBeInTheDocument()
    })

    it('should render "Let\'s Find Out" button initially', () => {
      render(<Lesson1_WhatIsOctal onComplete={mockOnComplete} />)
      
      expect(screen.getByText('Let\'s Find Out')).toBeInTheDocument()
    })

    it('should render introduction question', () => {
      render(<Lesson1_WhatIsOctal onComplete={mockOnComplete} />)
      
      expect(screen.getByText(/how octal numbers actually work/i)).toBeInTheDocument()
    })
  })

  describe('Question Reveal Interaction', () => {
    it('should reveal first question when "Let\'s Find Out" is clicked', () => {
      render(<Lesson1_WhatIsOctal onComplete={mockOnComplete} />)
      
      const startButton = screen.getByText('Let\'s Find Out')
      fireEvent.click(startButton)
      
      expect(screen.getByText('Question 1: Why do we use 8 digits?')).toBeInTheDocument()
    })

    it('should show visual for first question', () => {
      render(<Lesson1_WhatIsOctal onComplete={mockOnComplete} />)
      
      const startButton = screen.getByText('Let\'s Find Out')
      fireEvent.click(startButton)
      
      expect(screen.getByText('0 1 2 3 4 5 6 7')).toBeInTheDocument()
    })

    it('should show lesson reference for first question', () => {
      render(<Lesson1_WhatIsOctal onComplete={mockOnComplete} />)
      
      const startButton = screen.getByText('Let\'s Find Out')
      fireEvent.click(startButton)
      
      expect(screen.getByText('→ Find the answer in Lesson 2')).toBeInTheDocument()
    })

    it('should reveal second question when "Next Question" is clicked', () => {
      render(<Lesson1_WhatIsOctal onComplete={mockOnComplete} />)
      
      fireEvent.click(screen.getByText('Let\'s Find Out'))
      fireEvent.click(screen.getByText('Next Question'))
      
      expect(screen.getByText('Question 2: Why does the same digit have different values?')).toBeInTheDocument()
    })

    it('should reveal third question when "Next Question" is clicked again', () => {
      render(<Lesson1_WhatIsOctal onComplete={mockOnComplete} />)
      
      fireEvent.click(screen.getByText('Let\'s Find Out'))
      fireEvent.click(screen.getByText('Next Question'))
      fireEvent.click(screen.getByText('Next Question'))
      
      expect(screen.getByText('Question 3: How does a digit get its value?')).toBeInTheDocument()
    })
  })

  describe('Completion State', () => {
    it('should show completion message when all questions revealed', async () => {
      render(<Lesson1_WhatIsOctal onComplete={mockOnComplete} />)
      
      fireEvent.click(screen.getByText('Let\'s Find Out'))
      fireEvent.click(screen.getByText('Next Question'))
      fireEvent.click(screen.getByText('Next Question'))
      
      await waitFor(() => {
        expect(screen.getByText(/Great! You've discovered the key questions about octal numbers/i)).toBeInTheDocument()
      })
    })

    it('should call onComplete when all questions revealed', async () => {
      render(<Lesson1_WhatIsOctal onComplete={mockOnComplete} />)
      
      fireEvent.click(screen.getByText('Let\'s Find Out'))
      fireEvent.click(screen.getByText('Next Question'))
      fireEvent.click(screen.getByText('Next Question'))
      
      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalledTimes(1)
      })
    })

    it('should show "Start Over" button after completion', async () => {
      render(<Lesson1_WhatIsOctal onComplete={mockOnComplete} />)
      
      fireEvent.click(screen.getByText('Let\'s Find Out'))
      fireEvent.click(screen.getByText('Next Question'))
      fireEvent.click(screen.getByText('Next Question'))
      
      await waitFor(() => {
        expect(screen.getByText('Start Over')).toBeInTheDocument()
      })
    })
  })

  describe('Reset Functionality', () => {
    it('should reset to initial state when "Start Over" is clicked', async () => {
      render(<Lesson1_WhatIsOctal onComplete={mockOnComplete} />)
      
      // Complete the lesson
      fireEvent.click(screen.getByText('Let\'s Find Out'))
      fireEvent.click(screen.getByText('Next Question'))
      fireEvent.click(screen.getByText('Next Question'))
      
      await waitFor(() => {
        expect(screen.getByText('Start Over')).toBeInTheDocument()
      })
      
      // Reset
      fireEvent.click(screen.getByText('Start Over'))
      
      // Should return to initial state
      expect(screen.getByText('Let\'s Find Out')).toBeInTheDocument()
      expect(screen.queryByText('Question 1:')).not.toBeInTheDocument()
    })
  })

  describe('Educational Content', () => {
    it('should render "What is a Number System" section', () => {
      render(<Lesson1_WhatIsOctal onComplete={mockOnComplete} />)
      
      expect(screen.getByText('What is a Number System?')).toBeInTheDocument()
    })

    it('should explain octal as 8-digit system', () => {
      render(<Lesson1_WhatIsOctal onComplete={mockOnComplete} />)
      
      expect(screen.getByText(/Octal is the number system that uses 8 digits/i)).toBeInTheDocument()
    })

    it('should show computing context', () => {
      render(<Lesson1_WhatIsOctal onComplete={mockOnComplete} />)
      
      expect(screen.getByText(/Octal numbers are used in computing/i)).toBeInTheDocument()
    })
  })

  describe('Question Content', () => {
    it('should show correct visual for question 1', () => {
      render(<Lesson1_WhatIsOctal onComplete={mockOnComplete} />)
      
      fireEvent.click(screen.getByText('Let\'s Find Out'))
      
      expect(screen.getByText('0 1 2 3 4 5 6 7')).toBeInTheDocument()
    })

    it('should show correct visual for question 2', () => {
      render(<Lesson1_WhatIsOctal onComplete={mockOnComplete} />)
      
      fireEvent.click(screen.getByText('Let\'s Find Out'))
      fireEvent.click(screen.getByText('Next Question'))
      
      expect(screen.getByText(/1.*1.*1/i)).toBeInTheDocument()
      expect(screen.getByText(/64.*8.*1/i)).toBeInTheDocument()
    })

    it('should show correct visual for question 3', () => {
      render(<Lesson1_WhatIsOctal onComplete={mockOnComplete} />)
      
      fireEvent.click(screen.getByText('Let\'s Find Out'))
      fireEvent.click(screen.getByText('Next Question'))
      fireEvent.click(screen.getByText('Next Question'))
      
      expect(screen.getByText('1 → ? → 64')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper button labels', () => {
      render(<Lesson1_WhatIsOctal onComplete={mockOnComplete} />)
      
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should be keyboard navigable', () => {
      render(<Lesson1_WhatIsOctal onComplete={mockOnComplete} />)
      
      const startButton = screen.getByText('Let\'s Find Out')
      expect(startButton).toBeEnabled()
    })
  })
})