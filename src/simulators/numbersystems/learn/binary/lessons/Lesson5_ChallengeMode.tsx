/**
 * Lesson 5: Challenge Mode
 * Game-like challenges to test understanding of L1-L4 concepts for binary
 */

import { useState, useRef } from 'react'
import { Button } from '../../../../../components/ui/Button'

interface Lesson5Props {
  onComplete?: () => void
}

interface Lesson5State {
  currentChallenge: number
  correctAnswers: number
  showResult: boolean
  selectedAnswer: string | null
  builderDigits: [number, number, number]
}

export function Lesson5_ChallengeMode({ onComplete }: Lesson5Props) {
  const [state, setState] = useState<Lesson5State>({
    currentChallenge: 1,
    correctAnswers: 0,
    showResult: false,
    selectedAnswer: null,
    builderDigits: [0, 0, 0]
  })
  const completionCalled = useRef(false)

  const challenges = [
    {
      id: 1,
      type: 'multiple-choice',
      question: 'Which decimal number is represented?',
      display: '1 × 4\n0 × 2\n1 × 1',
      options: ['5', '4', '6'],
      correct: '5'
    },
    {
      id: 2,
      type: 'multiple-choice',
      question: 'What is the place value of the middle 1?',
      display: '111',
      options: ['1', '2', '4'],
      correct: '2'
    },
    {
      id: 3,
      type: 'explanation',
      question: 'Why are these different?',
      display: '1       1       1\n↓       ↓       ↓\n1       2       4',
      options: ['Different digits', 'Different positions', 'Different bases'],
      correct: 'Different positions'
    },
    {
      id: 4,
      type: 'builder',
      question: 'Build the binary number',
      target: 5, // 101 in binary
      positionNames: ['Fours', 'Twos', 'Ones']
    }
  ]

  const currentChallengeData = challenges[state.currentChallenge - 1]

  const handleAnswerSelect = (answer: string) => {
    if (state.showResult) return

    setState(prev => ({ ...prev, selectedAnswer: answer, showResult: true }))

    const isCorrect = answer === currentChallengeData.correct
    if (isCorrect) {
      setState(prev => ({ ...prev, correctAnswers: prev.correctAnswers + 1 }))
    }

    // Auto-advance after showing result
    setTimeout(() => {
      handleNextChallenge()
    }, 1500)
  }

  const handleBuilderDigitChange = (position: number, value: number) => {
    const newDigits = [...state.builderDigits] as [number, number, number]
    newDigits[position] = value
    setState(prev => ({ ...prev, builderDigits: newDigits }))

    // Check if builder challenge is complete
    if (currentChallengeData.type === 'builder') {
      const builtNumber = newDigits[0] * 4 + newDigits[1] * 2 + newDigits[2] * 1
      if (builtNumber === currentChallengeData.target) {
        setState(prev => ({ ...prev, correctAnswers: prev.correctAnswers + 1, showResult: true }))
        
        setTimeout(() => {
          handleNextChallenge()
        }, 1500)
      }
    }
  }

  const handleNextChallenge = () => {
    if (state.currentChallenge < challenges.length) {
      setState(prev => ({
        ...prev,
        currentChallenge: prev.currentChallenge + 1,
        showResult: false,
        selectedAnswer: null,
        builderDigits: [0, 0, 0]
      }))
    } else {
      // All challenges complete
      if (!completionCalled.current) {
        completionCalled.current = true
        onComplete?.()
      }
    }
  }

  const handleReset = () => {
    setState({
      currentChallenge: 1,
      correctAnswers: 0,
      showResult: false,
      selectedAnswer: null,
      builderDigits: [0, 0, 0]
    })
    completionCalled.current = false
  }

  const isComplete = state.currentChallenge > challenges.length

  return (
    <div className="space-y-8">
      {/* Main content */}
      <div className="text-center space-y-6">
        <h2 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
          🎮 Challenge Mode
        </h2>

        <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
          Test everything you learned in Lessons 1-4 about binary!
        </p>

        {/* Progress indicator */}
        <div className="flex justify-center items-center gap-2">
          {challenges.map((_, index) => (
            <div
              key={index}
              className={`w-8 h-2 rounded-full ${
                index + 1 <= state.currentChallenge ? 'bg-current' : 'bg-gray-300'
              }`}
              style={{
                backgroundColor: index + 1 <= state.currentChallenge ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                color: index + 1 <= state.currentChallenge ? 'var(--accent-primary)' : 'var(--text-muted)'
              }}
            />
          ))}
        </div>

        {/* Challenge content */}
        {!isComplete && currentChallengeData && (
          <div className="space-y-6">
            {/* Challenge header */}
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                Challenge {state.currentChallenge} of {challenges.length}
              </p>
              <p className="text-xl font-bold mt-2" style={{ color: 'var(--text-primary)' }}>
                {currentChallengeData.question}
              </p>
            </div>

            {/* Challenge display */}
            <div className="p-6 rounded-lg font-mono text-sm whitespace-pre-line text-center" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
              <pre className="whitespace-pre-wrap text-center">{currentChallengeData.display}</pre>
            </div>

            {/* Multiple choice options */}
            {currentChallengeData.type === 'multiple-choice' && currentChallengeData.options && (
              <div className="space-y-3">
                {currentChallengeData.options.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleAnswerSelect(option)}
                    disabled={state.showResult}
                    className={`w-full p-4 rounded-lg text-lg font-medium transition-all ${
                      state.showResult && state.selectedAnswer === option
                        ? option === currentChallengeData.correct
                          ? 'bg-green-100 border-green-500'
                          : 'bg-red-100 border-red-500'
                        : 'hover:scale-102'
                    }`}
                    style={{
                      backgroundColor: state.showResult && state.selectedAnswer === option
                        ? option === currentChallengeData.correct
                          ? 'var(--success-bg)'
                          : 'var(--error-bg)'
                        : 'var(--bg-tertiary)',
                      border: state.showResult && state.selectedAnswer === option ? '2px solid' : 'none',
                      borderColor: state.showResult && state.selectedAnswer === option
                        ? option === currentChallengeData.correct
                          ? 'var(--success-text)'
                          : 'var(--error-text)'
                        : 'transparent',
                      color: state.showResult && state.selectedAnswer === option
                        ? option === currentChallengeData.correct
                          ? 'var(--success-text)'
                          : 'var(--error-text)'
                        : 'var(--text-primary)',
                      opacity: state.showResult && state.selectedAnswer !== option ? '0.5' : '1'
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            {/* Builder challenge */}
            {currentChallengeData.type === 'builder' && currentChallengeData.positionNames && (
              <div className="space-y-4">
                <div className="flex justify-center gap-4">
                  {currentChallengeData.positionNames.map((name, index) => (
                    <div key={index} className="text-center">
                      <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>{name}</p>
                      <select
                        value={state.builderDigits[index]}
                        onChange={(e) => handleBuilderDigitChange(index, parseInt(e.target.value))}
                        className="w-20 h-20 rounded-xl text-3xl font-bold text-center"
                        style={{
                          backgroundColor: 'var(--bg-tertiary)',
                          color: 'var(--text-primary)',
                          border: '2px solid var(--border-color)'
                        }}
                      >
                        {[0, 1].map((digit) => (
                          <option key={digit} value={digit}>{digit}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Target decimal: {currentChallengeData.target}</p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Your binary: {state.builderDigits.join('')}</p>
                  <p className="text-2xl font-bold mt-1" style={{ color: 'var(--accent-primary)' }}>
                    Calculated: {state.builderDigits[0] * 4 + state.builderDigits[1] * 2 + state.builderDigits[2] * 1}
                  </p>
                </div>

                {state.showResult && (
                  <div className="p-4 rounded-lg animate-fade-in" style={{ backgroundColor: 'var(--success-bg)' }}>
                    <p className="text-lg font-bold" style={{ color: 'var(--success-text)' }}>
                      🎉 Correct!
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Result feedback */}
            {state.showResult && currentChallengeData.type === 'multiple-choice' && (
              <div className={`p-4 rounded-lg animate-fade-in ${
                state.selectedAnswer === currentChallengeData.correct
                  ? 'var(--success-bg)'
                  : 'var(--error-bg)'
              }`}>
                <p className={`text-lg font-bold ${
                  state.selectedAnswer === currentChallengeData.correct
                    ? 'var(--success-text)'
                    : 'var(--error-text)'
                }`}>
                  {state.selectedAnswer === currentChallengeData.correct ? '✅ Correct!' : '❌ Try again next time!'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Completion screen */}
        {isComplete && (
          <div className="animate-fade-in-up space-y-6">
            <div className="p-8 rounded-xl" style={{ backgroundColor: 'var(--accent-bg)' }}>
              <p className="text-3xl font-bold mb-4" style={{ color: 'var(--accent-primary)' }}>
                🎉 Challenge Complete!
              </p>
              <p className="text-xl" style={{ color: 'var(--text-primary)' }}>
                You got {state.correctAnswers} out of {challenges.length} correct!
              </p>
              {state.correctAnswers === challenges.length && (
                <p className="text-lg mt-2" style={{ color: 'var(--text-secondary)' }}>
                  Perfect score! You've mastered binary number systems!
                </p>
              )}
            </div>

            <Button
              variant="primary"
              onClick={handleReset}
              className="font-medium"
            >
              Try Again
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}