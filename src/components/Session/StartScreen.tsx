import { useAppStore } from '../../store/useAppStore'

interface Props {
  onOpenMap: () => void
  onOpenFreePractice: () => void
  onOpenBuilder: () => void
}

export function StartScreen({ onOpenMap, onOpenFreePractice, onOpenBuilder }: Props) {
  const { startSession, skills, history } = useAppStore()

  const totalSessions = new Set(history.map(h => h.sessionId)).size

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2">Guitar Trainer</h1>
        <p className="text-gray-400">Daily 30-minute practice session</p>
      </div>

      {totalSessions > 0 && (
        <div className="bg-gray-800 rounded-xl p-6 w-full max-w-sm">
          <h2 className="text-gray-400 text-sm mb-3 uppercase tracking-wide">Your Progress</h2>
          <div className="flex justify-around">
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-400">{totalSessions}</p>
              <p className="text-xs text-gray-500">Sessions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-400">{skills.fretboard}/10</p>
              <p className="text-xs text-gray-500">Fretboard</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-400">{skills.pentatonic}/10</p>
              <p className="text-xs text-gray-500">Pentatonic</p>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={startSession}
        className="px-10 py-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xl font-bold rounded-2xl transition-colors shadow-lg shadow-emerald-900/30"
      >
        Start Today's Session
      </button>

      <div className="flex gap-3 flex-wrap justify-center">
        <button
          onClick={onOpenFreePractice}
          className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition-colors text-sm"
        >
          Free Practice
        </button>
        <button
          onClick={onOpenMap}
          className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition-colors text-sm"
        >
          Scale Map
        </button>
        <button
          onClick={onOpenBuilder}
          className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition-colors text-sm"
        >
          Fretboard Canvas
        </button>
      </div>

      <p className="text-gray-600 text-sm">No account needed · Progress saved locally</p>
    </div>
  )
}
