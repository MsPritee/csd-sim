/**
 * Tests for OctalLearnModule component
 * Tests module integration and lesson rendering
 */

import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { OctalLearnModule } from '../../../../../simulators/numbersystems/learn/octal/OctalLearnModule'
import { useOctalLearnStore } from '../../../../../stores/octalLearnStore'

// Mock the store
vi.mock('../../../../../stores/octalLearnStore', () => ({
  useOctalLearnStore: vi.fn(() => ({
    currentLesson: 1,
    completedLessons: new Set<number>(),
    setCurrentLesson: vi.fn(),
    markLessonComplete: vi.fn()
  }))
}))

describe('OctalLearnModule', () => {
  const mockOnBackToHome = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render OctalLearnModule component', () => {
      render(<OctalLearnModule onBackToHome={mockOnBackToHome} />)
      
      // Module should render without errors
      expect(screen.getByText('Introduction to Octal Number System')).toBeInTheDocument()
    })

    it('should render back button', () => {
      render(<OctalLearnModule onBackToHome={mockOnBackToHome} />)
      
      const backButton = screen.getByText('← Back to Number Systems')
      expect(backButton).toBeInTheDocument()
    })

    it('should render lesson header', () => {
      render(<OctalLearnModule onBackToHome={mockOnBackToHome} />)
      
      expect(screen.getByText('Introduction to Octal Number System')).toBeInTheDocument()
    })
  })

  describe('Lesson Content', () => {
    it('should render Lesson 1 content', () => {
      render(<OctalLearnModule onBackToHome={mockOnBackToHome} />)
      
      expect(screen.getByText('Meet the Octal Number System')).toBeInTheDocument()
    })

    it('should render navigation buttons', () => {
      render(<OctalLearnModule onBackToHome={mockOnBackToHome} />)
      
      expect(screen.getByText('Previous')).toBeInTheDocument()
      expect(screen.getByText('Next Lesson')).toBeInTheDocument()
    })
  })

  describe('Integration', () => {
    it('should integrate with octalLearnStore', () => {
      render(<OctalLearnModule onBackToHome={mockOnBackToHome} />)
      
      // Store should be called during render
      expect(useOctalLearnStore).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      render(<OctalLearnModule onBackToHome={mockOnBackToHome} />)
      
      const mainHeading = screen.getByText('Introduction to Octal Number System')
      expect(mainHeading).toBeInTheDocument()
    })

    it('should have navigable elements', () => {
      render(<OctalLearnModule onBackToHome={mockOnBackToHome} />)
      
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })
})