import { useState } from 'react'
import { PentatonicPositionExercise } from '../Exercise/PentatonicPositionExercise'
import { PentatonicTransitionExercise } from '../Exercise/PentatonicTransitionExercise'
import { FretboardNoteExercise } from '../Exercise/FretboardNoteExercise'
import { ExerciseInstance } from '../../types'

type FreeMode = 'pentatonic_position' | 'pentatonic_transition' | 'fretboard_quiz'

// Minimal seed instances — the exercise components manage their own state internally
const PENTA_POSITION_EXERCISE: ExerciseInstance = {
  id: 'free-penta-pos',
  type: 'pentatonic_position',
  duration: 0,
  params: { key: 'A', position: 1, bpm: 80, mode: 'ascending' },
}

const PENTA_TRANSITION_EXERCISE: ExerciseInstance = {
  id: 'free-penta-trans',
  type: 'pentatonic_transition',
  duration: 0,
  params: { key: 'A', fromPosition: 1, toPosition: 2, bpm: 80 },
}

const FRETBOARD_EXERCISE: ExerciseInstance = {
  id: 'free-fretboard',
  type: 'fretboard_note',
  duration: 0,
  params: { mode: 'identify', scope: 'full' },
}

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
  const [mode, setMode] = useState<FreeMode | null>(null)

  const back = () => setMode(null)

  if (mode === 'pentatonic_position') {
    return (
      <div className="flex flex-col min-h-screen bg-gray-900 text-white p-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={back} className="text-gray-400 hover:text-white transition-colors text-sm">
            ← Back
          </button>
          <h2 className="text-white font-bold text-lg">Pentatonic Position</h2>
        </div>
        <PentatonicPositionExercise exercise={PENTA_POSITION_EXERCISE} />
      </div>
    )
  }

  if (mode === 'pentatonic_transition') {
    return (
      <div className="flex flex-col min-h-screen bg-gray-900 text-white p-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={back} className="text-gray-400 hover:text-white transition-colors text-sm">
            ← Back
          </button>
          <h2 className="text-white font-bold text-lg">Pentatonic Transition</h2>
        </div>
        <PentatonicTransitionExercise exercise={PENTA_TRANSITION_EXERCISE} />
      </div>
    )
  }

  if (mode === 'fretboard_quiz') {
    return (
      <div className="flex flex-col min-h-screen bg-gray-900 text-white p-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={back} className="text-gray-400 hover:text-white transition-colors text-sm">
            ← Back
          </button>
          <h2 className="text-white font-bold text-lg">Fretboard Q&A</h2>
        </div>
        <FretboardNoteExercise exercise={FRETBOARD_EXERCISE} />
      </div>
    )
  }

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
          onClick={() => setMode('pentatonic_position')}
        />
        <Card
          title="Pentatonic Transition"
          description="Choose a key and two CAGED shapes to practice moving between them up the neck."
          accent="text-blue-400"
          onClick={() => setMode('pentatonic_transition')}
        />
        <Card
          title="Fretboard Q&A"
          description="12-question quiz — name the note at a given string and fret. Answer with keyboard or tap."
          accent="text-purple-400"
          onClick={() => setMode('fretboard_quiz')}
        />
      </div>
    </div>
  )
}
