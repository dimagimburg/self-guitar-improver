import { useState } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { ExerciseRenderer } from '../Exercise/ExerciseRenderer'
import { Timer } from '../Timer/Timer'

const EXERCISE_TITLES: Record<string, string> = {
  fretboard_note: 'Fretboard Note Finding',
  pentatonic_position: 'Pentatonic Position',
  pentatonic_transition: 'Pentatonic Transition',
}

export function ExerciseScreen() {
  const { currentSession, currentExerciseIndex, goToFeedback } = useAppStore()
  const [timerRunning, setTimerRunning] = useState(false)

  if (!currentSession) return null
  const exercise = currentSession.exercises[currentExerciseIndex]
  const total = currentSession.exercises.length

  return (
    <div className="flex flex-col min-h-screen p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-gray-500 text-sm">
            Exercise {currentExerciseIndex + 1} of {total}
          </p>
          <h2 className="text-white font-bold text-lg">
            {EXERCISE_TITLES[exercise.type]}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <Timer
            duration={exercise.duration}
            running={timerRunning}
            onComplete={() => setTimerRunning(false)}
          />
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-800 rounded-full h-1 mb-6">
        <div
          className="bg-emerald-500 h-1 rounded-full transition-all"
          style={{ width: `${((currentExerciseIndex + 1) / total) * 100}%` }}
        />
      </div>

      {/* Exercise content */}
      <div className="flex-1">
        <ExerciseRenderer exercise={exercise} />
      </div>

      {/* Bottom controls */}
      <div className="mt-6 flex flex-col items-center gap-4">
        {!timerRunning && (
          <button
            onClick={() => setTimerRunning(true)}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
          >
            Start Timer
          </button>
        )}

        <button
          onClick={goToFeedback}
          className="w-full max-w-xs px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors"
        >
          Done →
        </button>
      </div>
    </div>
  )
}
