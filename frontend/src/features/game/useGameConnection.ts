import { Client, type IMessage } from '@stomp/stompjs'
import type { QueryClient } from '@tanstack/react-query'
import { useEffect, useRef, type Dispatch, type SetStateAction } from 'react'
import type { GameState, PublicPlayer } from '../../types/game'
import type { AlchemistResolutionNotice, AttackResolutionNotice, DefenseOutcomeNotice, DefenseResolutionNotice } from './types'
import { getCard, type DeclarationNotice } from './gameUi'

type GameConnectionOptions = {
  gameStatus: string | undefined
  queryClient: QueryClient
  showError: (message: string) => void
  setHand: Dispatch<SetStateAction<string[]>>
  setTurnIntro: Dispatch<SetStateAction<boolean>>
  setDeclarationNotice: Dispatch<SetStateAction<DeclarationNotice | null>>
  setAttackResolutionNotice: Dispatch<SetStateAction<AttackResolutionNotice | null>>
  setDefenseResolutionNotice: Dispatch<SetStateAction<DefenseResolutionNotice | null>>
  setDefenseOutcomeNotice: Dispatch<SetStateAction<DefenseOutcomeNotice | null>>
  setAlchemistResolutionNotice: Dispatch<SetStateAction<AlchemistResolutionNotice | null>>
}

