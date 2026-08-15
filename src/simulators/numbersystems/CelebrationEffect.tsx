/**
 * CelebrationEffect - Moderate confetti/burst animation on completion
 * Provides celebratory feedback when students complete the conversion successfully
 */

import { useEffect, useState } from 'react'

interface CelebrationEffectProps {
  readonly trigger: boolean
  readonly onComplete?: () => void
}

export function CelebrationEffect({ trigger, onComplete }: CelebrationEffectProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; color: string; delay: number }>>([])

  useEffect(() => {
    if (trigger && !isVisible) {
      // Generate particles
      const colors = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6']
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.5,
      }))
      
      setParticles(newParticles)
      setIsVisible(true)

      // Hide after animation completes
      const timer = setTimeout(() => {
        setIsVisible(false)
        if (onComplete) onComplete()
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [trigger, isVisible, onComplete])

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (prefersReducedMotion || !isVisible) {
    return null
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-3 h-3 rounded-full animate-confetti-burst"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            backgroundColor: particle.color,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
    </div>
  )
}
