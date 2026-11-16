import { Client, type IMessage } from '@stomp/stompjs'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'
import type { GameState, LeaderboardEntry, PublicPlayer } from './types/game'

const CARD_INFO = [
  { id: 'assassin', ko: '암살자', en: 'Assassin', target: true },
  { id: 'warlock', ko: '흑마법사', en: 'Warlock', target: true },
  { id: 'red-dragon', ko: '불용', en: 'Red Dragon', target: false },
  { id: 'archer', ko: '궁수', en: 'Archer', target: true },
  { id: 'bomber', ko: '폭탄병', en: 'Bomber', target: false },
  { id: 'vampire-king', ko: '뱀파이어킹', en: 'Vampire King', target: false },
  { id: 'vampire', ko: '뱀파이어', en: 'Vampire', target: true },
  { id: 'alchemist', ko: '연금술사', en: 'Alchemist', target: true },
  { id: 'high-priest', ko: '고위사제', en: 'High Priest', target: false },
  { id: 'priest', ko: '사제', en: 'Priest', target: false },
  { id: 'wizard', ko: '마법사', en: 'Wizard', target: false },
  { id: 'defender', ko: '방패병', en: 'Defender', target: false },
  { id: 'clown', ko: '광대', en: 'Clown', target: false },
] as const

const Page = styled.main`
  min-height: 100vh;
  padding: 1rem clamp(1rem, 3vw, 2.5rem) 1.5rem;
  overflow: hidden;
  color: #edf5ff;
  background: radial-gradient(ellipse at 50% 38%, #203f69 0%, #122844 48%, #0b172a 100%);
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
`

const TopBar = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 3rem;
  max-width: 84rem;
  margin: 0 auto;
`

const Brand = styled.div`
  color: #a8c9f3;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
