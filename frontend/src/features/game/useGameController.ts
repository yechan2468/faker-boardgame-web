import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { DeclarationNotice } from './types'
import { createGameActionCommands } from './gameActionCommands'
import { useGameAudio } from './audio/GameAudioProvider'
import { fetchGameState, fetchLeaderboard } from './api/gameQueries'
import type { AlchemistResolutionNotice, AttackResolutionNotice, DefenseOutcomeNotice, DefenseResolutionNotice, GameScreenProps } from './types'
import { useGameConnection } from './connection/useGameConnection'
import { useGameTimers } from './useGameTimers'
import { deriveGameViewModel } from './gameViewModel'

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

  const viewModel = deriveGameViewModel({
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
  })
  const { self, mustDefend, selectedCard, selectedDeclaration } = viewModel

  const gameActionCommands = createGameActionCommands({
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
  const modalLeaderboard = useMemo(() => {
    if (!game) return []
    const wins = new Map((leaderboardQuery.data ?? []).map((entry) => [entry.playerId, entry.wins]))
    return game.players
      .map((player) => ({ id: player.id, nickname: player.nickname, wins: wins.get(player.id) ?? 0 }))
      .sort((left, right) => right.wins - left.wins || left.nickname.localeCompare(right.nickname, 'ko'))
  }, [game, leaderboardQuery.data])

  useEffect(() => {
    if (mustDefend && !previousMustDefendRef.current) {
      setSelectedHandIndex(null)
      setSelectedDefenseType(null)
      setRedirectTargetId(null)
    }
    previousMustDefendRef.current = mustDefend
  }, [mustDefend])
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
      ...viewModel,
      hand,
      selectedHandIndex,
      selectedDeclarationId,
      targetId,
      selectedDefenseType,
      redirectTargetId,
      modalOpen,
      errorMessage,
      turnIntro,
      currentTurnId,
      hostActionPending,
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
        publish: gameActionCommands.publish,
        startGame: gameActionCommands.startGame,
        restartGame: gameActionCommands.restartGame,
        endGame: gameActionCommands.endGame,
        submitTurnEnd: gameActionCommands.submitTurnEnd,
        submitBluff: gameActionCommands.submitBluff,
        passSuspicion: gameActionCommands.passSuspicion,
        submitDefense: gameActionCommands.submitDefense,
        passDefense: gameActionCommands.passDefense,
      },
    },
  }
}
