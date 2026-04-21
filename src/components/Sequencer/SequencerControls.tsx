import { SoundMode } from '../../hooks/useSequencer'

interface SequencerControlsProps {
  isPlaying: boolean
  bpm: number
  soundMode: SoundMode
  highlightEnabled: boolean
  onToggle: () => void
  onBpmChange: (bpm: number) => void
  onSoundModeChange: (mode: SoundMode) => void
  onHighlightChange: (v: boolean) => void
}

const SOUND_MODES: Array<{ value: SoundMode; label: string }> = [
  { value: 'none', label: 'Silent' },
  { value: 'tick', label: 'Tick' },
  { value: 'note', label: 'Note' },
]

export function SequencerControls({
  isPlaying,
  bpm,
  soundMode,
  highlightEnabled,
  onToggle,
  onBpmChange,
  onSoundModeChange,
  onHighlightChange,
}: SequencerControlsProps) {
  return (
    <div className="flex flex-col items-center gap-3 bg-gray-800 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <span className="text-gray-400 text-sm">BPM</span>
        <input
          type="range"
          min={40}
          max={200}
          value={bpm}
          onChange={e => onBpmChange(Number(e.target.value))}
          className="w-32 accent-emerald-500"
        />
        <span className="text-white font-mono w-8">{bpm}</span>
      </div>

      <div className="flex items-center gap-4">
        {/* Sound mode selector */}
        <div className="flex rounded-lg overflow-hidden border border-gray-700">
          {SOUND_MODES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onSoundModeChange(value)}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                soundMode === value
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Highlight toggle */}
        <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={highlightEnabled}
            onChange={e => onHighlightChange(e.target.checked)}
            className="accent-emerald-500"
          />
          Highlight
        </label>

        <button
          onClick={onToggle}
          className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
            isPlaying
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}
        >
          {isPlaying ? 'Stop' : 'Start'}
        </button>
      </div>

      <div
        className={`w-3 h-3 rounded-full transition-colors duration-75 ${
          isPlaying ? 'bg-emerald-400' : 'bg-gray-600'
        }`}
      />
    </div>
  )
}
