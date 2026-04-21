import { useMemo, useState, useCallback } from 'react'
import { ExerciseInstance, PentatonicMode } from '../../types'
import { Fretboard } from '../Fretboard/Fretboard'
import {
  getFretboardPositions,
  getPentatonicPositionFrets,
  isPentatonicBoxValid,
  getNoteAtFret,
  STANDARD_TUNING,
  NOTE_DISPLAY,
} from '../../data/notes'
import { useSequencer } from '../../hooks/useSequencer'
import { SequencerControls } from '../Sequencer/SequencerControls'

interface Props {
  exercise: ExerciseInstance
}

const POSITION_NAMES = ['', 'Box 1', 'Box 2', 'Box 3', 'Box 4', 'Box 5']
const CAGED_SHAPES   = ['', 'A shape', 'G shape', 'E shape', 'D shape', 'C shape']
const ALL_KEYS = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#']

function getModeInstructions(
  mode: PentatonicMode | undefined,
  targetNote?: string
): { primary: string; secondary: string } {
  switch (mode) {
    case 'descending':
      return {
        primary: 'Descend from high e → low E',
        secondary: 'Start at the highest note, work down cleanly',
      }
    case 'alternating':
      return {
        primary: 'Ascend then descend — repeat 3×',
        secondary: 'Keep a steady rhythm throughout all passes',
      }
    case 'target_note':
      return {
        primary: `Find and play every ${targetNote} note in this position`,
        secondary: `The blue dots mark every ${targetNote} in this scale shape — play each one across all strings`,
      }
    default:
      return {
        primary: 'Ascend from low E → high e',
        secondary: 'Focus on clean transitions between strings',
      }
  }
}

function sortAscending(positions: Array<{ string: number; fret: number }>) {
  return [...positions].sort((a, b) =>
    a.string !== b.string ? b.string - a.string : a.fret - b.fret
  )
}

function pickRandomValidKey(position: number, exclude?: string): string {
  const valid = ALL_KEYS.filter(k => isPentatonicBoxValid(k, position) && k !== exclude)
  const pool = valid.length > 0 ? valid : ALL_KEYS.filter(k => k !== exclude)
  return pool[Math.floor(Math.random() * pool.length)]
}

function pickTargetNote(key: string, position: number): string {
  const positions = getPentatonicPositionFrets(key, position)
  if (positions.length === 0) return key
  const p = positions[Math.floor(Math.random() * positions.length)]
  return getNoteAtFret(STANDARD_TUNING[p.string], p.fret)
}

