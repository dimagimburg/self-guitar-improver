import { useMemo, useState, useCallback } from 'react'
import { ExerciseInstance } from '../../types'
import { Fretboard } from '../Fretboard/Fretboard'
import {
  getPentatonicPositionFrets,
  getNoteAtFret,
  STANDARD_TUNING,
  isPentatonicBoxValid,
  NOTE_DISPLAY,
  ALL_NOTES,
} from '../../data/notes'
import { useSequencer } from '../../hooks/useSequencer'
import { SequencerControls } from '../Sequencer/SequencerControls'

interface Props {
  exercise: ExerciseInstance
}

const POSITION_NAMES = ['', 'Box 1', 'Box 2', 'Box 3', 'Box 4', 'Box 5']
const CAGED_SHAPES  = ['', 'A shape', 'G shape', 'E shape', 'D shape', 'C shape']
const ALL_POSITIONS = [1, 2, 3, 4, 5]

function posLabel(pos: number) {
  return `${POSITION_NAMES[pos]} · ${CAGED_SHAPES[pos]}`
}

function dn(key: string) {
  return NOTE_DISPLAY[key] ?? key
}

function sortAscending(positions: Array<{ string: number; fret: number }>) {
  return [...positions].sort((a, b) =>
    a.string !== b.string ? b.string - a.string : a.fret - b.fret
  )
}

function getScaleNoteNames(positions: Array<{ string: number; fret: number }>): Set<string> {
  return new Set(positions.map(p => getNoteAtFret(STANDARD_TUNING[p.string], p.fret)))
}

function pickValidKey(position: number, exclude?: string): string {
  const valid = ALL_NOTES.filter(k => isPentatonicBoxValid(k, position) && k !== exclude)
  const pool = valid.length > 0 ? valid : ALL_NOTES.filter(k => k !== exclude)
  return pool[Math.floor(Math.random() * pool.length)]
}

function pickRandomExercise() {
  const fromPos = ALL_POSITIONS[Math.floor(Math.random() * ALL_POSITIONS.length)]
  const toPos = ALL_POSITIONS.filter(p => p !== fromPos)[Math.floor(Math.random() * 4)]
  const fromKey = pickValidKey(fromPos)
  const toKey = pickValidKey(toPos, fromKey)
  return { fromPos, toPos, fromKey, toKey }
}

