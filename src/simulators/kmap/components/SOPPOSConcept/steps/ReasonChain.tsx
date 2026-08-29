interface ReasonChainProps {
  labels: readonly string[]
  tone: 'green' | 'red'
}

export default function ReasonChain({ labels, tone }: ReasonChainProps) {
  const toneStyle: React.CSSProperties =
    tone === 'green'
      ? { borderColor: 'var(--success-text)', backgroundColor: 'var(--success-bg)', color: 'var(--success-text)' }
      : { borderColor: 'var(--error-text)', backgroundColor: 'var(--error-bg)', color: 'var(--error-text)' }
  return (
    <div className="flex flex-wrap items-center gap-2" style={{ fontSize: '0.875rem' }}>
      {labels.map((label, i) => (
        <span key={i} className="flex items-center gap-2">
          <span className="rounded px-2 py-1 font-medium" style={toneStyle}>{label}</span>
          {i < labels.length - 1 && <span style={{ color: 'var(--text-muted)' }}>↓</span>}
        </span>
      ))}
    </div>
  )
}
