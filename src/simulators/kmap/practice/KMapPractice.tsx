/**
 * P2 — K-Map Practice container.
 *
 * Owns the top-level screen switch (home ↔ active session) and renders the
 * practice home together with the live problem. Session state and mastery live
 * in the practice store; all evaluation math is delegated to the core + the
 * education modules.
 */

import { usePracticeStore } from '../../../stores/practiceStore'
import PracticeHome from './PracticeHome'
import PracticeProblem from './PracticeProblem'

export default function KMapPractice() {
  const screen = usePracticeStore((s) => s.screen)
  const backHome = usePracticeStore((s) => s.backHome)

  if (screen === 'session') {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <button
          onClick={backHome}
          className="mb-4 font-medium"
          style={{ color: 'var(--accent-primary)' }}
        >
          ← Practice home
        </button>
        <PracticeProblem />
      </div>
    )
  }

  return <PracticeHome />
}
