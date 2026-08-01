# Key Builder — Exercise Spec

Learn to construct major/minor keys quickly. Build scales and diatonic chords.

## Concept

System shows a root note and key type. User builds the scale by selecting notes, then optionally builds the diatonic chord set.

**Why this second**: Builds on Note Finder. Teaches interval relationships and functional harmony. Naturally extends into Diatonic Chords.

## Exercise Variants

### KeyBuilderExerciseConfig
```ts
interface KeyBuilderExerciseConfig {
  root: string                 // 'C', 'D', 'F#', etc.
  keyType: 'major' | 'natural-minor'  // Later: harmonic minor, dorian, etc.
  
  mode: 'scale-only' | 'scale-and-chords'
  
  // Skill gates
  difficulty: 'text-input' | 'select-from-notes' | 'select-and-voice'
  
  timed?: boolean
  timeoutMs?: number
}
```

## Exercise Flow

### Mode 1: Scale Building (Text Input)
```
1. Show: "Build D major"
2. User types notes: D E F# G A B C# (space or comma separated)
3. Validate each note
4. Show: "✓ All correct" or "✗ Missing C#, extra D"
5. Feedback: response time, accuracy
```

### Mode 2: Scale Selection (Multiple Choice)
```
1. Show: "Build A major"
2. Display 12 note buttons: C C# D D# E F ... B
3. User clicks note buttons to select
4. Visual feedback: selected notes highlight
5. "Submit" button → validate
6. If wrong: "Missing F#" or "Extra C"
```

### Mode 3: Scale + Chords (Advanced)
```
1. Build scale (as above)
2. Build diatonic chords on fretboard:
   - User selects chord voicings for I, ii, iii, IV, V, vi, vii°
   - Show on fretboard (multiple highlighted positions per chord)
   - Validate root notes are correct
```

## Data Model

### Theory Engine (new)

```ts
// src/features/theory/scales.ts

export const SCALE_INTERVALS = {
  major: [0, 2, 4, 5, 7, 9, 11],        // W-W-H-W-W-W-H
  naturalMinor: [0, 2, 3, 5, 7, 8, 10], // W-H-W-W-H-W-W
}

export function buildScale(root: string, scaleType: keyof typeof SCALE_INTERVALS): string[] {
  const rootIndex = NOTE_INDICES[root]
  const intervals = SCALE_INTERVALS[scaleType]
  return intervals.map(interval => ALL_NOTES[(rootIndex + interval) % 12])
}

// Diatonic chords in major key
export function getDiatonicChords(root: string, keyType: 'major' | 'minor') {
  if (keyType === 'major') {
    const scale = buildScale(root, 'major')
    return {
      I: [scale[0], scale[2], scale[4]],    // 1–3–5
      ii: [scale[1], scale[3], scale[5]],   // 2–4–6
      iii: [scale[2], scale[4], scale[6]],  // 3–5–7
      IV: [scale[3], scale[5], scale[0]],   // 4–6–1
      V: [scale[4], scale[6], scale[1]],    // 5–7–2
      vi: [scale[5], scale[0], scale[2]],   // 6–1–3
      vii: [scale[6], scale[1], scale[3]],  // 7–2–4 (diminished)
    }
  }
  // ... similar for minor
}
```

### ExerciseInstance
```ts
interface ExerciseInstance {
  type: 'key-builder'
  config: KeyBuilderExerciseConfig
}
```

### Result Tracking
```ts
// Extend ExerciseResult
metrics?: {
  exerciseType: 'key-builder'
  responseTimeMs: 3200
  accuracy: 1.0  // 100%
  weakKeys?: ['F#', 'Bb']  // keys user struggled with
  mode: 'scale-only' | 'scale-and-chords'
}
```

## Difficulty Progression (Skill 1–10)

| Skill | Mode | Example |
|-------|------|---------|
| 1–2 | Text input, white keys (C, D, E, F, G, A, B) | "Build C major: C D E F G A B" |
| 3–4 | Text input, all keys | "Build F# major: F# G# A# B C# D# E#" |
| 5–6 | Select from buttons (avoid typing errors) | Click: [A] [B] [C#] [D] [E] [F#] [G#] |
| 7–8 | Scale + chords (name the diatonic chords) | "V in G major? → D major" |
| 9–10 | Voice chords on fretboard | "Play I–IV–V–I progression in D" |

## UI Needed

### New Component: KeyBuilderExercise
```tsx
interface KeyBuilderExerciseProps {
  instance: ExerciseInstance
  onComplete: (rating: 'easy' | 'medium' | 'hard' | 'skipped') => void
}
```

### Sub-component: ScaleNoteSelector
- 12 note buttons with visual selection state
- "Submit" button

### Sub-component: ChordVoiceSelector
- Displays diatonic chord names (I, ii, iii, IV, V, vi, vii°)
- Fretboard below showing current selections
- User clicks fret positions to add chord notes

## Integration Points

### Session Generator
```ts
// In generateDailySession()
if (skills.keys >= 3) {
  exercises.push({
    type: 'key-builder',
    config: {
      root: randomKey(),
      keyType: 'major',
      mode: skills.keys >= 7 ? 'scale-and-chords' : 'scale-only',
      difficulty: skills.keys >= 5 ? 'select-from-notes' : 'text-input',
    }
  })
}
```

### Skill Adaptation
- Track `skills.keys` from 1–10
- Weight weak keys higher in future sessions

### Fretboard.tsx Integration
- For "chords" mode, use `coloredPositions` to show different chords
- Each chord gets a distinct color (emerald for I, blue for IV, etc.)

## Validation Logic

### Scale Validation
```ts
function validateScale(userInput: string[], expectedScale: string[]): {
  correct: boolean
  missing: string[]
  extra: string[]
} {
  const userSet = new Set(userInput.map(note => normalizeNote(note)))
  const expectedSet = new Set(expectedScale)
  
  return {
    correct: userSet.size === expectedSet.size && [...userSet].every(n => expectedSet.has(n)),
    missing: [...expectedSet].filter(n => !userSet.has(n)),
    extra: [...userSet].filter(n => !expectedSet.has(n)),
  }
}
```

### Chord Validation
```ts
function validateChord(userNotes: string[], expectedChord: string[]): boolean {
  const userSet = new Set(userNotes.map(normalizeNote))
  return expectedChord.every(n => userSet.has(n))
}
```

## Feedback & Scoring

| Event | Feedback |
|-------|----------|
| Submit scale | Show missing/extra notes; allow retry or move on |
| All correct | "Perfect! C, E, G, B are the major scale degrees" |
| Incomplete | "Missing F# (the 4th)" — teach the role |
| Timed out | Show what was missing, move to rating |

## Audio Integration

- Optionally play the scale as user types (sequencer)
- Play each chord when selected
- Reinforce audio + visual connection

## Code Estimate

- **scales.ts** — scale builder, diatonic chord logic (~100 lines)
- **KeyBuilderExercise.tsx** — main component (~250 lines)
- **ScaleNoteSelector.tsx** — note picker (~100 lines)
- **ChordVoiceSelector.tsx** — chord builder (~150 lines)
- **Session generator** — add key-builder type (~30 lines)
- **Zustand store** — track keys skill (~10 lines)

Total: ~640 lines. Medium risk (new theory engine, but well-defined logic).

## Next: Diatonic Chords

Once users can build scales, the jump to "name the IV chord in D major" is natural.
