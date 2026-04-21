import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AppState, DifficultyRating, ExerciseResult } from '../types'
import { generateDailySession } from '../features/session/sessionGenerator'
import { computeUpdatedSkills } from '../features/skills/adaptation'

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentSession: null,
      currentExerciseIndex: 0,
      sessionPhase: 'start',
      history: [],
      skills: { fretboard: 3, pentatonic: 2 },

      startSession: () => {
        const { skills, history } = get()
        const session = generateDailySession(skills, history)
        set({
          currentSession: session,
          currentExerciseIndex: 0,
          sessionPhase: 'exercise',
        })
      },

      goToFeedback: () => {
        set({ sessionPhase: 'feedback' })
      },

      completeExercise: (rating: DifficultyRating) => {
        const { currentSession, currentExerciseIndex, history, skills } = get()
        if (!currentSession) return

        const exercise = currentSession.exercises[currentExerciseIndex]
        const result: ExerciseResult = {
          exerciseId: exercise.id,
          exerciseType: exercise.type,
          rating,
          date: new Date().toISOString(),
          sessionId: currentSession.id,
          note: exercise.params.note,
          key: exercise.params.key ?? exercise.params.fromKey,
        }

        const newHistory = [...history, result]
        const updatedSkills = computeUpdatedSkills(skills, newHistory)

        const nextIdx = currentExerciseIndex + 1
        const isLast = nextIdx >= currentSession.exercises.length

        set({
          history: newHistory,
          skills: updatedSkills,
          currentExerciseIndex: isLast ? currentExerciseIndex : nextIdx,
          sessionPhase: isLast ? 'complete' : 'exercise',
        })
      },

      resetSession: () => {
        set({
          currentSession: null,
          currentExerciseIndex: 0,
          sessionPhase: 'start',
        })
      },
    }),
    {
      name: 'guitar-trainer-storage',
      partialize: (state) => ({
        history: state.history,
        skills: state.skills,
      }),
    }
  )
)
