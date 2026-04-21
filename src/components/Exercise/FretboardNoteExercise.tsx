import { useState, useMemo, useEffect, useCallback } from 'react'
import { ExerciseInstance } from '../../types'
import { Fretboard } from '../Fretboard/Fretboard'
import { ALL_NOTES, getFretboardPositions, getNoteAtFret, STANDARD_TUNING } from '../../data/notes'
import { useSequencer, usePlayNote } from '../../hooks/useSequencer'
import { SequencerControls } from '../Sequencer/SequencerControls'

const STRING_NAMES = ['e', 'B', 'G', 'D', 'A', 'E']
const QUESTION_COUNT = 12

interface Question {
  string: number
  fret: number
  answer: string
}

function generateQuestions(scope: 'full' | 'limited'): Question[] {
  const maxFret = scope === 'full' ? 21 : 12
  return Array.from({ length: QUESTION_COUNT }, () => {
    const s = Math.floor(Math.random() * 6)
    const f = Math.floor(Math.random() * (maxFret + 1))
    return { string: s, fret: f, answer: getNoteAtFret(STANDARD_TUNING[s], f) }
  })
}

interface Props {
  exercise: ExerciseInstance
}

// Sort positions low E → high e (string 5→0), then fret ascending
function sortPositions(positions: Array<{ string: number; fret: number }>) {
  return [...positions].sort((a, b) =>
    a.string !== b.string ? b.string - a.string : a.fret - b.fret
  )
}

