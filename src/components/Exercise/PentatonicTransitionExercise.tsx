import { useMemo, useState, useCallback } from 'react'
import { ExerciseInstance } from '../../types'
import { Fretboard } from '../Fretboard/Fretboard'
import {
  getPentatonicPositionFrets,
  isPentatonicBoxValid,
  NOTE_DISPLAY,
  ALL_NOTES,
} from '../../data/notes'
import { useSequencer } from '../../hooks/useSequencer'
import { SequencerControls } from '../Sequencer/SequencerControls'

interface Props {
  exercise: ExerciseInstance
}

const CAGED_SHAPES = ['', 'A shape', 'G shape', 'E shape', 'D shape', 'C shape']

// CAGED sequence going up the neck: C(5) → A(1) → G(2) → E(3) → D(4) → C(5)
const CAGED_TRANSITIONS = [
  { from: 5, to: 1 },
  { from: 1, to: 2 },
  { from: 2, to: 3 },
  { from: 3, to: 4 },
  { from: 4, to: 5 },
]

function transitionLabel(t: { from: number; to: number }) {
  return `${CAGED_SHAPES[t.from]} → ${CAGED_SHAPES[t.to]}`
}

function dn(key: string) {
  return NOTE_DISPLAY[key] ?? key
}

function sortAscending(positions: Array<{ string: number; fret: number }>) {
  return [...positions].sort((a, b) =>
    a.string !== b.string ? b.string - a.string : a.fret - b.fret
  )
}

function findTransitionIndex(fromPos: number, toPos: number): number {
  const idx = CAGED_TRANSITIONS.findIndex(t => t.from === fromPos && t.to === toPos)
  return idx !== -1 ? idx : 0
}

function isKeyValidForTransition(key: string, transIdx: number): boolean {
  const { from, to } = CAGED_TRANSITIONS[transIdx]
  return isPentatonicBoxValid(key, from) && isPentatonicBoxValid(key, to)
}

function pickValidKeyForTransition(transIdx: number, exclude?: string): string {
  const valid = ALL_NOTES.filter(k => isKeyValidForTransition(k, transIdx) && k !== exclude)
  const pool = valid.length > 0 ? valid : ALL_NOTES.filter(k => k !== exclude)
  return pool[Math.floor(Math.random() * pool.length)]
}

