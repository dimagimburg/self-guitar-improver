import { useAppStore } from '../../store/useAppStore'
import { DifficultyRating } from '../../types'

const RATINGS: Array<{ value: DifficultyRating; label: string; color: string }> = [
  { value: 'easy', label: 'Easy', color: 'bg-emerald-600 hover:bg-emerald-500' },
  { value: 'medium', label: 'Medium', color: 'bg-blue-600 hover:bg-blue-500' },
  { value: 'hard', label: 'Hard', color: 'bg-orange-600 hover:bg-orange-500' },
  { value: 'skipped', label: 'Skipped', color: 'bg-gray-700 hover:bg-gray-600' },
]

export function FeedbackScreen() {
  const { completeExercise, currentSession, currentExerciseIndex } = useAppStore()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">How was that?</h2>
        <p className="text-gray-400 text-sm">
          Your answer helps adapt difficulty
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
        {RATINGS.map(({ value, label, color }) => (
          <button
            key={value}
            onClick={() => completeExercise(value)}
            className={`${color} text-white font-semibold py-4 rounded-xl transition-colors text-lg`}
          >
            {label}
          </button>
        ))}
      </div>

      <p className="text-gray-600 text-xs">
        {currentSession
          ? `${currentExerciseIndex + 1} / ${currentSession.exercises.length} complete`
          : ''}
      </p>
    </div>
  )
}
