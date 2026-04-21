import { ExerciseInstance } from '../../types'
import { FretboardNoteExercise } from './FretboardNoteExercise'
import { PentatonicPositionExercise } from './PentatonicPositionExercise'
import { PentatonicTransitionExercise } from './PentatonicTransitionExercise'

interface Props {
  exercise: ExerciseInstance
}

export function ExerciseRenderer({ exercise }: Props) {
  switch (exercise.type) {
    case 'fretboard_note':
      return <FretboardNoteExercise exercise={exercise} />
    case 'pentatonic_position':
      return <PentatonicPositionExercise exercise={exercise} />
    case 'pentatonic_transition':
      return <PentatonicTransitionExercise exercise={exercise} />
    default:
      return <div className="text-red-400">Unknown exercise type</div>
  }
}
