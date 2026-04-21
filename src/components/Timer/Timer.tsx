import { useEffect, useState, useRef } from 'react'

interface TimerProps {
  duration: number
  running: boolean
  onComplete?: () => void
}

export function Timer({ duration, running, onComplete }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    setTimeLeft(duration)
  }, [duration])

  useEffect(() => {
    if (!running) return
    if (timeLeft <= 0) {
      onCompleteRef.current?.()
      return
    }
    const id = setTimeout(() => setTimeLeft(t => t - 1), 1000)
    return () => clearTimeout(id)
  }, [running, timeLeft])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const progress = (duration - timeLeft) / duration

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
          <circle
            cx="18" cy="18" r="15.9"
            fill="none"
            stroke="#374151"
            strokeWidth="2.5"
          />
          <circle
            cx="18" cy="18" r="15.9"
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeDasharray={`${progress * 100} 100`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-mono font-bold text-white">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
        </div>
      </div>
    </div>
  )
}
