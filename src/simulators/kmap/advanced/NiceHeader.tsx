export default function NiceHeader({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="mb-1">
      <h3 className="font-medium text-base" style={{ color: 'var(--accent-secondary)' }}>{title}</h3>
      {hint ? <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{hint}</p> : null}
    </div>
  )
}
