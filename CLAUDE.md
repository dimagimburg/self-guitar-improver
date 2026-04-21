# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Vite dev server
npm run build     # TypeScript compile + Vite build
npm run lint      # ESLint
npm run preview   # Preview production build
```

No test suite exists yet.

## Stack

React 18 + TypeScript + Vite, Tailwind CSS, Zustand (with localStorage persistence), Web Audio API. No backend — all state is client-side.

## Architecture

### App routing

`App.tsx` owns a `view` state (`'session' | 'pentatonic-map' | 'free-practice' | 'fretboard-builder'`) and renders top-level views. Session flow is separate: it's driven by `sessionPhase` in the Zustand store (`'start' → 'exercise' → 'feedback' → 'complete'`).

### State — `src/store/useAppStore.ts`

Single Zustand store, persisted to localStorage. Holds:
- `currentSession` / `currentExerciseIndex` / `sessionPhase`
- `history: ExerciseResult[]` — every rated exercise ever
- `skills: { fretboard: number, pentatonic: number }` — 1–10 each

`startSession()` calls `generateDailySession(skills)` and resets phase to `'exercise'`. `completeExercise(rating)` appends to history, calls `computeUpdatedSkills()`, and advances the index.

### Session generation — `src/features/session/sessionGenerator.ts`

`generateDailySession(skills)` builds 4–6 `ExerciseInstance` objects targeting ~1800 s total. Exercise type and params are skill-gated:
- Skill 1–3 → limited scope / ascending only
- Skill 4–6 → medium scope / more modes
- Skill 7–10 → full neck / all modes including `target_note` and `alternating`

Recent "hard" ratings increase re-selection probability via weighted random selection over `history`.

### Skill adaptation — `src/features/skills/adaptation.ts`

`computeUpdatedSkills(history, current)` adjusts skill ±1 based on last 1–2 ratings. Easy×2 → +1, hard → −1, skipped → −0.5. Clamped to [1, 10].

### Exercise components — `src/components/Exercise/`

Three components, each accepts `ExerciseInstance`:
- `FretboardNoteExercise` — find/string_focus modes use the sequencer; `identify` mode is a self-contained `IdentifyQA` sub-component (12 Q&A, keyboard input, auto-advance)
- `PentatonicPositionExercise` — local key/position state with pickers; builds `seqPositions` from scale pattern then hands off to `useSequencer`
- `PentatonicTransitionExercise` — two independent position states; sequences through both shapes with a shared-notes display

### Pentatonic data — `src/data/notes.ts`

All pentatonic logic lives here. Key facts:
- String indices: 0 = high e, 5 = low E
- `PENTATONIC_POSITIONS` stores fret *offsets* from the root position on the low E string. Box 2 and Box 3 G-string notes are shifted −1 fret to account for the G–B tuning break (major 3rd, not perfect 4th).
- `getPentatonicPositionFrets(root, position)` — single octave, filtered to 0–21
- `getAllPentatonicPositions(root, position)` — tries root−12, root, root+12 to cover the full neck
- `isPentatonicBoxValid(root, position)` — true only when all 12 notes of the box fit within frets 0–21; used to disable invalid key+box combos in pickers

Note display: internal storage uses sharps only (`ALL_NOTES`). `NOTE_DISPLAY` maps to flat names where conventional (A# → Bb, D# → Eb, G# → Ab).

### Sequencer — `src/hooks/useSequencer.ts`

`useSequencer(positions, initialBpm)` schedules a `setTimeout` loop through `FretPosition[]`, playing audio and updating `activeIndex`. Sound modes: `none | tick | note`. The `note` mode synthesizes a guitar-like timbre with 5 harmonics via Web Audio API. `usePlayNote()` is a standalone hook for one-shot note playback (used in the fretboard Q&A).

### Fretboard component — `src/components/Fretboard/Fretboard.tsx`

22 frets (0–21), 6 strings. Renders full-viewport-width via `w-screen left-1/2 -translate-x-1/2` breakout, capped at `max-w-[1300px]`. Mid-neck position dots are absolutely positioned at the bottom edge of the G-string row (zero height impact). Accepts:
- `highlightedPositions` / `highlightedPositions2` — emerald / blue dots
- `coloredPositions: ColoredPosition[]` — takes priority, arbitrary Tailwind bg class per dot
- `onFretClick` — makes cells clickable with hover indicator; used by FretboardBuilder

### CAGED shape names

Box 1 = E shape, Box 2 = G shape, Box 3 = D shape, Box 4 = A shape, Box 5 = C shape.
