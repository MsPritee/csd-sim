export default function RunningText({ lines }: { lines: readonly string[] }) {
  if (lines.length === 0) return null
  return (
    <div className="text-slate-400 text-sm space-y-1">
      {lines.map((l, i) => <p key={i}>{l}</p>)}
    </div>
  )
}