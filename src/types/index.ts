export type DifficultyRating = 'easy' | 'medium' | 'hard' | 'skipped'

export type ExerciseType = 'fretboard_note' | 'pentatonic_position' | 'pentatonic_transition'

export type FretboardMode = 'find' | 'identify' | 'string_focus'
export type PentatonicMode = 'ascending' | 'descending' | 'alternating' | 'target_note'

export interface ExerciseInstance {
  id: string
  type: ExerciseType
  duration: number // seconds
  params: {
    note?: string
    key?: string
    position?: number
    fromPosition?: number
    toPosition?: number
    bpm?: number
    scope?: 'full' | 'limited'
    strings?: number[]
    mode?: FretboardMode | PentatonicMode
    targetNote?: string      // pentatonic 'target_note' mode
    identifyString?: number  // fretboard 'identify' mode
    identifyFret?: number    // fretboard 'identify' mode
    fromKey?: string         // transition exercise
    toKey?: string
  }
}

export interface Session {
  id: string
  date: string
  exercises: ExerciseInstance[]
  totalDuration: number
}

export interface ExerciseResult {
  exerciseId: string
  exerciseType: ExerciseType
  rating: DifficultyRating
  date: string
  sessionId: string
  note?: string
  key?: string
}

export interface SkillState {
  fretboard: number // 1-10
  pentatonic: number // 1-10
}

export interface AppState {
  currentSession: Session | null
  currentExerciseIndex: number
  sessionPhase: 'start' | 'exercise' | 'feedback' | 'complete'
  history: ExerciseResult[]
  skills: SkillState
  startSession: () => void
  goToFeedback: () => void
  completeExercise: (rating: DifficultyRating) => void
  resetSession: () => void
}