export function useGameConnection({
  gameStatus,
  queryClient,
  showError,
  setHand,
  setTurnIntro,
  setDeclarationNotice,
  setAttackResolutionNotice,
  setDefenseResolutionNotice,
  setDefenseOutcomeNotice,
  setAlchemistResolutionNotice,
}: GameConnectionOptions) {
  const clientRef = useRef<Client | null>(null)
  useEffect(() => {
    if (!gameStatus) return
    const client = new Client({
      brokerURL: `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws`,
      reconnectDelay: 2500,
      onConnect: () => {
        client.subscribe('/topic/game', (message: IMessage) => {
          const payload = JSON.parse(message.body) as Record<string, unknown>
          if (Array.isArray(payload.cards)) setHand(payload.cards as string[])
          if (typeof payload.message === 'string') showError(payload.message)

          const statePayload = payload.state && typeof payload.state === 'object'
            ? payload.state as Partial<GameState>
            : null
          const pendingAction = statePayload?.pendingAction
            ?? (payload.pendingAction as GameState['pendingAction'] | undefined)
            ?? null
          const previousState = queryClient.getQueryData<GameState>(['game-state'])
          const nextTurn = statePayload?.turn ?? payload.turn as GameState['turn'] | undefined
          const nextPendingAction = statePayload
            ? statePayload.pendingAction ?? null
            : (payload.pendingAction as GameState['pendingAction'] | undefined) ?? null
          const previousPendingAction = previousState?.pendingAction
          const attackChallengeTruthful = payload.defenseIndex === -1 && typeof payload.truthful === 'boolean'
            ? payload.truthful
            : previousPendingAction?.attackerTruthful
          const handlessTargetIds = previousPendingAction?.targetIds.filter((playerId) =>
            previousState?.players.find((player) => player.id === playerId)?.cardCount === 0,
          ) ?? []
          const automaticallyResolvedEmptyHandAttack = Boolean(
            previousState?.turn.phase === 'SUSPICION'
              && previousPendingAction
              && ['assassin', 'warlock', 'red-dragon', 'archer', 'bomber'].includes(previousPendingAction.declaredCardId)
              && previousPendingAction.targetIds.length > 0
              && handlessTargetIds.length === previousPendingAction.targetIds.length
              && attackChallengeTruthful !== false,
          )
          const alchemistTargetId = previousPendingAction?.targetIds[0]
          const challengedAlchemistTruth = payload.declaredCardId === 'alchemist'
            && payload.defenseIndex === -1
            && typeof payload.truthful === 'boolean'
            ? payload.truthful
            : previousPendingAction?.attackerTruthful
          if (
            previousState?.status === 'IN_GAME'
            && previousPendingAction?.declaredCardId === 'alchemist'
            && challengedAlchemistTruth !== false
            && alchemistTargetId
            && nextTurn?.phase === 'RESOLVED'
            && nextPendingAction === null
            && nextTurn.number === previousState.turn.number
          ) {
            setAlchemistResolutionNotice({
              actorId: previousPendingAction.actorId,
              targetId: alchemistTargetId,
              turnNumber: nextTurn.number,
            })
          }
          if (
            previousState?.status === 'IN_GAME'
            && (previousState.turn.phase === 'DEFENSE'
              || previousState.turn.phase === 'DEFENSE_SUSPICION'
              || automaticallyResolvedEmptyHandAttack)
            && previousPendingAction
            && nextTurn?.phase === 'RESOLVED'
            && nextPendingAction === null
            && nextTurn.number === previousState.turn.number
          ) {
            const defendedPlayerIds = new Set(previousPendingAction.defenses.map((defense) => defense.playerId))
            const passers = previousPendingAction.targetIds.filter((playerId) => !defendedPlayerIds.has(playerId))
            const handlessPassers = passers.filter((playerId) => handlessTargetIds.includes(playerId))
            const failedDefenders = previousPendingAction.defenses
              .filter((defense) => defense.truthful === false)
              .map((defense) => defense.playerId)
            const successfulDefenders = previousPendingAction.defenses
              .filter((defense) => defense.truthful !== false)
              .map((defense) => defense.playerId)
            const damageAmount = getCard(previousPendingAction.declaredCardId).healthLoss ?? 0
            setDefenseOutcomeNotice({
              actorId: previousPendingAction.actorId,
              turnNumber: nextTurn.number,
              damageAmount,
              passers,
              handlessPassers,
              successfulDefenders,
              failedDefenders,
            })
          }
          if (payload.type === 'MATCH_STARTED') {
            setTurnIntro(true)
            setDeclarationNotice(null)
            setAttackResolutionNotice(null)
            setDefenseResolutionNotice(null)
            setDefenseOutcomeNotice(null)
            setAlchemistResolutionNotice(null)
          }
          if (payload.type === 'TURN_STARTED') {
            setTurnIntro(true)
            setDefenseOutcomeNotice(null)
            setAlchemistResolutionNotice(null)
          }
          if (payload.type === 'DEFENSE_SUBMITTED') setDefenseResolutionNotice(null)
          if (payload.type === 'BLUFF_SUBMITTED' && pendingAction) {
            setDefenseOutcomeNotice(null)
            setDeclarationNotice({
              playerId: pendingAction.actorId,
              declaredCardId: pendingAction.declaredCardId,
              truthful: pendingAction.attackerTruthful,
              targetIds: pendingAction.targetIds,
            })
          }
          if (payload.type === 'DEFENSE_SUBMITTED' && pendingAction?.defenses.length) {
            const defense = pendingAction.defenses[pendingAction.defenses.length - 1]
            setDeclarationNotice({
              playerId: defense.playerId,
              declaredCardId: defense.declaredCardId,
              truthful: defense.truthful,
              targetIds: [],
            })
          }
          if (typeof payload.truthful === 'boolean' && typeof payload.declaredCardId === 'string') {
            const playerId = typeof payload.defenseIndex === 'number' && payload.defenseIndex >= 0
              ? payload.challengedPlayerId
              : payload.actorId
            if (typeof playerId === 'string') {
              const resolvedTargets = statePayload?.pendingAction?.actorId === playerId
                ? statePayload.pendingAction.targetIds
                : undefined
              setDeclarationNotice((previous) => ({
                playerId,
                declaredCardId: payload.declaredCardId,
                truthful: payload.truthful,
                actualCardId: typeof payload.actualCardId === 'string' ? payload.actualCardId : null,
                targetIds: resolvedTargets ?? (previous?.playerId === playerId
                  && previous.declaredCardId === payload.declaredCardId
                  ? previous.targetIds
                  : undefined),
              }))
            }
            if (
              payload.defenseIndex === -1
              && typeof payload.actorId === 'string'
              && typeof payload.challengerId === 'string'
              && typeof statePayload?.turn?.number === 'number'
            ) {
              setAttackResolutionNotice({
                actorId: payload.actorId,
                challengerId: payload.challengerId,
                truthful: payload.truthful,
                turnNumber: statePayload.turn.number,
              })
              setDefenseResolutionNotice(null)
            } else if (
              typeof payload.defenseIndex === 'number'
              && payload.defenseIndex >= 0
              && typeof payload.actorId === 'string'
              && typeof payload.challengedPlayerId === 'string'
              && typeof payload.challengerId === 'string'
              && typeof statePayload?.turn?.number === 'number'
            ) {
              setDefenseResolutionNotice({
                actorId: payload.actorId,
                defenderId: payload.challengedPlayerId,
                challengerId: payload.challengerId,
                truthful: payload.truthful,
                turnNumber: statePayload.turn.number,
              })
              setAttackResolutionNotice(null)
            }
          }

          if (payload.state && typeof payload.state === 'object') {
            const publicState = statePayload as Partial<GameState>
            queryClient.setQueryData<GameState>(['game-state'], (current) =>
              current ? { ...current, ...publicState, viewerId: current.viewerId } : undefined,
            )
          } else if (Array.isArray(payload.players) && typeof payload.status === 'string') {
            queryClient.setQueryData<GameState>(['game-state'], (current) =>
              current
                ? {
                    ...current,
                    status: payload.status as GameState['status'],
                    players: payload.players as PublicPlayer[],
                    turnOrder: Array.isArray(payload.turnOrder)
                      ? payload.turnOrder as string[]
                      : current.turnOrder,
                    supplyHealth: payload.supplyHealth as number,
                    turn: payload.turn as GameState['turn'],
                    cardDeckCount: payload.deckCount as number,
                    matchResult: (payload.matchResult as GameState['matchResult']) ?? null,
                    pendingAction: (payload.pendingAction as GameState['pendingAction']) ?? null,
                  }
                : undefined,
            )
          }

        })
        client.subscribe('/user/queue/private', (message: IMessage) => {
          const payload = JSON.parse(message.body) as { cards?: string[] }
          if (Array.isArray(payload.cards)) setHand(payload.cards)
        })
        client.subscribe('/user/queue/errors', (message: IMessage) => {
          const payload = JSON.parse(message.body) as { message?: string }
          if (payload.message) showError(payload.message)
        })
        client.publish({ destination: '/app/game/hand', body: '{}' })
      },
      onStompError: (frame) => showError(frame.headers.message || '게임 서버와 통신할 수 없습니다.'),
      onWebSocketError: () => showError('게임 서버와 연결할 수 없습니다.'),
    })
    clientRef.current = client
    client.activate()
    return () => {
      clientRef.current = null
      void client.deactivate()
    }
  }, [gameStatus, queryClient, showError])

  return clientRef
}
