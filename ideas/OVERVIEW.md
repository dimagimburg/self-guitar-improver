# Guitar Key Master Trainer — Feature Ideas

Adapting the Key Master spec to the existing self-guitar-improver architecture.

## Quick Fit Assessment

### ✅ Reusable Components
- **Fretboard.tsx** — already handles highlight states; can extend with `correctPositions | incorrectPositions` props
- **useSequencer** — can play scales, arpeggios, chords during exercises
- **Zustand store** — extend `skills` from `{fretboard, pentatonic}` to add `notes`, `keys`, `diatonic`, `intervals`
- **Session generator** — already weights exercise selection; can target weak notes/keys detected in history
- **Web Audio note synthesis** — already implemented; reuse for key/chord playback

### 🔨 New Infrastructure
- **Theory engine** — scale/chord builders, interval calculations (most of this is pure logic, not UI)
- **Exercise components** — 4–5 new exercise types (NoteFinderExercise, KeyBuilderExercise, DiatonicChordExercise, IntervalExercise)
- **Metrics tracking** — response time, accuracy per note/key/interval (extend `ExerciseResult`)
- **View routing** — new top-level views or sub-views under existing routing

## Feature Organization

| Feature | Complexity | Reuse | Status |
|---------|-----------|-------|--------|
| Note Finder | Low | Fretboard, sequencer | `/ideas/note-finder` |
| Key Builder | Medium | Fretboard, pentatonic data | `/ideas/key-builder` |
| Diatonic Chords | Medium | Theory engine + Fretboard | `/ideas/diatonic-chords` |
| Interval Trainer | Low–Medium | Theory engine + Fretboard | `/ideas/intervals` |
| Position Constraints | High | Session generator logic | `/ideas/position-constraints` |
| Random Recall Drill | Low | Just theory engine | `/ideas/recall-drill` |

## Implementation Priority

**Phase 1** (Highest value): Note Finder + Key Builder
- Both teach "fretboard fluency" (core goal)
- Reuse 80% of existing code
- Feed into skill adaptation naturally

**Phase 2**: Diatonic Chords + Interval Trainer
- Build on theory engine from Phase 1
- Intermediate complexity

**Phase 3**: Position Constraints + Recall Drill
- Specialized modes, high reuse of existing session generator

## Data Model Extensions

### Add to Zustand store
```ts
skills: {
  fretboard: 1–10         // current
  pentatonic: 1–10        // current
  notes: 1–10             // all 12 notes across neck
  keys: 1–10              // major key construction
  diatonicChords: 1–10    // chord functions
  intervals: 1–10         // interval recognition
}

// Track per-note and per-key accuracy
analytics: {
  noteAccuracy: Record<string, {correct: number, total: number}>
  keyAccuracy: Record<string, {correct: number, total: number}>
  intervalAccuracy: Record<string, {correct: number, total: number}>
}
```

### Extend ExerciseResult
```ts
metrics?: {
  responseTimeMs: number
  accuracy: number
  weakNotes?: string[]
  weakKeys?: string[]
  weakIntervals?: string[]
}
```

## View Structure

Current: `'session' | 'pentatonic-map' | 'free-practice' | 'fretboard-builder'`

Option A: Add parallel views
- `'note-finder'`
- `'key-builder'`
- `'diatonic-chords'`
- etc.

Option B: Integrate into existing `'session'` as exercise types (preferred)
- Session generator includes new exercise types
- Reuse rating flow, history, skill adaptation
- Cleaner architecture

## Next Steps

See `/ideas/<feature>/*.md` for detailed specs on each feature.
