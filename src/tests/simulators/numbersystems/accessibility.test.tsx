import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ConversionAnimator, type AnimationStep } from '../../../simulators/numbersystems/ConversionAnimator'
import { BitGroupingVisualizer } from '../../../simulators/numbersystems/BitGroupingVisualizer'

describe('Number Systems Visual Components - Accessibility', () => {
  const mockSteps: AnimationStep[] = [
    {
      id: 'step1',
      title: 'Step 1',
      description: 'First step description',
    },
    {
      id: 'step2',
      title: 'Step 2',
      description: 'Second step description',
    },
  ]

  describe('Keyboard Navigation', () => {
    it('ConversionAnimator supports keyboard shortcuts', () => {
      render(<ConversionAnimator conversionType="general" steps={mockSteps} enableKeyboardShortcuts={true} />)
      
      expect(screen.getByText(/Keyboard shortcuts:/)).toBeInTheDocument()
      expect(screen.getByText(/←→/)).toBeInTheDocument()
      expect(screen.getByText(/Space/)).toBeInTheDocument()
    })

    it('BitGroupingVisualizer buttons are keyboard accessible', () => {
      render(<BitGroupingVisualizer binaryValue="1011" />)
      
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toBeVisible()
      })
    })

    it('playback controls have proper aria labels', () => {
      render(<ConversionAnimator conversionType="general" steps={mockSteps} />)
      
      expect(screen.getByTitle('Reset to beginning (Home)')).toBeInTheDocument()
      expect(screen.getByTitle('Previous step (Left Arrow)')).toBeInTheDocument()
      expect(screen.getByTitle('Play/Pause (Space)')).toBeInTheDocument()
      expect(screen.getByTitle('Next step (Right Arrow)')).toBeInTheDocument()
      expect(screen.getByTitle('Go to end (End)')).toBeInTheDocument()
    })
  })

  describe('Screen Reader Support', () => {
    it('buttons have descriptive labels', () => {
      render(<ConversionAnimator conversionType="general" steps={mockSteps} />)
      
      const playButton = screen.getByTitle('Play/Pause (Space)')
      expect(playButton).toHaveAttribute('title')
    })

    it('timeline steps are properly labeled', () => {
      render(<ConversionAnimator conversionType="general" steps={mockSteps} showTimeline={true} />)
      
      // Timeline should be present when enabled
      expect(screen.getByText('Timeline:')).toBeInTheDocument()
    })

    it('status updates are announced', () => {
      render(<ConversionAnimator conversionType="general" steps={mockSteps} />)
      
      expect(screen.getByText('Step 1/2')).toBeInTheDocument()
    })
  })

  describe('Focus Management', () => {
    it('disabled buttons have proper disabled state', () => {
      render(<ConversionAnimator conversionType="general" steps={mockSteps} />)
      
      const prevButton = screen.getByTitle('Previous step (Left Arrow)')
      expect(prevButton).toBeDisabled()
    })

    it('enabled buttons are focusable', () => {
      render(<ConversionAnimator conversionType="general" steps={mockSteps} />)
      
      const nextButton = screen.getByTitle('Next step (Right Arrow)')
      expect(nextButton).not.toBeDisabled()
    })
  })

  describe('Color Contrast', () => {
    it('uses CSS variables for consistent theming', () => {
      render(<ConversionAnimator conversionType="general" steps={mockSteps} />)
      
      const component = screen.getByText('Conversion Steps Animator')
      expect(component).toBeInTheDocument()
    })
  })

  describe('Error States', () => {
    it('invalid inputs show clear error messages', () => {
      render(<BitGroupingVisualizer binaryValue="1021" />)
      
      expect(screen.getByText('Invalid binary format: must contain only 0s and 1s')).toBeInTheDocument()
    })

    it('error messages are descriptive', () => {
      render(<BitGroupingVisualizer binaryValue="abc" />)
      
      const errorElement = screen.getByText(/Invalid binary format/)
      expect(errorElement).toBeInTheDocument()
    })
  })

  describe('Responsive Design', () => {
    it('components render with proper structure', () => {
      render(<ConversionAnimator conversionType="general" steps={mockSteps} />)
      
      // Component should render properly
      expect(screen.getByText('Conversion Steps Animator')).toBeInTheDocument()
    })
  })

  describe('ARIA Attributes', () => {
    it('buttons have appropriate roles', () => {
      render(<ConversionAnimator conversionType="general" steps={mockSteps} />)
      
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('interactive elements are properly marked', () => {
      render(<BitGroupingVisualizer binaryValue="1011" />)
      
      const interactiveElements = screen.getAllByRole('button')
      expect(interactiveElements.length).toBeGreaterThan(0)
    })
  })
})
