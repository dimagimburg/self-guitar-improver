import { v4 as uuidv4 } from 'uuid'
import { ExerciseInstance, ExerciseResult, FretboardMode, PentatonicMode, Session, SkillState } from '../../types'
import { ALL_NOTES, getNoteAtFret, getPentatonicPositionFrets, isPentatonicBoxValid, STANDARD_TUNING } from '../../data/notes'

// --- Weighted random selection ---

function weightedRandomFrom<T extends string>(
  candidates: T[],
  history: ExerciseResult[],
  getLabel: (r: ExerciseResult) => string | undefined
): T {
  const recent = history.slice(-10)
  const hardCounts: Record<string, number> = {}
  for (const r of recent) {
    if (r.rating === 'hard') {
      const label = getLabel(r)
      if (label) hardCounts[label] = (hardCounts[label] ?? 0) + 1
    }
  }
  const weights = candidates.map(c => Math.min(1 + (hardCounts[c] ?? 0) * 1.5, 4))
  const total = weights.reduce((s, w) => s + w, 0)
  let rand = Math.random() * total
  for (let i = 0; i < candidates.length; i++) {
    rand -= weights[i]
    if (rand <= 0) return candidates[i]
  }
  return candidates[candidates.length - 1]
}

// --- Mode pickers ---

function pickFretboardMode(skill: number): FretboardMode {
  const r = Math.random()
  if (skill <= 3) return 'find'
  if (skill <= 6) {
    if (r < 0.60) return 'find'
    if (r < 0.85) return 'string_focus'
    return 'identify'
  }
  if (r < 0.40) return 'find'
  if (r < 0.70) return 'string_focus'
  return 'identify'
}

function pickPentatonicMode(skill: number): PentatonicMode {
  const r = Math.random()
  if (skill <= 3) return r < 0.70 ? 'ascending' : 'descending'
  if (skill <= 6) {
    if (r < 0.33) return 'ascending'
    if (r < 0.66) return 'descending'
    return 'alternating'
  }
  if (r < 0.25) return 'ascending'
  if (r < 0.50) return 'descending'
  if (r < 0.75) return 'alternating'
  return 'target_note'
}

// --- BPM / duration helpers ---

function getBaseBpm(skill: number): number {
  return 60 + (skill - 1) * 8
}

function getFretboardDuration(skill: number): number {
  return Math.max(60, 90 - (skill - 1) * 5)
}

// --- Fretboard note for 'identify' mode: derive note from string+fret ---

function pickIdentifyPosition(scope: 'full' | 'limited'): { identifyString: number; identifyFret: number } {
  const identifyString = Math.floor(Math.random() * 6)
  const maxFret = scope === 'full' ? 21 : 12
  const identifyFret = Math.floor(Math.random() * (maxFret + 1))
  return { identifyString, identifyFret }
}

// --- Pick a target note within a pentatonic scale position ---

function pickTargetNoteInPosition(key: string, position: number): string {
  const positions = getPentatonicPositionFrets(key, position)
  if (positions.length === 0) return key
  const pos = positions[Math.floor(Math.random() * positions.length)]
  return getNoteAtFret(STANDARD_TUNING[pos.string], pos.fret)
}

// --- Shuffle array in-place ---

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// --- Weighted draw for block count ---

function pickBlockCount(): 4 | 5 | 6 {
  const r = Math.random()
  if (r < 0.25) return 4
  if (r < 0.75) return 5
  return 6
}

// --- Build a single fretboard exercise ---

function makeFretboardExercise(
  skill: number,
  history: ExerciseResult[],
  duration: number
): ExerciseInstance {
  const scope: 'full' | 'limited' = skill >= 5 ? 'full' : 'limited'
  const mode = pickFretboardMode(skill)

  if (mode === 'identify') {
    const { identifyString, identifyFret } = pickIdentifyPosition(scope)
    return {
      id: uuidv4(),
      type: 'fretboard_note',
      duration,
      params: { scope, mode, identifyString, identifyFret },
    }
  }

  const note = weightedRandomFrom(ALL_NOTES, history, r => r.note)
  const strings = mode === 'string_focus'
    ? (Math.random() < 0.5 ? [3, 4, 5] : [0, 1, 2])
    : undefined

  return {
    id: uuidv4(),
    type: 'fretboard_note',
    duration,
    params: { note, scope, mode, strings },
  }
}

// --- Build a single pentatonic position exercise ---

