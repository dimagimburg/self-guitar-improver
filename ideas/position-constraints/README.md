# Position Constraints — Exercise Spec

Force real fretboard understanding by restricting where you can play.

## Concept

Train users to think musically within constraints. Instead of \"play V–I–vi–IV in C,\" it's \"play this progression in frets 5–9 only,\" forcing creative voicing and understanding of what notes are available.

**Why valuable (high value)**: This is how real playing works. Musicians must find chord voicings and melodies within the position they're already in. Builds position mastery + adaptability.

## Exercise Variants

### PositionConstraintExerciseConfig
```ts
interface PositionConstraintExerciseConfig {
  // Musical constraint
  root: string                          // Key root
  keyType: 'major' | 'natural-minor'
  task: 'play-chord' | 'play-progression' | 'play-scale' | 'play-melody'
  
  // Position constraint
  fretRange: { start: number; end: number }  // e.g., 5–9
  stringRestriction?: 'all' | 'top-3' | 'bottom-3' | 'adjacent-pair'
  
  // Musical specifics
  chordOrProgression?: string           // \"V\" | \"I–IV–V–I\" | \"D major\" etc.
  melodyPattern?: string[]              // for melody exercises
  
  timed?: boolean
  timeoutMs?: number
}
```

## Exercise Modes

### Mode 1: Play a Chord in Position
```
1. Show: \"Play G major in frets 3–7 (any strings)\"
2. Display fretboard with allowed region highlighted
3. User clicks 3 frets to voice G major (root, 3rd, 5th)
4. Validate voicing:
   - All 3 notes within fret range? ✓
   - All notes are G major? ✓
   - Can play within one hand position? (sanity check)
5. Success: \"✓ Valid G major voicing between frets 3–7\"
```

### Mode 2: Play a Chord Progression in Position
```
1. Show: \"Play I–IV–V–I in A major, frets 0–5 only\"
2. User builds 4 voicings in sequence:
   - A major (I)
   - D major (IV)
   - E major (V)
   - A major (I)
3. Each voicing must fit within frets 0–5
4. Feedback per chord: valid or \"can't voice this chord in this position\"
5. Higher difficulty: can't move strings between chords (position lock)
```

### Mode 3: Play a Scale Passage (Melodic)
```
1. Show: \"Play a C major scale descending from C5 to C4, using top 3 strings only\"
2. Fretboard shows allowed strings highlighted
3. User plays sequential notes (C–B–A–G–F–E–D–C)
4. Validate:
   - All notes are in C major? ✓
   - All on top 3 strings? ✓
   - Playable as written? (no impossible stretches)
5. Feedback: \"✓ Smooth descending passage\"
```

### Mode 4: Find the Melody (Note Discovery)
```
1. Show: Fretboard region (e.g., frets 5–9)
2. Play a melody audibly
3. User clicks frets to recreate the melody from the allowed region
4. Validate note-by-note
5. Example: \"Recreate the main riff from [song] using only frets 3–7\"
```

## Data Model

### Position Mastery Tracking
```ts
// Extend Zustand store

positionMastery: {
  // Track accuracy in each position range
  fret0to5: { correct: 30, total: 35 },
  fret5to9: { correct: 22, total: 40 },  // weak position
  fret9to12: { correct: 28, total: 32 },
  // ...
  fret12plus: { correct: 10, total: 20 },
  
  // Track by string restriction
  topStringsOnly: { correct: 24, total: 30 },
  allStrings: { correct: 45, total: 50 },
}

// Track chord voicing variety
voicingVariety: {
  'C major': [
    { frets: [0, 3, 2], strings: [5, 4, 3] },  // standard voicing
    { frets: [3, 3, 2], strings: [5, 4, 3] },  // lower voicing
    { frets: [8, 7, 8], strings: [5, 4, 3] },  // higher voicing
  ],
  // ... other chords
}
```

### ExerciseInstance
```ts
interface ExerciseInstance {
  type: 'position-constraint'
  config: PositionConstraintExerciseConfig
}
```

### Result Metrics
```ts
metrics?: {
  exerciseType: 'position-constraint'
  responseTimeMs: 8500
  accuracy: 0.92  // 12/13 notes correct
  
  // Position-specific feedback
  positionsUsed: [3, 5, 7, 8]  // frets the user actually played on
  difficultChords?: ['C major']  // chords they struggled with
  
  // Stretch difficulty
  maxStretch: 4  // largest fret span in a voicing
}
```

## Difficulty Progression (Skill 1–10)

| Skill | Constraints | Task | Notes |
|-------|-------------|------|-------|
| 1–2 | Frets 0–5 (open position) | Single chord | Low E + A strings only |
| 3–4 | Frets 5–9 (1st position) | Single chord | All strings |
| 5–6 | Frets 3–8 (mixed) | Two-chord progression | Force creative voicing |
| 7–8 | Frets 12+ (high position) | Four-chord progression | High neck mastery |
| 9–10 | Position shift required | Scale passages, melodies | Rapid position changes |

## UI Needed

### New Component: PositionConstraintExercise
```tsx
interface PositionConstraintExerciseProps {
  instance: ExerciseInstance
  onComplete: (rating: 'easy' | 'medium' | 'hard' | 'skipped') => void
}
```

