import { useState, useEffect } from 'react'
import type { CellValue } from '../../../core/kmap'
import PrimaryToolbar from './PrimaryToolbar'
import SecondaryToolbar from './SecondaryToolbar'
import ButtonGroup from './ButtonGroup'

interface KMapToolbarProps {
  variableCount: 2 | 3 | 4 | 5
  currentValue: CellValue
  showMintermNumbers: boolean
  onVariableCountChange: (count: 2 | 3 | 4 | 5) => void
  onCurrentValueChange: (value: CellValue) => void
  onToggleMintermNumbers: () => void
  onClear: () => void
}

export default function KMapToolbar({
  variableCount,
  currentValue,
  showMintermNumbers,
  onVariableCountChange,
  onCurrentValueChange,
  onToggleMintermNumbers,
  onClear,
}: KMapToolbarProps) {
  const [showSecondary, setShowSecondary] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <div className="toolbar-primary kmap-toolbar rounded-lg p-1 sm:p-1.5 md:p-2 mb-1 sm:mb-1.5">
      <div className="flex flex-wrap gap-control-group items-center justify-between">
        <div className="flex-1 min-w-0 overflow-x-auto -mx-0.5 px-0.5 sm:mx-0 sm:px-0">
          <PrimaryToolbar
            variableCount={variableCount}
            currentValue={currentValue}
            onVariableCountChange={onVariableCountChange}
            onCurrentValueChange={onCurrentValueChange}
          />
        </div>

        <ButtonGroup>
          <button
            onClick={() => setShowSecondary(!showSecondary)}
            className="hidden sm:flex px-2 py-1 rounded text-xs transition-all touch-action-manipulation toolbar-control min-h-[40px]"
            style={{
              backgroundColor: showSecondary ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
              color: showSecondary ? '#ffffff' : 'var(--text-secondary)',
              boxShadow: showSecondary ? 'var(--shadow-accent)' : 'var(--shadow-xs)'
            }}
            title="Toggle display options"
          >
            {showSecondary ? '− Options' : '+ Options'}
          </button>

          <button
            onClick={onClear}
            className="rounded transition-all touch-action-manipulation"
            style={{ 
              backgroundColor: 'var(--error-border, #dc2626)',
              color: '#ffffff',
              boxShadow: 'var(--shadow-error)',
              padding: '6px 12px',
              fontSize: '14px',
              minWidth: '44px',
              minHeight: '44px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--error-text, #b91c1c)'
              e.currentTarget.style.boxShadow = '0 6px 20px color-mix(in srgb, var(--error-border) 50%, transparent)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--error-border, #dc2626)'
              e.currentTarget.style.boxShadow = 'var(--shadow-error)'
            }}
            title="Clear K-Map"
          >
            <span style={{ color: '#ffffff', display: 'inline' }}>Clear</span>
          </button>
        </ButtonGroup>
      </div>

      {(showSecondary || isMobile) && (
        <div className="mt-1.5 pt-1.5 border-t control-group" style={{ borderColor: 'var(--border-color)' }}>
          <SecondaryToolbar
            showMintermNumbers={showMintermNumbers}
            onToggleMintermNumbers={onToggleMintermNumbers}
          />
        </div>
      )}
    </div>
  )
}