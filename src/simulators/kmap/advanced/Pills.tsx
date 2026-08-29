export default function Pills({ items }: { items: readonly number[] }) {
  if (items.length === 0) return <span className="text-sm" style={{ color: 'var(--text-muted)' }}>none</span>
  return (
    <span className="flex flex-wrap gap-1">
      {items.map((m) => (
        <code key={m} className="px-1.5 py-0.5 rounded text-xs" style={{ background: 'var(--border-light)', color: 'var(--text-primary)' }}>
          m{m}
        </code>
      ))}
    </span>
  )
}
