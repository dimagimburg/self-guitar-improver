import { ExerciseResult, SkillState, ExerciseType } from '../../types'

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val))
}

export function computeUpdatedSkills(
  current: SkillState,
  history: ExerciseResult[]
): SkillState {
  const updated = { ...current }

  const skillForType = (type: ExerciseType): keyof SkillState => {
    if (type === 'fretboard_note') return 'fretboard'
    return 'pentatonic'
  }

  // Group by type, take last 2 results
  const byType: Partial<Record<ExerciseType, ExerciseResult[]>> = {}
  history.forEach(r => {
    if (!byType[r.exerciseType]) byType[r.exerciseType] = []
    byType[r.exerciseType]!.push(r)
  })

  Object.entries(byType).forEach(([type, results]) => {
    const skill = skillForType(type as ExerciseType)
    const last2 = results.slice(-2)

    if (last2.length === 2 && last2.every(r => r.rating === 'easy')) {
      updated[skill] = clamp(updated[skill] + 1, 1, 10)
    } else if (last2[last2.length - 1]?.rating === 'hard') {
      updated[skill] = clamp(updated[skill] - 1, 1, 10)
    } else if (last2[last2.length - 1]?.rating === 'skipped') {
      updated[skill] = clamp(updated[skill] - 0.5, 1, 10)
    }
  })

  return updated
}
