/**
 * ConversionPractice - Practice mode with visual hints for number system conversions
 * Provides interactive practice problems with progressive visual guidance
 */

import { useState, useCallback, useEffect } from 'react'
import type { NumberSystem } from '../../core/numbersystems/types'
import { Card } from '../../components/ui'
import { Button } from '../../components/ui'
import { Input } from '../../components/ui'
import { Alert } from '../../components/ui'
import { orchestrateConversion, calculatePositionValues } from '../../application/numbersystems'
import { ConversionAnimator } from './ConversionAnimator'
import { createDivisionSteps, createPositionValueSteps } from './AnimationAdapters'

type HintLevel = 0 | 1 | 2 | 3 | 4

interface PracticeProblem {
  readonly id: string
  readonly fromSystem: NumberSystem
  readonly toSystem: NumberSystem
  readonly inputValue: string
  readonly correctAnswer: string
  readonly difficulty: 'easy' | 'medium' | 'hard'
}

interface ScoreData {
  readonly correct: number
  readonly incorrect: number
  readonly total: number
  readonly streak: number
  readonly hintsUsed: number
}

interface ConversionPracticeProps {
  readonly onBackToHome: () => void
  readonly preferredSystem?: NumberSystem
}

export function ConversionPractice({ onBackToHome, preferredSystem = 'decimal' }: ConversionPracticeProps) {
  const [currentProblem, setCurrentProblem] = useState<PracticeProblem | null>(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [hintLevel, setHintLevel] = useState<HintLevel>(0)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null)
  const [score, setScore] = useState<ScoreData>({ correct: 0, incorrect: 0, total: 0, streak: 0, hintsUsed: 0 })
  const [showAnswer, setShowAnswer] = useState(false)
  const [fromSystem, setFromSystem] = useState<NumberSystem>(preferredSystem)
  const [toSystem, setToSystem] = useState<NumberSystem>('binary')
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')

  // Generate random practice problem
  const generateProblem = useCallback(() => {
    let value: string
    let maxVal: number

    switch (difficulty) {
      case 'easy':
        maxVal = fromSystem === 'decimal' ? 15 : 7
        break
      case 'medium':
        maxVal = fromSystem === 'decimal' ? 63 : 15
        break
      case 'hard':
        maxVal = fromSystem === 'decimal' ? 255 : 31
        break
    }

    if (fromSystem === 'decimal') {
      value = Math.floor(Math.random() * (maxVal + 1)).toString()
    } else if (fromSystem === 'binary') {
      const bitLength = Math.floor(Math.log2(maxVal + 1))
      value = Array.from({ length: bitLength }, () => Math.random() > 0.5 ? '1' : '0').join('')
    } else if (fromSystem === 'hexadecimal') {
      const hexChars = '0123456789ABCDEF'
      const maxLength = Math.floor(Math.log10(maxVal + 1) / Math.log10(16)) + 1
      value = Array.from({ length: maxLength }, () => hexChars[Math.floor(Math.random() * 16)]).join('')
    } else {
      const octalChars = '01234567'
      const maxLength = Math.floor(Math.log10(maxVal + 1) / Math.log10(8)) + 1
      value = Array.from({ length: maxLength }, () => octalChars[Math.floor(Math.random() * 8)]).join('')
    }

    // Get correct answer
    const conversion = orchestrateConversion({
      value,
      fromSystem,
      toSystem,
      showSteps: true,
    })

    if (!conversion.success || !conversion.result) {
      return generateProblem() // Retry if conversion fails
    }

    const newProblem: PracticeProblem = {
      id: Date.now().toString(),
      fromSystem,
      toSystem,
      inputValue: value,
      correctAnswer: conversion.result.toString(),
      difficulty,
    }

    setCurrentProblem(newProblem)
    setUserAnswer('')
    setHintLevel(0)
    setFeedback(null)
    setShowAnswer(false)
  }, [fromSystem, toSystem, difficulty])

  // Initialize with first problem
  useEffect(() => {
    generateProblem()
  }, [generateProblem])

  // Check answer
  const checkAnswer = useCallback(() => {
    if (!currentProblem) return

    const isCorrect = userAnswer.trim().toUpperCase() === currentProblem.correctAnswer.toUpperCase()

    if (isCorrect) {
      setFeedback({ type: 'success', message: 'Correct! Great job!' })
      setScore(prev => ({
        ...prev,
        correct: prev.correct + 1,
        total: prev.total + 1,
        streak: prev.streak + 1,
      }))
    } else {
      setFeedback({ type: 'error', message: `Incorrect. The correct answer is ${currentProblem.correctAnswer}` })
      setScore(prev => ({
        ...prev,
        incorrect: prev.incorrect + 1,
        total: prev.total + 1,
        streak: 0,
      }))
      setShowAnswer(true)
    }
  }, [currentProblem, userAnswer])

  // Show hint
  const showHint = useCallback(() => {
    if (hintLevel < 4) {
      setHintLevel((prev) => (prev + 1) as HintLevel)
      setScore(prev => ({
        ...prev,
        hintsUsed: prev.hintsUsed + 1,
      }))
    }
  }, [hintLevel])

  // Get hint content based on level
  const getHintContent = () => {
    if (!currentProblem) return null

    const conversion = orchestrateConversion({
      value: currentProblem.inputValue,
      fromSystem: currentProblem.fromSystem,
      toSystem: currentProblem.toSystem,
      showSteps: true,
    })

    switch (hintLevel) {
      case 1:
        // Show conversion method explanation
        return (
          <Alert variant="info">
            <div className="font-medium mb-1">Hint 1: Conversion Method</div>
            <div className="text-sm">
              {currentProblem.fromSystem === 'decimal' 
                ? `Use the division method: divide ${currentProblem.inputValue} by ${currentProblem.toSystem === 'binary' ? 2 : currentProblem.toSystem === 'octal' ? 8 : 16} and collect remainders.`
                : currentProblem.toSystem === 'decimal'
                ? `Use position values: multiply each digit by its place value and sum the results.`
                : `Convert via binary: ${currentProblem.fromSystem} → binary → ${currentProblem.toSystem}`}
            </div>
          </Alert>
        )

      case 2:
        // Show first step or position breakdown
        if (currentProblem.fromSystem === 'decimal') {
          const decimalValue = parseInt(currentProblem.inputValue, 10)
          const targetBase = currentProblem.toSystem === 'binary' ? 2 : currentProblem.toSystem === 'octal' ? 8 : 16
          const firstDivision = Math.floor(decimalValue / targetBase)
          const firstRemainder = decimalValue % targetBase
          
          return (
            <Alert variant="info">
              <div className="font-medium mb-1">Hint 2: First Step</div>
              <div className="text-sm font-mono">
                {currentProblem.inputValue} ÷ {targetBase} = {firstDivision} with remainder {firstRemainder}
              </div>
              <div className="text-xs mt-1">Continue dividing the quotient ({firstDivision})</div>
            </Alert>
          )
        } else if (currentProblem.toSystem === 'decimal') {
          const positionData = calculatePositionValues(currentProblem.inputValue, currentProblem.fromSystem)
          if (positionData.success && positionData.positions.length > 0) {
            const firstPos = positionData.positions[0]
            return (
              <Alert variant="info">
                <div className="font-medium mb-1">Hint 2: First Position</div>
                <div className="text-sm font-mono">
                  {firstPos.digit} × {firstPos.positionValue} = {firstPos.contribution}
                </div>
                <div className="text-xs mt-1">Continue with remaining positions</div>
              </Alert>
            )
          }
        }
        return null

      case 3:
        // Show complete visual aid
        if (currentProblem.fromSystem === 'decimal' && conversion.divisionSteps) {
          return (
            <div className="space-y-2">
              <Alert variant="info">
                <div className="font-medium mb-1">Hint 3: Complete Division Table</div>
              </Alert>
              <ConversionAnimator
                conversionType="division"
                steps={createDivisionSteps(
                  conversion.divisionSteps.steps,
                  conversion.divisionSteps.targetBase,
                  conversion.divisionSteps.decimalValue,
                  conversion.divisionSteps.result
                )}
                initialSpeed={1.5}
                showTimeline={true}
                showSpeedControl={false}
                enableKeyboardShortcuts={false}
              />
            </div>
          )
        } else if (currentProblem.toSystem === 'decimal') {
          const positionData = calculatePositionValues(currentProblem.inputValue, currentProblem.fromSystem)
          if (positionData.success) {
            return (
              <div className="space-y-2">
                <Alert variant="info">
                  <div className="font-medium mb-1">Hint 3: Complete Position Breakdown</div>
                </Alert>
                <ConversionAnimator
                  conversionType="position-value"
                  steps={createPositionValueSteps(positionData, currentProblem.fromSystem as 'binary' | 'octal' | 'hexadecimal')}
                  initialSpeed={1.5}
                  showTimeline={true}
                  showSpeedControl={false}
                  enableKeyboardShortcuts={false}
                />
              </div>
            )
          }
        }
        return null

      case 4:
        // Show answer
        return (
          <Alert variant="warning">
            <div className="font-medium mb-1">Hint 4: Answer</div>
            <div className="text-lg font-mono font-bold">
              {currentProblem.inputValue} ({currentProblem.fromSystem}) = {currentProblem.correctAnswer} ({currentProblem.toSystem})
            </div>
          </Alert>
        )

      default:
        return null
    }
  }

  // Get hint button text
  const getHintButtonText = () => {
    switch (hintLevel) {
      case 0: return 'Show Hint 1'
      case 1: return 'Show Hint 2'
      case 2: return 'Show Hint 3'
      case 3: return 'Show Answer'
      case 4: return 'All Hints Used'
    }
  }

  const systems: NumberSystem[] = ['decimal', 'binary', 'hexadecimal', 'octal']

  return (
    <div>
      <nav
        className="px-4 py-1.5 flex items-center gap-4 border-b"
        style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
      >
        <Button
          variant="ghost"
          onClick={onBackToHome}
          className="font-medium"
        >
          Back to Home
        </Button>
      </nav>
      <div
        className="min-h-screen p-6"
        style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
      >
        <div className="max-w-4xl mx-auto space-y-6">
          <Card title="Number Systems Practice">
            {/* Configuration */}
            <div className="space-y-4 p-4 rounded-md" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    From System
                  </label>
                  <select
                    value={fromSystem}
                    onChange={(e) => setFromSystem(e.target.value as NumberSystem)}
                    className="w-full px-3 py-2 rounded-md"
                    style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                  >
                    {systems.map(system => (
                      <option key={system} value={system}>
                        {system.charAt(0).toUpperCase() + system.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    To System
                  </label>
                  <select
                    value={toSystem}
                    onChange={(e) => setToSystem(e.target.value as NumberSystem)}
                    className="w-full px-3 py-2 rounded-md"
                    style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                  >
                    {systems.filter(s => s !== fromSystem).map(system => (
                      <option key={system} value={system}>
                        {system.charAt(0).toUpperCase() + system.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Difficulty
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                    className="w-full px-3 py-2 rounded-md"
                    style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Score Display */}
            <div className="flex items-center justify-between p-4 rounded-md" style={{ backgroundColor: 'var(--accent-bg)', borderColor: 'var(--accent-border)', border: '1px solid' }}>
              <div className="flex gap-6">
                <div>
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Score: </span>
                  <span className="font-bold" style={{ color: 'var(--accent-primary)' }}>{score.correct}/{score.total}</span>
                </div>
                <div>
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Streak: </span>
                  <span className="font-bold" style={{ color: 'var(--success-text)' }}>{score.streak}🔥</span>
                </div>
                <div>
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Hints Used: </span>
                  <span className="font-bold" style={{ color: 'var(--warning-text)' }}>{score.hintsUsed}</span>
                </div>
              </div>
              <Button onClick={generateProblem} variant="primary">
                New Problem
              </Button>
            </div>

            {/* Problem Display */}
            {currentProblem && (
              <div className="space-y-4">
                <div
                  className="p-6 rounded-md border text-center"
                  style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
                >
                  <div className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Convert this value:
                  </div>
                  <div className="text-4xl font-mono font-bold mb-2" style={{ color: 'var(--accent-primary)' }}>
                    {currentProblem.inputValue}
                  </div>
                  <div className="text-lg" style={{ color: 'var(--text-primary)' }}>
                    {currentProblem.fromSystem.charAt(0).toUpperCase() + currentProblem.fromSystem.slice(1)} → {currentProblem.toSystem.charAt(0).toUpperCase() + currentProblem.toSystem.slice(1)}
                  </div>
                </div>

                {/* Answer Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    Your Answer:
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={userAnswer}
                      onChange={setUserAnswer}
                      onKeyDown={(e) => e.key === 'Enter' && checkAnswer()}
                      placeholder={`Enter ${currentProblem.toSystem} value`}
                      disabled={showAnswer}
                    />
                    <Button
                      onClick={checkAnswer}
                      variant="success"
                      disabled={showAnswer || !userAnswer.trim()}
                    >
                      Check Answer
                    </Button>
                    <Button
                      onClick={showHint}
                      variant="warning"
                      disabled={hintLevel >= 4 || showAnswer}
                    >
                      {getHintButtonText()}
                    </Button>
                  </div>
                </div>

                {/* Feedback */}
                {feedback && (
                  <Alert variant={feedback.type}>
                    {feedback.message}
                  </Alert>
                )}

                {/* Hints */}
                {hintLevel > 0 && getHintContent()}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    onClick={generateProblem}
                    variant="primary"
                  >
                    Next Problem
                  </Button>
                  <Button
                    onClick={() => setScore({ correct: 0, incorrect: 0, total: 0, streak: 0, hintsUsed: 0 })}
                    variant="secondary"
                  >
                    Reset Score
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}