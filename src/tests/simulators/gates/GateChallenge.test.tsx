import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { GateChallenge } from '../../../simulators/gates'
import type { GateChallenge as GateChallengeType, SosRowChallenge } from '../../../education/gates/challenge'
import { generateGateChallengeBatch } from '../../../education/gates/challenge'

const SEED = 'lg8-test'
const BATCH = generateGateChallengeBatch({ count: 5, seed: `${SEED}:0` })

function canonicalExpression(gate: string): string {
  return {
    BUFFER: 'A',
    NOT: "A'",
    AND: 'A·B',
    NAND: "(A·B)'",
    OR: 'A+B',
    NOR: "(A+B)'",
    XOR: 'A⊕B',
    XNOR: "(A⊕B)'",
    CON_BUF: 'A·B',
    CON_INV: "A'·B",
    ODD_PARITY: 'A⊕B',
    EVEN_PARITY: "(A⊕B)'",
  }[gate] as string
}

/** Drives the UI forward until the current challenge matches `pred`, answering each prior one correctly. */
function driveTo(
  pred: (ch: GateChallengeType) => boolean,
): GateChallengeType {
  let target: GateChallengeType | null = null
  for (const ch of BATCH) {
    if (pred(ch)) {
      target = ch
      break
    }
    if (ch.kind === 'sos-row') {
      fireEvent.click(screen.getByTestId(`challenge-option-${ch.answer.toLowerCase()}`))
    } else {
      fireEvent.change(screen.getByTestId('expression-input'), {
        target: { value: canonicalExpression(ch.targetGate) },
      })
      fireEvent.click(screen.getByTestId('challenge-check'))
    }
    fireEvent.click(screen.getByTestId('challenge-next'))
  }
  if (!target) throw new Error('No challenge matched the predicate for seed ' + SEED)
  return target
}

describe('GateChallenge', () => {
  it('renders the challenge header and first challenge', () => {
    render(<GateChallenge seed={SEED} />)
    expect(screen.getByTestId('challenge-header')).toHaveTextContent('Challenge mode')
    expect(screen.getByTestId('challenge-progress')).toHaveTextContent('Challenge 1 / 5')
    expect(screen.getByTestId('challenge-prompt')).toBeInTheDocument()
  })

  it('verifies an sos-row gate answer by equivalence and updates the score', () => {
    render(<GateChallenge seed={SEED} />)
    const target = driveTo((ch) => ch.kind === 'sos-row')
    expect(screen.getByTestId('sos-column')).toBeInTheDocument()
    const before = Number(screen.getByTestId('challenge-progress').textContent!.match(/(\d+) solved/)![1])
    fireEvent.click(screen.getByTestId(`challenge-option-${target.answer.toLowerCase()}`))
    expect(screen.getByTestId('challenge-feedback')).toHaveTextContent('Equivalent — correct')
    const after = Number(screen.getByTestId('challenge-progress').textContent!.match(/(\d+) solved/)![1])
    expect(after).toBe(before + 1)
  })

  it('builds a gate from a description and verifies by truth-table equivalence', () => {
    render(<GateChallenge seed={SEED} />)
    const target = driveTo((ch) => ch.kind === 'build-from-description')
    expect(screen.getByTestId('challenge-description')).toBeInTheDocument()
    fireEvent.change(screen.getByTestId('expression-input'), {
      target: { value: canonicalExpression(target.targetGate) },
    })
    fireEvent.click(screen.getByTestId('challenge-check'))
    expect(screen.getByTestId('challenge-feedback')).toHaveTextContent('Equivalent — correct')
  })

  it('reports mismatch rows for a non-equivalent expression', () => {
    render(<GateChallenge seed={SEED} />)
    driveTo((ch) => ch.kind === 'build-from-description')
    fireEvent.change(screen.getByTestId('expression-input'), { target: { value: '0' } })
    fireEvent.click(screen.getByTestId('challenge-check'))
    const feedback = screen.getByTestId('challenge-feedback')
    expect(feedback).toHaveTextContent('Not equivalent')
    expect(feedback).toHaveTextContent('Rows that differ')
    expect(screen.getByTestId('challenge-mismatches')).toBeInTheDocument()
  })

  it('shows the correct gate when an sos-row answer is wrong', () => {
    render(<GateChallenge seed={SEED} />)
    const target = driveTo((ch) => ch.kind === 'sos-row') as SosRowChallenge
    const wrong = target.options.find((g) => g !== target.answer)!
    fireEvent.click(screen.getByTestId(`challenge-option-${wrong.toLowerCase()}`))
    expect(screen.getByTestId('challenge-feedback')).toHaveTextContent('Not equivalent')
    expect(screen.getByTestId('challenge-feedback')).toHaveTextContent(target.answer)
  })

  it('shows a summary after finishing all challenges', () => {
    render(<GateChallenge seed={SEED} />)
    for (const ch of BATCH) {
      if (ch.kind === 'sos-row') {
        fireEvent.click(screen.getByTestId(`challenge-option-${ch.answer.toLowerCase()}`))
      } else {
        fireEvent.change(screen.getByTestId('expression-input'), {
          target: { value: canonicalExpression(ch.targetGate) },
        })
        fireEvent.click(screen.getByTestId('challenge-check'))
      }
      fireEvent.click(screen.getByTestId('challenge-next'))
    }
    const summary = screen.getByTestId('challenge-summary')
    expect(summary).toHaveTextContent('Challenges complete')
    expect(summary).toHaveTextContent('5 of 5')
  })
})