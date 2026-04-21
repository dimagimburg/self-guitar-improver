import { useState } from 'react'
import { useAppStore } from './store/useAppStore'
import { StartScreen } from './components/Session/StartScreen'
import { ExerciseScreen } from './components/Session/ExerciseScreen'
import { FeedbackScreen } from './components/Session/FeedbackScreen'
import { CompleteScreen } from './components/Session/CompleteScreen'
import { PentatonicMapView } from './components/PentatonicMap/PentatonicMapView'
import { FreePracticeView } from './components/FreePractice/FreePracticeView'
import { FretboardBuilderView } from './components/FretboardBuilder/FretboardBuilderView'

type AppView = 'session' | 'pentatonic-map' | 'free-practice' | 'fretboard-builder'

function App() {
  const { sessionPhase } = useAppStore()
  const [view, setView] = useState<AppView>('session')

  if (view === 'pentatonic-map') {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <PentatonicMapView onBack={() => setView('session')} />
      </div>
    )
  }

  if (view === 'free-practice') {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <FreePracticeView onBack={() => setView('session')} />
      </div>
    )
  }

  if (view === 'fretboard-builder') {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <FretboardBuilderView onBack={() => setView('session')} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {sessionPhase === 'start' && (
        <StartScreen
          onOpenMap={() => setView('pentatonic-map')}
          onOpenFreePractice={() => setView('free-practice')}
          onOpenBuilder={() => setView('fretboard-builder')}
        />
      )}
      {sessionPhase === 'exercise' && <ExerciseScreen />}
      {sessionPhase === 'feedback' && <FeedbackScreen />}
      {sessionPhase === 'complete' && <CompleteScreen />}
    </div>
  )
}

export default App