export function PentatonicTransitionExercise({ exercise }: Props) {
  const { key, fromKey: initFromKey, toKey: initToKey, fromPosition, toPosition, bpm } = exercise.params

  const [localFromKey, setLocalFromKey] = useState(initFromKey ?? key ?? 'E')
  const [localToKey, setLocalToKey] = useState(initToKey ?? key ?? 'A')
  const [localFromPos, setLocalFromPos] = useState(fromPosition ?? 5)
  const [localToPos, setLocalToPos] = useState(toPosition ?? 5)

  const sameKey = localFromKey === localToKey
  const samePosition = localFromPos === localToPos

  const pos1 = useMemo(
    () => getPentatonicPositionFrets(localFromKey, localFromPos),
    [localFromKey, localFromPos]
  )
  const pos2 = useMemo(
    () => getPentatonicPositionFrets(localToKey, localToPos),
    [localToKey, localToPos]
  )

  const seqPositions = useMemo(
    () => [...sortAscending(pos1), ...sortAscending(pos2)],
    [pos1, pos2]
  )

  const seq = useSequencer(seqPositions, bpm ?? 80)

  const activeShape = useMemo(() => {
    if (!seq.isPlaying || seq.activeIndex < 0) return null
    const idx = seq.activeIndex % seqPositions.length
    return idx < pos1.length ? 1 : 2
  }, [seq.isPlaying, seq.activeIndex, seqPositions.length, pos1.length])

  const sharedNoteNames = useMemo(() => {
    const notes1 = getScaleNoteNames(pos1)
    const notes2 = getScaleNoteNames(pos2)
    return [...notes1].filter(n => notes2.has(n)).sort().map(n => dn(n))
  }, [pos1, pos2])

  const stopIfPlaying = useCallback(() => {
    if (seq.isPlaying) seq.toggle()
  }, [seq])

  const handleFromKey = (k: string) => {
    if (!isPentatonicBoxValid(k, localFromPos)) return
    stopIfPlaying()
    setLocalFromKey(k)
  }
  const handleToKey = (k: string) => {
    if (!isPentatonicBoxValid(k, localToPos)) return
    stopIfPlaying()
    setLocalToKey(k)
  }
  const handleFromPos = (pos: number) => {
    stopIfPlaying()
    setLocalFromPos(pos)
    if (!isPentatonicBoxValid(localFromKey, pos)) setLocalFromKey(pickValidKey(pos, localToKey))
  }
  const handleToPos = (pos: number) => {
    stopIfPlaying()
    setLocalToPos(pos)
    if (!isPentatonicBoxValid(localToKey, pos)) setLocalToKey(pickValidKey(pos, localFromKey))
  }

  const handleShuffle = useCallback(() => {
    stopIfPlaying()
    const { fromPos, toPos, fromKey, toKey } = pickRandomExercise()
    setLocalFromKey(fromKey)
    setLocalToKey(toKey)
    setLocalFromPos(fromPos)
    setLocalToPos(toPos)
  }, [stopIfPlaying])

  const fromLabel = sameKey ? posLabel(localFromPos) : `${posLabel(localFromPos)} (${dn(localFromKey)})`
  const toLabel   = sameKey ? posLabel(localToPos)   : `${posLabel(localToPos)} (${dn(localToKey)})`

  const title = sameKey
    ? `${dn(localFromKey)} Minor Pentatonic`
    : `${dn(localFromKey)} → ${dn(localToKey)} Minor Pentatonic`

  const subtitle = samePosition
    ? `${posLabel(localFromPos)} — two keys`
    : `${posLabel(localFromPos)} → ${posLabel(localToPos)}`

  const primaryInstruction = samePosition
    ? `Learn ${posLabel(localFromPos)} in both ${dn(localFromKey)} and ${dn(localToKey)}`
    : `Connect ${posLabel(localFromPos)} and ${posLabel(localToPos)}`

  const secondaryInstruction = samePosition
    ? `The shapes share these note names: ${sharedNoteNames.join(', ')} — use them as landmarks`
    : `Ascend through the green shape, then transition into the blue`

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <p className="text-gray-400 text-sm mb-1">Transition between positions</p>
        <div className="flex items-center justify-center gap-3">
          <p className="text-2xl font-bold text-emerald-400">{title}</p>
          <button
            onClick={handleShuffle}
            title="Pick random keys & positions"
            className="text-gray-500 hover:text-emerald-400 transition-colors text-lg leading-none"
          >
            ⟳
          </button>
        </div>
        <p className="text-emerald-300 mt-1 text-sm">{subtitle}</p>
        <p className="text-gray-500 text-sm mt-0.5">Target: {bpm} BPM</p>
      </div>

      {/* Key pickers */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-emerald-400 text-xs uppercase tracking-wide mb-1.5 text-center">From key</p>
          <div className="flex flex-wrap gap-1 justify-center">
            {ALL_NOTES.map(k => {
              const valid = isPentatonicBoxValid(k, localFromPos)
              return (
                <button
                  key={k}
                  onClick={() => handleFromKey(k)}
                  disabled={!valid}
                  className={`px-2 py-0.5 rounded text-xs font-semibold transition-colors ${
                    localFromKey === k
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
        <div>
          <p className="text-blue-400 text-xs uppercase tracking-wide mb-1.5 text-center">To key</p>
          <div className="flex flex-wrap gap-1 justify-center">
            {ALL_NOTES.map(k => {
              const valid = isPentatonicBoxValid(k, localToPos)
              return (
                <button
                  key={k}
                  onClick={() => handleToKey(k)}
                  disabled={!valid}
                  className={`px-2 py-0.5 rounded text-xs font-semibold transition-colors ${
                    localToKey === k
                      ? 'bg-blue-500 text-white'
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
      </div>

      {/* Box pickers */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-emerald-400 text-xs uppercase tracking-wide mb-1.5 text-center">From box</p>
          <div className="flex flex-wrap gap-1 justify-center">
            {ALL_POSITIONS.map(pos => (
              <button key={pos} onClick={() => handleFromPos(pos)}
                className={`px-2 py-0.5 rounded text-xs font-semibold transition-colors ${
                  localFromPos === pos ? 'bg-emerald-500 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
              >
                {POSITION_NAMES[pos]}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-blue-400 text-xs uppercase tracking-wide mb-1.5 text-center">To box</p>
          <div className="flex flex-wrap gap-1 justify-center">
            {ALL_POSITIONS.map(pos => (
              <button key={pos} onClick={() => handleToPos(pos)}
                className={`px-2 py-0.5 rounded text-xs font-semibold transition-colors ${
                  localToPos === pos ? 'bg-blue-500 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
              >
                {POSITION_NAMES[pos]}
              </button>
            ))}
          </div>
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
            ▶ {dn(localFromKey)} Min Pent
          </span>
          <span className={`font-semibold transition-all ${activeShape === 2 ? 'text-blue-400 scale-110' : 'text-gray-600'}`}>
            ▶ {dn(localToKey)} Min Pent
          </span>
        </div>
      ) : (
        <div className="text-center">
          <p className="font-medium text-gray-300 text-sm">{primaryInstruction}</p>
          <p className="text-gray-400 text-sm mt-1">{secondaryInstruction}</p>
        </div>
      )}

      <div className="flex justify-center gap-4 text-sm flex-wrap">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 bg-emerald-500 rounded-full inline-block" />
          <span className="text-gray-400">{fromLabel}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 bg-blue-500 rounded-full inline-block" />
          <span className="text-gray-400">{toLabel}</span>
        </span>
        {sharedNoteNames.length > 0 && (
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-purple-500 rounded-full inline-block" />
            <span className="text-gray-400">Shared positions</span>
          </span>
        )}
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
