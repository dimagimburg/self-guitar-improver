import { useState, useEffect } from 'react'
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
  const [view, setViewState] = useState<AppView>(() => {
    const params = new URLSearchParams(window.location.search)
    return (params.get('view') as AppView) || 'session'
  })
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  const setView = (newView: AppView) => {
    setViewState(newView)
    window.history.pushState(null, '', `?view=${newView}`)
    setElapsedSeconds(0)
  }

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search)
      const newView = (params.get('view') as AppView) || 'session'
      setViewState(newView)
      setElapsedSeconds(0)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

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

  const TimerDisplay = () => (
    <div className="fixed top-6 right-6 z-50">
      <div className="text-white text-3xl font-bold font-mono bg-gray-800 px-6 py-3 rounded-lg border border-gray-700">
        {formatTime(elapsedSeconds)}
      </div>
    </div>
  )

  if (view === 'pentatonic-map') {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <TimerDisplay />
        <PentatonicMapView onBack={() => setView('session')} />
      </div>
    )
  }

  if (view === 'free-practice') {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <TimerDisplay />
        <FreePracticeView onBack={() => setView('session')} />
      </div>
    )
  }

  if (view === 'fretboard-builder') {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <TimerDisplay />
        <FretboardBuilderView onBack={() => setView('session')} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <TimerDisplay />
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
