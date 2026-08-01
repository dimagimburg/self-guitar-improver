import { useNavigate } from 'react-router-dom'

interface CardProps {
  title: string
  description: string
  accent: string
  onClick: () => void
}

function Card({ title, description, accent, onClick }: CardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-gray-500 rounded-xl p-5 transition-all group"
    >
      <div className={`text-xs font-semibold uppercase tracking-wide mb-1 ${accent}`}>
        {title}
      </div>
      <p className="text-white font-semibold text-lg group-hover:text-white">{title}</p>
      <p className="text-gray-400 text-sm mt-1">{description}</p>
    </button>
  )
}

interface Props {
  onBack: () => void
}

export function FreePracticeView({ onBack }: Props) {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors text-sm">
          ← Back
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">Free Practice</h1>
          <p className="text-gray-500 text-xs">Open any exercise directly, no session required</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Card
          title="Pentatonic Position"
          description="Pick any key and CAGED shape to drill ascending, descending, or alternating runs."
          accent="text-emerald-400"
          onClick={() => navigate('/free-practice/pentatonic-position')}
        />
        <Card
          title="Pentatonic Transition"
          description="Choose a key and two CAGED shapes to practice moving between them up the neck."
          accent="text-blue-400"
          onClick={() => navigate('/free-practice/pentatonic-transition')}
        />
        <Card
          title="Fretboard Q&A"
          description="12-question quiz — name the note at a given string and fret. Answer with keyboard or tap."
          accent="text-purple-400"
          onClick={() => navigate('/free-practice/fretboard-quiz')}
        />
        <Card
          title="Find the Note Warmup"
          description="Quick warmup — press space to get a random note and string, then find it on your guitar. Perfect for loosening up."
          accent="text-orange-400"
          onClick={() => navigate('/free-practice/find-the-note-warmup')}
        />
      </div>
    </div>
  )
}
