import { useState, useMemo } from 'react'
import { Fretboard, ColoredPosition } from '../Fretboard/Fretboard'
import { getAllPentatonicPositions, getNoteAtFret, STANDARD_TUNING, NOTE_DISPLAY, ALL_NOTES } from '../../data/notes'

const ALL_KEYS = ALL_NOTES
const CAGED_SHAPES = ['', 'E shape', 'G shape', 'D shape', 'A shape', 'C shape']
const MAJOR_CAGED_SHAPES = ['', 'G shape', 'E shape', 'D shape', 'C shape', 'A shape']

type ScaleType = 'minor' | 'major'

// Order shapes as C A G E D (5, 4, 2, 1, 3)
const SHAPE_DISPLAY_ORDER = [5, 4, 2, 1, 3]

// Major pentatonic of key X = same shapes as relative minor (3 semitones below X)
function getPatternKey(selectedKey: string, scaleType: ScaleType): string {
  if (scaleType === 'minor') return selectedKey
  const idx = ALL_NOTES.indexOf(selectedKey)
  return ALL_NOTES[(idx - 3 + 12) % 12]
}

// Get the relative major/minor key (3 semitones apart)
function getRelativeKey(key: string, direction: 'major' | 'minor'): string {
  const idx = ALL_NOTES.indexOf(key)
  const offset = direction === 'major' ? 3 : -3
  return ALL_NOTES[(idx + offset + 12) % 12]
}

const SHAPE_STYLES: Record<number, { bg: string; bgDarker: string; text: string; ring: string }> = {
  1: { bg: 'bg-emerald-500', bgDarker: 'bg-emerald-700', text: 'text-emerald-400', ring: 'ring-emerald-300' },
  2: { bg: 'bg-blue-500',    bgDarker: 'bg-blue-700',    text: 'text-blue-400',    ring: 'ring-blue-300'    },
  3: { bg: 'bg-purple-500',  bgDarker: 'bg-purple-700',  text: 'text-purple-400',  ring: 'ring-purple-300'  },
  4: { bg: 'bg-amber-500',   bgDarker: 'bg-amber-700',   text: 'text-amber-400',   ring: 'ring-amber-300'   },
  5: { bg: 'bg-rose-500',    bgDarker: 'bg-rose-700',    text: 'text-rose-400',    ring: 'ring-rose-300'    },
}

interface Props {
  onBack: () => void
}

export function PentatonicMapView({ onBack }: Props) {
  const [selectedKey, setSelectedKey] = useState('A')
  const [scaleType, setScaleType] = useState<ScaleType>('minor')
  const [visibleShapes, setVisibleShapes] = useState<number[]>([1, 2, 3, 4, 5])
  const [showLabels, setShowLabels] = useState(true)

  const toggleShape = (shape: number) => {
    setVisibleShapes(prev =>
      prev.includes(shape) ? prev.filter(s => s !== shape) : [...prev, shape].sort()
    )
  }

  const coloredPositions = useMemo<ColoredPosition[]>(() => {
    const patternKey = getPatternKey(selectedKey, scaleType)
    const relativeKey = getRelativeKey(selectedKey, scaleType === 'minor' ? 'major' : 'minor')
    const seen = new Set<string>()
    const result: ColoredPosition[] = []

    for (const shapeNum of [1, 2, 3, 4, 5]) {
      if (!visibleShapes.includes(shapeNum)) continue
      const positions = getAllPentatonicPositions(patternKey, shapeNum)
      for (const { string, fret } of positions) {
        const key = `${string}-${fret}`
        if (seen.has(key)) continue
        seen.add(key)
        const note = getNoteAtFret(STANDARD_TUNING[string], fret)
        const isMinorRoot = note === selectedKey
        const isMajorRoot = note === relativeKey
        const isMainRoot = scaleType === 'minor' ? isMinorRoot : isMajorRoot
        const isRoot = isMinorRoot || isMajorRoot
        result.push({
          string,
          fret,
          color: isRoot && !isMainRoot ? SHAPE_STYLES[shapeNum].bgDarker : SHAPE_STYLES[shapeNum].bg,
          isRoot,
          rootType: isMinorRoot ? 'minor' : isMajorRoot ? 'major' : undefined,
          isMainRoot,
          label: showLabels ? note : undefined,
        })
      }
    }
    return result
  }, [selectedKey, scaleType, visibleShapes, showLabels])

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
          <p className="text-gray-500 text-xs">All 5 shapes on one neck</p>
        </div>
      </div>

      {/* Minor / Major toggle */}
      <div className="mb-4 flex gap-2">
        {(['minor', 'major'] as ScaleType[]).map(t => (
          <button
            key={t}
            onClick={() => setScaleType(t)}
            className={`px-5 py-1.5 rounded-lg text-sm font-semibold transition-colors capitalize ${
              scaleType === t
                ? 'bg-white text-gray-900'
                : 'bg-gray-700 text-gray-400 hover:text-white'
            }`}
          >
            {t === 'minor' ? 'Minor' : 'Major'}
          </button>
        ))}
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

      {/* Shape toggles */}
      <div className="mb-5">
        <p className="text-gray-500 text-xs uppercase tracking-wide mb-2">Shapes</p>
        <div className="flex flex-wrap gap-2">
          {SHAPE_DISPLAY_ORDER.map(shapeNum => {
            const on = visibleShapes.includes(shapeNum)
            const s = SHAPE_STYLES[shapeNum]
            return (
              <button
                key={shapeNum}
                onClick={() => toggleShape(shapeNum)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-colors ${
                  on
                    ? `${s.bg} text-white border-transparent`
                    : 'bg-transparent text-gray-500 border-gray-700 hover:border-gray-500'
                }`}
              >
                {(scaleType === 'major' ? MAJOR_CAGED_SHAPES : CAGED_SHAPES)[shapeNum]}
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
        {SHAPE_DISPLAY_ORDER.filter(s => visibleShapes.includes(s)).map(shapeNum => (
          <span key={shapeNum} className="flex items-center gap-1.5 text-sm">
            <span className={`w-3 h-3 rounded-full inline-block ${SHAPE_STYLES[shapeNum].bg}`} />
            <span className={SHAPE_STYLES[shapeNum].text}>
              {(scaleType === 'major' ? MAJOR_CAGED_SHAPES : CAGED_SHAPES)[shapeNum]}
            </span>
          </span>
        ))}
        <span className="text-gray-400 text-sm">
          ◯ Ring = {scaleType === 'major' ? 'Major' : 'Minor'} root (main)
        </span>
        <span className="text-gray-400 text-sm">
          • Darker = {scaleType === 'major' ? 'Minor' : 'Major'} root (relative)
        </span>
      </div>
    </div>
  )
}
