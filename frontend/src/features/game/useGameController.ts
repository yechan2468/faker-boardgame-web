import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { GameState, PublicPlayer } from '../../types/game'
import { CARD_INFO, getCard, getPlayerName, type DeclarationNotice } from './gameUi'
import { createGameActions } from './gameActions'
import { useGameAudio } from './audio/GameAudioProvider'
import { fetchGameState, fetchLeaderboard } from './gameQueries'
import { getGameStatusText } from './gameStatusText'
import type { AlchemistResolutionNotice, AttackResolutionNotice, DefenseOutcomeNotice, DefenseResolutionNotice, GameScreenProps } from './types'
import { useGameConnection } from './useGameConnection'
import { useGameTimers } from './useGameTimers'

export type GameControllerResult =
  | { kind: 'loading' }
  | { kind: 'error'; message: string; refresh: () => void }
  | { kind: 'ready'; screen: GameScreenProps }

export function useGameController(): GameControllerResult {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const gameQuery = useQuery({
    queryKey: ['game-state'],
    queryFn: fetchGameState,
    retry: false,
    refetchInterval: (query) => (query.state.data?.status === 'IN_GAME' ? false : 1500),
  })
  useEffect(() => {
    if (gameQuery.error instanceof Error && gameQuery.error.message === 'AUTHENTICATION_REQUIRED') {
      navigate('/login', { replace: true })
    }
  }, [gameQuery.error, navigate])
  const [hand, setHand] = useState<string[]>([])
  const [selectedHandIndex, setSelectedHandIndex] = useState<number | null>(null)
  const [selectedDeclarationId, setSelectedDeclarationId] = useState<string | null>(null)
  const [targetId, setTargetId] = useState<string | null>(null)
  const [selectedDefenseType, setSelectedDefenseType] = useState<'defender' | 'wizard' | null>(null)
  const [redirectTargetId, setRedirectTargetId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [declarationNotice, setDeclarationNotice] = useState<DeclarationNotice | null>(null)
  const [attackResolutionNotice, setAttackResolutionNotice] = useState<AttackResolutionNotice | null>(null)
  const [defenseResolutionNotice, setDefenseResolutionNotice] = useState<DefenseResolutionNotice | null>(null)
  const [defenseOutcomeNotice, setDefenseOutcomeNotice] = useState<DefenseOutcomeNotice | null>(null)
  const [alchemistResolutionNotice, setAlchemistResolutionNotice] = useState<AlchemistResolutionNotice | null>(null)
  const [turnIntro, setTurnIntro] = useState(false)
  const [hostActionPending, setHostActionPending] = useState(false)
  const errorTimerRef = useRef<number | undefined>(undefined)
  const previousTurnRef = useRef<string | null>(null)
  const previousMustDefendRef = useRef(false)
  const previousGameStatusRef = useRef<string | null>(null)
  const game = gameQuery.data
  const pending = game?.pendingAction ?? null
  const gameStatus = game?.status
  const currentTurnId = game?.turn.activePlayerId ?? null
  const viewerId = game?.viewerId ?? null

  const { elapsedTurn, elapsedPhase } = useGameTimers({
    gameStatus,
    currentTurnId,
    viewerId,
    turnNumber: game?.turn.number,
    phase: game?.turn.phase,
  })
  const { playSound } = useGameAudio()
  const showError = useCallback((message: string) => {
    setErrorMessage(message)
    window.clearTimeout(errorTimerRef.current)
    errorTimerRef.current = window.setTimeout(() => setErrorMessage(null), 2000)
  }, [])

  const clientRef = useGameConnection({
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
  })

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.repeat) return
      event.preventDefault()
      setModalOpen((open) => !open)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (gameStatus !== 'IN_GAME') setHand([])
  }, [gameStatus])

  useEffect(() => {
    if (gameStatus === 'IN_GAME' && previousGameStatusRef.current === 'LOBBY') {
      setDeclarationNotice(null)
      setAttackResolutionNotice(null)
      setDefenseResolutionNotice(null)
      setDefenseOutcomeNotice(null)
      setAlchemistResolutionNotice(null)
    } else if (gameStatus === 'LOBBY' && !game?.matchResult) {
      setDeclarationNotice(null)
      setAttackResolutionNotice(null)
      setDefenseResolutionNotice(null)
      setDefenseOutcomeNotice(null)
      setAlchemistResolutionNotice(null)
    }
    previousGameStatusRef.current = gameStatus ?? null
  }, [gameStatus, game?.matchResult])

  useEffect(() => {
    if (gameStatus !== 'IN_GAME') {
      previousTurnRef.current = null
      return
    }
    if (currentTurnId && previousTurnRef.current !== currentTurnId) {
      setTurnIntro(true)
      setDeclarationNotice(null)
    }
    previousTurnRef.current = currentTurnId
  }, [currentTurnId, gameStatus])

  useEffect(() => () => window.clearTimeout(errorTimerRef.current), [])

  const leaderboardQuery = useQuery({
    queryKey: ['leaderboard'],
    queryFn: fetchLeaderboard,
    enabled: modalOpen,
    staleTime: 10_000,
  })

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
  const activeTurnName = game?.players.find((player) => player.id === currentTurnId)?.nickname
  const turnOverlayText = isMyTurn ? '나의 턴' : activeTurnName ? `${activeTurnName} 님의 턴` : '턴 변경'
  const defaultStatusText = getGameStatusText({
    game,
    isMyTurn,
    mustDefend,
    errorMessage,
    elapsedTurn,
    elapsedPhase,
    attackResolutionNotice,
    defenseResolutionNotice,
    defenseOutcomeNotice,
    alchemistResolutionNotice,
  })
  const selectedCard = selectedHandIndex === null ? null : getCard(hand[selectedHandIndex] ?? '')
  const selectedDeclaration = selectedDeclarationId ? getCard(selectedDeclarationId) : null
  const gameActions = createGameActions({
    game,
    self,
    clientRef,
    queryClient,
    showError,
    playSound,
    selectedHandIndex,
    selectedCard,
    selectedDeclaration,
    targetId,
    selectedDefenseType,
    redirectTargetId,
    hostActionPending,
    setModalOpen,
    setHostActionPending,
    setSelectedHandIndex,
    setSelectedDeclarationId,
    setDeclarationNotice,
    setTargetId,
    setSelectedDefenseType,
    setRedirectTargetId,
    messages: {
      disconnected: '게임 서버에 연결되어 있지 않습니다.',
      targetRequired: '대상을 선택해 주세요.',
      redirectTargetRequired: '반사할 대상을 선택해 주세요.',
      restartRequiresPlayers: '게임을 재시작하려면 플레이어가 2명 이상 필요합니다.',
      startFailed: '게임을 시작하지 못했습니다.',
      restartFailed: '게임을 재시작하지 못했습니다.',
      endFailed: '게임을 종료하지 못했습니다.',
    },
  })
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
  const waitingForTurnEnd = game?.status === 'IN_GAME'
    && game.turn.phase === 'RESOLVED'
    && !isMyTurn
    && (displayedDeclaration?.truthful === true || displayedDeclaration?.truthful === false)
  const statusText = waitingForTurnEnd
    ? `${activeTurnName ?? '상대'} 님의 턴 종료를 기다리는 중... (${elapsedPhase})`
    : defaultStatusText
  const modalLeaderboard = useMemo(() => {
    if (!game) return []
    const wins = new Map((leaderboardQuery.data ?? []).map((entry) => [entry.playerId, entry.wins]))
    return game.players
      .map((player) => ({ id: player.id, nickname: player.nickname, wins: wins.get(player.id) ?? 0 }))
      .sort((left, right) => right.wins - left.wins || left.nickname.localeCompare(right.nickname, 'ko'))
  }, [game, leaderboardQuery.data])

  const canAct = Boolean(isMyTurn && game?.turn.phase === 'START' && !pending)
  useEffect(() => {
    if (mustDefend && !previousMustDefendRef.current) {
      setSelectedHandIndex(null)
      setSelectedDefenseType(null)
      setRedirectTargetId(null)
    }
    previousMustDefendRef.current = mustDefend
  }, [mustDefend])
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


  if (gameQuery.isLoading) return { kind: 'loading' }
  if (gameQuery.isError || !game) {
    return {
      kind: 'error',
      message: gameQuery.error?.message ?? '게임 상태를 불러오지 못했습니다.',
      refresh: () => { void gameQuery.refetch() },
    }
  }

  return {
    kind: 'ready',
    screen: {
      game,
      self,
      opponents,
      hand,
      selectedHandIndex,
      selectedDeclarationId,
      targetId,
      selectedDefenseType,
      redirectTargetId,
      modalOpen,
      errorMessage,
      statusText,
      waitingForTurnEnd,
      turnIntro,
      turnOverlayText,
      currentTurnId,
      displayedDeclaration,
      displayedDeclarationLabel,
      displayedCard,
      hostActionPending,
      isMyTurn,
      selectedCard,
      selectedDeclaration,
      needsTarget,
      eligibleDeclarations,
      canAct,
      mustDefend,
      suspicionPasserNames,
      suspicionWaitingNames,
      suspicionCardOwnerId,
      hasPassedSuspicion,
      hasDefenderCard,
      hasWizardCard,
      redirectTargets,
      turnPreview,
      modalLeaderboard,
      leaderboardLoading: leaderboardQuery.isLoading,
      leaderboardError: leaderboardQuery.error instanceof Error ? leaderboardQuery.error.message : null,
      actions: {
        setModalOpen,
        setTurnIntro,
        setSelectedDeclarationId,
        setTargetId,
        setSelectedDefenseType,
        setRedirectTargetId,
        setSelectedHandIndex,
        publish: gameActions.publish,
        startGame: gameActions.startGame,
        restartGame: gameActions.restartGame,
        endGame: gameActions.endGame,
        submitTurnEnd: gameActions.submitTurnEnd,
        submitBluff: gameActions.submitBluff,
        passSuspicion: gameActions.passSuspicion,
        submitDefense: gameActions.submitDefense,
        passDefense: gameActions.passDefense,
      },
    },
  }
}
