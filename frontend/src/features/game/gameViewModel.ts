import type { GameState, PublicPlayer } from '../../types/game'
import { CARD_INFO, getCard, getCardLongEffect } from './utils/cardCatalog'
import { getPlayerName } from './utils/playerNames'
import { getGameStatusText } from './utils/gameStatusText'
import type { DeclarationNotice } from './types'
import type {
  AlchemistResolutionNotice,
  AttackResolutionNotice,
  DefenseOutcomeNotice,
  DefenseResolutionNotice,
  GameScreenProps,
} from './types'

type GameViewModelInput = {
  game: GameState | undefined
  hand: string[]
  selectedHandIndex: number | null
  selectedDeclarationId: string | null
  declarationNotice: DeclarationNotice | null
  errorMessage: string | null
  elapsedTurn: string
  elapsedPhase: string
  attackResolutionNotice: AttackResolutionNotice | null
  defenseResolutionNotice: DefenseResolutionNotice | null
  defenseOutcomeNotice: DefenseOutcomeNotice | null
  alchemistResolutionNotice: AlchemistResolutionNotice | null
}

export type GameViewModel = Pick<GameScreenProps,
  | 'self'
  | 'opponents'
  | 'turnPreview'
  | 'isMyTurn'
  | 'mustDefend'
  | 'turnOverlayText'
  | 'selectedCard'
  | 'selectedDeclaration'
  | 'needsTarget'
  | 'eligibleDeclarations'
  | 'displayedDeclaration'
  | 'displayedDeclarationLabel'
  | 'displayedCard'
  | 'statusText'
  | 'turnEndWaitingText'
  | 'waitingForTurnEnd'
  | 'canAct'
  | 'hasDefenderCard'
  | 'hasWizardCard'
  | 'redirectTargets'
  | 'hasPassedSuspicion'
  | 'suspicionCardOwnerId'
  | 'suspicionPasserNames'
  | 'suspicionWaitingNames'
>

