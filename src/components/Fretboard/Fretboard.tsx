import { STANDARD_TUNING, getNoteAtFret } from '../../data/notes'

export interface ColoredPosition {
  string: number
  fret: number
  color: string   // tailwind bg class, e.g. 'bg-emerald-500'
  isRoot?: boolean
  label?: string
}

interface FretboardProps {
  highlightedPositions?: Array<{ string: number; fret: number }>
  highlightedPositions2?: Array<{ string: number; fret: number }>
  activePosition?: { string: number; fret: number }
  showOverlapColor?: boolean
  showLabels?: boolean
  tuning?: string[]
  coloredPositions?: ColoredPosition[]
  onFretClick?: (string: number, fret: number) => void
}

const FRET_COUNT = 22 // 0-21
const STRING_NAMES = ['e', 'B', 'G', 'D', 'A', 'E']
const SINGLE_DOT_FRETS = [3, 5, 7, 9, 15, 17, 19, 21]
const DOUBLE_DOT_FRET = 12

export function Fretboard({
  highlightedPositions = [],
  highlightedPositions2 = [],
  activePosition,
  showOverlapColor = false,
  showLabels = true,
  tuning = STANDARD_TUNING,
  coloredPositions,
  onFretClick,
}: FretboardProps) {
  const isHighlighted = (s: number, f: number) =>
    highlightedPositions.some(p => p.string === s && p.fret === f)
  const isHighlighted2 = (s: number, f: number) =>
    highlightedPositions2.some(p => p.string === s && p.fret === f)
  const isActive = (s: number, f: number) =>
    activePosition?.string === s && activePosition?.fret === f
  const getColored = (s: number, f: number) =>
    coloredPositions?.find(p => p.string === s && p.fret === f)

  return (
    <div className="w-screen max-w-[1300px] relative left-1/2 -translate-x-1/2 px-6">
      <div className="w-full">
        {/* Fret numbers */}
        <div className="flex mb-1">
          <div className="w-8 shrink-0" />
          {Array.from({ length: FRET_COUNT }).map((_, fret) => (
            <div key={fret} className="flex-1 text-center text-xs text-gray-500">
              {fret === 0 ? 'O' : fret}
            </div>
          ))}
        </div>

        {/* Strings */}
        {tuning.map((openNote, stringIdx) => (
          <div key={stringIdx} className="flex items-center mb-1.5">
            <div className="w-8 shrink-0 text-center text-sm text-gray-400 font-mono">
              {STRING_NAMES[stringIdx]}
            </div>

            {Array.from({ length: FRET_COUNT }).map((_, fret) => {
              const note = getNoteAtFret(openNote, fret)
              const h1 = isHighlighted(stringIdx, fret)
              const h2 = isHighlighted2(stringIdx, fret)
              const highlighted = h1 || h2
              const active = isActive(stringIdx, fret)
              const colored = getColored(stringIdx, fret)
              const hasMidDot = stringIdx === 2 && (SINGLE_DOT_FRETS.includes(fret) || fret === DOUBLE_DOT_FRET)

              return (
                <div
                  key={fret}
                  className={`flex-1 h-11 flex items-center justify-center relative border-r border-gray-700 ${
                    fret === 0 ? 'border-r-2 border-r-gray-400' : ''
                  } ${onFretClick ? 'cursor-pointer group' : ''}`}
                  onClick={() => onFretClick?.(stringIdx, fret)}
                >
                  {/* String line */}
                  <div className="absolute inset-y-0 w-full flex items-center pointer-events-none">
                    <div className={`w-full h-px ${stringIdx === 0 || stringIdx === 5 ? 'bg-gray-500' : 'bg-gray-600'}`} />
                  </div>

                  {/* Mid-neck inlay dots — absolute at bottom of G string, zero height impact */}
                  {hasMidDot && (
                    <div className="absolute bottom-0 translate-y-1/2 left-0 right-0 flex justify-center gap-1 z-20 pointer-events-none">
                      {fret === DOUBLE_DOT_FRET ? (
                        <>
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        </>
                      ) : (
                        <div className="w-2.5 h-2.5 rounded-full bg-gray-600" />
                      )}
                    </div>
                  )}

                  {colored ? (
                    <div
                      className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${colored.color} text-white ${
                        colored.isRoot ? 'ring-2 ring-white ring-offset-1 ring-offset-gray-900' : ''
                      }`}
                    >
                      {colored.label ?? (showLabels ? note : '')}
                    </div>
                  ) : highlighted ? (
                    <div
                      className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-transform ${
                        showOverlapColor && h1 && h2
                          ? 'bg-purple-500 text-white'
                          : h2
                          ? 'bg-blue-500 text-white'
                          : 'bg-emerald-500 text-white'
                      } ${active ? 'ring-2 ring-white ring-offset-1 ring-offset-gray-900 scale-125' : ''}`}
                    >
                      {showLabels ? note : ''}
                    </div>
                  ) : active ? (
                    <div className="relative z-10 w-8 h-8 rounded-full bg-amber-400 text-gray-900 flex items-center justify-center text-xs font-bold ring-2 ring-white ring-offset-1 ring-offset-gray-900 scale-125">
                      {showLabels ? note : ''}
                    </div>
                  ) : onFretClick ? (
                    <div className="relative z-10 w-8 h-8 rounded-full border border-transparent group-hover:border-gray-500 transition-colors" />
                  ) : (
                    <div className="relative z-10 w-7 h-7" />
                  )}
                </div>
              )
            })}
          </div>
        ))}

        {/* Bottom fret markers */}
        <div className="flex mt-1">
          <div className="w-8 shrink-0" />
          {Array.from({ length: FRET_COUNT }).map((_, fret) => (
            <div key={fret} className="flex-1 flex justify-center gap-1">
              {SINGLE_DOT_FRETS.includes(fret) && (
                <div className="w-2.5 h-2.5 rounded-full bg-gray-600" />
              )}
              {fret === DOUBLE_DOT_FRET && (
                <>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
