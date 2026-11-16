import { useLayoutEffect, useRef } from 'react'
import type { GameScreenProps } from '../types'
import {
  BottomArea,
  CardCornerValue,
  CardEffectIcons,
  CardEnglish,
  CardKorean,
  GameCard,
  Hand,
  Hearts,
  OwnIdentity,
  OwnName,
  PlayerHealth,
  TurnOrderItem,
  TurnOrderLabel,
  TurnOrderName,
  TurnOrderPreview,
} from '../gameStyles'
import { getCard, getCardEffectIcons } from '../gameUi'
import { CardMascot } from './CardMascot'
import { animateCardDraw, hideCardUntilDraw } from './cardAnimations'

type DrawnCard = { cardId: string; occurrence: number }
const DRAW_ANIMATION_DELAY_MS = 1000

export function BottomPlayerArea({ self, hand, selectedHandIndex, turnPreview, turnIntro, actions }: GameScreenProps) {
  const handElement = useRef<HTMLDivElement>(null)
  const previousHand = useRef<string[]>([])
  const pendingDrawCards = useRef<DrawnCard[]>([])

  useLayoutEffect(() => {
    const previousCounts = new Map<string, number>()
    previousHand.current.forEach((cardId) => previousCounts.set(cardId, (previousCounts.get(cardId) ?? 0) + 1))
    const currentCounts = new Map<string, number>()
    const drawnCards: DrawnCard[] = []
    hand.forEach((cardId, index) => {
      const occurrence = currentCounts.get(cardId) ?? 0
      if (occurrence >= (previousCounts.get(cardId) ?? 0)) drawnCards.push({ cardId, occurrence })
      currentCounts.set(cardId, occurrence + 1)
    })
    previousHand.current = [...hand]

    if (hand.length === 0) pendingDrawCards.current = []
    if (turnIntro) {
      pendingDrawCards.current.push(...drawnCards)
      drawnCards.forEach(({ cardId, occurrence }) => {
        let seen = 0
        const index = hand.findIndex((id) => id === cardId && seen++ === occurrence)
        const card = handElement.current?.querySelector<HTMLElement>(`[data-hand-index="${index}"]`)
        if (index >= 0 && card) hideCardUntilDraw(card)
      })
      return
    }

    const cardsToAnimate = [...pendingDrawCards.current, ...drawnCards]
    const deck = document.querySelector<HTMLElement>('[data-deck-source]')
    if (!deck) {
      cardsToAnimate.forEach(({ cardId, occurrence }) => {
        let seen = 0
        const index = hand.findIndex((id) => id === cardId && seen++ === occurrence)
        const card = handElement.current?.querySelector<HTMLElement>(`[data-hand-index="${index}"]`)
        if (card) {
          card.style.opacity = ''
          card.style.pointerEvents = ''
        }
      })
      pendingDrawCards.current = []
      return
    }
    pendingDrawCards.current = []
    cardsToAnimate.forEach(({ cardId, occurrence }, order) => {
      let seen = 0
      const index = hand.findIndex((id) => id === cardId && seen++ === occurrence)
      if (index < 0) return
      const card = handElement.current?.querySelector<HTMLElement>(`[data-hand-index="${index}"]`)
      if (card) animateCardDraw(card, deck, DRAW_ANIMATION_DELAY_MS + order * 110)
    })
  }, [hand, turnIntro])

  return (
    <BottomArea>
      <OwnIdentity>
        <OwnName>{self?.nickname ?? '나'}</OwnName>
        <PlayerHealth data-player-health-id={self?.id} $small>
          <span>{self?.health ?? 0}</span>
          <Hearts $small>{'♥'.repeat(Math.max(0, self?.health ?? 0))}</Hearts>
        </PlayerHealth>
      </OwnIdentity>
      <Hand ref={handElement} aria-label="내 카드 패">
        {hand.map((cardId, index) => {
          const card = getCard(cardId)
          const cardOccurrence = hand.slice(0, index).filter((id) => id === cardId).length
          return (
            <GameCard
              key={`${cardId}-${cardOccurrence}`}
              data-hand-index={index}
              type="button"
              $selected={selectedHandIndex === index}
              onClick={() => {
                actions.setSelectedHandIndex(selectedHandIndex === index ? null : index)
                actions.setSelectedDeclarationId(null)
                actions.setTargetId(null)
              }}
              aria-pressed={selectedHandIndex === index}
              draggable={false}
            >
              <CardCornerValue aria-hidden="true" $corner="top-left">{14 - card.value}</CardCornerValue>
              <CardCornerValue aria-hidden="true" $corner="bottom-right">{14 - card.value}</CardCornerValue>
              <CardMascot cardId={card.id} large />
              <CardEffectIcons aria-hidden="true">{getCardEffectIcons(card.id)}</CardEffectIcons>
              <CardKorean>{card.ko}</CardKorean>
              <CardEnglish>{card.en}</CardEnglish>
            </GameCard>
          )
        })}
      </Hand>
      <TurnOrderPreview aria-label="턴 순서">
        {turnPreview.map((player, index) => (
          <TurnOrderItem key={player.id} $current={index === 0}>
            <TurnOrderLabel>
              {index === 0 ? '현재 순서' : index === 1 ? '다음 순서' : `${index}번째 다음`}
            </TurnOrderLabel>
            <TurnOrderName $current={index === 0}>{player.nickname}</TurnOrderName>
          </TurnOrderItem>
        ))}
      </TurnOrderPreview>
    </BottomArea>
  )
}
