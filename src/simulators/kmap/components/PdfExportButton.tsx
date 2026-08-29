import { useState, useCallback } from 'react'
import type { KMapModel } from '../../../core/kmap'
import { exportKMapToPdf } from '../utils/pdfExport'

interface PdfExportButtonProps {
  kmap: KMapModel
  simplifiedExpression: string
  originalExpression: string
  showSOP: boolean
  sopTerms: readonly string[]
  posTerms: readonly string[]
  groupCount: number
}

export default function PdfExportButton({
  kmap,
  simplifiedExpression,
  originalExpression,
  showSOP,
  sopTerms,
  posTerms,
  groupCount,
}: PdfExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = useCallback(() => {
    setIsExporting(true)
    try {
      exportKMapToPdf({
        kmap,
        simplifiedExpression,
        originalExpression,
        showSOP,
        sopTerms,
        posTerms,
        groupCount,
      })
    } finally {
      setTimeout(() => setIsExporting(false), 500)
    }
  }, [kmap, simplifiedExpression, originalExpression, showSOP, sopTerms, posTerms, groupCount])

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-sm font-medium transition-all touch-action-manipulation min-h-[36px]"
      style={{
        backgroundColor: isExporting ? 'var(--bg-tertiary)' : 'var(--bg-tertiary)',
        color: isExporting ? 'var(--text-muted)' : 'var(--text-primary)',
        border: '1px solid var(--border-color)',
      }}
      onMouseEnter={(e) => {
        if (!isExporting) {
          e.currentTarget.style.borderColor = 'var(--accent-primary)'
          e.currentTarget.style.backgroundColor = 'var(--accent-bg)'
        }
      }}
      onMouseLeave={(e) => {
        if (!isExporting) {
          e.currentTarget.style.borderColor = 'var(--border-color)'
          e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'
        }
      }}
      title="Export K-Map results as PDF"
    >
      {isExporting ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      )}
      <span className="hidden sm:inline">{isExporting ? 'Exporting...' : 'Export PDF'}</span>
    </button>
  )
}
