# Interval Trainer — Exercise Spec

Connect fretboard geometry with interval awareness.

## Concept

System gives a root note and interval target. User finds the note on the fretboard. Trains visual + aural interval recognition.

**Why valuable**: Intervals are the foundation of all harmony. This trains geometric understanding (same interval always looks the same on fretboard) vs. rote memorization.

## Exercise Variants

### IntervalExerciseConfig
```ts
interface IntervalExerciseConfig {
  root: string                  // 'C', 'D#', etc.
  rootString?: number           // optional: force root on specific string
  
  interval: IntervalType        // 'P1' | 'm2' | 'M2' | 'm3' | 'M3' | 'P4' | etc.
  
  mode: 'ascending' | 'descending' | 'harmonic'  // harmonic = both notes at once
  
  // Skill gates
  stringRestriction?: 'same-string' | 'adjacent-strings' | 'any'
  
  timed?: boolean
  timeoutMs?: number
}

type IntervalType = 'P1' | 'm2' | 'M2' | 'm3' | 'M3' | 'P4' | 'A4' | 'P5' | 'm6' | 'M6' | 'm7' | 'M7' | 'P8'
```

## Exercise Modes

### Mode 1: Melodic Interval (Ascending)
```
1. Show: Root note (highlight on fretboard), then play it
2. Ask: "Find a Major 3rd from C"
3. Root C is shown, user clicks to find E
4. Validate: Is E exactly a M3 above C?
5. Feedback: Highlight both C and E, show semitone count (4 semitones = M3)
```

### Mode 2: Melodic Interval (Descending)
```
1. Show: "Find a Perfect 4th DOWN from G"
2. Root G highlighted
3. User finds D (4 semitones down)
4. Validate and show interval on fretboard
```

### Mode 3: Harmonic Interval
```
1. Show: Root note highlighted
2. Ask: "Find a Major 6th from A (both at same time)"
3. User clicks to add F# (same time as A, different string typically)
4. Show both notes highlighted
5. Play them together (harmonic)
```

## Data Model

### Interval System
```ts
// src/features/theory/intervals.ts

export const INTERVALS: Record<IntervalType, number> = {
  'P1': 0,    // Perfect Unison
  'm2': 1,    // Minor 2nd
  'M2': 2,    // Major 2nd
  'm3': 3,    // Minor 3rd
  'M3': 4,    // Major 3rd
  'P4': 5,    // Perfect 4th
  'A4': 6,    // Augmented 4th (tritone)
  'P5': 7,    // Perfect 5th
  'm6': 8,    // Minor 6th
  'M6': 9,    // Major 6th
  'm7': 10,   // Minor 7th
  'M7': 11,   // Major 7th
  'P8': 12,   // Perfect Octave (unison)
}

export function getIntervalName(semitones: number): IntervalType | null {\n  return Object.entries(INTERVALS).find(([_, s]) => s === semitones)?.[0] as IntervalType | null\n}

export function getNoteAtInterval(root: string, interval: IntervalType, direction: 'up' | 'down' = 'up'): string {
  const rootIndex = NOTE_INDICES[root]\n  const semitones = INTERVALS[interval]\n  const targetIndex = direction === 'up' ? (rootIndex + semitones) % 12 : (rootIndex - semitones + 12) % 12\n  return ALL_NOTES[targetIndex]\n}

export function semitonesBetween(note1: string, note2: string, direction: 'up' | 'down' = 'up'): number {\n  const idx1 = NOTE_INDICES[note1]\n  const idx2 = NOTE_INDICES[note2]\n  \n  if (direction === 'up') {\n    return (idx2 - idx1 + 12) % 12\n  } else {\n    return (idx1 - idx2 + 12) % 12\n  }\n}
```

### ExerciseInstance
```ts
interface ExerciseInstance {
  type: 'interval'
  config: IntervalExerciseConfig
}
```

### Result Tracking
```ts
metrics?: {
  exerciseType: 'interval'
  responseTimeMs: 1850
  accuracy: 1.0
  weakIntervals?: ['A4', 'm6']  // user struggled with these
}
```

## Difficulty Progression (Skill 1–10)

