import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { GatePractice } from '../../../simulators/gates'
import { generateGateExerciseBatch } from '../../../education/gates/exercises'

const SEED = 'lg7-test'

describe('GatePractice', () => {
  it('renders the first question with four options', () => {
    render(<GatePractice seed={SEED} />)
    expect(screen.getByTestId('prompt')).toBeInTheDocument()
    expect(screen.queryAllByTestId(/^option-/)).toHaveLength(4)
    expect(screen.getByTestId('progress')).toHaveTextContent('Question 1 / 5')
  })

  it('validates the correct answer and updates the score', () => {
    render(<GatePractice seed={SEED} />)
    const first = generateGateExerciseBatch({
      kind: 'description-to-gate',
      count: 5,
      seed: `${SEED}:beginner:0`,
    })[0]!
    fireEvent.click(within(screen.getByTestId('options')).getByText(first.answer))
    const feedback = screen.getByTestId('feedback')
    expect(feedback).toHaveTextContent('Correct')
    expect(screen.getByTestId('progress')).toHaveTextContent('1 correct')
  })

  it('detects a wrong answer with a hint and reveals the correct one', () => {
    render(<GatePractice seed={SEED} />)
    const first = generateGateExerciseBatch({
      kind: 'description-to-gate',
      count: 5,
      seed: `${SEED}:beginner:0`,
    })[0]!
    const wrong = first.choices.find((g) => g !== first.answer)!
    fireEvent.click(within(screen.getByTestId('options')).getByText(wrong))
    const feedback = screen.getByTestId('feedback')
    expect(feedback).toHaveTextContent('Not quite')
    expect(feedback).toHaveTextContent('Hint')
    expect(screen.getByTestId('practice-retry')).toBeInTheDocument()
    expect(screen.getByTestId('progress')).toHaveTextContent('0 correct')
  })

  it('advances to the next question', () => {
    render(<GatePractice seed={SEED} />)
    const first = generateGateExerciseBatch({
      kind: 'description-to-gate',
      count: 5,
      seed: `${SEED}:beginner:0`,
    })[0]!
    fireEvent.click(within(screen.getByTestId('options')).getByText(first.answer))
    fireEvent.click(screen.getByTestId('practice-next'))
    expect(screen.getByTestId('progress')).toHaveTextContent('Question 2 / 5')
    expect(screen.queryByTestId('feedback')).not.toBeInTheDocument()
  })

  it('switches difficulty tiers (description → table → expression)', () => {
    render(<GatePractice seed={SEED} />)
    expect(screen.getByTestId('prompt')).toHaveTextContent('description')

    fireEvent.click(screen.getByTestId('difficulty-intermediate'))
    expect(screen.getByTestId('prompt')).toHaveTextContent('truth table')
    expect(screen.getByTestId('truth-table')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('difficulty-advanced'))
    expect(screen.getByTestId('prompt')).toHaveTextContent('expression')
    expect(screen.queryByTestId('truth-table')).not.toBeInTheDocument()
  })

  it('shows a session summary after finishing all questions', () => {
    render(<GatePractice seed={SEED} />)
    const exercises = generateGateExerciseBatch({
      kind: 'description-to-gate',
      count: 5,
      seed: `${SEED}:beginner:0`,
    })
    for (const ex of exercises) {
      fireEvent.click(within(screen.getByTestId('options')).getByText(ex.answer))
      fireEvent.click(screen.getByTestId('practice-next'))
    }
    const summary = screen.getByTestId('summary')
    expect(summary).toHaveTextContent('Session complete')
    expect(summary).toHaveTextContent('5 of 5')
  })

  it('retry clears the current answer so the question can be re-answered', () => {
    render(<GatePractice seed={SEED} />)
    const first = generateGateExerciseBatch({
      kind: 'description-to-gate',
      count: 5,
      seed: `${SEED}:beginner:0`,
    })[0]!
    const wrong = first.choices.find((g) => g !== first.answer)!
    fireEvent.click(within(screen.getByTestId('options')).getByText(wrong))
    fireEvent.click(screen.getByTestId('practice-retry'))
    expect(screen.queryByTestId('feedback')).not.toBeInTheDocument()
    expect(screen.queryByTestId('practice-retry')).not.toBeInTheDocument()
  })
})
