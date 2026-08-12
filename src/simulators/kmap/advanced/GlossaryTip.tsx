import { useState } from 'react'
import { glossaryByTerm } from '../../../education/advanced'

export default function GlossaryTip({ word }: { word: string }) {
  const [open, setOpen] = useState(false)
  const text = glossaryByTerm(word)
  if (!text) return null
  return (
    <span className="inline-flex items-start">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label={`Explain ${word}`}
        className="underline decoration-dotted underline-offset-2 text-violet-300 hover:text-white font-medium"
      >
        {word}
      </button>
      {open && <span className="text-slate-400 text-xs ml-1">— {text}</span>}
    </span>
  )
}