import { usePracticeStore } from '../../../../stores/practiceStore'

export default function SessionDone() {
  const index = usePracticeStore((s) => s.index)
  const sessionSize = usePracticeStore((s) => s.sessionSize)
  const backHome = usePracticeStore((s) => s.backHome)
  const mastery = usePracticeStore((s) => s.conceptMastery)
  const mastered = Object.values(mastery).filter((m) => m.status === 'MASTERED').length
  const total = Object.keys(mastery).length

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900 p-8 text-center">
      <h2 className="text-2xl font-bold text-violet-300">Session complete</h2>
      <p className="mt-3 text-slate-300">
        You finished all {sessionSize} problems (reached #{index + 1}).
      </p>
      <p className="mt-2 text-slate-400">
        Mastered concepts: <span className="text-green-400">{mastered}</span> / {total}
      </p>
      <button
        onClick={backHome}
        className="mt-6 rounded bg-violet-600 px-5 py-2.5 font-medium text-white hover:bg-violet-500"
      >
        Back to practice home
      </button>
    </div>
  )
}