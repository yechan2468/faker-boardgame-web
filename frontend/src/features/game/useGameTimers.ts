import { useEffect, useState } from 'react'

function formatElapsedTime(seconds: number) {
  if (seconds < 60) return String(seconds)
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0')
  const remainingSeconds = (seconds % 60).toString().padStart(2, '0')
  return `${minutes}:${remainingSeconds}`
}

type GameTimersOptions = {
  gameStatus: string | undefined
  currentTurnId: string | null
  viewerId: string | null
  turnNumber: number | undefined
  phase: string | undefined
}

export function useGameTimers({ gameStatus, currentTurnId, viewerId, turnNumber, phase }: GameTimersOptions) {
  const [elapsedTurnSeconds, setElapsedTurnSeconds] = useState(0)
  useEffect(() => {
    if (gameStatus !== 'IN_GAME' || !currentTurnId || !viewerId || currentTurnId === viewerId) {
      setElapsedTurnSeconds(0)
      return
    }

    const turnStartedAt = performance.now()
    setElapsedTurnSeconds(0)
    const intervalId = window.setInterval(() => {
      setElapsedTurnSeconds(Math.floor((performance.now() - turnStartedAt) / 1000))
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [gameStatus, currentTurnId, turnNumber, viewerId])

  const timedPhase = gameStatus === 'IN_GAME'
    && ['SUSPICION', 'DEFENSE', 'DEFENSE_SUSPICION', 'RESOLVED'].includes(phase ?? '')
    ? phase ?? null
    : null
  const [elapsedPhaseSeconds, setElapsedPhaseSeconds] = useState(0)
  useEffect(() => {
    if (!timedPhase) {
      setElapsedPhaseSeconds(0)
      return
    }

    const phaseStartedAt = performance.now()
    setElapsedPhaseSeconds(0)
    const intervalId = window.setInterval(() => {
      setElapsedPhaseSeconds(Math.floor((performance.now() - phaseStartedAt) / 1000))
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [timedPhase, turnNumber])

  return {
    elapsedTurn: formatElapsedTime(elapsedTurnSeconds),
    elapsedPhase: formatElapsedTime(elapsedPhaseSeconds),
  }
}
