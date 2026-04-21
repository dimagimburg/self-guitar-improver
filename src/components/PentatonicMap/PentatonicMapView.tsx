import { useState, useMemo } from 'react'
import { Fretboard, ColoredPosition } from '../Fretboard/Fretboard'
import { getAllPentatonicPositions, getNoteAtFret, STANDARD_TUNING, NOTE_DISPLAY, ALL_NOTES } from '../../data/notes'

const ALL_KEYS = ALL_NOTES
const CAGED_SHAPES = ['', 'A shape', 'G shape', 'E shape', 'D shape', 'C shape']

const BOX_STYLES: Record<number, { bg: string; text: string; ring: string }> = {
  1: { bg: 'bg-emerald-500', text: 'text-emerald-400', ring: 'ring-emerald-300' },
  2: { bg: 'bg-blue-500',    text: 'text-blue-400',    ring: 'ring-blue-300'    },
  3: { bg: 'bg-purple-500',  text: 'text-purple-400',  ring: 'ring-purple-300'  },
  4: { bg: 'bg-amber-500',   text: 'text-amber-400',   ring: 'ring-amber-300'   },
  5: { bg: 'bg-rose-500',    text: 'text-rose-400',    ring: 'ring-rose-300'    },
}

interface Props {
  onBack: () => void
}

export function PentatonicMapView({ onBack }: Props) {
  const [selectedKey, setSelectedKey] = useState('A')
  const [visibleBoxes, setVisibleBoxes] = useState<number[]>([1, 2, 3, 4, 5])
  const [showLabels, setShowLabels] = useState(true)

  const toggleBox = (box: number) => {
    setVisibleBoxes(prev =>
      prev.includes(box) ? prev.filter(b => b !== box) : [...prev, box].sort()
    )
  }

  const coloredPositions = useMemo<ColoredPosition[]>(() => {
    const seen = new Set<string>()
    const result: ColoredPosition[] = []

    for (const boxNum of [1, 2, 3, 4, 5]) {
      if (!visibleBoxes.includes(boxNum)) continue
      const positions = getAllPentatonicPositions(selectedKey, boxNum)
      for (const { string, fret } of positions) {
        const key = `${string}-${fret}`
        if (seen.has(key)) continue
        seen.add(key)
        const note = getNoteAtFret(STANDARD_TUNING[string], fret)
        const isRoot = note === selectedKey
        result.push({
          string,
          fret,
          color: BOX_STYLES[boxNum].bg,
          isRoot,
          label: showLabels ? note : undefined,
        })
      }
    }
    return result
  }, [selectedKey, visibleBoxes, showLabels])

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-white transition-colors text-sm"
        >
          ← Back
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">Pentatonic Scale Map</h1>
          <p className="text-gray-500 text-xs">All 5 boxes on one neck</p>
        </div>
      </div>

      {/* Key selector */}
      <div className="mb-4">
        <p className="text-gray-500 text-xs uppercase tracking-wide mb-2">Key</p>
        <div className="flex flex-wrap gap-2">
          {ALL_KEYS.map(k => (
            <button
              key={k}
              onClick={() => setSelectedKey(k)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                selectedKey === k
                  ? 'bg-white text-gray-900'
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
            >
              {NOTE_DISPLAY[k] ?? k}
            </button>
          ))}
        </div>
      </div>

      {/* Box toggles */}
      <div className="mb-5">
        <p className="text-gray-500 text-xs uppercase tracking-wide mb-2">Boxes</p>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map(box => {
            const on = visibleBoxes.includes(box)
            const s = BOX_STYLES[box]
            return (
              <button
                key={box}
                onClick={() => toggleBox(box)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-colors ${
                  on
                    ? `${s.bg} text-white border-transparent`
                    : 'bg-transparent text-gray-500 border-gray-700 hover:border-gray-500'
                }`}
              >
                {CAGED_SHAPES[box]}
              </button>
            )
          })}
          <button
            onClick={() => setShowLabels(l => !l)}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-colors ml-auto ${
              showLabels
                ? 'bg-gray-600 text-white border-transparent'
                : 'bg-transparent text-gray-500 border-gray-700 hover:border-gray-500'
            }`}
          >
            {showLabels ? 'Hide notes' : 'Show notes'}
          </button>
        </div>
      </div>

      {/* Fretboard */}
      <Fretboard
        coloredPositions={coloredPositions}
        showLabels={showLabels}
      />

      {/* Legend */}
      <div className="mt-5 flex flex-wrap gap-4 justify-center">
        {[1, 2, 3, 4, 5].filter(b => visibleBoxes.includes(b)).map(box => (
          <span key={box} className="flex items-center gap-1.5 text-sm">
            <span className={`w-3 h-3 rounded-full inline-block ${BOX_STYLES[box].bg}`} />
            <span className={BOX_STYLES[box].text}>
              {CAGED_SHAPES[box]}
            </span>
          </span>
        ))}
        <span className="flex items-center gap-1.5 text-sm">
          <span className="w-3 h-3 rounded-full inline-block bg-gray-400 ring-2 ring-white ring-offset-1 ring-offset-gray-900" />
          <span className="text-gray-400">Root ({NOTE_DISPLAY[selectedKey] ?? selectedKey})</span>
        </span>
      </div>
    </div>
  )
}
