import { EXAMPLES, type KMapExample } from '../examples'
import SectionCard from './SectionCard'

interface ExampleLibraryProps {
  onLoadExample: (example: KMapExample) => void
}

export default function ExampleLibrary({ onLoadExample }: ExampleLibraryProps) {
  return (
    <SectionCard
      title="Example Library"
      subtitle="Click an example to load it into the K-map and explore the concepts."
    >
      <div className="space-y-2">
        {EXAMPLES.map((example) => (
          <button
            key={example.id}
            onClick={() => onLoadExample(example)}
            className="w-full text-left p-3 rounded-lg border transition-colors"
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              borderColor: 'var(--border-color)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-color)';
            }}
            title={`${example.name}: ${example.description}`}
          >
            <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{example.name}</div>
            <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{example.description}</div>
          </button>
        ))}
      </div>
    </SectionCard>
  )
}
