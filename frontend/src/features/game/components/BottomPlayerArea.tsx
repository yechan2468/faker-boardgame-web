import { useLayoutEffect, useRef } from 'react'
import type { GameScreenProps } from '../types'
import {
  BottomArea,
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
import { getCard } from '../gameUi'
import { CardMascot } from './CardMascot'
import { animateCardDraw } from './cardAnimations'

export function BottomPlayerArea({ self, hand, selectedHandIndex, turnPreview, actions }: GameScreenProps) {
  const handElement = useRef<HTMLDivElement>(null)
  const previousHand = useRef<string[]>([])

  useLayoutEffect(() => {
    const previousCounts = new Map<string, number>()
    previousHand.current.forEach((cardId) => previousCounts.set(cardId, (previousCounts.get(cardId) ?? 0) + 1))
    const currentCounts = new Map<string, number>()
    const drawnIndexes: number[] = []
    hand.forEach((cardId, index) => {
      const occurrence = currentCounts.get(cardId) ?? 0
      if (occurrence >= (previousCounts.get(cardId) ?? 0)) drawnIndexes.push(index)
      currentCounts.set(cardId, occurrence + 1)
    })
    previousHand.current = [...hand]

    const deck = document.querySelector<HTMLElement>('[data-deck-source]')
    if (!deck) return
    drawnIndexes.forEach((index, order) => {
      const card = handElement.current?.querySelector<HTMLElement>(`[data-hand-index="${index}"]`)
      if (card) animateCardDraw(card, deck, order * 110)
    })
  }, [hand])

  return (
    <BottomArea>
      <OwnIdentity>
        <OwnName>{self?.nickname ?? '나'}</OwnName>
        <PlayerHealth $small>
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
              onClick={() => actions.setSelectedHandIndex(selectedHandIndex === index ? null : index)}
              aria-pressed={selectedHandIndex === index}
              draggable={false}
            >
              <CardMascot cardId={card.id} large />
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
