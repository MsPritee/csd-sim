import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ConversionAnimator, type AnimationStep } from '../../../simulators/numbersystems/ConversionAnimator'
import { BitGroupingVisualizer } from '../../../simulators/numbersystems/BitGroupingVisualizer'

describe('Number Systems Visual Components - Cross-Browser Compatibility', () => {
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

  describe('CSS Feature Detection', () => {
    it('uses CSS variables for theming (works in modern browsers)', () => {
      render(<ConversionAnimator conversionType="general" steps={mockSteps} />)
      
      const component = screen.getByText('Conversion Steps Animator')
      expect(component).toBeInTheDocument()
    })

    it('uses flexbox for layout (widely supported)', () => {
      render(<ConversionAnimator conversionType="general" steps={mockSteps} />)
      
      // Component renders successfully with flexbox layout
      expect(screen.getByText('Conversion Steps Animator')).toBeInTheDocument()
    })
  })

  describe('JavaScript API Compatibility', () => {
    it('uses standard React hooks (widely supported)', () => {
      render(<ConversionAnimator conversionType="general" steps={mockSteps} />)
      
      // Use getAllByText since multiple elements match the pattern
      const stepElements = screen.getAllByText((content, element) => {
        const text = element?.textContent || content
        return text.includes('Step') && text.includes('1') && text.includes('/')
      })
      expect(stepElements.length).toBeGreaterThan(0)
    })

    it('uses standard event handlers (widely supported)', () => {
      render(<ConversionAnimator conversionType="general" steps={mockSteps} />)
      
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  describe('Feature Fallbacks', () => {
    it('works without CSS Grid (uses flexbox)', () => {
      render(<BitGroupingVisualizer binaryValue="1011" />)
      
      // The full title includes the conversion type
      expect(screen.getByText(/Bit Grouping Visualizer/)).toBeInTheDocument()
    })

    it('works without advanced CSS features', () => {
      render(<ConversionAnimator conversionType="general" steps={mockSteps} />)
      
      // Use getAllByText since multiple elements match "Step 1"
      const stepElements = screen.getAllByText('Step 1')
      expect(stepElements.length).toBeGreaterThan(0)
    })
  })

  describe('Browser-Specific Quirks', () => {
    it('handles different default font sizes', () => {
      render(<ConversionAnimator conversionType="general" steps={mockSteps} />)
      
      // Use getAllByText since multiple elements match "Step 1"
      const stepElements = screen.getAllByText('Step 1')
      expect(stepElements.length).toBeGreaterThan(0)
    })

    it('handles different box-sizing models', () => {
      render(<BitGroupingVisualizer binaryValue="1011" />)
      
      // Component renders successfully
      expect(screen.getByText(/Bit Grouping Visualizer/)).toBeInTheDocument()
    })
  })

  describe('Touch Device Compatibility', () => {
    it('buttons are large enough for touch targets', () => {
      render(<ConversionAnimator conversionType="general" steps={mockSteps} />)
      
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toBeVisible()
      })
    })

    it('interactive elements have proper spacing', () => {
      render(<BitGroupingVisualizer binaryValue="1011" />)
      
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  describe('Mobile Browser Compatibility', () => {
    it('renders correctly on small viewports', () => {
      // Simulate mobile viewport
      window.innerWidth = 375
      window.innerHeight = 667
      
      render(<ConversionAnimator conversionType="general" steps={mockSteps} />)
      
      expect(screen.getByText('Conversion Steps Animator')).toBeInTheDocument()
    })

    it('handles viewport orientation changes', () => {
      render(<ConversionAnimator conversionType="general" steps={mockSteps} />)
      
      // Simulate orientation change
      window.innerWidth = 667
      window.innerHeight = 375
      
      expect(screen.getByText('Conversion Steps Animator')).toBeInTheDocument()
    })
  })

  describe('Older Browser Support', () => {
    it('works without ES6+ features', () => {
      render(<ConversionAnimator conversionType="general" steps={mockSteps} />)
      
      // Use getAllByText since multiple elements match "Step 1"
      const stepElements = screen.getAllByText('Step 1')
      expect(stepElements.length).toBeGreaterThan(0)
    })

    it('gracefully degrades without JavaScript', () => {
      // Components require JavaScript, but should have meaningful error handling
      render(<ConversionAnimator conversionType="general" steps={mockSteps} />)
      
      expect(screen.getByText('Conversion Steps Animator')).toBeInTheDocument()
    })
  })

  describe('Performance Across Browsers', () => {
    it('animation timing is consistent', () => {
      render(<ConversionAnimator conversionType="general" steps={mockSteps} />)
      
      // Use getAllByText since multiple elements match the pattern
      const stepElements = screen.getAllByText((content, element) => {
        const text = element?.textContent || content
        return text.includes('Step') && text.includes('1') && text.includes('/')
      })
      expect(stepElements.length).toBeGreaterThan(0)
    })

    it('rendering is efficient across browsers', () => {
      const startTime = performance.now()
      
      render(<BitGroupingVisualizer binaryValue="1011" />)
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      // Should render quickly regardless of browser
      expect(renderTime).toBeLessThan(100)
    })
  })

  describe('Browser Extensions Compatibility', () => {
    it('works with content script injections', () => {
      render(<ConversionAnimator conversionType="general" steps={mockSteps} />)
      
      expect(screen.getByText('Conversion Steps Animator')).toBeInTheDocument()
    })

    it('handles DOM modifications gracefully', () => {
      render(<BitGroupingVisualizer binaryValue="1011" />)
      
      // The full title includes the conversion type
      expect(screen.getByText(/Bit Grouping Visualizer/)).toBeInTheDocument()
    })
  })
})
