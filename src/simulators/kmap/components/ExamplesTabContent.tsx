import ExampleLibrary from './ExampleLibrary'
import { type KMapExample } from '../examples'

interface ExamplesTabContentProps {
  onLoadExample: (example: KMapExample) => void
}

export default function ExamplesTabContent({ onLoadExample }: ExamplesTabContentProps) {
  return (
    <div className="space-y-2 sm:space-y-3">
      <ExampleLibrary onLoadExample={onLoadExample} />
    </div>
  )
}
