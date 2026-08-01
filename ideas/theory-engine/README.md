# Theory Engine — Shared Infrastructure

Central place for all music theory calculations. Used by Note Finder, Key Builder, Diatonic Chords, Intervals, Position Constraints, and Recall Drill.

## Philosophy

- **Pure functions**: No state, no side effects. Testable in isolation.
- **Reusable**: Every module can be used by multiple exercise types.
- **Music-first**: Model the problem domain accurately (scales, intervals, chords, functions).
- **Guitar-specific**: Account for tuning, frets, strings, and practical playing constraints.

## Module Structure

```
src/features/theory/
├── notes.ts              // Core: note names, enharmonics, indices
├── scales.ts             // Scale building: intervals, diatonic notes
├── chords.ts             // Chord construction, voicing, validation
├── intervals.ts          // Interval calculations
├── functions.ts          // Chord functions (I, ii, iii, IV, V, vi, vii)
└── fretboard.ts          // Map notes to fret positions on guitar
```

## 1. notes.ts — Core Note System

```ts
// All natural notes in chromatic order
export const ALL_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

// Flat aliases
export const NOTE_DISPLAY: Record<string, string> = {
  'C#': 'Db',
  'D#': 'Eb',
  'F#': 'Gb',
  'G#': 'Ab',
  'A#': 'Bb',
}

// Bidirectional index
export const NOTE_INDICES: Record<string, number> = {
  'C': 0, 'C#': 1, 'Db': 1,
  'D': 2, 'D#': 3, 'Eb': 3,
  // ...
}

// Enharmonic equivalence
export function normalizeNote(note: string): string {
  // \"Db\" → \"C#\", \"A#\" → \"Bb\" (per convention)
  return NOTE_DISPLAY[note] || note
}

// Get display name (user-friendly)
export function displayNote(note: string): string {
  return normalizeNote(note)
}

export function getEnharmonics(note: string): string[] {
  const idx = NOTE_INDICES[note]
  // Find all names that map to this index
  return Object.entries(NOTE_INDICES)
    .filter(([_, i]) => i === idx)
    .map(([n]) => n)
}
```

## 2. scales.ts — Scale Construction

```ts
// Interval patterns (semitone distances from root)
export const SCALE_INTERVALS = {
  major: [0, 2, 4, 5, 7, 9, 11],
  naturalMinor: [0, 2, 3, 5, 7, 8, 10],
  harmonicMinor: [0, 2, 3, 5, 7, 8, 11],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
}

export function buildScale(root: string, scaleType: keyof typeof SCALE_INTERVALS): string[] {
  const rootIdx = NOTE_INDICES[root]
  const intervals = SCALE_INTERVALS[scaleType]
  return intervals.map(semitones => ALL_NOTES[(rootIdx + semitones) % 12])
}

export function getScaleDegree(scale: string[], degree: number): string {
  // degree is 1–7 (not 0-indexed)
  return scale[(degree - 1) % scale.length]
}

// Helper: is note in scale?
export function isInScale(note: string, scale: string[]): boolean {
  const normalized = normalizeNote(note)
  return scale.some(n => normalizeNote(n) === normalized)
}
```

## 3. intervals.ts — Interval Calculations

```ts
// All intervals with their semitone distances
export const INTERVALS: Record<string, number> = {
  'P1': 0,    // Unison
  'm2': 1,    // Minor 2nd
  'M2': 2,    // Major 2nd
  'm3': 3,    // Minor 3rd
  'M3': 4,    // Major 3rd
  'P4': 5,    // Perfect 4th
  'A4': 6,    // Augmented 4th (tritone)
  'd5': 6,    // Diminished 5th (enharmonic to A4)
  'P5': 7,    // Perfect 5th
  'm6': 8,    // Minor 6th
  'M6': 9,    // Major 6th
  'm7': 10,   // Minor 7th
  'M7': 11,   // Major 7th
  'P8': 12,   // Octave
}

export type IntervalType = keyof typeof INTERVALS

export function semitonesBetween(note1: string, note2: string): number {
  const idx1 = NOTE_INDICES[normalizeNote(note1)]
  const idx2 = NOTE_INDICES[normalizeNote(note2)]
  return (idx2 - idx1 + 12) % 12
}

export function getIntervalName(semitones: number): IntervalType | null {
  for (const [name, dist] of Object.entries(INTERVALS)) {
    if (dist === semitones) return name as IntervalType
  }
  return null
}

export function getNoteAtInterval(root: string, interval: IntervalType, direction: 'up' | 'down' = 'up'): string {
  const rootIdx = NOTE_INDICES[normalizeNote(root)]
  const semitones = INTERVALS[interval]
  const distance = direction === 'up' ? semitones : -semitones
  return ALL_NOTES[(rootIdx + distance + 12) % 12]
}

// Consonance rating (for feedback)
export function getConsonance(interval: IntervalType): 'perfect' | 'consonant' | 'dissonant' {
  const consonant = ['P1', 'P4', 'P5', 'P8', 'M3', 'm3', 'M6', 'm6']
  const dissonant = ['m2', 'M7', 'A4', 'd5']
  
  if (consonant.includes(interval)) return 'consonant'
  if (dissonant.includes(interval)) return 'dissonant'
  return 'perfect'
}
```

