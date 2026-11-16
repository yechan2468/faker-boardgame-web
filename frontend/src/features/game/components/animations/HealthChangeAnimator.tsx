import { useLayoutEffect, useRef } from 'react'
import type { GameState } from '../../../../types/game'
import { animateHealthChange, findPlayerHealth } from './healthAnimations'

type HealthSnapshot = {
  status: GameState['status']
  hasMatchResult: boolean
  supplyHealth: number
  playerHealth: Map<string, number>
}

export function HealthChangeAnimator({ game }: { game: GameState }) {
  const previous = useRef<HealthSnapshot | null>(null)

  useLayoutEffect(() => {
    const current: HealthSnapshot = {
      status: game.status,
      hasMatchResult: Boolean(game.matchResult),
      supplyHealth: game.supplyHealth,
      playerHealth: new Map(game.players.map((player) => [player.id, player.health] as const)),
    }
    const prior = previous.current
    previous.current = current
    if (!prior || prior.status !== 'IN_GAME' || (current.status !== 'IN_GAME' && !current.hasMatchResult)) return

    const changes = [...current.playerHealth.entries()]
      .filter(([playerId, health]) => prior.playerHealth.has(playerId) && prior.playerHealth.get(playerId) !== health)
      .map(([playerId, health]) => ({ playerId, delta: health - (prior.playerHealth.get(playerId) ?? health) }))
    if (changes.length === 0) return

    const losses = changes.filter(({ delta }) => delta < 0)
      .map(({ playerId, delta }) => ({ playerId, count: -delta }))
    const gains = changes.filter(({ delta }) => delta > 0)
      .map(({ playerId, delta }) => ({ playerId, count: delta }))
    const tokenMoves: Array<{ from: HTMLElement; to: HTMLElement }> = []

    let lossIndex = 0
    let gainIndex = 0
    while (lossIndex < losses.length && gainIndex < gains.length) {
      const loss = losses[lossIndex]
      const gain = gains[gainIndex]
      const from = findPlayerHealth(loss.playerId)
      const to = findPlayerHealth(gain.playerId)
      if (from && to) {
        const count = Math.min(loss.count, gain.count)
        for (let index = 0; index < count; index += 1) tokenMoves.push({ from, to })
      }
      const count = Math.min(loss.count, gain.count)
      loss.count -= count
      gain.count -= count
      if (loss.count === 0) lossIndex += 1
      if (gain.count === 0) gainIndex += 1
    }

    const supply = document.querySelector<HTMLElement>('[data-health-supply]')
    if (supply) {
      losses.slice(lossIndex).forEach(({ playerId, count }) => {
        const from = findPlayerHealth(playerId)
        if (from) for (let index = 0; index < count; index += 1) tokenMoves.push({ from, to: supply })
      })
      gains.slice(gainIndex).forEach(({ playerId, count }) => {
        const to = findPlayerHealth(playerId)
        if (to) for (let index = 0; index < count; index += 1) tokenMoves.push({ from: supply, to })
      })
    }

    animateHealthChange(changes, tokenMoves, prior.supplyHealth !== current.supplyHealth)
  }, [game.matchResult, game.players, game.status, game.supplyHealth])

  return null
}
