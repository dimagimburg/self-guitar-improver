# Note Finder — Exercise Spec

Instantly locate notes on the fretboard.

## Concept

System displays a target note, user taps frets to find it. Validates correctness immediately.

**Why this first**: Core fretboard fluency. Reuses Fretboard.tsx almost entirely. Pure skill progression.

## Exercise Variants

### NoteFinderExercise Config
```ts
interface NoteFinderExerciseConfig {
  targetNote: string           // 'C' | 'C#' | 'D' etc.
  mode: 'any-string' | 'specific-string' | 'fret-range'
  stringIndex?: number         // if specific-string
  fretRangeStart?: number      // if fret-range
  fretRangeEnd?: number
  timed?: boolean
  timeoutMs?: number
  
  // Skill gates
  stringRestriction?: 'E-A' | 'D-G-B' | 'full'  // E, A strings vs full neck
}
```

### Difficulty Levels (mapped to skill 1–10)

| Skill | Mode | Notes |
|-------|------|-------|
| 1–2 | Low E string only | 4–5 instances of note on one string |
| 3–4 | Low E + A strings | |
| 5–6 | Full fretboard, any string | |
| 7–8 | Full neck + timed mode (5 sec) | |
| 9–10 | Rapid-fire (12 notes, 2 sec each) | |

## Exercise Flow

```
1. Show target note (large text + maybe play audio)
2. User taps fret positions on Fretboard
3. Tap highlights the fret (visual feedback)
4. System validates:
   - correct note → turns green, count as hit
   - wrong note → turns red, brief animation, stays tappable
5. After all valid positions found (or timeout):
   - Show accuracy % (e.g., "3/4 correct")
   - Show response time
   - Advance or retry
```

## UI Changes Needed

### Fretboard.tsx extension
```ts
// Add to props
incorrect?: FretPosition[]  // highlight red
correct?: FretPosition[]    // highlight green (already have highlightedPositions)

// Add to FretCell
isClickable?: boolean
onCellClick?: (string: number, fret: number) => void
clickState?: 'neutral' | 'hover' | 'correct' | 'incorrect'
```

### New ExerciseInstance type
```ts
interface ExerciseInstance {
  type: 'note-finder'
  config: NoteFinderExerciseConfig
}
```

## Data Model

### User's weak notes tracking
Extend Zustand analytics:
```ts
noteAccuracy: {
  'C': { correct: 45, total: 50 },   // 90%
  'C#': { correct: 12, total: 25 },  // 48% — prioritize this
  'D': { correct: 38, total: 40 },   // 95%
  // ... all 12 pitches
}
```

Session generator can bias toward weak notes via weighted random selection.

## Integration Points

### Session Generator
- `generateDailySession()` includes 'note-finder' exercises
- Weights weak notes higher (from analytics)
- Uses skill level to set difficulty gates

### Skill Adaptation
- `computeUpdatedSkills()` updates `skills.notes` based on rating
- Also updates `noteAccuracy` for weak-note prioritization

### Exercise Component Pattern
```ts
<NoteFinderExercise
  instance={exerciseInstance}
  onComplete={(rating) => handleCompleteExercise(rating)}
/>
```

## Validation & Feedback

| Event | Feedback |
|-------|----------|
| Correct note tapped | Green highlight, brief success tone (optional) |
| Wrong note tapped | Red highlight, sad tone (optional), stays tappable |
| Timeout | Show progress, auto-advance |
| Completed | Accuracy %, response time, move to rating screen |

## Scoring Metrics

Track in ExerciseResult.metrics:
```ts
{
  exerciseType: 'note-finder'
  responseTimeMs: 2350
  accuracy: 0.75  // 3 of 4 correct
  weakNotes: ['C#', 'F#']  // notes the user struggled with
}
```

## Progression Examples

**Skill 2 session**:
- Find C on low E string
- Find G on low E string
- Find D on A string
- etc.

**Skill 5 session**:
- Find all F# on fretboard
- Find B between frets 5–10
- etc.

**Skill 9 session**:
- Rapid-fire: 12 random notes, 2 sec each, full neck

## Code Estimate

- **Fretboard.tsx** — extend with click handling, color states (~50 lines)
- **NoteFinderExercise.tsx** — new component (~200 lines)
- **Session generator** — add note-finder type (~30 lines)
- **Theory utils** — note validation, is-note-on-fret logic (~50 lines)
- **Zustand store** — extend analytics tracking (~20 lines)

Total: ~350 lines, low risk (mostly new, isolated component).
