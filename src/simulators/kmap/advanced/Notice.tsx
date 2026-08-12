export default function Notice({ lines }: { lines: readonly string[] }) {
  if (lines.length === 0) return null
  return (
    <div className="rounded bg-slate-800 border border-slate-700 px-3 py-2 text-slate-300 text-sm space-y-1">
      {lines.map((n, i) => <p key={i}>{n}</p>)}
    </div>
  )
}