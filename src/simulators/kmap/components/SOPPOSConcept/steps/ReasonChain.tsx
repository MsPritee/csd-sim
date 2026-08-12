interface ReasonChainProps {
  labels: readonly string[]
  tone: 'green' | 'red'
}

export default function ReasonChain({ labels, tone }: ReasonChainProps) {
  const toneColor =
    tone === 'green'
      ? 'border-green-700/40 bg-green-900/10 text-green-300'
      : 'border-red-800/60 bg-red-900/10 text-red-300'
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      {labels.map((label, i) => (
        <span key={i} className="flex items-center gap-2">
          <span className={`rounded border px-2 py-1 font-medium ${toneColor}`}>{label}</span>
          {i < labels.length - 1 && <span className="text-slate-500">↓</span>}
        </span>
      ))}
    </div>
  )
}