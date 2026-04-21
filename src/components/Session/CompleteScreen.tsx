import { useAppStore } from '../../store/useAppStore'

export function CompleteScreen() {
  const { resetSession, skills, history, currentSession } = useAppStore()

  const sessionResults = currentSession
    ? history.filter(h => h.sessionId === currentSession.id)
    : []

  const easyCount = sessionResults.filter(r => r.rating === 'easy').length
  const hardCount = sessionResults.filter(r => r.rating === 'hard').length

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-6">
      <div className="text-center">
        <p className="text-6xl mb-4">🎸</p>
        <h2 className="text-3xl font-bold text-white mb-2">Session Complete!</h2>
        <p className="text-gray-400">Great work. Come back tomorrow.</p>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-sm">
        <h3 className="text-gray-400 text-sm mb-4 uppercase tracking-wide">Session Summary</h3>
        <div className="flex justify-around mb-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-400">{sessionResults.length}</p>
            <p className="text-xs text-gray-500">Exercises</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400">{easyCount}</p>
            <p className="text-xs text-gray-500">Easy</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-400">{hardCount}</p>
            <p className="text-xs text-gray-500">Hard</p>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-4 flex justify-around">
          <div className="text-center">
            <p className="text-lg font-bold text-blue-400">{skills.fretboard}/10</p>
            <p className="text-xs text-gray-500">Fretboard</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-purple-400">{skills.pentatonic}/10</p>
            <p className="text-xs text-gray-500">Pentatonic</p>
          </div>
        </div>
      </div>

      <button
        onClick={resetSession}
        className="px-10 py-4 bg-gray-700 hover:bg-gray-600 text-white text-lg font-bold rounded-2xl transition-colors"
      >
        Back to Home
      </button>
    </div>
  )
}