export function deriveGameViewModel({
  game,
  hand,
  selectedHandIndex,
  selectedDeclarationId,
  declarationNotice,
  errorMessage,
  elapsedTurn,
  elapsedPhase,
  attackResolutionNotice,
  defenseResolutionNotice,
  defenseOutcomeNotice,
  alchemistResolutionNotice,
}: GameViewModelInput): GameViewModel {
  const pending = game?.pendingAction ?? null
  const viewerId = game?.viewerId ?? null
  const self = game?.players.find((player) => player.id === game.viewerId)
  const opponents = game?.players.filter((player) => player.id !== game.viewerId) ?? []
  const aliveTurnOrder = game?.status === 'IN_GAME'
    ? game.turnOrder
      .map((playerId) => game.players.find((player) => player.id === playerId))
      .filter((player): player is PublicPlayer => Boolean(player?.alive))
    : []
  const currentOrderIndex = aliveTurnOrder.findIndex((player) => player.id === game?.turn.activePlayerId)
  const turnPreview = currentOrderIndex < 0
    ? []
    : [...aliveTurnOrder.slice(currentOrderIndex), ...aliveTurnOrder.slice(0, currentOrderIndex)].slice(0, 4)
  const isMyTurn = Boolean(game?.status === 'IN_GAME' && game.turn.activePlayerId === game.viewerId)
  const mustDefend = Boolean(
    game?.turn.phase === 'DEFENSE' &&
    pending && viewerId && pending.targetIds.includes(viewerId) &&
    !pending.defensePasses.includes(viewerId) &&
    !pending.defenses.some((defense) => defense.playerId === viewerId),
  )
  const currentTurnId = game?.turn.activePlayerId ?? null
  const activeTurnName = game?.players.find((player) => player.id === currentTurnId)?.nickname
  const turnOverlayText = isMyTurn ? '나의 턴' : activeTurnName ? `${activeTurnName} 님의 턴` : '턴 변경'
  const selectedCard = selectedHandIndex === null ? null : getCard(hand[selectedHandIndex] ?? '')
  const selectedDeclaration = selectedDeclarationId ? getCard(selectedDeclarationId) : null
  const needsTarget = Boolean(selectedDeclaration?.target)
  const eligibleDeclarations = CARD_INFO
    .filter((card) => !['wizard', 'defender'].includes(card.id))
    .sort((left, right) => right.value - left.value)
  const activeDefenseDeclaration = game?.turn.phase === 'DEFENSE_SUSPICION'
    ? pending?.defenses.find((defense) => defense.index === pending.suspicionDefenseIndex)
    : null
  const pendingDeclarationNotice: DeclarationNotice | null = activeDefenseDeclaration
    ? {
        playerId: activeDefenseDeclaration.playerId,
        declaredCardId: activeDefenseDeclaration.declaredCardId,
        truthful: activeDefenseDeclaration.truthful,
        actualCardId: activeDefenseDeclaration.actualCardId,
        targetIds: [],
      }
    : pending
      ? {
          playerId: pending.actorId,
          declaredCardId: pending.declaredCardId,
          truthful: pending.attackerTruthful,
          actualCardId: pending.attackerActualCardId,
          targetIds: pending.targetIds,
        }
      : null
  const displayedDeclaration = declarationNotice ?? pendingDeclarationNotice
  const displayedCard = displayedDeclaration ? getCard(displayedDeclaration.declaredCardId) : null
  const displayedPlayerName = displayedDeclaration
    ? getPlayerName(game?.players ?? [], displayedDeclaration.playerId)
    : null
  const declarationBaseLabel = displayedDeclaration && displayedCard
    ? displayedCard.target || displayedCard.allTargets
      ? displayedDeclaration.playerId === viewerId
        ? `나의 ${displayedCard.ko} 선언`
        : `${displayedPlayerName} 님이 ${displayedCard.ko} 선언`
      : displayedDeclaration.playerId === viewerId
        ? `나의 ${displayedCard.ko} 선언`
        : `${displayedPlayerName} 님의 ${displayedCard.ko} 선언`
    : null
  const displayedDeclarationLabel = displayedDeclaration && displayedCard
    ? `${declarationBaseLabel}${displayedCard.allTargets
        ? ' (대상: 전원)'
        : displayedCard.target && displayedDeclaration.targetIds?.length
          ? ` (대상: ${displayedDeclaration.targetIds.map((playerId) => getPlayerName(game?.players ?? [], playerId)).join(', ')})`
          : ''}`
    : null
  const falseDeclarationLongEffect = displayedDeclaration?.truthful === false
    && displayedDeclaration.actualCardId
    && displayedDeclaration.actualCardId !== 'clown'
    ? getCardLongEffect(displayedDeclaration.actualCardId)
    : null
  const defaultStatusText = getGameStatusText({
    game,
    isMyTurn,
    mustDefend,
    errorMessage,
    elapsedTurn,
    elapsedPhase,
    attackResolutionNotice,
    falseDeclarationLongEffect,
    defenseResolutionNotice,
    defenseOutcomeNotice,
    alchemistResolutionNotice,
  })
  const waitingForTurnEnd = game?.status === 'IN_GAME'
    && game.turn.phase === 'RESOLVED'
    && !isMyTurn
  const turnEndWaitingText = waitingForTurnEnd
    ? `${activeTurnName ?? '상대'} 님의 턴 종료를 기다리는 중... (${elapsedPhase})`
    : ''
  const canAct = Boolean(isMyTurn && game?.turn.phase === 'START' && !pending)
  const hasDefenderCard = hand.includes('defender')
  const hasWizardCard = hand.includes('wizard')
  const redirectTargets = opponents.filter((player) => player.alive && !pending?.targetIds.includes(player.id))
  const hasPassedSuspicion = Boolean(pending?.suspicionPasses.includes(game?.viewerId ?? ''))
  const suspicionPlayers = game?.players ?? []
  const suspicionCardOwnerId = game?.turn.phase === 'SUSPICION'
    ? pending?.actorId
    : game?.turn.phase === 'DEFENSE_SUSPICION'
      ? pending?.defenses.find((defense) => defense.index === pending.suspicionDefenseIndex)?.playerId
      : undefined
  const suspicionPasserNames = (pending?.suspicionPasses ?? [])
    .map((playerId) => getPlayerName(suspicionPlayers, playerId))
  const suspicionWaitingNames = suspicionPlayers
    .filter((player) => player.alive && player.id !== suspicionCardOwnerId
      && !pending?.suspicionPasses.includes(player.id))
    .map((player) => player.nickname)
    .join(', ')

  return {
    self,
    opponents,
    turnPreview,
    isMyTurn,
    mustDefend,
    turnOverlayText,
    selectedCard,
    selectedDeclaration,
    needsTarget,
    eligibleDeclarations,
    displayedDeclaration,
    displayedDeclarationLabel,
    displayedCard,
    statusText: defaultStatusText,
    turnEndWaitingText,
    waitingForTurnEnd,
    canAct,
    hasDefenderCard,
    hasWizardCard,
    redirectTargets,
    hasPassedSuspicion,
    suspicionCardOwnerId,
    suspicionPasserNames,
    suspicionWaitingNames,
  }
}