function makePentatonicExercise(
  skill: number,
  history: ExerciseResult[],
  duration: number,
  position: number
): ExerciseInstance {
  const KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const
  const validKeys = KEYS.filter(k => isPentatonicBoxValid(k, position))
  const key = weightedRandomFrom(validKeys.length > 0 ? validKeys : [...KEYS], history, r => r.key)
  const mode = pickPentatonicMode(skill)
  const bpm = getBaseBpm(skill)

  const params: ExerciseInstance['params'] = { key, position, bpm, mode }
  if (mode === 'target_note') {
    params.targetNote = pickTargetNoteInPosition(key, position)
  }

  return { id: uuidv4(), type: 'pentatonic_position', duration, params }
}

// --- Build a transition exercise ---

function makeTransitionExercise(
  skill: number,
  history: ExerciseResult[],
  duration: number,
  fromPosition: number,
  toPosition: number
): ExerciseInstance {
  const KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const
  const validFromKeys = KEYS.filter(k => isPentatonicBoxValid(k, fromPosition))
  const fromKey = weightedRandomFrom(validFromKeys.length > 0 ? validFromKeys : [...KEYS], history, r => r.key)
  const validToKeys = KEYS.filter(k => isPentatonicBoxValid(k, toPosition) && k !== fromKey)
  const toKey = validToKeys.length > 0
    ? weightedRandomFrom(validToKeys, history, r => r.key)
    : KEYS.filter(k => k !== fromKey)[Math.floor(Math.random() * (KEYS.length - 1))]

  return {
    id: uuidv4(),
    type: 'pentatonic_transition',
    duration,
    params: {
      fromKey,
      toKey,
      fromPosition,
      toPosition,
      bpm: Math.max(60, getBaseBpm(skill) - 10),
    },
  }
}

// --- Main export ---

export function generateDailySession(skills: SkillState, history: ExerciseResult[]): Session {
  const { fretboard, pentatonic } = skills
  const blockCount = pickBlockCount()
  const position = Math.min(Math.ceil(pentatonic / 2), 5)
  const fretDuration = getFretboardDuration(fretboard)

  // Build descriptor list based on block count
  type Descriptor = 'fretboard' | 'penta_main' | 'penta_secondary' | 'transition' | 'fretboard_extra' | 'transition2'

  let descriptors: Descriptor[]
  if (blockCount === 4) {
    descriptors = ['fretboard', 'penta_main', 'penta_secondary', pentatonic >= 4 ? 'transition' : 'fretboard']
  } else if (blockCount === 5) {
    descriptors = ['fretboard', 'fretboard', 'penta_main', 'penta_secondary', pentatonic >= 4 ? 'transition' : 'fretboard']
  } else {
    descriptors = ['fretboard', 'fretboard', 'fretboard_extra', 'penta_main', 'penta_secondary', pentatonic >= 4 ? 'transition' : 'fretboard']
  }

  // Shuffle with constraint: transition must come after both penta blocks
  const pentatonicSet = new Set<Descriptor>(['penta_main', 'penta_secondary', 'transition', 'transition2'])
  const nonPenta = descriptors.filter(d => !pentatonicSet.has(d))
  const pentaGroup = descriptors.filter(d => pentatonicSet.has(d))
  // shuffle non-penta blocks, then append penta group (which itself can be shuffled except transition last)
  shuffle(nonPenta)
  const pentaNonTransition = pentaGroup.filter(d => d !== 'transition' && d !== 'transition2')
  const transitions = pentaGroup.filter(d => d === 'transition' || d === 'transition2')
  shuffle(pentaNonTransition)
  const orderedDescriptors: Descriptor[] = [...nonPenta, ...pentaNonTransition, ...transitions]

  // Duration budget: target ~1800s total
  const durMap: Record<Descriptor, number> = {
    fretboard: blockCount === 4 ? 100 : fretDuration,
    fretboard_extra: 90,
    penta_main: blockCount === 4 ? 700 : 600,
    penta_secondary: blockCount === 4 ? 400 : 300,
    transition: 300,
    transition2: 240,
  }

  const exercises: ExerciseInstance[] = orderedDescriptors.map(desc => {
    const dur = durMap[desc]
    switch (desc) {
      case 'fretboard':
      case 'fretboard_extra':
        return makeFretboardExercise(fretboard, history, dur)
      case 'penta_main':
        return makePentatonicExercise(pentatonic, history, dur, position)
      case 'penta_secondary':
        return makePentatonicExercise(pentatonic, history, dur, Math.min(position + 1, 5))
      case 'transition':
      case 'transition2': {
        const allPos = [1, 2, 3, 4, 5]
        const fromPos = allPos[Math.floor(Math.random() * allPos.length)]
        const toPos = allPos.filter(p => p !== fromPos)[Math.floor(Math.random() * 4)]
        return makeTransitionExercise(pentatonic, history, dur, fromPos, toPos)
      }
    }
  })

  return {
    id: uuidv4(),
    date: new Date().toISOString().split('T')[0],
    exercises,
    totalDuration: exercises.reduce((s, e) => s + e.duration, 0),
  }
}