`

const MenuButton = styled.button`
  border: 1px solid #57769c;
  border-radius: 0.7rem;
  padding: 0.5rem 0.85rem;
  color: #eaf3ff;
  background: #193352;
  cursor: pointer;
  &:hover { background: #24466f; }
`

const Board = styled.section`
  display: grid;
  grid-template-rows: minmax(6rem, 0.8fr) minmax(19rem, 2.7fr) minmax(9rem, 1fr) auto;
  gap: clamp(0.8rem, 2vh, 1.35rem);
  width: min(100%, 84rem);
  min-height: calc(100vh - 5rem);
  margin: 0 auto;
`

const OpponentRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: clamp(0.6rem, 2vw, 1.5rem);
  flex-wrap: wrap;
`

const OpponentCard = styled.button<{ $active: boolean; $selected: boolean; $alive: boolean }>`
  min-width: 9rem;
  padding: 0.75rem 1rem;
  border: 1px solid ${({ $active, $selected }) => ($active || $selected ? '#80bcff' : '#385574')};
  border-radius: 0.85rem;
  color: ${({ $alive }) => ($alive ? '#eff6ff' : '#8190a2')};
  background: ${({ $active }) => ($active ? 'rgb(50 105 161 / 42%)' : 'rgb(13 31 51 / 80%)')};
  text-align: left;
  opacity: ${({ $alive }) => ($alive ? 1 : 0.5)};
  cursor: pointer;
  box-shadow: ${({ $active }) => ($active ? '0 0 1.2rem rgb(71 158 255 / 24%)' : 'none')};
`

const PlayerName = styled.div`
  overflow: hidden;
  font-size: 1rem;
  font-weight: 750;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const PlayerHealth = styled.div<{ $small?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin-top: 0.4rem;
  color: #62b5ff;
  font-size: ${({ $small }) => ($small ? '0.82rem' : '1.1rem')};
  font-weight: 800;
`

const Hearts = styled.span<{ $small?: boolean }>`
  display: inline-flex;
  gap: 0.12rem;
  color: #4ea9ff;
  font-size: ${({ $small }) => ($small ? '0.72rem' : '1rem')};
  letter-spacing: -0.08em;
`

const SmallCards = styled.div`
  margin-top: 0.25rem;
  color: #a9b9ce;
  font-size: 0.72rem;
`

const PlayField = styled.div`
  position: relative;
  display: grid;
  place-items: center;
  min-height: 19rem;
  border: 1px solid rgb(147 184 222 / 12%);
  border-radius: 1.5rem;
  background: radial-gradient(ellipse at center, rgb(46 82 122 / 38%), rgb(11 25 42 / 10%) 70%);
`

const CenterContent = styled.div<{ $hidden: boolean }>`
  display: grid;
  justify-items: center;
  gap: 1.25rem;
  visibility: ${({ $hidden }) => ($hidden ? 'hidden' : 'visible')};
  transition: opacity 220ms ease;
`

const TableState = styled.div`
  display: flex;
  align-items: center;
  gap: clamp(2rem, 7vw, 6rem);
`

const Supply = styled.div`
  display: grid;
  justify-items: center;
  gap: 0.55rem;
  color: #91a7c3;
  font-size: 0.78rem;
  text-align: center;
`

const SupplyValue = styled.div`
  color: #62b5ff;
  font-size: 2rem;
  font-weight: 850;
  line-height: 1;
`

const Deck = styled.div`
  display: grid;
  justify-items: center;
  gap: 0.45rem;
  color: #c3d6ed;
  font-size: 0.82rem;
`

const DeckCount = styled.div`
  color: #f6fbff;
  font-size: 1.25rem;
  font-weight: 800;
`

const DeckStack = styled.div`
  position: relative;
  width: 4.4rem;
  height: 5.7rem;
  border: 1px solid #b2d1f0;
  border-radius: 0.65rem;
  background: linear-gradient(145deg, #407eb8, #1a3e68);
  box-shadow: 0.25rem 0.25rem 0 #102846, 0.5rem 0.5rem 0 #081a30, 0 0.8rem 1.5rem rgb(0 0 0 / 25%);
  &::after {
    position: absolute;
    inset: 0.4rem;
    border: 1px solid rgb(222 238 255 / 48%);
    border-radius: 0.4rem;
    content: '';
  }
  &::before {
    position: absolute;
    z-index: 1;
    inset: 1.75rem 0 0;
    color: #e6f2ff;
    content: 'FB';
    font-size: 1.5rem;
    font-weight: 900;
    text-align: center;
  }
`

const Status = styled.div`
  min-height: 1.8rem;
  color: #d7e8fb;
  font-size: 1rem;
  font-weight: 650;
  text-align: center;
  &[data-error='true'] { color: #ffcf9c; }
`

const TurnGlow = keyframes`
  0% { opacity: 0; transform: scale(0.94); }
  14% { opacity: 1; transform: scale(1); }
  76% { opacity: 1; }
  100% { opacity: 0; transform: scale(1.04); }
`

const TurnOverlay = styled.div`
  position: absolute;
  z-index: 3;
  color: #d6edff;
  font-size: clamp(2rem, 6vw, 4.5rem);
  font-weight: 900;
  text-shadow: 0 0 2rem rgb(73 168 255 / 65%);
  animation: ${TurnGlow} 2s ease both;
`

const ActionChoices = styled.div`
  position: absolute;
  inset: auto 0 1rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  width: min(100% - 2rem, 58rem);
  margin: auto;
`

const Choice = styled.div`
  min-height: 4.3rem;
  padding: 0.65rem 0.8rem;
  border: 1px solid #45698e;
  border-radius: 0.9rem;
  background: rgb(7 20 35 / 82%);
  text-align: center;
`

const ChoiceTitle = styled.div`
  margin-bottom: 0.45rem;
  color: #a8c9e9;
  font-size: 0.78rem;
  font-weight: 700;
`

const Pills = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.35rem;
  flex-wrap: wrap;
`

const Pill = styled.button<{ $selected?: boolean }>`
  border: 1px solid ${({ $selected }) => ($selected ? '#8ec7ff' : '#4b6380')};
  border-radius: 999px;
  padding: 0.25rem 0.65rem;
  color: ${({ $selected }) => ($selected ? '#eff8ff' : '#c6d5e7')};
  background: ${({ $selected }) => ($selected ? '#285a8d' : '#172b43')};
  font-size: 0.75rem;
  cursor: pointer;
`

const ActionButton = styled.button`
  border: 1px solid #74b7f5;
  border-radius: 999px;
  padding: 0.35rem 0.8rem;
  color: white;
  background: #24629d;
  font-weight: 700;
  cursor: pointer;
  &:disabled { cursor: not-allowed; opacity: 0.42; }
`

const PlayerArea = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  min-height: 5.3rem;
`

const OwnIdentity = styled.div`
  display: grid;
  justify-items: start;
  gap: 0.15rem;
`

const OwnName = styled(PlayerName)`
  font-size: 1.05rem;
`

const Hand = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: clamp(0.45rem, 1.7vw, 1.1rem);
  min-height: 10rem;
  padding: 0.6rem 0.5rem 0;
`

const GameCard = styled.button<{ $selected: boolean }>`
  display: grid;
  align-content: space-between;
  width: clamp(6.3rem, 11vw, 8rem);
  height: clamp(8.3rem, 17vh, 11rem);
  padding: 0.8rem 0.45rem;
  border: 2px solid ${({ $selected }) => ($selected ? '#77c5ff' : '#a1bad3')};
  border-radius: 0.8rem;
  color: #172b42;
  background: linear-gradient(155deg, #f7f7ee, #cedbea);
  box-shadow: ${({ $selected }) => ($selected ? '0 0 1.2rem #59b4ff, 0 0 0 3px rgb(89 180 255 / 25%)' : '0 0.5rem 1rem rgb(0 0 0 / 28%)')};
  transform: ${({ $selected }) => ($selected ? 'translateY(-0.55rem)' : 'none')};
  cursor: pointer;
  transition: transform 140ms ease, box-shadow 140ms ease, border-color 140ms ease;
  &:hover { transform: translateY(-0.45rem); }
`

const CardKorean = styled.span`
  font-size: clamp(0.88rem, 1.5vw, 1.15rem);
  font-weight: 850;
  line-height: 1.25;
`

const CardEnglish = styled.span`
  color: #61768d;
  font-size: 0.66rem;
  font-weight: 650;
`

const DialogBackdrop = styled.div`
  position: fixed;
  z-index: 10;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgb(3 9 17 / 72%);
  backdrop-filter: blur(5px);
`

const Dialog = styled.section`
  width: min(100%, 34rem);
  max-height: min(85vh, 42rem);
  overflow: auto;
  padding: 1.4rem;
  border: 1px solid #54769a;
  border-radius: 1.1rem;
  background: #142943;
  box-shadow: 0 1.5rem 5rem rgb(0 0 0 / 45%);
`

const DialogHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  h2 { margin: 0; font-size: 1.3rem; }
`

const LeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.7rem 0.2rem;
  border-bottom: 1px solid rgb(183 211 241 / 12%);
  color: #dceafd;
`

const DialogActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  margin-top: 1.3rem;
`

const SecondaryButton = styled.button`
  border: 1px solid #526b89;
  border-radius: 0.7rem;
  padding: 0.55rem 0.8rem;
  color: #d8e6f7;
  background: #1b3553;
  cursor: pointer;
  &:disabled { cursor: not-allowed; opacity: 0.5; }
`

const ResultBanner = styled.div`
  position: absolute;
  top: 1rem;
  left: 50%;
  width: min(90%, 38rem);
  padding: 0.7rem 1rem;
  border: 1px solid #9ecfff;
  border-radius: 0.8rem;
  color: #f2f8ff;
  background: rgb(23 60 96 / 94%);
  text-align: center;
  transform: translateX(-50%);
`

const ErrorText = styled.div`
  margin-top: 0.6rem;
  color: #ffd0a0;
  font-size: 0.85rem;
  text-align: center;
`

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

function getCard(id: string) {
  return CARD_INFO.find((card) => card.id === id) ?? { id, ko: id, en: id, target: false }
}

function GamePage() {
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
  const [turnIntro, setTurnIntro] = useState(false)
  const [startPending, setStartPending] = useState(false)
  const errorTimerRef = useRef<number | undefined>(undefined)
  const previousTurnRef = useRef<string | null>(null)
  const clientRef = useRef<Client | null>(null)
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

          if (payload.state && typeof payload.state === 'object') {
            const publicState = payload.state as Partial<GameState>
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
                    supplyHealth: payload.supplyHealth as number,
                    turn: payload.turn as GameState['turn'],
                    cardDeckCount: payload.deckCount as number,
                    matchResult: (payload.matchResult as GameState['matchResult']) ?? null,
                    pendingAction: (payload.pendingAction as GameState['pendingAction']) ?? null,
                  }
                : undefined,
            )
          }

          if (typeof payload.truthful === 'boolean' && typeof payload.actualCardId === 'string') {
            const cardName = getCard(payload.actualCardId).ko
            showError(`${cardName} 선언은 ${payload.truthful ? '진실' : '거짓'}입니다.`)
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
    if (currentTurnId && currentTurnId === viewerId && previousTurnRef.current && previousTurnRef.current !== currentTurnId) {
      setTurnIntro(true)
    }
    previousTurnRef.current = currentTurnId
  }, [currentTurnId, viewerId])

  useEffect(() => () => window.clearTimeout(errorTimerRef.current), [])

  const leaderboardQuery = useQuery({
    queryKey: ['leaderboard'],
    queryFn: fetchLeaderboard,
    enabled: modalOpen,
    staleTime: 10_000,
  })

  const self = game?.players.find((player) => player.id === game.viewerId)
  const opponents = game?.players.filter((player) => player.id !== game.viewerId) ?? []
  const isMyTurn = Boolean(game?.status === 'IN_GAME' && game.turn.activePlayerId === game.viewerId)
  const selectedCard = selectedHandIndex === null ? null : getCard(hand[selectedHandIndex] ?? '')
  const selectedDeclaration = selectedDeclarationId ? getCard(selectedDeclarationId) : null
  const needsTarget = Boolean(selectedDeclaration?.target)
  const eligibleDeclarations = CARD_INFO.filter((card) => !['wizard', 'defender', 'clown'].includes(card.id))
  const statusText = errorMessage
    ? errorMessage
    : game?.status !== 'IN_GAME'
      ? game?.matchResult?.message ?? '호스트가 게임을 시작하기를 기다리는 중입니다.'
      : game.turn.phase === 'DEFENSE'
        ? '공격 대상들이 방어를 선택하는 중입니다.'
        : game.turn.phase === 'SUSPICION'
          ? '의심을 진행 중입니다.'
          : isMyTurn
            ? '나의 턴입니다'
            : `${game.players.find((player) => player.id === game.turn.activePlayerId)?.nickname ?? '상대'} 님이 턴 진행 중...`

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

  const startGame = () => {
    if (!game || self?.role !== 'HOST' || game.players.length < 2) return
    setStartPending(true)
    const client = new Client({
      brokerURL: `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws`,
      reconnectDelay: 0,
      onConnect: () => {
        client.publish({ destination: '/app/game/start', body: '{}' })
        window.setTimeout(() => void client.deactivate(), 300)
        window.setTimeout(() => setStartPending(false), 1800)
      },
      onStompError: (frame) => {
        showError(frame.headers.message || '게임을 시작하지 못했습니다.')
        setStartPending(false)
      },
    })
    client.activate()
  }

  const submitBluff = () => {
    if (!selectedCard || !selectedDeclaration || selectedHandIndex === null) return
    if (selectedDeclaration.target && !targetId) {
      showError('대상을 선택해 주세요.')
      return
    }
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
  const hasPassedSuspicion = Boolean(pending?.suspicionPasses.includes(game?.viewerId ?? ''))

  if (gameQuery.isLoading) {
    return <Page><TopBar><Brand>Faker Blue</Brand></TopBar><Status>게임 상태를 불러오는 중...</Status></Page>
  }
  if (gameQuery.isError || !game) {
    return <Page><TopBar><Brand>Faker Blue</Brand></TopBar><Status data-error="true">{gameQuery.error?.message ?? '게임 상태를 불러오지 못했습니다.'}</Status></Page>
  }

  return (
    <Page onContextMenu={(event) => event.preventDefault()} onDragStart={(event) => event.preventDefault()}>
      <TopBar>
        <Brand>Faker Blue</Brand>
        <MenuButton type="button" onClick={() => setModalOpen(true)}>메뉴 · ESC</MenuButton>
      </TopBar>

      <Board>
        <OpponentRow aria-label="상대 플레이어">
          {opponents.map((player) => (
            <OpponentCard
              key={player.id}
              type="button"
              $active={game.turn.activePlayerId === player.id}
              $selected={targetId === player.id || redirectTargetId === player.id}
              $alive={player.alive}
              disabled={Boolean(
                mustDefend && selectedDefenseType === 'wizard' &&
                (!player.alive || pending?.targetIds.includes(player.id)),
              )}
              onClick={() => {
                if (mustDefend && selectedDefenseType === 'wizard' && player.alive
                  && !pending?.targetIds.includes(player.id)) setRedirectTargetId(player.id)
                else if (isMyTurn && needsTarget) setTargetId(player.id)
              }}
              aria-pressed={targetId === player.id || redirectTargetId === player.id}
            >
              <PlayerName>{player.nickname}</PlayerName>
              <PlayerHealth $small>
                <span>{player.health}</span>
                <Hearts $small>{'♥'.repeat(Math.max(0, player.health))}</Hearts>
              </PlayerHealth>
              <SmallCards>남은 카드 {player.cardCount}장</SmallCards>
            </OpponentCard>
          ))}
        </OpponentRow>

        <PlayField>
          {game.matchResult && game.status === 'LOBBY' && <ResultBanner>{game.matchResult.message}</ResultBanner>}
          <CenterContent $hidden={turnIntro}>
            <TableState>
              <Supply>
                <span>남은 체력 토큰</span>
                <SupplyValue>{game.supplyHealth}</SupplyValue>
              </Supply>
              <Deck>
                <DeckCount>{game.cardDeckCount}</DeckCount>
                <DeckStack aria-label="기본 카드 더미" />
                <span>기본 카드 더미</span>
              </Deck>
            </TableState>
            <Status data-error={Boolean(errorMessage)}>{statusText}</Status>
            {game.status === 'LOBBY' && self?.role === 'HOST' && (
              <ActionButton type="button" onClick={startGame} disabled={startPending || game.players.length < 2}>
                {startPending ? '시작 요청 중...' : '게임 시작'}
              </ActionButton>
            )}
            {game.status === 'IN_GAME' && isMyTurn && game.turn.phase === 'RESOLVED' && (
              <ActionButton type="button" onClick={submitTurnEnd}>턴 종료</ActionButton>
            )}
          </CenterContent>
          {turnIntro && <TurnOverlay onAnimationEnd={() => setTurnIntro(false)}>나의 턴</TurnOverlay>}

          {canAct && selectedCard && (
            <ActionChoices>
              <Choice>
                <ChoiceTitle>블러핑하지 않기</ChoiceTitle>
                <ActionButton
                  type="button"
                  onClick={() => setSelectedDeclarationId(selectedCard.id)}
                  disabled={!eligibleDeclarations.some((card) => card.id === selectedCard.id)}
                >
                  {selectedCard.ko}로 선언
                </ActionButton>
              </Choice>
              <Choice>
                <ChoiceTitle>블러핑하기 · 선언 카드 선택</ChoiceTitle>
                <Pills>
                  {eligibleDeclarations.filter((card) => card.id !== selectedCard.id).map((card) => (
                    <Pill
                      key={card.id}
                      type="button"
                      $selected={selectedDeclarationId === card.id}
                      onClick={() => { setSelectedDeclarationId(card.id); setTargetId(null) }}
                    >
                      {card.ko}
                    </Pill>
                  ))}
                </Pills>
              </Choice>
              {selectedDeclaration && (
                <Choice style={{ gridColumn: '1 / -1' }}>
                  <ChoiceTitle>
                    {selectedDeclaration.ko} · {selectedDeclaration.en}
                    {needsTarget ? ' — 대상 플레이어를 선택해 주세요.' : ''}
                  </ChoiceTitle>
                  {needsTarget && (
                    <Pills>
                      {opponents.filter((player) => player.alive).map((player) => (
                        <Pill key={player.id} type="button" $selected={targetId === player.id}
                          onClick={() => setTargetId(player.id)}>{player.nickname}</Pill>
                      ))}
                    </Pills>
                  )}
                  <ActionButton type="button" onClick={submitBluff} disabled={needsTarget && !targetId}>
                    카드 제출
                  </ActionButton>
                </Choice>
              )}
            </ActionChoices>
          )}

          {pending && game.turn.phase === 'DEFENSE' && !mustDefend && (
            <ActionChoices>
              <Choice>
                <ChoiceTitle>공격 대상의 방어 선택을 기다리는 중</ChoiceTitle>
                <Pills>
                  {pending.defenses.map((defense) => (
                    <Pill key={defense.index} type="button" disabled>
                      {getPlayerName(game.players, defense.playerId)}: {getCard(defense.declaredCardId).ko}
                    </Pill>
                  ))}
                  {pending.defensePasses.map((playerId) => (
                    <Pill key={playerId} type="button" disabled>
                      {getPlayerName(game.players, playerId)}: 방어 안 함
                    </Pill>
                  ))}
                  {pending.targetIds.filter((playerId) => !pending.defensePasses.includes(playerId)).map((playerId) => (
                    <Pill key={playerId} type="button" disabled>
                      {getPlayerName(game.players, playerId)}: 선택 대기
                    </Pill>
                  ))}
                </Pills>
              </Choice>
            </ActionChoices>
          )}

          {pending && game.turn.phase === 'SUSPICION' && self?.alive && (
            <ActionChoices>
              <Choice>
                <ChoiceTitle>
                  {getPlayerName(game.players, pending.actorId)}의 {getCard(pending.declaredCardId).ko} 선언
                </ChoiceTitle>
                {pending.attackerTruthful === null ? (
                  game.viewerId !== pending.actorId && (
                    <ActionButton
                      type="button"
                      onClick={() => publish('/app/game/bluff/challenge', { challengedPlayerId: pending.actorId })}
                    >
                      공격 선언 의심하기
                    </ActionButton>
                  )
                ) : (
                  <ChoiceTitle>
                    {pending.attackerTruthful ? '진실' : '거짓'} · 실제 카드: {getCard(pending.attackerActualCardId ?? '').ko}
                  </ChoiceTitle>
                )}
              </Choice>
              {pending.defenses.map((defense) => (
                <Choice key={defense.index}>
                  <ChoiceTitle>
                    {getPlayerName(game.players, defense.playerId)}의 {getCard(defense.declaredCardId).ko} 방어
                  </ChoiceTitle>
                  {defense.truthful === null ? (
                    game.viewerId !== defense.playerId && (
                      <ActionButton
                        type="button"
                        onClick={() => publish('/app/game/bluff/challenge', {
                          challengedPlayerId: defense.playerId,
                          defenseIndex: defense.index,
                        })}
                      >
                        방어 의심하기
                      </ActionButton>
                    )
                  ) : (
                    <ChoiceTitle>
                      {defense.truthful ? '진실' : '거짓'} · 실제 카드: {getCard(defense.actualCardId ?? '').ko}
                    </ChoiceTitle>
                  )}
                </Choice>
              ))}
              <Choice>
                <ChoiceTitle>
                  의심을 끝내려면 생존 플레이어 모두가 패스해야 합니다. ({pending.suspicionPasses.length}/{game.players.filter((player) => player.alive).length})
                </ChoiceTitle>
                <ActionButton type="button" onClick={passSuspicion} disabled={hasPassedSuspicion}>
                  {hasPassedSuspicion ? '패스 완료 · 다른 플레이어 대기 중' : '더 의심하지 않기'}
                </ActionButton>
              </Choice>
            </ActionChoices>
          )}

          {mustDefend && (
            <ActionChoices>
              <Choice>
                <ChoiceTitle>방어 카드로 선언</ChoiceTitle>
                {hand.length > 0 && (
                  <Pills>
                    <Pill type="button" $selected={selectedDefenseType === 'defender'} onClick={() => setSelectedDefenseType('defender')}>방패병</Pill>
                    <Pill type="button" $selected={selectedDefenseType === 'wizard'} onClick={() => setSelectedDefenseType('wizard')}>마법사</Pill>
                  </Pills>
                )}
                {selectedDefenseType === 'wizard' && <ChoiceTitle>상대 플레이어를 눌러 반사 대상을 선택하세요.</ChoiceTitle>}
                <ActionButton type="button" onClick={submitDefense} disabled={!selectedDefenseType || selectedHandIndex === null || (selectedDefenseType === 'wizard' && !redirectTargetId)}>
                  선택한 카드로 방어
                </ActionButton>
                <SecondaryButton type="button" onClick={passDefense}>
                  방어하지 않기
                </SecondaryButton>
              </Choice>
            </ActionChoices>
          )}
        </PlayField>

        <PlayerArea>
          <OwnIdentity>
            <OwnName>{self?.nickname ?? '나'}</OwnName>
            <PlayerHealth>
              <span>{self?.health ?? 0}</span>
              <Hearts>{'♥'.repeat(Math.max(0, self?.health ?? 0))}</Hearts>
            </PlayerHealth>
          </OwnIdentity>
        </PlayerArea>

        <Hand aria-label="내 카드 패">
          {hand.map((cardId, index) => {
            const card = getCard(cardId)
            const cardOccurrence = hand.slice(0, index).filter((id) => id === cardId).length
            return (
              <GameCard key={`${cardId}-${cardOccurrence}`} type="button" $selected={selectedHandIndex === index}
                onClick={() => setSelectedHandIndex(selectedHandIndex === index ? null : index)}
                aria-pressed={selectedHandIndex === index} draggable={false}>
                <CardKorean>{card.ko}</CardKorean>
                <CardEnglish>{card.en}</CardEnglish>
              </GameCard>
            )
          })}
        </Hand>
      </Board>

      {modalOpen && (
        <DialogBackdrop onMouseDown={(event) => { if (event.target === event.currentTarget) setModalOpen(false) }}>
          <Dialog role="dialog" aria-modal="true" aria-labelledby="menu-title">
            <DialogHeader>
              <h2 id="menu-title">게임 메뉴</h2>
              <MenuButton type="button" onClick={() => setModalOpen(false)}>닫기</MenuButton>
            </DialogHeader>
            <ChoiceTitle>접속 플레이어 승리 횟수</ChoiceTitle>
            {leaderboardQuery.isLoading ? <Status>리더보드를 불러오는 중...</Status> : null}
            {leaderboardQuery.isError ? <ErrorText>{leaderboardQuery.error.message}</ErrorText> : null}
            {modalLeaderboard.map((entry, index) => (
              <LeaderRow key={entry.id}>
                <span>{index + 1}. {entry.nickname}</span>
                <strong>{entry.wins}승</strong>
              </LeaderRow>
            ))}
            <DialogActions>
              <SecondaryButton type="button" disabled title="추후 연결 예정">게임 재시작</SecondaryButton>
              <SecondaryButton type="button" disabled title="추후 연결 예정">게임 종료</SecondaryButton>
            </DialogActions>
          </Dialog>
        </DialogBackdrop>
      )}
    </Page>
  )
}

function getPlayerName(players: PublicPlayer[], playerId: string) {
  return players.find((player) => player.id === playerId)?.nickname ?? '플레이어'
}

export default GamePage
