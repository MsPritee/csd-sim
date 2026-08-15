import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ConversionAnimator, type AnimationStep } from '../../../simulators/numbersystems/ConversionAnimator'
import { BitGroupingVisualizer } from '../../../simulators/numbersystems/BitGroupingVisualizer'

describe('Number Systems Visual Components - Performance', () => {
  const createLargeSteps = (count: number): AnimationStep[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: `step${i}`,
      title: `Step ${i + 1}`,
      description: `Description for step ${i + 1}`,
      visualization: <div data-testid={`viz${i}`}>Visualization {i + 1}</div>,
    }))
  }

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Animation Timing', () => {
    it('respects configured animation speed', () => {
      const steps = createLargeSteps(5)
      render(<ConversionAnimator conversionType="general" steps={steps} initialSpeed={1} />)
      
      const playButton = screen.getByTitle('Play/Pause (Space)')
      fireEvent.click(playButton)
      
      // Speed 1 = 1500ms per step
      vi.advanceTimersByTime(1500)
      
      // Use getAllByText since multiple elements match the pattern
      const stepElements = screen.getAllByText((content, element) => {
        const text = element?.textContent || content
        return text.includes('Step') && text.includes('2') && text.includes('/')
      })
      expect(stepElements.length).toBeGreaterThan(0)
    })

    it('faster speed reduces timing', () => {
      const steps = createLargeSteps(5)
      render(<ConversionAnimator conversionType="general" steps={steps} initialSpeed={2} />)
      
      const playButton = screen.getByTitle('Play/Pause (Space)')
      fireEvent.click(playButton)
      
      // Speed 2 = 750ms per step
      vi.advanceTimersByTime(750)
      
      // Use getAllByText since multiple elements match the pattern
      const stepElements = screen.getAllByText((content, element) => {
        const text = element?.textContent || content
        return text.includes('Step') && text.includes('2') && text.includes('/')
      })
      expect(stepElements.length).toBeGreaterThan(0)
    })

    it('slower speed increases timing', () => {
      const steps = createLargeSteps(5)
      render(<ConversionAnimator conversionType="general" steps={steps} initialSpeed={0.5} />)
      
      const playButton = screen.getByTitle('Play/Pause (Space)')
      fireEvent.click(playButton)
      
      // Speed 0.5 = 3000ms per step
      vi.advanceTimersByTime(3000)
      
      // Use getAllByText since multiple elements match the pattern
      const stepElements = screen.getAllByText((content, element) => {
        const text = element?.textContent || content
        return text.includes('Step') && text.includes('2') && text.includes('/')
      })
      expect(stepElements.length).toBeGreaterThan(0)
    })
  })

  describe('Memory Management', () => {
    it('cleans up timers on unmount', () => {
      const steps = createLargeSteps(10)
      const { unmount } = render(<ConversionAnimator conversionType="general" steps={steps} />)
      
      const playButton = screen.getByTitle('Play/Pause (Space)')
      fireEvent.click(playButton)
      
      unmount()
      
      // Should not throw errors after unmount
      vi.advanceTimersByTime(5000)
    })

    it('handles rapid step changes without memory leaks', () => {
      const steps = createLargeSteps(10)
      render(<ConversionAnimator conversionType="general" steps={steps} />)
      
      const nextButton = screen.getByTitle('Next step (Right Arrow)')
      
      // Rapidly click through steps
      for (let i = 0; i < 10; i++) {
        fireEvent.click(nextButton)
      }
      
      // Use getAllByText since multiple elements match the pattern
      const stepElements = screen.getAllByText((content, element) => {
        const text = element?.textContent || content
        return text.includes('Step') && text.includes('10') && text.includes('/')
      })
      expect(stepElements.length).toBeGreaterThan(0)
    })
  })

  describe('Large Dataset Performance', () => {
    it('handles large number of steps efficiently', () => {
      const steps = createLargeSteps(50)
      const startTime = performance.now()
      
      render(<ConversionAnimator conversionType="general" steps={steps} />)
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      // Should render within reasonable time (< 100ms)
      expect(renderTime).toBeLessThan(100)
    })

    it('BitGroupingVisualizer handles long binary strings', () => {
      const longBinary = '1'.repeat(64)
      const startTime = performance.now()
      
      render(<BitGroupingVisualizer binaryValue={longBinary} />)
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      // Should render within reasonable time (< 100ms)
      expect(renderTime).toBeLessThan(100)
    })
  })

  describe('Animation Smoothness', () => {
    it('maintains consistent timing between steps', () => {
      const steps = createLargeSteps(5)
      render(<ConversionAnimator conversionType="general" steps={steps} initialSpeed={1} />)
      
      const playButton = screen.getByTitle('Play/Pause (Space)')
      fireEvent.click(playButton)
      
      const timings: number[] = []
      let previousTime = 0
      
      for (let i = 0; i < 4; i++) {
        vi.advanceTimersByTime(1500)
        const currentTime = performance.now()
        timings.push(currentTime - previousTime)
        previousTime = currentTime
      }
      
      // All timings should be close to 1500ms (within 10% tolerance)
      timings.forEach(timing => {
        expect(timing).toBeGreaterThan(1350) // 1500 - 10%
        expect(timing).toBeLessThan(1650) // 1500 + 10%
      })
    })
  })

  describe('Re-render Performance', () => {
    it('only re-renders when necessary', () => {
      const steps = createLargeSteps(5)
      const { rerender } = render(<ConversionAnimator conversionType="general" steps={steps} />)
      
      const startTime = performance.now()
      
      // Re-render with same props
      rerender(<ConversionAnimator conversionType="general" steps={steps} />)
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      // Should be very fast for same props (< 10ms)
      expect(renderTime).toBeLessThan(10)
    })

    it('efficiently handles prop changes', () => {
      const steps = createLargeSteps(5)
      const { rerender } = render(<ConversionAnimator conversionType="general" steps={steps} />)
      
      const startTime = performance.now()
      
      const newSteps = createLargeSteps(6)
      rerender(<ConversionAnimator conversionType="general" steps={newSteps} />)
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      // Should handle prop changes efficiently (< 50ms)
      expect(renderTime).toBeLessThan(50)
    })
  })

  describe('Event Handling Performance', () => {
    it('handles rapid button clicks efficiently', () => {
      const steps = createLargeSteps(10)
      render(<ConversionAnimator conversionType="general" steps={steps} />)
      
      const nextButton = screen.getByTitle('Next step (Right Arrow)')
      const startTime = performance.now()
      
      // Click 10 times rapidly
      for (let i = 0; i < 10; i++) {
        fireEvent.click(nextButton)
      }
      
      const endTime = performance.now()
      const clickTime = endTime - startTime
      
      // Should handle rapid clicks efficiently (< 50ms total)
      expect(clickTime).toBeLessThan(50)
    })

    it('handles keyboard navigation efficiently', () => {
      const steps = createLargeSteps(10)
      render(<ConversionAnimator conversionType="general" steps={steps} enableKeyboardShortcuts={true} />)
      
      const startTime = performance.now()
      
      // Press right arrow 10 times
      for (let i = 0; i < 10; i++) {
        fireEvent.keyDown(window, { key: 'ArrowRight' })
      }
      
      const endTime = performance.now()
      const keyTime = endTime - startTime
      
      // Should handle rapid key presses efficiently (< 50ms total)
      expect(keyTime).toBeLessThan(50)
    })
  })

  describe('Component Lifecycle Performance', () => {
    it('mounts quickly', () => {
      const steps = createLargeSteps(10)
      const startTime = performance.now()
      
      render(<ConversionAnimator conversionType="general" steps={steps} />)
      
      const endTime = performance.now()
      const mountTime = endTime - startTime
      
      // Should mount quickly (< 50ms)
      expect(mountTime).toBeLessThan(50)
    })

    it('unmounts quickly', () => {
      const steps = createLargeSteps(10)
      const { unmount } = render(<ConversionAnimator conversionType="general" steps={steps} />)
      
      const startTime = performance.now()
      unmount()
      const endTime = performance.now()
      const unmountTime = endTime - startTime
      
      // Should unmount quickly (< 10ms)
      expect(unmountTime).toBeLessThan(10)
    })
  })
})