export function PentatonicTransitionExercise({ exercise }: Props) {
  const { key: initKey, fromKey, fromPosition, toPosition, bpm } = exercise.params

  const initKey_ = initKey ?? fromKey ?? 'A'
  const initTransIdx = findTransitionIndex(fromPosition ?? 1, toPosition ?? 2)

  const [localKey, setLocalKey] = useState(initKey_)
  const [transIdx, setTransIdx] = useState(initTransIdx)

  const { from: fromPos, to: toPos } = CAGED_TRANSITIONS[transIdx]

  const pos1 = useMemo(() => getPentatonicPositionFrets(localKey, fromPos), [localKey, fromPos])
  const pos2 = useMemo(() => getPentatonicPositionFrets(localKey, toPos), [localKey, toPos])

  const seqPositions = useMemo(
    () => [...sortAscending(pos1), ...sortAscending(pos2)],
    [pos1, pos2]
  )

  const seq = useSequencer(seqPositions, bpm ?? 80)

  const activeShape = useMemo(() => {
    if (!seq.isPlaying || seq.activeIndex < 0) return null
    return seq.activeIndex % seqPositions.length < pos1.length ? 1 : 2
  }, [seq.isPlaying, seq.activeIndex, seqPositions.length, pos1.length])

  const stopIfPlaying = useCallback(() => {
    if (seq.isPlaying) seq.toggle()
  }, [seq])

  const handleKeySelect = (k: string) => {
    if (!isKeyValidForTransition(k, transIdx)) return
    stopIfPlaying()
    setLocalKey(k)
  }

  const handleTransitionSelect = (idx: number) => {
    stopIfPlaying()
    setTransIdx(idx)
    if (!isKeyValidForTransition(localKey, idx)) {
      setLocalKey(pickValidKeyForTransition(idx))
    }
  }

  const handleShuffle = useCallback(() => {
    stopIfPlaying()
    const newTransIdx = Math.floor(Math.random() * CAGED_TRANSITIONS.length)
    const newKey = pickValidKeyForTransition(newTransIdx)
    setTransIdx(newTransIdx)
    setLocalKey(newKey)
  }, [stopIfPlaying])

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <p className="text-gray-400 text-sm mb-1">Transition between shapes</p>
        <div className="flex items-center justify-center gap-3">
          <p className="text-2xl font-bold text-emerald-400">
            {dn(localKey)} Minor Pentatonic
          </p>
          <button
            onClick={handleShuffle}
            title="Pick random key & transition"
            className="text-gray-500 hover:text-emerald-400 transition-colors text-lg leading-none"
          >
            ⟳
          </button>
        </div>
        <p className="text-emerald-300 mt-1 text-sm">{transitionLabel(CAGED_TRANSITIONS[transIdx])}</p>
        <p className="text-gray-500 text-sm mt-0.5">Target: {bpm} BPM</p>
      </div>

      {/* Key picker */}
      <div>
        <p className="text-center text-gray-500 text-xs uppercase tracking-wide mb-1.5">Key</p>
        <div className="flex flex-wrap gap-1.5 justify-center">
          {ALL_NOTES.map(k => {
            const valid = isKeyValidForTransition(k, transIdx)
            return (
              <button
                key={k}
                onClick={() => handleKeySelect(k)}
                disabled={!valid}
                className={`px-2.5 py-1 rounded-md text-sm font-semibold transition-colors ${
                  localKey === k
                    ? 'bg-emerald-500 text-white'
                    : valid
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                }`}
              >
                {dn(k)}
              </button>
            )
          })}
        </div>
      </div>

      {/* Transition picker */}
      <div>
        <p className="text-center text-gray-500 text-xs uppercase tracking-wide mb-1.5">Transition</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {CAGED_TRANSITIONS.map((t, i) => (
            <button
              key={i}
              onClick={() => handleTransitionSelect(i)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                transIdx === i
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
            >
              {transitionLabel(t)}
            </button>
          ))}
        </div>
      </div>

      <Fretboard
        highlightedPositions={pos1}
        highlightedPositions2={pos2}
        activePosition={seq.activePosition}
        showOverlapColor={true}
        showLabels={true}
      />

      {seq.isPlaying ? (
        <div className="flex justify-center gap-8 text-sm">
          <span className={`font-semibold transition-all ${activeShape === 1 ? 'text-emerald-400 scale-110' : 'text-gray-600'}`}>
            ▶ {CAGED_SHAPES[fromPos]}
          </span>
          <span className={`font-semibold transition-all ${activeShape === 2 ? 'text-blue-400 scale-110' : 'text-gray-600'}`}>
            ▶ {CAGED_SHAPES[toPos]}
          </span>
        </div>
      ) : (
        <div className="text-center">
          <p className="font-medium text-gray-300 text-sm">
            Connect {CAGED_SHAPES[fromPos]} and {CAGED_SHAPES[toPos]}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            Ascend through the green shape, then transition into the blue
          </p>
        </div>
      )}

      <div className="flex justify-center gap-4 text-sm flex-wrap">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 bg-emerald-500 rounded-full inline-block" />
          <span className="text-gray-400">{CAGED_SHAPES[fromPos]}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 bg-blue-500 rounded-full inline-block" />
          <span className="text-gray-400">{CAGED_SHAPES[toPos]}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 bg-purple-500 rounded-full inline-block" />
          <span className="text-gray-400">Shared positions</span>
        </span>
      </div>

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
    </div>
  )
}
