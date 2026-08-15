/**
 * AnimatedPhaseTransition - Handles smooth phase change animations
 * Provides cross-fade transitions between different phases of the conversion
 */

import { useState, useEffect } from 'react'

interface AnimatedPhaseTransitionProps {
  readonly phase: string
  readonly children: React.ReactNode
  readonly className?: string
}

export function AnimatedPhaseTransition({
  phase,
  children,
  className = '',
}: AnimatedPhaseTransitionProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [displayPhase, setDisplayPhase] = useState(phase)

  useEffect(() => {
    if (phase !== displayPhase) {
      setIsAnimating(true)
      
      // Small delay to allow fade-out animation
      const timer = setTimeout(() => {
        setDisplayPhase(phase)
        setIsAnimating(false)
      }, 150)

      return () => clearTimeout(timer)
    }
  }, [phase, displayPhase])

  return (
    <div
      className={`transition-all duration-300 ${
        isAnimating ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
      } ${className}`}
    >
      {children}
    </div>
  )
}
