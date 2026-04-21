import { useState } from 'react'
import { Fretboard, ColoredPosition } from '../Fretboard/Fretboard'
import { getNoteAtFret, STANDARD_TUNING, NOTE_DISPLAY, ALL_NOTES } from '../../data/notes'

// ── Theory data ────────────────────────────────────────────────────────────────

const CHORD_FORMULAS: Record<string, { name: string; intervals: number[]; degrees: string[] }> = {
  major:   { name: 'Major',        intervals: [0, 4, 7],       degrees: ['Root', 'Maj 3rd', 'P5']        },
  minor:   { name: 'Minor',        intervals: [0, 3, 7],       degrees: ['Root', 'Min 3rd', 'P5']        },
  power:   { name: 'Power (5)',    intervals: [0, 7],          degrees: ['Root', 'P5']                   },
}

const SCALE_FORMULAS: Record<string, { name: string; intervals: number[]; degrees: string[] }> = {
  major:      { name: 'Major',            intervals: [0,2,4,5,7,9,11],  degrees: ['1','2','3','4','5','6','7']         },
  minor:      { name: 'Natural Minor',    intervals: [0,2,3,5,7,8,10],  degrees: ['1','2','b3','4','5','b6','b7']      },
  pentatonic: { name: 'Pentatonic Minor', intervals: [0,3,5,7,10],      degrees: ['1','b3','4','5','b7']               },
  pentatonic_major: { name: 'Pentatonic Major', intervals: [0,2,4,7,9], degrees: ['1','2','3','5','6']                 },
}

function getFormulaNote(root: string, interval: number): string {
  const idx = ALL_NOTES.indexOf(root)
  return ALL_NOTES[(idx + interval) % 12]
}

// ── Palette ────────────────────────────────────────────────────────────────────

const PALETTE = [
  { label: 'Emerald', bg: 'bg-emerald-500' },
  { label: 'Blue',    bg: 'bg-blue-500'    },
  { label: 'Rose',    bg: 'bg-rose-500'    },
  { label: 'Amber',   bg: 'bg-amber-500'   },
  { label: 'Purple',  bg: 'bg-purple-500'  },
  { label: 'Gray',    bg: 'bg-gray-400'    },
]

// ── Types ──────────────────────────────────────────────────────────────────────

interface PlacedNote {
  string: number
  fret: number
  color: string
}

interface Props {
  onBack: () => void
}

// ── Theory reference panel ─────────────────────────────────────────────────────

type RefType = 'chord' | 'scale'

function TheoryPanel() {
  const [refType, setRefType] = useState<RefType>('chord')
  const [root, setRoot] = useState('A')
  const [chordKey, setChordKey] = useState('major')
  const [scaleKey, setScaleKey] = useState('minor')

  const formula = refType === 'chord' ? CHORD_FORMULAS[chordKey] : SCALE_FORMULAS[scaleKey]
  const notes = formula.intervals.map((iv, i) => ({
    note: getFormulaNote(root, iv),
    degree: formula.degrees[i],
  }))

  const displayNote = (n: string) => NOTE_DISPLAY[n] ?? n

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 mb-5">
      <p className="text-gray-500 text-xs uppercase tracking-wide mb-3">Theory Reference</p>

      {/* Type toggle */}
      <div className="flex gap-2 mb-3">
        {(['chord', 'scale'] as RefType[]).map(t => (
          <button
            key={t}
            onClick={() => setRefType(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors capitalize ${
              refType === t
                ? 'bg-white text-gray-900'
                : 'bg-gray-700 text-gray-400 hover:text-white'
            }`}
          >
            {t === 'chord' ? 'Chords' : 'Scales'}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 items-start">
        {/* Root selector */}
        <div>
          <p className="text-gray-500 text-xs mb-1.5">Root</p>
          <div className="flex flex-wrap gap-1">
            {ALL_NOTES.map(n => (
              <button
                key={n}
                onClick={() => setRoot(n)}
                className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
                  root === n
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
              >
                {displayNote(n)}
              </button>
            ))}
          </div>
        </div>

        {/* Chord / Scale picker */}
        <div>
          <p className="text-gray-500 text-xs mb-1.5">
            {refType === 'chord' ? 'Chord' : 'Scale'}
          </p>
          <div className="flex flex-wrap gap-1">
            {Object.entries(refType === 'chord' ? CHORD_FORMULAS : SCALE_FORMULAS).map(([k, f]) => (
              <button
                key={k}
                onClick={() => refType === 'chord' ? setChordKey(k) : setScaleKey(k)}
                className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                  (refType === 'chord' ? chordKey : scaleKey) === k
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
              >
                {f.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result notes */}
      <div className="mt-4">
        <p className="text-gray-400 text-sm font-semibold mb-2">
          {displayNote(root)} {formula.name}
        </p>
        <div className="flex flex-wrap gap-2">
          {notes.map(({ note, degree }, i) => (
            <div key={i} className="flex flex-col items-center gap-0.5">
              <div className={`px-3 py-1.5 rounded-lg text-sm font-bold text-white ${
                i === 0 ? 'bg-emerald-600' : 'bg-gray-600'
              }`}>
                {displayNote(note)}
              </div>
              <span className="text-gray-500 text-xs">{degree}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main view ──────────────────────────────────────────────────────────────────

export function FretboardBuilderView({ onBack }: Props) {
  const [placed, setPlaced] = useState<PlacedNote[]>([])
  const [activeColor, setActiveColor] = useState(PALETTE[0].bg)
  const [showLabels, setShowLabels] = useState(true)

  const handleFretClick = (string: number, fret: number) => {
    setPlaced(prev => {
      const idx = prev.findIndex(p => p.string === string && p.fret === fret)
      if (idx !== -1) return prev.filter((_, i) => i !== idx)
      return [...prev, { string, fret, color: activeColor }]
    })
  }

  const coloredPositions: ColoredPosition[] = placed.map(p => {
    const note = getNoteAtFret(STANDARD_TUNING[p.string], p.fret)
    return {
      string: p.string,
      fret: p.fret,
      color: p.color,
      label: showLabels ? (NOTE_DISPLAY[note] ?? note) : undefined,
    }
  })

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors text-sm">
          ← Back
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">Fretboard Canvas</h1>
          <p className="text-gray-500 text-xs">Click any fret to place or remove a note</p>
        </div>
      </div>

      <TheoryPanel />

      {/* Color picker */}
      <div className="mb-5">
        <p className="text-gray-500 text-xs uppercase tracking-wide mb-2">Dot color</p>
        <div className="flex gap-3">
          {PALETTE.map(c => (
            <button
              key={c.bg}
              onClick={() => setActiveColor(c.bg)}
              title={c.label}
              className={`w-8 h-8 rounded-full ${c.bg} transition-transform ${
                activeColor === c.bg
                  ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900 scale-110'
                  : 'opacity-60 hover:opacity-100'
              }`}
            />
          ))}
        </div>
      </div>

      <Fretboard
        coloredPositions={coloredPositions}
        showLabels={showLabels}
        onFretClick={handleFretClick}
      />

      <div className="flex gap-3 mt-5 justify-between items-center">
        <button
          onClick={() => setShowLabels(l => !l)}
          className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
            showLabels
              ? 'bg-gray-600 text-white border-transparent'
              : 'bg-transparent text-gray-500 border-gray-700 hover:border-gray-500'
          }`}
        >
          {showLabels ? 'Hide notes' : 'Show notes'}
        </button>
        <button
          onClick={() => setPlaced([])}
          disabled={placed.length === 0}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Clear all
        </button>
      </div>
    </div>
  )
}
