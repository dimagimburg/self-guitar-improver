import { useState, useRef, useEffect, useCallback } from 'react'

export function usePlayNote() {
  const audioCtxRef = useRef<AudioContext | null>(null)
  return useCallback((string: number, fret: number) => {
    if (!audioCtxRef.current) audioCtxRef.current = new AudioContext()
    playGuitarNote(audioCtxRef.current, getFrequency(string, fret))
  }, [])
}

export interface FretPosition {
  string: number
  fret: number
}

export type SoundMode = 'none' | 'tick' | 'note'

// Standard tuning open string frequencies (string 0=high e to 5=low E)
const OPEN_STRING_FREQ = [329.63, 246.94, 196.0, 146.83, 110.0, 82.41]

function getFrequency(string: number, fret: number): number {
  return OPEN_STRING_FREQ[string] * Math.pow(2, fret / 12)
}

function playTick(ctx: AudioContext) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.frequency.value = 880
  gain.gain.setValueAtTime(0.3, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.05)
}

function playGuitarNote(ctx: AudioContext, freq: number) {
  const now = ctx.currentTime
  const master = ctx.createGain()
  master.connect(ctx.destination)
  // Fast attack, natural decay like a plucked string
  master.gain.setValueAtTime(0.0, now)
  master.gain.linearRampToValueAtTime(0.7, now + 0.005)
  master.gain.exponentialRampToValueAtTime(0.001, now + 1.2)

  // Fundamental + harmonics for a guitar-like timbre
  const partials: Array<{ mult: number; gain: number }> = [
    { mult: 1, gain: 0.5 },
    { mult: 2, gain: 0.3 },
    { mult: 3, gain: 0.15 },
    { mult: 4, gain: 0.07 },
    { mult: 5, gain: 0.03 },
  ]

  partials.forEach(({ mult, gain }) => {
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.connect(g)
    g.connect(master)
    osc.type = 'triangle'
    osc.frequency.value = freq * mult
    g.gain.value = gain
    osc.start(now)
    osc.stop(now + 1.2)
  })
}

export function useSequencer(positions: FretPosition[], initialBpm = 80) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [bpm, setBpm] = useState(initialBpm)
  const [soundMode, setSoundMode] = useState<SoundMode>('tick')
  const [highlightEnabled, setHighlightEnabled] = useState(true)

  const audioCtxRef = useRef<AudioContext | null>(null)
  const timeoutRef = useRef<number | null>(null)
  const stepIndexRef = useRef(0)
  const soundModeRef = useRef(soundMode)
  soundModeRef.current = soundMode
  const positionsRef = useRef(positions)
  positionsRef.current = positions

  const playSound = useCallback((position: FretPosition) => {
    const ctx = audioCtxRef.current
    if (!ctx) return
    const sm = soundModeRef.current
    if (sm === 'tick') {
      playTick(ctx)
    } else if (sm === 'note') {
      playGuitarNote(ctx, getFrequency(position.string, position.fret))
    }
  }, [])

  useEffect(() => {
    if (!isPlaying) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      setActiveIndex(-1)
      return
    }

    const interval = (60 / bpm) * 1000

    const step = () => {
      const pos = positionsRef.current
      if (pos.length === 0) return
      const idx = stepIndexRef.current % pos.length
      stepIndexRef.current++
      setActiveIndex(idx)
      playSound(pos[idx])
      timeoutRef.current = window.setTimeout(step, interval)
    }

    stepIndexRef.current = 0
    step()

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [isPlaying, bpm, playSound])

  const toggle = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext()
    }
    stepIndexRef.current = 0
    setIsPlaying(p => !p)
  }

  const activePosition =
    isPlaying && highlightEnabled && activeIndex >= 0 && positions.length > 0
      ? positions[activeIndex % positions.length]
      : undefined

  return {
    isPlaying,
    toggle,
    activePosition,
    activeIndex,
    bpm,
    setBpm,
    soundMode,
    setSoundMode,
    highlightEnabled,
    setHighlightEnabled,
  }
}
