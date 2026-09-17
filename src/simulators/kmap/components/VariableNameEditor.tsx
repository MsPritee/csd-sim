import { useEffect, useMemo, useState } from 'react'
import { validateVariableNames } from '../../../application/kmap'
import CompactSelect from './CompactSelect'
import { PRESET_VARIABLE_NAMES } from './variableNamePresets'

/** Sentinel dropdown value that reveals the custom-name text input. */
const OTHER = '__custom__'

interface VariableNameEditorProps {
  variables: readonly string[]
  onChange?: (names: string[]) => void
}

const isPresetName = (name: string): boolean =>
  (PRESET_VARIABLE_NAMES as readonly string[]).includes(name)

/**
 * Single-row variable-name editor: a "Name:" prefix followed by one compact
 * select per variable position (matching the current variable count). Each
 * select lists all preset names plus an "Other" option that reveals an inline
 * custom-name input. Names already assigned to another variable are disabled so
 * the user cannot accidentally create ambiguous combinations; the custom input
 * runs the same validation (empty / multi-letter / duplicate) and only commits
 * a valid set to the parent.
 */
export default function VariableNameEditor({ variables, onChange }: VariableNameEditorProps) {
  const [draft, setDraft] = useState<string[]>(() => [...variables])

  // Reconcile the local draft whenever the authoritative names change
  // externally (variable-count change, example load, parent adjustment).
  useEffect(() => {
    setDraft([...variables])
  }, [variables])

  const validation = useMemo(() => validateVariableNames(draft), [draft])

  const commit = (next: string[]) => {
    setDraft(next)
    const result = validateVariableNames(next)
    if (result.valid) onChange?.(result.names)
  }

  const commitSelect = (index: number, value: string) => {
    const next = [...draft]
    next[index] = value === OTHER ? '' : value
    commit(next)
  }

  const commitCustom = (index: number, value: string) => {
    const next = [...draft]
    next[index] = value
    commit(next)
  }

  const optionFor = (index: number, name: string) => {
    const current = draft[index] ?? ''
    return {
      value: name,
      label: name,
      disabled: draft.some((draftName, j) => j !== index && draftName === name) && name !== current,
    }
  }

  const errorsByIndex = useMemo(() => {
    const map = new Map<number, string>()
    for (const issue of validation.issues) {
      if (!map.has(issue.index)) map.set(issue.index, issue.message)
    }
    return map
  }, [validation.issues])

  return (
    <div
      className="flex flex-wrap gap-x-2.5 gap-y-2 items-center"
      role="group"
      aria-label="Variable names"
    >
      <span
        className="text-xs sm:text-sm whitespace-nowrap font-medium"
        style={{ color: 'var(--text-secondary)' }}
      >
        Name:
      </span>
      {draft.map((name, index) => {
        const useCustom = !isPresetName(name)
        const options = [
          ...PRESET_VARIABLE_NAMES.map((preset) => optionFor(index, preset)),
          { value: OTHER, label: 'Other' },
        ]
        const error = errorsByIndex.get(index)

        return (
          <div key={index} className="flex items-center gap-1.5">
            <CompactSelect
              id={`variable-name-select-${index}`}
              ariaLabel={`Variable ${index + 1} name`}
              value={useCustom ? OTHER : name}
              onChange={(value) => commitSelect(index, value)}
              options={options}
              title="Select a variable name, or choose Other for a custom name"
            />
            {useCustom && (
              <input
                id={`variable-name-input-${index}`}
                type="text"
                value={name}
                onChange={(e) => commitCustom(index, e.target.value)}
                placeholder="Input variable name..."
                aria-label={`Custom name for Variable ${index + 1}`}
                aria-invalid={error !== undefined}
                className="w-28 border rounded px-2.5 py-1.5 text-sm min-h-[44px] sm:min-h-[40px] focus:outline-none focus:ring-2 transition-colors"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: error ? 'var(--error-border)' : 'var(--border-color)',
                  color: 'var(--text-primary)',
                }}
              />
            )}
            {error && (
              <span
                className="text-xs whitespace-nowrap"
                style={{ color: 'var(--error-text)' }}
                role="alert"
              >
                {error}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}