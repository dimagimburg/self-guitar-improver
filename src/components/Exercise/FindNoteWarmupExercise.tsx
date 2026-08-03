import { useState, useEffect } from 'react'
import { ALL_NOTES, NOTE_DISPLAY, STANDARD_TUNING, getNoteAtFret } from '../../data/notes'
import { Fretboard } from '../Fretboard/Fretboard'

const STRING_NAMES = ['e (1st string)', 'B (2nd string)', 'G (3rd string)', 'D (4th string)', 'A (5th string)', 'E (6th string)']

interface TimeRecord {
  time: number
  note: string
  string: number
}

export function FindNoteWarmupExercise() {
  const [currentNote, setCurrentNote] = useState<string>('')
  const [currentString, setCurrentString] = useState<number>(-1)
  const [timeStarted, setTimeStarted] = useState<number | null>(null)
  const [times, setTimes] = useState<TimeRecord[]>([])
  const [isActive, setIsActive] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const generateNewNote = () => {
    const randomNote = ALL_NOTES[Math.floor(Math.random() * ALL_NOTES.length)]
    const randomString = Math.floor(Math.random() * 6)
    setCurrentNote(randomNote)
    setCurrentString(randomString)
    setTimeStarted(Date.now())
    setIsActive(true)
  }

  const handleSpace = (e: KeyboardEvent) => {
    if (e.code !== 'Space') return
    e.preventDefault()

    if (!isActive) {
      generateNewNote()
      return
    }

    if (timeStarted !== null) {
      const elapsed = (Date.now() - timeStarted) / 1000
      setTimes(prev => [{ time: elapsed, note: currentNote, string: currentString }, ...prev])
      generateNewNote()
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', handleSpace)
    return () => window.removeEventListener('keydown', handleSpace)
  }, [isActive, timeStarted, currentNote, currentString, times])

  const averageTime = times.length > 0 ? (times.reduce((sum, r) => sum + r.time, 0) / times.length).toFixed(2) : '0'

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-6">
      <div>
        <h1 className="text-4xl font-bold text-white mb-4 text-center">Find the Note Warmup</h1>
        <p className="text-gray-400 text-center">Press SPACE to start, press SPACE each time you find the note on your guitar</p>
      </div>

      <div className="flex flex-col items-center gap-8">
        {!isActive ? (
          <button
            onClick={() => generateNewNote()}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors"
          >
            Start (or press Space)
          </button>
        ) : (
          <div className="text-center">
            <div className="text-8xl font-bold text-emerald-400">
              {NOTE_DISPLAY[currentNote] || currentNote} on {STRING_NAMES[currentString]}
            </div>
            <div className="text-gray-400 text-lg mt-4">Press SPACE when found</div>
          </div>
        )}
      </div>

      {times.length > 0 && (
        <div className="w-full max-w-2xl bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">Session Stats</h2>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <div className="text-gray-400 text-sm">Notes Found</div>
              <div className="text-3xl font-bold text-white">{times.length}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">Average Time</div>
              <div className="text-3xl font-bold text-emerald-400">{averageTime}s</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">Fastest</div>
              <div className="text-3xl font-bold text-blue-400">
                {times.length > 0 ? Math.min(...times.map(t => t.time)).toFixed(2) : '-'}s
              </div>
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto">
            <div className="space-y-2">
              {times.map((record, idx) => (
                <div
                  key={idx}
                  className="flex justify-between text-sm text-gray-300 bg-gray-900 p-2 rounded hover:bg-gray-800 cursor-pointer transition-colors"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <span>{NOTE_DISPLAY[record.note] || record.note} on {STRING_NAMES[record.string]}</span>
                  <span className="font-mono text-emerald-400">{record.time.toFixed(2)}s</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {isActive && (
        <button
          onClick={() => setIsActive(false)}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          Stop Exercise
        </button>
      )}

      {hoveredIndex !== null && (() => {
        const record = times[hoveredIndex]
        const positions: Array<{ string: number; fret: number }> = []

        const stringNote = STANDARD_TUNING[record.string]
        for (let fret = 0; fret < 12; fret++) {
          if (getNoteAtFret(stringNote, fret) === record.note) {
            positions.push({ string: record.string, fret })
          }
        }

        return (
          <>
            <div className="fixed inset-0 bg-black/50 z-40 pointer-events-auto" onClick={() => setHoveredIndex(null)} />
            <div className="fixed top-0 left-1/2 -translate-x-1/2 bg-gray-900 p-8 rounded-b-lg border-b border-l border-r border-gray-600 z-50 shadow-2xl max-w-4xl w-11/12 max-h-80 overflow-y-auto"
              onMouseLeave={() => {}}
            >
              <div className="mb-6">
                <h3 className="text-3xl font-bold text-emerald-400 mb-2">
                  {NOTE_DISPLAY[record.note] || record.note}
                </h3>
                <p className="text-gray-400 text-sm">Find on {STRING_NAMES[record.string]}</p>
              </div>
              <Fretboard
                highlightedPositions={positions}
                maxFrets={12}
                compact={false}
                showStringLabels={true}
                tuning={STANDARD_TUNING}
                showLabels={true}
              />
              <p className="text-gray-500 text-xs mt-4 text-center cursor-pointer hover:text-gray-400" onClick={() => setHoveredIndex(null)}>Click to close</p>
            </div>
          </>
        )
      })()}
    </div>
  )
}
