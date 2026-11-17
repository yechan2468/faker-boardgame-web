import { Client } from '@stomp/stompjs'
import { useEffect, useRef } from 'react'
import { useGameAudio } from '../audio/GameAudioProvider'
import { handleGameTopicMessage, type GameConnectionEventHandlers } from './gameTopicEvents'

type GameConnectionOptions = Omit<GameConnectionEventHandlers, 'playSound'> & {
  gameStatus: string | undefined
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
  const { playSound } = useGameAudio()

  useEffect(() => {
    if (!gameStatus) return
    const eventHandlers: GameConnectionEventHandlers = {
      queryClient,
      showError,
      setHand,
      setTurnIntro,
      setDeclarationNotice,
      setAttackResolutionNotice,
      setDefenseResolutionNotice,
      setDefenseOutcomeNotice,
      setAlchemistResolutionNotice,
      playSound,
    }
    const client = new Client({
      brokerURL: `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws`,
      reconnectDelay: 2500,
      onConnect: () => {
        client.subscribe('/topic/game', (message) => handleGameTopicMessage(message, eventHandlers))
        client.subscribe('/user/queue/private', (message) => {
          const payload = JSON.parse(message.body) as { cards?: string[] }
          if (Array.isArray(payload.cards)) setHand(payload.cards)
        })
        client.subscribe('/user/queue/errors', (message) => {
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
  }, [gameStatus, playSound, queryClient, showError])

  return clientRef
}
