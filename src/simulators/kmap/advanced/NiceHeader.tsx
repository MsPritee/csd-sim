export default function NiceHeader({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="mb-1">
      <h3 className="font-medium text-violet-200 text-base">{title}</h3>
      {hint ? <p className="text-slate-500 text-xs mt-0.5">{hint}</p> : null}
    </div>
  )
}