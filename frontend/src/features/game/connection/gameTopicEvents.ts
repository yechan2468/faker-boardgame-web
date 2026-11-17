import type { IMessage } from '@stomp/stompjs'
import type { QueryClient } from '@tanstack/react-query'
import type { Dispatch, SetStateAction } from 'react'
import type { GameState, PublicPlayer } from '../../../types/game'
import type { GameEffect } from '../audio/GameAudioProvider'
import type { AlchemistResolutionNotice, AttackResolutionNotice, DefenseOutcomeNotice, DefenseResolutionNotice } from '../types'
import { getCard } from '../utils/cardCatalog'
import type { DeclarationNotice } from '../types'

export type GameConnectionEventHandlers = {
  queryClient: QueryClient
  showError: (message: string) => void
  setHand: Dispatch<SetStateAction<string[]>>
  setTurnIntro: Dispatch<SetStateAction<boolean>>
  setDeclarationNotice: Dispatch<SetStateAction<DeclarationNotice | null>>
  setAttackResolutionNotice: Dispatch<SetStateAction<AttackResolutionNotice | null>>
  setDefenseResolutionNotice: Dispatch<SetStateAction<DefenseResolutionNotice | null>>
  setDefenseOutcomeNotice: Dispatch<SetStateAction<DefenseOutcomeNotice | null>>
  setAlchemistResolutionNotice: Dispatch<SetStateAction<AlchemistResolutionNotice | null>>
  playSound: (effect: GameEffect) => void
}

type GameEventPayload = Record<string, unknown>

function createGameEventSnapshot(payload: GameEventPayload, queryClient: QueryClient) {
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
  const outcomePendingAction = previousPendingAction
    && typeof payload.defenseIndex === 'number'
    && payload.defenseIndex >= 0
    && typeof payload.truthful === 'boolean'
    ? {
        ...previousPendingAction,
        defenses: previousPendingAction.defenses.map((defense) =>
          defense.index === payload.defenseIndex
            ? { ...defense, truthful: payload.truthful as boolean }
            : defense,
        ),
      }
    : previousPendingAction
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

  return {
    statePayload,
    pendingAction,
    previousState,
    nextTurn,
    nextPendingAction,
    previousPendingAction,
    outcomePendingAction,
    handlessTargetIds,
    automaticallyResolvedEmptyHandAttack,
    alchemistTargetId,
    challengedAlchemistTruth,
  }
}

