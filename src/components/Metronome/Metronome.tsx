import { useState, useRef, useEffect, useCallback } from 'react'

interface MetronomeProps {
  initialBpm?: number
}

export function Metronome({ initialBpm = 80 }: MetronomeProps) {
  const [bpm, setBpm] = useState(initialBpm)
  const [running, setRunning] = useState(false)
  const [beat, setBeat] = useState(false)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const timeoutRef = useRef<number | null>(null)

  const tick = useCallback(() => {
    if (!audioCtxRef.current) return
    const ctx = audioCtxRef.current
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 880
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.05)
    setBeat(b => !b)
  }, [])

  useEffect(() => {
    if (!running) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      return
    }
    const interval = (60 / bpm) * 1000
    const schedule = () => {
      tick()
      timeoutRef.current = window.setTimeout(schedule, interval)
    }
    schedule()
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [running, bpm, tick])

  const toggle = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext()
    }
    setRunning(r => !r)
  }

  return (
    <div className="flex flex-col items-center gap-3 bg-gray-800 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <span className="text-gray-400 text-sm">BPM</span>
        <input
          type="range"
          min={40}
          max={200}
          value={bpm}
          onChange={e => setBpm(Number(e.target.value))}
          className="w-32 accent-emerald-500"
        />
        <span className="text-white font-mono w-8">{bpm}</span>
      </div>
      <button
        onClick={toggle}
        className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
          running
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
        }`}
      >
        {running ? 'Stop' : 'Start'}
      </button>
      <div className={`w-3 h-3 rounded-full transition-colors ${beat ? 'bg-emerald-400' : 'bg-gray-600'}`} />
    </div>
  )
}
