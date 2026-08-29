interface SecondaryToolbarProps {
  showMintermNumbers: boolean
  onToggleMintermNumbers: () => void
}

export default function SecondaryToolbar({
  showMintermNumbers,
  onToggleMintermNumbers,
}: SecondaryToolbarProps) {
  return (
    <div className="flex flex-wrap gap-1.5 sm:gap-2 items-center">
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <label className="text-xs sm:text-sm whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>Display:</label>
        <button
          onClick={onToggleMintermNumbers}
          className="px-2.5 py-1.5 rounded text-sm transition-colors touch-action-manipulation min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-[40px]"
          style={{
            backgroundColor: showMintermNumbers ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
            color: showMintermNumbers ? '#ffffff' : 'var(--text-secondary)'
          }}
          title={showMintermNumbers ? 'Hide minterm numbers' : 'Show minterm numbers'}
        >
          <span className="text-base">{showMintermNumbers ? '#️⃣' : '🔢'}</span>
        </button>
      </div>
    </div>
  )
}