function updateResolvedActionNotices(
  snapshot: ReturnType<typeof createGameEventSnapshot>,
  { playSound, setAlchemistResolutionNotice, setDefenseOutcomeNotice }: GameConnectionEventHandlers,
) {
  const {
    previousState,
    previousPendingAction,
    nextTurn,
    nextPendingAction,
    outcomePendingAction,
    handlessTargetIds,
    automaticallyResolvedEmptyHandAttack,
    alchemistTargetId,
    challengedAlchemistTruth,
  } = snapshot

  if (
    previousState?.status === 'IN_GAME'
    && previousPendingAction?.declaredCardId === 'alchemist'
    && challengedAlchemistTruth !== false
    && alchemistTargetId
    && nextTurn?.phase === 'RESOLVED'
    && nextPendingAction === null
    && nextTurn.number === previousState.turn.number
  ) {
    playSound('drawCard')
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
    const outcomeDefenses = outcomePendingAction?.defenses ?? previousPendingAction.defenses
    const defendedPlayerIds = new Set(outcomeDefenses.map((defense) => defense.playerId))
    const passers = previousPendingAction.targetIds.filter((playerId) => !defendedPlayerIds.has(playerId))
    const handlessPassers = passers.filter((playerId) => handlessTargetIds.includes(playerId))
    const failedDefenders = outcomeDefenses
      .filter((defense) => defense.truthful === false)
      .map((defense) => defense.playerId)
    const successfulDefenders = outcomeDefenses
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
}

function updateTurnAndSubmissionNotices(
  payload: GameEventPayload,
  pendingAction: GameState['pendingAction'] | null,
  handlers: GameConnectionEventHandlers,
) {
  const {
    playSound,
    setTurnIntro,
    setDeclarationNotice,
    setAttackResolutionNotice,
    setDefenseResolutionNotice,
    setDefenseOutcomeNotice,
    setAlchemistResolutionNotice,
  } = handlers

  if (payload.type === 'MATCH_STARTED') {
    playSound('turnStart')
    setTurnIntro(true)
    setDeclarationNotice(null)
    setAttackResolutionNotice(null)
    setDefenseResolutionNotice(null)
    setDefenseOutcomeNotice(null)
    setAlchemistResolutionNotice(null)
  }
  if (payload.type === 'TURN_STARTED') {
    playSound('turnStart')
    setTurnIntro(true)
    setDefenseOutcomeNotice(null)
    setAlchemistResolutionNotice(null)
  }
  if (payload.type === 'DEFENSE_SUBMITTED') setDefenseResolutionNotice(null)
  if (payload.type === 'BLUFF_SUBMITTED' && pendingAction) {
    setDefenseOutcomeNotice(null)
    setDeclarationNotice((previous) => ({
      playerId: pendingAction.actorId,
      declaredCardId: pendingAction.declaredCardId,
      truthful: pendingAction.attackerTruthful,
      actualCardId: previous?.playerId === pendingAction.actorId
        && previous.declaredCardId === pendingAction.declaredCardId
        ? previous.actualCardId
        : pendingAction.attackerActualCardId,
      targetIds: pendingAction.targetIds,
    }))
  }
  if (payload.type === 'DEFENSE_SUBMITTED' && pendingAction?.defenses.length) {
    const defense = pendingAction.defenses[pendingAction.defenses.length - 1]
    setDeclarationNotice((previous) => ({
      playerId: defense.playerId,
      declaredCardId: defense.declaredCardId,
      truthful: defense.truthful,
      actualCardId: previous?.playerId === defense.playerId
        && previous.declaredCardId === defense.declaredCardId
        ? previous.actualCardId
        : defense.actualCardId,
      targetIds: [],
    }))
  }
}

function updateChallengeResolutionNotices(
  payload: GameEventPayload,
  statePayload: Partial<GameState> | null,
  { setDeclarationNotice, setAttackResolutionNotice, setDefenseResolutionNotice }: GameConnectionEventHandlers,
) {
  if (typeof payload.truthful !== 'boolean' || typeof payload.declaredCardId !== 'string') return

  const playerId = typeof payload.defenseIndex === 'number' && payload.defenseIndex >= 0
    ? payload.challengedPlayerId
    : payload.actorId
  if (typeof playerId === 'string') {
    const resolvedTargets = statePayload?.pendingAction?.actorId === playerId
      ? statePayload.pendingAction.targetIds
      : undefined
    setDeclarationNotice((previous) => ({
      playerId,
      declaredCardId: payload.declaredCardId as string,
      truthful: payload.truthful as boolean,
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

function updateCachedGameState(payload: GameEventPayload, statePayload: Partial<GameState> | null, queryClient: QueryClient) {
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
}

export function handleGameTopicMessage(message: IMessage, handlers: GameConnectionEventHandlers) {
  const payload = JSON.parse(message.body) as GameEventPayload
  if (Array.isArray(payload.cards)) handlers.setHand(payload.cards as string[])
  if (typeof payload.message === 'string') handlers.showError(payload.message)

  const snapshot = createGameEventSnapshot(payload, handlers.queryClient)
  updateResolvedActionNotices(snapshot, handlers)
  updateTurnAndSubmissionNotices(payload, snapshot.pendingAction, handlers)
  updateChallengeResolutionNotices(payload, snapshot.statePayload, handlers)
  updateCachedGameState(payload, snapshot.statePayload, handlers.queryClient)
}
