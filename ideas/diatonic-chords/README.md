# Diatonic Chords — Exercise Spec

Instantly know chord functions in every key.

## Concept

System asks for a chord function in a given key. User names it, voices it on fretboard, or selects from options.

**Why this third**: Builds directly on Key Builder. Teaches chord substitution, functional harmony, and voice leading.

## Exercise Variants

### DiatonicChordExerciseConfig
```ts
interface DiatonicChordExerciseConfig {
  root: string                          // 'C', 'F#', etc.
  keyType: 'major' | 'natural-minor'
  
  chordFunction: 'I' | 'ii' | 'iii' | 'IV' | 'V' | 'vi' | 'vii' // Roman numeral
  
  mode: 'name' | 'voice' | 'identify' | 'recognize-sound'
  
  // Skill gates
  difficulty: 'triads-only' | 'with-sevenths' | 'inversions'
  
  timed?: boolean
  timeoutMs?: number
}
```

## Exercise Modes

### Mode 1: Name the Chord (Text Input)
```
1. Show: "What is the V chord in G major?"
2. User types: "D" or "D major"
3. Validate: root + quality match expected
4. Feedback: "✓ D major (5–7–2 in G major)"
```

### Mode 2: Voice the Chord on Fretboard
```
1. Show: "Play the IV chord in A major" → "D major"
2. Display fretboard with target root note highlighted
3. User clicks fretboard to add chord notes (root, 3rd, 5th)
4. System validates voicing
5. Show: "✓ Valid D major voicing" or "Missing the 3rd (F#)"
```

### Mode 3: Identify Chord from Voicing
```
1. Show: Fretboard with a chord voicing highlighted
2. Ask: "What is this chord? What function in C major?"
3. User selects from dropdown: "C major (I)" | "F major (IV)" | "G major (V)"
4. Validate both chord name and function
```

### Mode 4: Recognize by Sound (Audio)
```
1. Play chord audio
2. Ask: "What is this chord in D major?"
3. User selects from options
4. Validates both the chord name and function in key
```

## Data Model

### Reuse from Key Builder
```ts
// src/features/theory/scales.ts already provides:
getDiatonicChords(root: string, keyType: 'major' | 'minor'): Record<ChordFunction, string[]>
```

### New Exercise Type
```ts
interface ExerciseInstance {
  type: 'diatonic-chord'
  config: DiatonicChordExerciseConfig
}
```

### Chord Voicing Validation
```ts
// src/features/theory/chords.ts (new)

export function isValidVoicing(
  positions: FretPosition[],
  expectedChord: string[]
): {
  valid: boolean
  missing: string[]
  extra: string[]
} {
  const voicedNotes = positions.map(pos => getNoteAtPosition(pos))
  const uniqueNotes = new Set(voicedNotes.map(normalizeEnharmonic))
  
  return {
    valid: expectedChord.every(note => uniqueNotes.has(note)),
    missing: expectedChord.filter(note => !uniqueNotes.has(note)),
    extra: [...uniqueNotes].filter(note => !expectedChord.includes(note)),
  }
}
```

## Difficulty Progression (Skill 1–10)

| Skill | Mode | Example |
|-------|------|---------|
| 1–2 | Name, major only, common chords (I, IV, V) | "V in C?" → "G" |
| 3–4 | Name, all diatonic chords, major only | "vi in F?" → "D minor" |
| 5–6 | Voice on fretboard, find valid voicing | Click frets for D major IV (G–B–D) |
| 7–8 | Identify from voicing, multi-key | "What key is this voicing in?" |
| 9–10 | Sound recognition, inversions | Play audio, identify function + inversion |

## UI Needed

### New Component: DiatonicChordExercise
```tsx
interface DiatonicChordExerciseProps {
  instance: ExerciseInstance
  onComplete: (rating: 'easy' | 'medium' | 'hard' | 'skipped') => void
}
```

### Sub-component: ChordNameInput
- Text input for chord name
- Auto-complete suggestions (D, D major, Dm, etc.)
- Validate root + quality

### Sub-component: ChordVoiceDisplay
- Fretboard with chord voicing highlighted
- Show root note emphasized
- Option to play chord audio