| Skill | Intervals | Mode | Notes |
|-------|-----------|------|-------|
| 1–2 | P1, M2, M3, P4, P5, P8 | Harmonic (easiest visual) | Same key only |
| 3–4 | All common intervals | Ascending melodic | Any key |
| 5–6 | Add tritone (A4/d5) | Ascending + descending | Full fretboard |
| 7–8 | All intervals including m6, M6, m7, M7 | All modes | Timed (5 sec) |
| 9–10 | All intervals + inversions | Rapid-fire (12 intervals, 2 sec each) | Complex keys |

## UI Needed

### New Component: IntervalExercise
```tsx
interface IntervalExerciseProps {
  instance: ExerciseInstance
  onComplete: (rating: 'easy' | 'medium' | 'hard' | 'skipped') => void
}
```

### Fretboard Enhancement
- Highlight root note prominently (e.g., larger dot, different color)
- Show target interval distance visually (e.g., line connecting root to target)
- Color-code intervals (P5 = blue, M3 = green, tritone = red, etc.)

### Information Display
- Show interval name (e.g., "Major 3rd = 4 semitones")
- Show interval on musical staff (optional future feature)
- Play audio: root note, then target note, then both together

## Integration Points

### Session Generator
```ts
// Only include interval exercises if:
if (skills.intervals >= 1) {
  exercises.push({
    type: 'interval',
    config: {
      root: randomNote(),
      interval: randomInterval(skills.intervals),
      mode: skills.intervals >= 5 ? randomMode : 'harmonic',
      stringRestriction: skills.intervals >= 7 ? 'any' : 'same-string',
      timed: skills.intervals >= 8,
      timeoutMs: skills.intervals >= 9 ? 2000 : 5000,
    }
  })
}
```

### Skill Adaptation
- Track `skills.intervals` from 1–10
- Also track per-interval accuracy:
  ```ts
  intervalAccuracy: {
    'P5': { correct: 48, total: 50 },
    'A4': { correct: 8, total: 20 },  // weak: tritone
    'm6': { correct: 6, total: 15 },  // weak
  }
  ```

### Fretboard.tsx
- Add color-coding for interval type
- `coloredPositions` with interval-specific colors
- `intervalHighlight` prop to show geometric interval shape

### useSequencer
- Play root note first
- Brief pause
- Play target note
- Then play both together (harmonic)

## Validation Logic

```ts
function validateInterval(
  rootNote: string,
  targetNote: string,
  expectedInterval: IntervalType,
  direction: 'up' | 'down'
): boolean {
  const semitones = semitonesBetween(rootNote, targetNote, direction)
  const expectedSemitones = INTERVALS[expectedInterval]
  return semitones === expectedSemitones
}
```

## Feedback Examples

| Scenario | Feedback |
|----------|----------|
| Correct | "✓ E is a Major 3rd (4 semitones) above C" |
| Too high | "✗ You clicked F, but that's a Major 4th (5 semitones). Try one fret lower." |
| Too low | "✗ You clicked D#, that's a minor 3rd (3 semitones). Try one fret higher." |
| Harmonic correct | "✓ C and E together = Major 3rd" |

## Audio Integration

- Play root note
- Pause 0.5 sec
- Play target note
- Pause 0.5 sec
- Play both together (harmonic)
- Show interval name as audio plays

## Visualization Ideas

### Interval Colors (consistent across exercises)
- P1/P8 = Gray (unison)
- M2/m7 = Yellow (common)
- M3/m6 = Green (consonant)
- P4/P5 = Blue (perfect consonance)
- M6/m3 = Teal (imperfect consonance)
- A4/d5 = Red (tritone — dissonant)
- M7/m2 = Orange (dissonant)

### Geometric Pattern Recognition
Show how the same interval always has the same visual shape:
- Major 3rd = always a specific fret/string offset
- Perfect 5th = always 2 strings + 2 frets (common pattern)
- Octave = always same fret, 2 string jumps

## Code Estimate

- **intervals.ts** — interval calculations (~100 lines)
- **IntervalExercise.tsx** — main component (~200 lines)
- **Fretboard.tsx** — extend with color-coding (~40 lines)
- **Session generator** — add interval type (~30 lines)
- **Zustand store** — track intervals skill (~15 lines)

Total: ~385 lines. Low–Medium risk (pure logic + component, reuses Fretboard heavily).

## Future: Interval Ear Training

Once visual recognition is solid:
- Remove fretboard, play intervals audibly only
- User names the interval
- Builds aural recognition independent of visual cues
