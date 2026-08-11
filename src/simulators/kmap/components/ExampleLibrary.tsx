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
            className="w-full text-left p-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-violet-500/50 transition-colors"
          >
            <div className="font-medium text-white">{example.name}</div>
            <div className="text-sm text-slate-400 mt-1">{example.description}</div>
          </button>
        ))}
      </div>
    </SectionCard>
  )
}