### Sub-component: MultipleChoiceChord
- Show 4–6 chord options
- Radio buttons or buttons
- Validate selection

## Integration Points

### Session Generator
```ts
// Only include diatonic-chord exercises if:
// 1. User has completed key-builder exercises (keys skill >= 5)
// 2. Or explicitly training diatonic chords

if (skills.diatonicChords >= 1) {
  exercises.push({
    type: 'diatonic-chord',
    config: {
      root: randomKey(),
      keyType: 'major',
      chordFunction: randomChordFunction(),
      mode: skills.diatonicChords >= 7 ? 'voice' : 'name',
      difficulty: skills.diatonicChords >= 8 ? 'with-sevenths' : 'triads-only',
    }
  })
}
```

### Skill Adaptation
- Track `skills.diatonicChords` from 1–10
- Also track per-key accuracy:
  ```ts
  diatonicAccuracy: {
    'C major': { correct: 18, total: 20 },
    'F# major': { correct: 5, total: 15 },  // weak key
    // ...
  }
  ```
- Bias future exercises toward weak keys

### Fretboard.tsx
- Use `coloredPositions` to show chord voicing
- Highlight root note differently (e.g., thicker border or different color)
- Show inactive chord notes in low opacity

### useSequencer Hook
- Play diatonic chord when showing it
- Play root note before chord
- Reinforce audio + visual

## Validation Logic

### Text Input Parsing
```ts
function parseChordInput(input: string): {
  root: string
  quality: string  // 'major' | 'minor' | 'diminished' | 'suspended', etc.
} {
  // Parse "D major", "D", "Dm", "D-", "Dsus4", etc.
  // Return normalized form for comparison
}

function isChordCorrect(
  userInput: string,
  expectedRoot: string,
  expectedFunction: ChordFunction,
  keyType: 'major' | 'minor'
): boolean {
  const parsed = parseChordInput(userInput)
  const expectedQuality = getQualityForFunction(expectedFunction, keyType)
  
  return (
    normalizeNote(parsed.root) === normalizeNote(expectedRoot) &&
    parsed.quality === expectedQuality
  )
}
```

## Feedback Examples

| Scenario | Feedback |
|----------|----------|
| Correct | "✓ D major is the V chord in G major" |
| Wrong root | "✗ You said E major, but the V is D major" |
| Wrong quality | "✗ Close! The V in G is D major, not D minor" |
| Correct voicing | "✓ Valid D major voicing on frets 10–12–11" |
| Missing note | "✗ Missing F# (the 3rd) in your voicing" |

## Audio Integration

- Play the diatonic scale degree (1–2–3–4–5–6–7) before asking
- Play the target chord root as reference
- Play the full diatonic chord when shown
- Optionally play full chord progression (I–IV–V–I) for context

## Scoring Metrics

```ts
metrics?: {
  exerciseType: 'diatonic-chord'
  responseTimeMs: 2800
  accuracy: 1.0  // 100%
  weakFunctions?: ['vii']  // user struggled with diminished chords
  weakKeys?: ['B major']   // struggled with this key
}
```

## Spaced Repetition Strategy

Weak areas to prioritize:
1. Diminished chords (vii° in major, ii° in minor)
2. Keys with many sharps/flats (F#, Bb, Gb)
3. Relative minor relationships

## Code Estimate

- **chords.ts** — chord validation, voicing logic (~150 lines)
- **DiatonicChordExercise.tsx** — main component (~250 lines)
- **ChordNameInput.tsx** — auto-complete input (~100 lines)
- **ChordVoiceDisplay.tsx** — chord voicing UI (~80 lines)
- **Session generator** — add diatonic-chord type (~30 lines)
- **Zustand store** — extend skills tracking (~15 lines)

Total: ~625 lines. Medium risk (extends theory engine).

## Future: Chord Progressions

Once users master individual chords, train progressions:
- "Build I–IV–V in C major" (all correct voicings)
- "Identify the progression from audio: C–Am–F–G"
- "Substitute a vi for the I" (modal interchange basics)