## 4. chords.ts — Chord Construction

```ts
export type ChordQuality = 'major' | 'minor' | 'diminished' | 'augmented' | 'dominant7' | 'maj7' | 'min7'

// Define chord intervals
export const CHORD_INTERVALS: Record<ChordQuality, IntervalType[]> = {
  'major': ['P1', 'M3', 'P5'],
  'minor': ['P1', 'm3', 'P5'],
  'diminished': ['P1', 'm3', 'd5'],
  'augmented': ['P1', 'M3', 'A4'],
  'dominant7': ['P1', 'M3', 'P5', 'm7'],
  'maj7': ['P1', 'M3', 'P5', 'M7'],
  'min7': ['P1', 'm3', 'P5', 'm7'],
}

export function buildChord(root: string, quality: ChordQuality): string[] {
  const intervals = CHORD_INTERVALS[quality]
  return intervals.map(interval => getNoteAtInterval(root, interval))
}

export function getChordQuality(notes: string[]): ChordQuality | null {
  // Given 3+ notes, identify the chord quality
  // This is harder (inversion handling), so simplified here
  // In practice, use voice-leading context
  const root = notes[0]
  const uniqueNotes = Array.from(new Set(notes.map(normalizeNote)))
  
  // Check against known qualities
  for (const [quality, intervals] of Object.entries(CHORD_INTERVALS)) {
    const expectedNotes = buildChord(root, quality as ChordQuality)
    if (uniqueNotes.length === expectedNotes.length &&
        uniqueNotes.every(n => expectedNotes.some(e => normalizeNote(e) === n))) {
      return quality as ChordQuality
    }
  }
  return null
}

export function isValidVoicing(
  notes: string[],
  expectedChord: string[]
): { valid: boolean; missing: string[]; extra: string[] } {
  const normalized = notes.map(normalizeNote)
  const expected = expectedChord.map(normalizeNote)
  
  return {
    valid: expected.every(n => normalized.includes(n)),
    missing: expected.filter(n => !normalized.includes(n)),
    extra: normalized.filter(n => !expected.includes(n)),
  }
}
```

## 5. functions.ts — Chord Functions (Roman Numerals)

```ts
export type ChordFunction = 'I' | 'ii' | 'iii' | 'IV' | 'V' | 'vi' | 'vii°'

// Map function to scale degree (1–7)
const FUNCTION_DEGREES: Record<ChordFunction, number> = {
  'I': 1, 'ii': 2, 'iii': 3, 'IV': 4, 'V': 5, 'vi': 6, 'vii°': 7,
}

// Map function to chord quality in major key
const MAJOR_FUNCTIONS: Record<ChordFunction, ChordQuality> = {
  'I': 'major',
  'ii': 'minor',
  'iii': 'minor',
  'IV': 'major',
  'V': 'major',
  'vi': 'minor',
  'vii°': 'diminished',
}

const MINOR_FUNCTIONS: Record<ChordFunction, ChordQuality> = {
  'I': 'minor',
  'ii': 'diminished',
  'iii': 'major',
  'IV': 'minor',
  'V': 'minor',  // Natural minor; could be major in harmonic minor
  'vi': 'major',
  'vii°': 'major',
}

export function getFunctionRoot(scale: string[], func: ChordFunction): string {
  const degree = FUNCTION_DEGREES[func]
  return getScaleDegree(scale, degree)
}

export function getFunctionChord(
  scale: string[],
  func: ChordFunction,
  keyType: 'major' | 'minor'
): { root: string; quality: ChordQuality; notes: string[] } {
  const root = getFunctionRoot(scale, func)
  const qualityMap = keyType === 'major' ? MAJOR_FUNCTIONS : MINOR_FUNCTIONS
  const quality = qualityMap[func]
  
  return {
    root,
    quality,
    notes: buildChord(root, quality),
  }
}

export function getDiatonicChords(
  root: string,
  keyType: 'major' | 'minor'
): Record<ChordFunction, { root: string; quality: ChordQuality; notes: string[] }> {
  const scale = buildScale(root, keyType === 'major' ? 'major' : 'naturalMinor')
  const chords: Record<ChordFunction, any> = {}
  
  for (const func of ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'] as ChordFunction[]) {
    chords[func] = getFunctionChord(scale, func, keyType)
  }
  
  return chords
}

export function nameChordInKey(root: string, chordRoot: string, keyType: 'major' | 'minor'): ChordFunction | null {
  const chords = getDiatonicChords(root, keyType)
  
  for (const [func, chord] of Object.entries(chords)) {
    if (normalizeNote(chord.root) === normalizeNote(chordRoot)) {
      return func as ChordFunction
    }
  }
  
  return null
}
```

