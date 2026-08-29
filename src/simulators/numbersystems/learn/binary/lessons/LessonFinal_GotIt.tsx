/**
 * Lesson Final: Congratulations
 * Final lesson showing completion and celebration
 */

import { Button } from '../../../../../components/ui/Button'

interface LessonFinalProps {
  onComplete?: () => void
}

export function LessonFinal_GotIt({ onComplete }: LessonFinalProps) {
  const handleComplete = () => {
    onComplete?.()
  }

  return (
    <div className="space-y-8">
      {/* Main content */}
      <div className="text-center space-y-6">
        <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          🎉 Congratulations!
        </h2>

        <div className="space-y-4">
          <p className="text-xl" style={{ color: 'var(--text-primary)' }}>
            You've completed the Binary Number System learning module!
          </p>

          <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--accent-bg)' }}>
            <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--accent-primary)' }}>
              What you learned:
            </h3>
            <div className="text-left space-y-2" style={{ color: 'var(--text-secondary)' }}>
              <p>✅ Lesson 1: What is a number system and why binary matters</p>
              <p>✅ Lesson 2: What base means and why binary is base 2</p>
              <p>✅ Lesson 3: How position affects digit values</p>
              <p>✅ Lesson 4: How to calculate position value using powers of 2</p>
              <p>✅ Lesson 5: Applied your knowledge through challenges</p>
            </div>
          </div>

          <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
            <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
              Key Takeaways:
            </h3>
            <div className="text-left space-y-2" style={{ color: 'var(--text-secondary)' }}>
              <p>• Binary uses only 2 digits: 0 and 1</p>
              <p>• Each position represents a power of 2 (1, 2, 4, 8, 16...)</p>
              <p>• Position determines the value of each digit</p>
              <p>• Binary is the foundation of how computers store and process information</p>
            </div>
          </div>

          <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--success-bg)' }}>
            <p className="text-lg font-bold" style={{ color: 'var(--success-text)' }}>
              🚀 You're now ready to explore more number systems and conversions!
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          onClick={handleComplete}
          className="font-medium"
        >
          Got it!
        </Button>
      </div>
    </div>
  )
}