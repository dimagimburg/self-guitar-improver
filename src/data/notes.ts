export const ALL_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

// Preferred display names for each note — uses flats where conventional for guitar
export const NOTE_DISPLAY: Record<string, string> = {
  'C': 'C', 'C#': 'C#', 'D': 'D', 'D#': 'Eb',
  'E': 'E', 'F': 'F',  'F#': 'F#', 'G': 'G',
  'G#': 'Ab', 'A': 'A', 'A#': 'Bb', 'B': 'B',
}

// Parse a display name back to the internal sharp-only key used in ALL_NOTES
export const DISPLAY_TO_NOTE: Record<string, string> = {
  'Bb': 'A#', 'Eb': 'D#', 'Ab': 'G#', 'Db': 'C#', 'Gb': 'F#',
}

// Standard tuning: string 0 (high e) to string 5 (low E)
export const STANDARD_TUNING = ['E', 'B', 'G', 'D', 'A', 'E'] // high to low

// Get note at fret position
export function getNoteAtFret(openNote: string, fret: number): string {
  const openIdx = ALL_NOTES.indexOf(openNote)
  return ALL_NOTES[(openIdx + fret) % 12]
}

// Get all fretboard positions for a note
export function getFretboardPositions(
  targetNote: string,
  tuning: string[] = STANDARD_TUNING,
  maxFret = 21
): Array<{ string: number; fret: number }> {
  const positions: Array<{ string: number; fret: number }> = []
  tuning.forEach((openNote, stringIdx) => {
    for (let fret = 0; fret <= maxFret; fret++) {
      if (getNoteAtFret(openNote, fret) === targetNote) {
        positions.push({ string: stringIdx, fret })
      }
    }
  })
  return positions
}

// Pentatonic minor scale patterns (positions 1-5) as fret offsets from root
// Each position is array of [string, fret_offset] pairs
export const PENTATONIC_POSITIONS: Record<number, Array<{ string: number; frets: number[] }>> = {
  1: [
    { string: 0, frets: [0, 3] },   // high e
    { string: 1, frets: [0, 3] },   // B
    { string: 2, frets: [0, 2] },   // G
    { string: 3, frets: [0, 2] },   // D
    { string: 4, frets: [0, 2] },   // A
    { string: 5, frets: [0, 3] },   // low E
  ],
  2: [
    { string: 0, frets: [3, 5] },
    { string: 1, frets: [3, 5] },
    { string: 2, frets: [2, 4] },   // G string: 1 fret lower due to G-B tuning break
    { string: 3, frets: [2, 5] },
    { string: 4, frets: [2, 5] },
    { string: 5, frets: [3, 5] },
  ],
  3: [
    { string: 0, frets: [5, 7] },
    { string: 1, frets: [5, 8] },
    { string: 2, frets: [4, 7] },   // G string: 1 fret lower due to G-B tuning break
    { string: 3, frets: [5, 7] },
    { string: 4, frets: [5, 7] },
    { string: 5, frets: [5, 7] },
  ],
  4: [
    { string: 0, frets: [7, 10] },
    { string: 1, frets: [8, 10] },
    { string: 2, frets: [7, 9] },
    { string: 3, frets: [7, 9] },
    { string: 4, frets: [7, 10] },
    { string: 5, frets: [7, 10] },
  ],
  5: [
    { string: 0, frets: [10, 12] },
    { string: 1, frets: [10, 12] },
    { string: 2, frets: [9, 12] },
    { string: 3, frets: [9, 12] },
    { string: 4, frets: [10, 12] },
    { string: 5, frets: [10, 12] },
  ],
}

// Get actual fret numbers for a pentatonic position given a root note
// Get actual fret numbers for a pentatonic position given a root note.
// Finds root on low E string, then applies the pattern offsets.
export function getPentatonicPositionFrets(
  rootNote: string,
  position: number,
  tuning: string[] = STANDARD_TUNING,
  maxFret = 21
): Array<{ string: number; fret: number }> {
  const pattern = PENTATONIC_POSITIONS[position]
  if (!pattern) return []

  // Find root fret on low E string (index 5 in standard tuning)
  const lowENote = tuning[5]
  const rootIdx = ALL_NOTES.indexOf(rootNote)
  const lowEIdx = ALL_NOTES.indexOf(lowENote)
  const rootFretOnLowE = (rootIdx - lowEIdx + 12) % 12

  return pattern.flatMap(({ string, frets }) =>
    frets
      .map(offset => ({ string, fret: rootFretOnLowE + offset }))
      .filter(pos => pos.fret >= 0 && pos.fret <= maxFret)
  )
}

// All occurrences of a pentatonic box across the full neck (covers both octave positions)
export function getAllPentatonicPositions(
  rootNote: string,
  position: number,
  tuning: string[] = STANDARD_TUNING,
  maxFret = 21
): Array<{ string: number; fret: number }> {
  const pattern = PENTATONIC_POSITIONS[position]
  if (!pattern) return []

  const lowENote = tuning[5]
  const rootIdx = ALL_NOTES.indexOf(rootNote)
  const lowEIdx = ALL_NOTES.indexOf(lowENote)
  const primaryRoot = (rootIdx - lowEIdx + 12) % 12

  // Try three octave roots to cover 0-maxFret
  const roots = [primaryRoot - 12, primaryRoot, primaryRoot + 12]

  const seen = new Set<string>()
  const result: Array<{ string: number; fret: number }> = []
  for (const root of roots) {
    pattern.flatMap(({ string, frets }) =>
      frets.map(offset => ({ string, fret: root + offset }))
    ).filter(p => p.fret >= 0 && p.fret <= maxFret).forEach(p => {
      const k = `${p.string}-${p.fret}`
      if (!seen.has(k)) { seen.add(k); result.push(p) }
    })
  }
  return result
}

// Returns true only if every note in the box fits within the fretboard
export function isPentatonicBoxValid(
  rootNote: string,
  position: number,
  maxFret = 21
): boolean {
  const pattern = PENTATONIC_POSITIONS[position]
  if (!pattern) return false
  const expected = pattern.reduce((sum, { frets }) => sum + frets.length, 0)
  return getPentatonicPositionFrets(rootNote, position, STANDARD_TUNING, maxFret).length === expected
}