export function PentatonicPositionExercise({ exercise }: Props) {
  const { bpm, mode } = exercise.params
  const pentatonicMode = mode as PentatonicMode | undefined

  const [localKey, setLocalKey] = useState(exercise.params.key!)
  const [localPosition, setLocalPosition] = useState(exercise.params.position!)
  const [localTargetNote, setLocalTargetNote] = useState(exercise.params.targetNote)

  const scalePositions = useMemo(
    () => getPentatonicPositionFrets(localKey, localPosition),
    [localKey, localPosition]
  )

  const targetPositions = useMemo(
    () =>
      pentatonicMode === 'target_note' && localTargetNote
        ? getFretboardPositions(localTargetNote).filter(tp =>
            scalePositions.some(sp => sp.string === tp.string && sp.fret === tp.fret)
          )
        : [],
    [pentatonicMode, localTargetNote, scalePositions]
  )

  const seqPositions = useMemo(() => {
    const base = pentatonicMode === 'target_note' ? targetPositions : scalePositions
    if (pentatonicMode === 'descending') {
      return [...sortAscending(base)].reverse()
    }
    if (pentatonicMode === 'alternating') {
      const asc = sortAscending(base)
      return [...asc, ...[...asc].reverse()]
    }
    return sortAscending(base)
  }, [pentatonicMode, scalePositions, targetPositions])

  const seq = useSequencer(seqPositions, bpm ?? 80)

  const stopIfPlaying = useCallback(() => {
    if (seq.isPlaying) seq.toggle()
  }, [seq])

  const handleKeySelect = useCallback((k: string) => {
    if (!isPentatonicBoxValid(k, localPosition)) return
    stopIfPlaying()
    setLocalKey(k)
    if (pentatonicMode === 'target_note') setLocalTargetNote(pickTargetNote(k, localPosition))
  }, [localPosition, pentatonicMode, stopIfPlaying])

  const handlePositionSelect = useCallback((pos: number) => {
    stopIfPlaying()
    const newKey = isPentatonicBoxValid(localKey, pos) ? localKey : pickRandomValidKey(pos)
    setLocalPosition(pos)
    setLocalKey(newKey)
    if (pentatonicMode === 'target_note') setLocalTargetNote(pickTargetNote(newKey, pos))
  }, [localKey, pentatonicMode, stopIfPlaying])

  const handleShuffle = useCallback(() => {
    stopIfPlaying()
    const newPos = Math.floor(Math.random() * 5) + 1
    const newKey = pickRandomValidKey(newPos)
    setLocalKey(newKey)
    setLocalPosition(newPos)
    if (pentatonicMode === 'target_note') setLocalTargetNote(pickTargetNote(newKey, newPos))
  }, [pentatonicMode, stopIfPlaying])

  const handleShuffleNote = useCallback(() => {
    stopIfPlaying()
    setLocalTargetNote(pickTargetNote(localKey, localPosition))
  }, [localKey, localPosition, stopIfPlaying])

  const { primary, secondary } = getModeInstructions(pentatonicMode, localTargetNote)

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <p className="text-gray-400 text-sm mb-1">Practice pentatonic scale</p>
        <p className="text-2xl font-bold text-emerald-400">
          {NOTE_DISPLAY[localKey] ?? localKey} Minor Pentatonic — {POSITION_NAMES[localPosition]} · {CAGED_SHAPES[localPosition]}
        </p>
        <p className="text-gray-500 text-sm mt-1">Target: {bpm} BPM</p>
      </div>

      {/* Key picker */}
      <div className="flex flex-col gap-2">
        <p className="text-center text-gray-500 text-xs uppercase tracking-wide">Key</p>
        <div className="flex flex-wrap gap-1.5 justify-center">
          {ALL_KEYS.map(k => {
            const valid = isPentatonicBoxValid(k, localPosition)
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
                {NOTE_DISPLAY[k] ?? k}
              </button>
            )
          })}
          <button
            onClick={handleShuffle}
            title="Random key & box"
            className="px-2.5 py-1 rounded-md text-sm text-gray-400 hover:text-white bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            ⟳
          </button>
        </div>
      </div>

      {/* Box picker */}
      <div className="flex flex-col gap-2">
        <p className="text-center text-gray-500 text-xs uppercase tracking-wide">Box</p>
        <div className="flex flex-wrap gap-1.5 justify-center">
          {[1, 2, 3, 4, 5].map(pos => (
            <button
              key={pos}
              onClick={() => handlePositionSelect(pos)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                localPosition === pos
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
            >
              {POSITION_NAMES[pos]} · {CAGED_SHAPES[pos]}
            </button>
          ))}
        </div>
      </div>

      <Fretboard
        highlightedPositions={scalePositions}
        highlightedPositions2={targetPositions}
        activePosition={seq.activePosition}
        showLabels={true}
      />

      <div className="text-center text-gray-400 text-sm">
        <div className="flex items-center justify-center gap-2">
          <p className="font-medium text-gray-300">{primary}</p>
          {pentatonicMode === 'target_note' && (
            <button
              onClick={handleShuffleNote}
              title="Pick different target note"
              className="text-gray-500 hover:text-emerald-400 transition-colors text-base leading-none"
            >
              ⟳
            </button>
          )}
        </div>
        <p className="mt-1">{secondary}</p>
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