function IdentifyQA({ scope }: { scope: 'full' | 'limited' }) {
  const [questions] = useState<Question[]>(() => generateQuestions(scope))
  const [idx, setIdx] = useState(0)
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [scores, setScores] = useState<boolean[]>([])
  const [done, setDone] = useState(false)
  const playNote = usePlayNote()

  const current = questions[idx]
  const correctCount = scores.filter(Boolean).length

  const submit = useCallback((answer: string) => {
    if (!answer || feedback !== null) return
    const correct = answer === current.answer
    setFeedback(correct ? 'correct' : 'wrong')
    setScores(s => [...s, correct])
    setTimeout(() => {
      if (idx + 1 >= QUESTION_COUNT) {
        setDone(true)
      } else {
        setIdx(i => i + 1)
        setInput('')
        setFeedback(null)
      }
    }, 1200)
  }, [feedback, current, idx])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (done || feedback !== null) return
      const key = e.key
      if (/^[a-gA-G]$/.test(key)) {
        e.preventDefault()
        setInput(key.toUpperCase())
      } else if (key === '#' && /^[A-G]$/.test(input)) {
        e.preventDefault()
        setInput(input + '#')
      } else if (key === 'Backspace') {
        e.preventDefault()
        setInput('')
      } else if ((key === 'Enter' || key === ' ') && input) {
        e.preventDefault()
        submit(input)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [done, feedback, input, submit])

  if (done) {
    const pct = Math.round((correctCount / QUESTION_COUNT) * 100)
    return (
      <div className="flex flex-col gap-6 items-center text-center py-4">
        <p className="text-gray-400 text-sm">Session complete</p>
        <p className="text-6xl font-bold text-emerald-400">{correctCount}/{QUESTION_COUNT}</p>
        <p className="text-gray-300 text-lg">
          {pct >= 90 ? 'Excellent!' : pct >= 70 ? 'Good job!' : 'Keep practicing!'}
        </p>
        <div className="flex gap-1 mt-2">
          {scores.map((s, i) => (
            <div key={i} className={`w-4 h-4 rounded-full ${s ? 'bg-emerald-500' : 'bg-red-500'}`} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Progress bar */}
      <div className="flex justify-between items-center text-sm text-gray-400 px-1">
        <span>Question {idx + 1} / {QUESTION_COUNT}</span>
        <span className={correctCount > 0 ? 'text-emerald-400' : ''}>
          {scores.length > 0 ? `${correctCount}/${scores.length} correct` : ''}
        </span>
      </div>
      <div className="w-full h-1 bg-gray-700 rounded-full">
        <div
          className="h-1 bg-emerald-500 rounded-full transition-all"
          style={{ width: `${(idx / QUESTION_COUNT) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="text-center">
        <p className="text-gray-400 text-sm mb-1">Name the note at</p>
        <div className="flex items-center justify-center gap-3">
          <p className="text-3xl font-bold text-emerald-400">
            Fret {current.fret} · String {STRING_NAMES[current.string]}
          </p>
          <button
            onClick={() => playNote(current.string, current.fret)}
            title="Play note"
            className="w-9 h-9 rounded-full bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white flex items-center justify-center transition-colors text-base"
          >
            ♪
          </button>
        </div>
        <p className="text-gray-500 text-xs mt-1">Type a note + Enter, or click a button below</p>
      </div>

      {/* Fretboard */}
      <Fretboard
        highlightedPositions={[{ string: current.string, fret: current.fret }]}
        showLabels={feedback !== null}
      />

      {/* Feedback / Input display */}
      <div className="flex flex-col items-center gap-3">
        {feedback ? (
          <div className={`text-2xl font-bold ${feedback === 'correct' ? 'text-emerald-400' : 'text-red-400'}`}>
            {feedback === 'correct' ? `✓ ${current.answer}` : `✗ ${current.answer}`}
          </div>
        ) : (
          <div className="flex items-center gap-3 h-10">
            <div className="text-2xl font-bold text-white min-w-[3rem] text-center">
              {input || <span className="text-gray-600">?</span>}
            </div>
            {input && (
              <button
                onClick={() => submit(input)}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors"
              >
                Submit ↵
              </button>
            )}
          </div>
        )}

        {/* Note buttons */}
        {!feedback && (
          <div className="flex flex-wrap gap-2 justify-center max-w-sm">
            {ALL_NOTES.map(note => (
              <button
                key={note}
                onClick={() => submit(note)}
                className={`w-12 h-9 rounded-lg font-semibold text-sm transition-colors ${
                  input === note
                    ? 'bg-emerald-500 text-white ring-2 ring-emerald-300'
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
              >
                {note}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function FretboardNoteExercise({ exercise }: Props) {
  const [revealed, setRevealed] = useState(false)
  const { note, scope, mode, strings } = exercise.params

  const focusStrings = strings ?? [3, 4, 5]

  // Compute all positions up front (hooks must be unconditional)
  const allPositions = useMemo(
    () => sortPositions(getFretboardPositions(note ?? '')),
    [note]
  )
  const stringFocusPositions = useMemo(
    () => allPositions.filter(p => focusStrings.includes(p.string)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allPositions, focusStrings.join(',')]
  )

  const seqPositions = mode === 'string_focus' ? stringFocusPositions : allPositions
  const seq = useSequencer(seqPositions)

  // --- 'identify' mode: rolling Q&A ---
  if (mode === 'identify') {
    return (
      <div className="flex flex-col gap-6">
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-1">Fretboard Note Finding</p>
          <p className="text-gray-500 text-xs">{scope === 'full' ? 'Full neck · Frets 0–21' : 'Lower neck · Frets 0–12'}</p>
        </div>
        <IdentifyQA scope={scope ?? 'limited'} />
      </div>
    )
  }

  // --- 'string_focus' mode ---
  if (mode === 'string_focus') {
    const positions = revealed ? stringFocusPositions : []
    const stringLabel = focusStrings.map(s => STRING_NAMES[s]).join(', ')
    const groupLabel = focusStrings[0] <= 2 ? 'Upper strings' : 'Lower strings'
    return (
      <div className="flex flex-col gap-6">
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-1">Find all positions of</p>
          <p className="text-5xl font-bold text-emerald-400">{note}</p>
          <p className="text-gray-500 text-sm mt-1">{groupLabel} only ({stringLabel})</p>
        </div>

        <Fretboard
          highlightedPositions={positions}
          showLabels={revealed}
          activePosition={revealed ? seq.activePosition : undefined}
        />

        <div className="flex justify-center">
          <button
            onClick={() => setRevealed(r => !r)}
            className="px-6 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-semibold transition-colors"
          >
            {revealed ? 'Hide' : 'Reveal'}
          </button>
        </div>

        {revealed && (
          <SequencerControls
            isPlaying={seq.isPlaying}
            bpm={seq.bpm}
            soundMode={seq.soundMode}
            highlightEnabled={seq.highlightEnabled}
            onToggle={seq.toggle}
            onBpmChange={seq.setBpm}
            onSoundModeChange={seq.setSoundMode}
            onHighlightChange={seq.setHighlightEnabled}
          />
        )}
      </div>
    )
  }

  // --- 'find' mode (default) ---
  const positions = revealed ? allPositions : []
  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <p className="text-gray-400 text-sm mb-1">Find all positions of</p>
        <p className="text-5xl font-bold text-emerald-400">{note}</p>
        <p className="text-gray-500 text-sm mt-1">
          {scope === 'full' ? 'Full neck · Frets 0–21' : 'Frets 0–12'}
        </p>
      </div>

      <Fretboard
        highlightedPositions={positions}
        showLabels={revealed}
        activePosition={revealed ? seq.activePosition : undefined}
      />

      <div className="flex justify-center">
        <button
          onClick={() => setRevealed(r => !r)}
          className="px-6 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-semibold transition-colors"
        >
          {revealed ? 'Hide' : 'Reveal'}
        </button>
      </div>

      {revealed && (
        <SequencerControls
          isPlaying={seq.isPlaying}
          bpm={seq.bpm}
          soundMode={seq.soundMode}
          highlightEnabled={seq.highlightEnabled}
          onToggle={seq.toggle}
          onBpmChange={seq.setBpm}
          onSoundModeChange={seq.setSoundMode}
          onHighlightChange={seq.setHighlightEnabled}
        />
      )}
    </div>
  )
}
