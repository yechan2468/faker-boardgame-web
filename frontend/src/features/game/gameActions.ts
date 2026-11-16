import { Client, type IMessage } from '@stomp/stompjs'
import type { QueryClient } from '@tanstack/react-query'
import type { Dispatch, SetStateAction } from 'react'
import type { GameState, PublicPlayer } from '../../types/game'
import { animatePlayedCard } from './components/animations/cardAnimations'
import type { CardInfo } from './gameUi'

type GameActionsOptions = {
  game: GameState | undefined
  self: PublicPlayer | undefined
  clientRef: { current: Client | null }
  queryClient: QueryClient
  showError: (message: string) => void
  selectedHandIndex: number | null
  selectedCard: CardInfo | null
  selectedDeclaration: CardInfo | null
  targetId: string | null
  selectedDefenseType: 'defender' | 'wizard' | null
  redirectTargetId: string | null
  hostActionPending: boolean
  setModalOpen: Dispatch<SetStateAction<boolean>>
  setHostActionPending: Dispatch<SetStateAction<boolean>>
  setSelectedHandIndex: Dispatch<SetStateAction<number | null>>
  setSelectedDeclarationId: Dispatch<SetStateAction<string | null>>
  setTargetId: Dispatch<SetStateAction<string | null>>
  setSelectedDefenseType: Dispatch<SetStateAction<'defender' | 'wizard' | null>>
  setRedirectTargetId: Dispatch<SetStateAction<string | null>>
  messages: {
    disconnected: string
    targetRequired: string
    redirectTargetRequired: string
    restartRequiresPlayers: string
    startFailed: string
    restartFailed: string
    endFailed: string
  }
}

export function createGameActions({
  game,
  self,
  clientRef,
  queryClient,
  showError,
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
  setTargetId,
  setSelectedDefenseType,
  setRedirectTargetId,
  messages,
}: GameActionsOptions) {
  const publish = (destination: string, body: unknown) => {
    if (!clientRef.current?.connected) {
      showError(messages.disconnected)
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

  const startGame = () => sendHostAction('/app/game/start', messages.startFailed)
  const restartGame = () => {
    if (!game) return
    if (game.players.length < 2) {
      showError(messages.restartRequiresPlayers)
      return
    }
    setModalOpen(false)
    sendHostAction('/app/game/restart', messages.restartFailed)
  }
  const endGame = () => {
    setModalOpen(false)
    sendHostAction('/app/game/end', messages.endFailed)
  }

  const submitBluff = () => {
    if (!selectedCard || !selectedDeclaration || selectedHandIndex === null) return
    if (selectedDeclaration.target && !targetId) {
      showError(messages.targetRequired)
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
      showError(messages.redirectTargetRequired)
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

  return {
    publish,
    startGame,
    restartGame,
    endGame,
    submitTurnEnd,
    submitBluff,
    passSuspicion,
    submitDefense,
    passDefense,
  }
}
