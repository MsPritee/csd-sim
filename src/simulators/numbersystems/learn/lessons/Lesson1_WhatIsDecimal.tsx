/**
 * Lesson 1: Introduction to Number System
 * Creates curiosity by asking questions that will be answered in later lessons
 */

import { useState, useRef } from 'react'
import { Button } from '../../../../components/ui/Button'

interface Lesson1Props {
  onComplete?: () => void
}

interface Lesson1State {
  revealedQuestions: number[]
  allQuestionsRevealed: boolean
}

export function Lesson1_WhatIsDecimal({ onComplete }: Lesson1Props) {
  const [state, setState] = useState<Lesson1State>({
    revealedQuestions: [],
    allQuestionsRevealed: false
  })
  const completionCalled = useRef(false)

  const everydayNumbers = ['25', '100', '3.14', '2026']
  
  const questions = [
    {
      id: 1,
      question: "Why do we use only 10 digits?",
      visual: "0 1 2 3 4 5 6 7 8 9",
      answerIn: "Lesson 2"
    },
    {
      id: 2,
      question: "Why does the same digit have different values?",
      visual: "5       5       5\n↓       ↓       ↓\n5       50      500",
      answerIn: "Lesson 3"
    },
    {
      id: 3,
      question: "How does a digit get its value?",
      visual: "5 → ? → 500",
      answerIn: "Lesson 4"
    }
  ]

  const handleStartExploring = () => {
    // Reveal first question
    setState(prev => ({
      ...prev,
      revealedQuestions: [1]
    }))
  }

  const handleNextQuestion = () => {
    const nextQuestionId = state.revealedQuestions.length + 1
    if (nextQuestionId <= questions.length) {
      setState(prev => ({
        ...prev,
        revealedQuestions: [...prev.revealedQuestions, nextQuestionId]
      }))

      // Check if all questions revealed
      if (nextQuestionId === questions.length) {
        setTimeout(() => {
          setState(prev => ({ ...prev, allQuestionsRevealed: true }))
          if (!completionCalled.current) {
            completionCalled.current = true
            onComplete?.()
          }
        }, 1000)
      }
    }
  }

  const handleReset = () => {
    setState({
      revealedQuestions: [],
      allQuestionsRevealed: false
    })
    completionCalled.current = false
  }

  return (
    <div className="space-y-8">
      {/* Main content */}
      <div className="text-center space-y-6">
        <h2 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Meet the Decimal Number System
        </h2>

        {/* Everyday numbers */}
        <div className="space-y-4">
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            You see numbers everywhere:
          </p>
          <div className="flex justify-center gap-6 flex-wrap">
            {everydayNumbers.map((num) => (
              <div
                key={num}
                className="px-6 py-3 rounded-xl text-2xl font-bold"
                style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--accent-primary)' }}
              >
                {num}
              </div>
            ))}
          </div>
        </div>

        {/* Big question */}
        {state.revealedQuestions.length === 0 && (
          <div className="space-y-4 animate-fade-in">
            <p className="text-xl font-medium" style={{ color: 'var(--text-primary)' }}>
              But have you ever wondered how these numbers actually work?
            </p>
            <Button
              variant="primary"
              onClick={handleStartExploring}
              className="font-medium"
            >
              Let's Find Out
            </Button>
          </div>
        )}

        {/* Questions reveal */}
        {state.revealedQuestions.length > 0 && (
          <div className="space-y-6">
            {questions.slice(0, state.revealedQuestions.length).map((q, index) => (
              <div
                key={q.id}
                className="p-6 rounded-xl animate-fade-in-up"
                style={{ 
                  backgroundColor: 'var(--bg-tertiary)',
                  animationDelay: `${index * 200}ms`
                }}
              >
                <div className="space-y-4">
                  <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                    Question {q.id}: {q.question}
                  </p>
                  
                  <div className="p-4 rounded-lg font-mono text-sm" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                    <pre className="whitespace-pre-wrap text-center">{q.visual}</pre>
                  </div>

                  <div className="inline-block px-4 py-2 rounded-lg" style={{ backgroundColor: 'var(--accent-bg)' }}>
                    <p className="text-sm font-medium" style={{ color: 'var(--accent-primary)' }}>
                      → Find the answer in {q.answerIn}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Next question button */}
            {state.revealedQuestions.length < questions.length && (
              <Button
                variant="primary"
                onClick={handleNextQuestion}
                className="font-medium"
              >
                Next Question
              </Button>
            )}

            {/* Completion message */}
            {state.allQuestionsRevealed && (
              <div className="animate-fade-in-up p-6 rounded-xl" style={{ backgroundColor: 'var(--accent-bg)' }}>
                <p className="text-lg font-bold" style={{ color: 'var(--accent-primary)' }}>
                  🎯 Great! You've discovered the key questions about decimal numbers.
                </p>
                <p className="text-base mt-2" style={{ color: 'var(--text-secondary)' }}>
                  Let's explore the answers in the next lessons!
                </p>
                <Button
                  variant="secondary"
                  onClick={handleReset}
                  className="mt-4"
                >
                  Start Over
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* What is a number system */}
      <div className="mt-8 p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
        <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          What is a Number System?
        </h3>
        <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
          A number system is a way to represent numbers using symbols and rules. 
          The decimal system is just one of many possible number systems!
        </p>
      </div>
    </div>
  )
}
