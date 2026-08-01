import { useState, useEffect } from 'react'
import { HashRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useAppStore } from './store/useAppStore'
import { StartScreen } from './components/Session/StartScreen'
import { ExerciseScreen } from './components/Session/ExerciseScreen'
import { FeedbackScreen } from './components/Session/FeedbackScreen'
import { CompleteScreen } from './components/Session/CompleteScreen'
import { PentatonicMapView } from './components/PentatonicMap/PentatonicMapView'
import { FreePracticeView } from './components/FreePractice/FreePracticeView'
import { FretboardBuilderView } from './components/FretboardBuilder/FretboardBuilderView'
import { PentatonicPositionExercise } from './components/Exercise/PentatonicPositionExercise'
import { PentatonicTransitionExercise } from './components/Exercise/PentatonicTransitionExercise'
import { FretboardNoteExercise } from './components/Exercise/FretboardNoteExercise'
import { FindNoteWarmupExercise } from './components/Exercise/FindNoteWarmupExercise'
import { ExerciseInstance } from './types'

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

function TimerDisplay() {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const location = useLocation()

  useEffect(() => {
    setElapsedSeconds(0)
  }, [location])

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds(s => s + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  return (
    <div className="fixed top-6 right-6 z-50">
      <div className="text-white text-3xl font-bold font-mono bg-gray-800 px-6 py-3 rounded-lg border border-gray-700">
        {formatTime(elapsedSeconds)}
      </div>
    </div>
  )
}

function SessionPage() {
  const { sessionPhase } = useAppStore()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <TimerDisplay />
      {sessionPhase === 'start' && (
        <StartScreen
          onOpenMap={() => navigate('/pentatonic-map')}
          onOpenFreePractice={() => navigate('/free-practice')}
          onOpenBuilder={() => navigate('/fretboard-builder')}
        />
      )}
      {sessionPhase === 'exercise' && <ExerciseScreen />}
      {sessionPhase === 'feedback' && <FeedbackScreen />}
      {sessionPhase === 'complete' && <CompleteScreen />}
    </div>
  )
}

function PentatonicMapPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <TimerDisplay />
      <PentatonicMapView onBack={() => navigate('/')} />
    </div>
  )
}

function FreePracticeIndexPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <TimerDisplay />
      <FreePracticeView onBack={() => navigate('/')} />
    </div>
  )
}

function PentatonicPositionPage() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white p-6 max-w-3xl mx-auto">
      <TimerDisplay />
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/free-practice')} className="text-gray-400 hover:text-white transition-colors text-sm">
          ← Back
        </button>
        <h2 className="text-white font-bold text-lg">Pentatonic Position</h2>
      </div>
      <PentatonicPositionExercise exercise={PENTA_POSITION_EXERCISE} />
    </div>
  )
}

function PentatonicTransitionPage() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white p-6 max-w-3xl mx-auto">
      <TimerDisplay />
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/free-practice')} className="text-gray-400 hover:text-white transition-colors text-sm">
          ← Back
        </button>
        <h2 className="text-white font-bold text-lg">Pentatonic Transition</h2>
      </div>
      <PentatonicTransitionExercise exercise={PENTA_TRANSITION_EXERCISE} />
    </div>
  )
}

function FretboardQuizPage() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white p-6 max-w-3xl mx-auto">
      <TimerDisplay />
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/free-practice')} className="text-gray-400 hover:text-white transition-colors text-sm">
          ← Back
        </button>
        <h2 className="text-white font-bold text-lg">Fretboard Q&A</h2>
      </div>
      <FretboardNoteExercise exercise={FRETBOARD_EXERCISE} />
    </div>
  )
}

function FindNoteWarmupPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <TimerDisplay />
      <div className="flex items-center gap-4 mb-6 max-w-3xl mx-auto">
        <button onClick={() => navigate('/free-practice')} className="text-gray-400 hover:text-white transition-colors text-sm">
          ← Back
        </button>
        <h2 className="text-white font-bold text-lg">Find the Note Warmup</h2>
      </div>
      <FindNoteWarmupExercise />
    </div>
  )
}

function FretboardBuilderPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <TimerDisplay />
      <FretboardBuilderView onBack={() => navigate('/')} />
    </div>
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<SessionPage />} />
      <Route path="/pentatonic-map" element={<PentatonicMapPage />} />
      <Route path="/free-practice" element={<FreePracticeIndexPage />} />
      <Route path="/free-practice/pentatonic-position" element={<PentatonicPositionPage />} />
      <Route path="/free-practice/pentatonic-transition" element={<PentatonicTransitionPage />} />
      <Route path="/free-practice/fretboard-quiz" element={<FretboardQuizPage />} />
      <Route path="/free-practice/find-the-note-warmup" element={<FindNoteWarmupPage />} />
      <Route path="/fretboard-builder" element={<FretboardBuilderPage />} />
    </Routes>
  )
}

function App() {
  return (
    <HashRouter>
      <AppRoutes />
    </HashRouter>
  )
}

export default App
