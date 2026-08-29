export default function Notice({ lines }: { lines: readonly string[] }) {
  if (lines.length === 0) return null
  return (
    <div className="rounded px-3 py-2 text-sm space-y-1" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
      {lines.map((n, i) => <p key={i}>{n}</p>)}
    </div>
  )
}
