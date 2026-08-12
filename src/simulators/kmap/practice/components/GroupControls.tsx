interface GroupControlsProps {
  locked: boolean
  selectedCount: number
  groupCount: number
  onAddGroup: () => void
  onClearSelection: () => void
  onClearGroups: () => void
  onSubmitGroups: () => void
}

export default function GroupControls({
  locked,
  selectedCount,
  groupCount,
  onAddGroup,
  onClearSelection,
  onClearGroups,
  onSubmitGroups,
}: GroupControlsProps) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <button
        onClick={onAddGroup}
        disabled={locked || selectedCount === 0}
        className="rounded bg-slate-700 px-3 py-2 text-sm font-medium text-slate-100 enabled:hover:bg-slate-600 disabled:opacity-40"
      >
        Add selected ({selectedCount}) as group
      </button>
      <button
        onClick={onClearSelection}
        disabled={locked || selectedCount === 0}
        className="rounded border border-slate-600 px-3 py-2 text-sm text-slate-300 enabled:hover:bg-slate-800 disabled:opacity-40"
      >
        Clear selection
      </button>
      <button
        onClick={onClearGroups}
        disabled={locked || groupCount === 0}
        className="rounded border border-slate-600 px-3 py-2 text-sm text-slate-300 enabled:hover:bg-slate-800 disabled:opacity-40"
      >
        Clear all groups
      </button>
      <button
        onClick={onSubmitGroups}
        disabled={locked || groupCount === 0}
        className="rounded bg-violet-600 px-3 py-2 text-sm font-medium text-white enabled:hover:bg-violet-500 disabled:opacity-40"
      >
        Check my groups
      </button>
    </div>
  )
}