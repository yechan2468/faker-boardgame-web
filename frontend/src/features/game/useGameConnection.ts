import { Client, type IMessage } from '@stomp/stompjs'
import type { QueryClient } from '@tanstack/react-query'
import { useEffect, useRef, type Dispatch, type SetStateAction } from 'react'
import type { GameState, PublicPlayer } from '../../types/game'
import type { AttackResolutionNotice, DefenseResolutionNotice } from './types'
import type { DeclarationNotice } from './gameUi'

type GameConnectionOptions = {
  gameStatus: string | undefined
  queryClient: QueryClient
  showError: (message: string) => void
  setHand: Dispatch<SetStateAction<string[]>>
  setDeclarationNotice: Dispatch<SetStateAction<DeclarationNotice | null>>
  setAttackResolutionNotice: Dispatch<SetStateAction<AttackResolutionNotice | null>>
  setDefenseResolutionNotice: Dispatch<SetStateAction<DefenseResolutionNotice | null>>
}

export function useGameConnection({
  gameStatus,
  queryClient,
  showError,
  setHand,
  setDeclarationNotice,
  setAttackResolutionNotice,
  setDefenseResolutionNotice,
}: GameConnectionOptions) {
  const clientRef = useRef<Client | null>(null)
  useEffect(() => {
    if (gameStatus !== 'IN_GAME') return
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
          if (payload.type === 'MATCH_STARTED') {
            setDeclarationNotice(null)
            setAttackResolutionNotice(null)
            setDefenseResolutionNotice(null)
          }
          if (payload.type === 'DEFENSE_SUBMITTED') setDefenseResolutionNotice(null)
          if (payload.type === 'BLUFF_SUBMITTED' && pendingAction) {
            setDeclarationNotice({
              playerId: pendingAction.actorId,
              declaredCardId: pendingAction.declaredCardId,
              truthful: pendingAction.attackerTruthful,
            })
          }
          if (payload.type === 'DEFENSE_SUBMITTED' && pendingAction?.defenses.length) {
            const defense = pendingAction.defenses[pendingAction.defenses.length - 1]
            setDeclarationNotice({
              playerId: defense.playerId,
              declaredCardId: defense.declaredCardId,
              truthful: defense.truthful,
            })
          }
          if (typeof payload.truthful === 'boolean' && typeof payload.declaredCardId === 'string') {
            const playerId = typeof payload.defenseIndex === 'number' && payload.defenseIndex >= 0
              ? payload.challengedPlayerId
              : payload.actorId
            if (typeof playerId === 'string') {
              setDeclarationNotice({
                playerId,
                declaredCardId: payload.declaredCardId,
                truthful: payload.truthful,
              })
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
