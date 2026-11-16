import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Client, type IMessage } from '@stomp/stompjs'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { GameState, LeaderboardEntry, PublicPlayer } from '../../types/game'
import { CARD_INFO, getCard, getPlayerName, type DeclarationNotice } from './gameUi'
import { animatePlayedCard } from './components/cardAnimations'
import type { AttackResolutionNotice, DefenseResolutionNotice, GameScreenProps } from './types'
import { useGameConnection } from './useGameConnection'

async function fetchGameState(): Promise<GameState> {
  const response = await fetch('/api/game', { credentials: 'same-origin', headers: { Accept: 'application/json' } })
  if (response.status === 401) throw new Error('AUTHENTICATION_REQUIRED')
  if (!response.ok) throw new Error('게임 상태를 불러오지 못했습니다.')
  return response.json() as Promise<GameState>
}

async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const response = await fetch('/api/leaderboard', { credentials: 'same-origin' })
  if (!response.ok) throw new Error('리더보드를 불러오지 못했습니다.')
  return response.json() as Promise<LeaderboardEntry[]>
}

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
    setDeclarationNotice,
    setAttackResolutionNotice,
    setDefenseResolutionNotice,
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
    } else if (gameStatus === 'LOBBY' && !game?.matchResult) {
      setDeclarationNotice(null)
      setAttackResolutionNotice(null)
      setDefenseResolutionNotice(null)
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
  const activeTurnName = game?.players.find((player) => player.id === currentTurnId)?.nickname
  const turnOverlayText = isMyTurn ? '나의 턴' : activeTurnName ? `${activeTurnName} 님의 턴` : '턴 변경'
  const attackResolutionStatus = attackResolutionNotice
    && game?.status === 'IN_GAME'
    && game.turn.phase === 'RESOLVED'
    && game.turn.activePlayerId === attackResolutionNotice.actorId
    && game.turn.number === attackResolutionNotice.turnNumber
    ? attackResolutionNotice.truthful
      ? `잘못 의심한 ${getPlayerName(game.players, attackResolutionNotice.challengerId)} 님이 체력 토큰을 2개 잃고, 선언한 카드의 능력이 그대로 적용됩니다.`
      : `거짓이 발각되어 ${getPlayerName(game.players, attackResolutionNotice.actorId)} 님이 체력 토큰을 2개 잃고 ${getPlayerName(game.players, attackResolutionNotice.challengerId)} 님이 체력 토큰을 2개 얻습니다. 선언한 카드의 능력은 무효화됩니다.`
    : null
  const defenseResolutionStatus = defenseResolutionNotice
    && game?.status === 'IN_GAME'
    && (game.turn.phase === 'DEFENSE_SUSPICION' || game.turn.phase === 'RESOLVED')
    && game.turn.activePlayerId === defenseResolutionNotice.actorId
    && game.turn.number === defenseResolutionNotice.turnNumber
    ? defenseResolutionNotice.truthful
      ? `잘못 의심한 ${getPlayerName(game.players, defenseResolutionNotice.challengerId)} 님이 체력 토큰을 2개 잃고, ${getPlayerName(game.players, defenseResolutionNotice.defenderId)} 님의 방어 카드 능력이 그대로 적용됩니다.`
      : `거짓이 발각되어 ${getPlayerName(game.players, defenseResolutionNotice.defenderId)} 님이 체력 토큰을 2개 잃고 ${getPlayerName(game.players, defenseResolutionNotice.challengerId)} 님이 체력 토큰을 2개 얻습니다. 방어 카드의 능력은 무효화됩니다.`
    : null
  const selectedCard = selectedHandIndex === null ? null : getCard(hand[selectedHandIndex] ?? '')
  const selectedDeclaration = selectedDeclarationId ? getCard(selectedDeclarationId) : null
  const needsTarget = Boolean(selectedDeclaration?.target)
  const eligibleDeclarations = CARD_INFO.filter((card) => !['wizard', 'defender', 'clown'].includes(card.id))
  const activeDefenseDeclaration = game?.turn.phase === 'DEFENSE_SUSPICION'
    ? pending?.defenses.find((defense) => defense.index === pending.suspicionDefenseIndex)
    : null
  const pendingDeclarationNotice: DeclarationNotice | null = activeDefenseDeclaration
    ? {
        playerId: activeDefenseDeclaration.playerId,
        declaredCardId: activeDefenseDeclaration.declaredCardId,
        truthful: activeDefenseDeclaration.truthful,
      }
    : pending
      ? {
          playerId: pending.actorId,
          declaredCardId: pending.declaredCardId,
          truthful: pending.attackerTruthful,
        }
      : null
  const displayedDeclaration = declarationNotice ?? pendingDeclarationNotice
  const displayedCard = displayedDeclaration ? getCard(displayedDeclaration.declaredCardId) : null
  const displayedPlayerName = displayedDeclaration
    ? getPlayerName(game?.players ?? [], displayedDeclaration.playerId)
    : null
  const displayedDeclarationLabel = displayedDeclaration && displayedCard
    ? displayedDeclaration.playerId === viewerId
      ? `나의 ${displayedCard.ko} 선언`
      : `${displayedPlayerName} 님의 ${displayedCard.ko} 선언`
    : null
  const statusText = defenseResolutionStatus
    ?? attackResolutionStatus
    ?? (errorMessage
    ? errorMessage
    : game?.status !== 'IN_GAME'
      ? game?.matchResult?.message ?? '호스트가 게임을 시작하기를 기다리는 중입니다.'
      : game.turn.phase === 'DEFENSE'
        ? '공격 대상들이 방어를 선택하는 중입니다.'
        : game.turn.phase === 'SUSPICION'
          ? '의심을 진행 중입니다.'
            : game.turn.phase === 'DEFENSE_SUSPICION'
              ? '방어 선언을 의심하는 중입니다.'
              : isMyTurn
            ? '나의 턴입니다'
            : `${game.players.find((player) => player.id === game.turn.activePlayerId)?.nickname ?? '상대'} 님이 턴 진행 중...`)

  const modalLeaderboard = useMemo(() => {
    if (!game) return []
    const wins = new Map((leaderboardQuery.data ?? []).map((entry) => [entry.playerId, entry.wins]))
    return game.players
      .map((player) => ({ id: player.id, nickname: player.nickname, wins: wins.get(player.id) ?? 0 }))
      .sort((left, right) => right.wins - left.wins || left.nickname.localeCompare(right.nickname, 'ko'))
  }, [game, leaderboardQuery.data])

  const publish = (destination: string, body: unknown) => {
    if (!clientRef.current?.connected) {
      showError('게임 서버에 연결되어 있지 않습니다.')
      return
    }
    clientRef.current.publish({ destination, body: JSON.stringify(body) })
  }

  const sendHostAction = (destination: string, failureMessage: string) => {
    if (!game || self?.role !== 'HOST' || hostActionPending) return
    setHostActionPending(true)
    if (clientRef.current?.connected) {
      clientRef.current.publish({ destination, body: '{}' })
      window.setTimeout(() => setHostActionPending(false), 1200)
      return
    }

    const expectedEvent = destination === '/app/game/end' ? 'MATCH_ENDED' : 'MATCH_STARTED'
    let actionTimeout: number | undefined
    let completed = false
    const finishAction = () => {
      if (completed) return
      completed = true
      window.clearTimeout(actionTimeout)
      setHostActionPending(false)
      void client.deactivate()
    }
    const client = new Client({
      brokerURL: `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws`,
      reconnectDelay: 0,
      onConnect: () => {
        client.subscribe('/topic/game', (message: IMessage) => {
          const payload = JSON.parse(message.body) as { type?: string }
          if (payload.type !== expectedEvent) return
          void queryClient.invalidateQueries({ queryKey: ['game-state'] })
          finishAction()
        })
        client.subscribe('/user/queue/errors', (message: IMessage) => {
          const payload = JSON.parse(message.body) as { message?: string }
          showError(payload.message || failureMessage)
          finishAction()
        })
        client.publish({ destination, body: '{}' })
      },
      onStompError: (frame) => {
        showError(frame.headers.message || failureMessage)
        finishAction()
      },
      onWebSocketError: () => {
        showError(failureMessage)
        finishAction()
      },
    })
    actionTimeout = window.setTimeout(() => {
      showError(failureMessage)
      finishAction()
    }, 5000)
    client.activate()
  }

  const startGame = () => sendHostAction('/app/game/start', '게임을 시작하지 못했습니다.')
  const restartGame = () => {
    if (!game) return
    if (game.players.length < 2) {
      showError('게임을 재시작하려면 플레이어가 2명 이상 필요합니다.')
      return
    }
    setModalOpen(false)
    sendHostAction('/app/game/restart', '게임을 재시작하지 못했습니다.')
  }
  const endGame = () => {
    setModalOpen(false)
    sendHostAction('/app/game/end', '게임을 종료하지 못했습니다.')
  }

  const submitBluff = () => {
    if (!selectedCard || !selectedDeclaration || selectedHandIndex === null) return
    if (selectedDeclaration.target && !targetId) {
      showError('대상을 선택해 주세요.')
      return
    }
    if (clientRef.current?.connected) animatePlayedCard(selectedHandIndex)
    publish('/app/game/bluff/submit', {
      actualCardId: selectedCard.id,
      declaredCardId: selectedDeclaration.id,
      targetIds: targetId ? [targetId] : [],
    })
    setSelectedHandIndex(null)
    setSelectedDeclarationId(null)
    setTargetId(null)
  }

  const submitDefense = () => {
    if (!selectedCard || !selectedDefenseType) return
    if (selectedDefenseType === 'wizard' && !redirectTargetId) {
      showError('반사할 대상을 선택해 주세요.')
      return
    }
    if (selectedHandIndex !== null && clientRef.current?.connected) animatePlayedCard(selectedHandIndex)
    publish('/app/game/card/defend', {
      actualCardId: selectedCard.id,
      declaredCardId: selectedDefenseType,
      redirectTargetId: selectedDefenseType === 'wizard' ? redirectTargetId : null,
    })
    setSelectedHandIndex(null)
    setSelectedDefenseType(null)
    setRedirectTargetId(null)
  }

  const passDefense = () => {
    setSelectedHandIndex(null)
    setSelectedDefenseType(null)
    setRedirectTargetId(null)
    publish('/app/game/card/pass-defense', {})
  }
  const passSuspicion = () => publish('/app/game/bluff/pass', {})
  const submitTurnEnd = () => publish('/app/game/turn-end', {})
  const canAct = Boolean(isMyTurn && game?.turn.phase === 'START' && !pending)
  const mustDefend = Boolean(
    game?.turn.phase === 'DEFENSE' &&
    pending && pending.targetIds.includes(game.viewerId ?? '') &&
    !pending.defensePasses.includes(game.viewerId ?? ''),
  )
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
        publish,
        startGame,
        restartGame,
        endGame,
        submitTurnEnd,
        submitBluff,
        passSuspicion,
        submitDefense,
        passDefense,
      },
    },
  }
}
