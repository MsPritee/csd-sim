export default function Pills({ items }: { items: readonly number[] }) {
  if (items.length === 0) return <span className="text-slate-500 text-sm">none</span>
  return (
    <span className="flex flex-wrap gap-1">
      {items.map((m) => (
        <code key={m} className="px-1.5 py-0.5 rounded bg-slate-700 text-slate-200 text-xs">
          m{m}
        </code>
      ))}
    </span>
  )
}