### Fretboard Enhancement
- Highlight allowed fret range (e.g., lighter background for frets 5–9)
- Highlight allowed strings (e.g., dim out restricted strings)
- Show forbidden zone clearly (gray out disallowed frets)
- Real-time validation: turn note red if outside allowed region

### Feedback Display
- Show the voicing that was created
- Show voice leading (arrow from chord to chord, if progressing)
- Show alternative voicings available in the position
- Explain why a voicing doesn't work (\"F# is not available in frets 5–9\")

## Integration Points

### Session Generator
```ts
// Build from lower-level skills: position constraints are \"capstone\" exercises
if (skills.fretboard >= 5 && skills.pentatonic >= 4) {
  exercises.push({
    type: 'position-constraint',
    config: {
      root: randomNote(),
      keyType: 'major',
      task: 'play-chord',
      fretRange: { start: randomPositionStart(), end: randomPositionStart() + 5 },
      stringRestriction: skills.fretboard >= 7 ? 'all' : 'top-3',
      chordOrProgression: randomChordInKey(),
    }
  })
}
```

### Skill Adaptation
- `computeUpdatedSkills()` updates position mastery tracking
- Weak positions get higher priority in future sessions
- Creates adaptive position-shift training (move from weak to strong positions)

### Fretboard.tsx
- Extend with region highlighting (`allowedFretRange`, `allowedStrings`)
- Visual validation: green highlight for valid notes, red for invalid
- Show hint: \"Try higher on the neck\" if chord isn't voiceable

## Validation Logic

```ts
function canVoiceChordInPosition(
  chord: string[],
  fretRange: { start: number; end: number },
  stringRestriction?: string[]
): {
  possible: boolean
  availableNotes: FretPosition[]
  missingNotes: string[]
} {
  // Find all fret positions in the allowed region for each chord note
  const available: Record<string, FretPosition[]> = {}
  
  for (const note of chord) {
    available[note] = getAllFretPositions(note).filter(pos =>
      pos.fret >= fretRange.start &&
      pos.fret <= fretRange.end &&
      (!stringRestriction || stringRestriction.includes(String(pos.string)))
    )
  }
  
  // Check if at least one voicing is possible
  const possible = chord.every(note => available[note].length > 0)
  
  return {
    possible,
    availableNotes: Object.values(available).flat(),
    missingNotes: possible ? [] : chord.filter(note => available[note].length === 0),
  }
}

function isValidVoicing(
  positions: FretPosition[],
  expectedChord: string[],
  constraints: PositionConstraintExerciseConfig
): boolean {
  // Validate 1: all selected notes are in the chord
  const notes = positions.map(p => getNoteAtPosition(p))
  if (!expectedChord.every(note => notes.some(n => normalizeNote(n) === normalizeNote(note)))) {
    return false
  }
  
  // Validate 2: all positions within constraints
  return positions.every(pos =>
    pos.fret >= constraints.fretRange.start &&
    pos.fret <= constraints.fretRange.end &&
    (!constraints.stringRestriction || constraints.stringRestriction.includes(String(pos.string)))
  )
}
```

## Teaching Moments

**Show alternative voicings:**
```
User found: D major voicing [5, 5, 4] on strings [6, 5, 4]

System shows:
\"✓ Valid voicing. Here are other D major voicings available in frets 5–9:
  • [5, 7, 6] (higher sounding)
  • [10, 9, 10] (won't fit in this range)
  
Pick your favorite for this progression!\"
```

**Explain position tradeoffs:**
```
User plays I–IV–V in open position, then tries high position.

System: \"In open position (0–5), you stayed in one spot. 
In frets 9–12, the IV chord requires more of a stretch.
This is why pros master multiple positions!\"
```

## Audio Integration

- Play the target chord before exercise (reference)
- Play user's voicing for feedback
- Play progression slowly to hear voice leading quality
- Highlight good vs. awkward voice leading

## Progression Ideas

### Natural Progression
1. **Position Mastery**: Single chords in fixed positions
2. **Small Progressions**: Two chords, no position shift
3. **Complex Progressions**: Full progression within one position
4. **Position Shifting**: Same progression across multiple positions
5. **Melodic Sequences**: Scales and melodies in constrained regions

### Real-World Application
```
Beginner: \"Play G major somewhere on the neck\" (any position)
Intermediate: \"Play G major in the first position only\" (0–5 frets)
Advanced: \"Play this four-chord progression in the high position\" (12+ frets)
Expert: \"Play this song riff using only top 3 strings\" (positional mastery)
```

## Code Estimate

- **PositionConstraintExercise.tsx** — main component (~250 lines)
- **Position validation logic** — helper functions (~120 lines)
- **Fretboard.tsx** — extend with constraints UI (~60 lines)
- **Session generator** — add position-constraint type (~40 lines)
- **Zustand store** — position mastery tracking (~25 lines)

Total: ~495 lines. Medium complexity (combines validation, visualization, skill tracking).

## Future: Position Shifting Drills

Once users master single positions, train rapid position changes:
- \"Play this progression moving through positions 0, 5, 9, 12\"
- Show optimal hand shifts for speed
- Train muscle memory for position changes
