interface FormedGroupsProps {
  groups: readonly (readonly number[])[]
  locked: boolean
  onRemoveGroup: (index: number) => void
}

export default function FormedGroups({ groups, locked, onRemoveGroup }: FormedGroupsProps) {
  if (groups.length === 0) return null
  return (
    <ul className="mt-3 space-y-1.5">
      {groups.map((g, gi) => (
        <li key={gi} className="flex items-center gap-2 text-sm">
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{ background: `hsl(${(gi * 137) % 360},70%,60%)` }}
          />
          <span className="font-mono text-slate-200">
            [{g.join(', ')}]
          </span>
          <button
            onClick={() => onRemoveGroup(gi)}
            disabled={locked}
            className="ml-auto text-slate-500 hover:text-red-400 disabled:opacity-40"
            aria-label={`Remove group ${gi + 1}`}
          >
            ✕
          </button>
        </li>
      ))}
    </ul>
  )
}