## 6. fretboard.ts — Guitar Fretboard Mapping

```ts
export const OPEN_STRINGS = ['E', 'A', 'D', 'G', 'B', 'E']  // Low E to high E (standard tuning)

export interface FretPosition {
  string: number  // 0–5 (0 = high E, 5 = low E)
  fret: number    // 0–21+ (0 = open string)
}

export function getNoteAtPosition(pos: FretPosition): string {
  const openNote = OPEN_STRINGS[5 - pos.string]  // Reverse for array indexing
  const noteIdx = NOTE_INDICES[openNote]
  return ALL_NOTES[(noteIdx + pos.fret) % 12]
}

export function findFretPositions(note: string, minFret: number = 0, maxFret: number = 21): FretPosition[] {
  const positions: FretPosition[] = []
  
  for (let string = 0; string < 6; string++) {
    for (let fret = minFret; fret <= maxFret; fret++) {
      if (getNoteAtPosition({ string, fret }) === normalizeNote(note)) {
        positions.push({ string, fret })
      }
    }
  }
  
  return positions
}

export function canVoiceChord(
  chord: string[],
  constraints?: { fretRange?: { min: number; max: number }; strings?: number[] }
): boolean {
  return chord.every(note => {
    const positions = findFretPositions(note)
    
    if (constraints?.fretRange) {
      positions = positions.filter(p =>
        p.fret >= constraints.fretRange.min && p.fret <= constraints.fretRange.max
      )
    }
    
    if (constraints?.strings) {
      positions = positions.filter(p => constraints.strings.includes(p.string))
    }
    
    return positions.length > 0
  })
}

// Get all occurrences of a chord on the neck (for display)
export function findChordVoicings(chord: string[], maxSpan: number = 5): FretPosition[][] {
  // Find all possible voicings of the chord on the neck
  // Returns array of voicings, each voicing is an array of FretPositions
  
  // Simplified: just find all positions for each note, then find combinations
  const notesPositions = chord.map(note => findFretPositions(note))
  
  // Generate all combinations (Cartesian product)
  const voicings: FretPosition[][] = []
  
  // This is a combinatorial explosion, so limit by maxSpan
  // Just return the most practical voicings
  
  return voicings
}
```

## Integration Points

### Used by Exercise Components
```ts
// NoteFinderExercise
const targetPositions = findFretPositions('C')
const isCorrect = targetPositions.some(pos => pos.string === clicked.string && pos.fret === clicked.fret)

// KeyBuilderExercise
const expectedScale = buildScale('D', 'major')
const isValidScale = validateScale(userInput, expectedScale)

// DiatonicChordExercise
const chords = getDiatonicChords('G', 'major')
const vChord = chords['V']  // { root: 'D', quality: 'major', notes: ['D', 'F#', 'A'] }

// IntervalExercise
const semitones = semitonesBetween('C', 'E')
const intervalName = getIntervalName(semitones)  // 'M3'

// PositionConstraintExercise
const canVoice = canVoiceChord(['G', 'B', 'D'], { fretRange: { min: 3, max: 8 } })
```

### Used by Session Generator
```ts
// Prioritize weak notes
const weakNotes = Object.entries(noteAccuracy)
  .filter(([_, stats]) => stats.correct / stats.total < 0.7)
  .map(([note]) => note)

// Generate exercises targeting weak keys
const targetKey = pickWeakKey(keyAccuracy)
```

## Testing Strategy

```ts
// Pure functions are easy to unit test
describe('scales', () => {
  it('builds correct major scale', () => {
    expect(buildScale('C', 'major')).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B'])
  })
})

describe('intervals', () => {
  it('calculates major 3rd correctly', () => {
    expect(semitonesBetween('C', 'E')).toBe(4)
  })
})

describe('chords', () => {
  it('builds correct diatonic chords in major', () => {
    const chords = getDiatonicChords('C', 'major')
    expect(chords['V'].root).toBe('G')
    expect(chords['V'].quality).toBe('major')
  })
})

describe('fretboard', () => {
  it('finds note on fretboard', () => {
    const positions = findFretPositions('E')
    expect(positions.some(p => p.string === 0 && p.fret === 0)).toBe(true)  // Open high E
    expect(positions.some(p => p.string === 5 && p.fret === 0)).toBe(true)  // Open low E
  })
})
```

## Code Estimate

Total theory engine: ~600 lines
- notes.ts: ~80
- scales.ts: ~80
- intervals.ts: ~100
- chords.ts: ~120
- functions.ts: ~120
- fretboard.ts: ~100

## Future Extensions

- Harmonic minor, dorian, phrygian, lydian, mixolydian support
- Chord inversions (1st inversion, 2nd inversion)
- Extended chords (9ths, 11ths, 13ths)
- Tension/resolution analysis
- Voice leading rules (parallel fifths, hidden fifths, etc.)
- Jazz harmony (altered dominants, secondary dominants, etc.)

This theory engine is the foundation for all other features. Build it solid, test it thoroughly, and everything else becomes easier.
