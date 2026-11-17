import { useLayoutEffect, useRef, useState } from 'react'
import type { GameScreenProps } from '../../../types'
import type { GameEffect } from '../../../audio/GameAudioProvider'
import { animateCardDraw, hideCardUntilDraw } from '../../../utils/animations/cardAnimations'

type HandLayoutOptions = Pick<GameScreenProps, 'game' | 'hand' | 'turnIntro'> & { playSound: (effect: GameEffect) => void }
type DrawnCard = { cardId: string; occurrence: number }
const DRAW_ANIMATION_DELAY_MS = 1000

export function useHandOrderAndDraw({ game, hand, turnIntro, playSound }: HandLayoutOptions) {
  const handElement = useRef<HTMLDivElement>(null)
  const [handOrder, setHandOrder] = useState(() => hand.map((_, index) => index))
  const handSignature = hand.join('\u0000')
  const previousHandSignature = useRef(handSignature)
  const pendingHandPositions = useRef<Map<number, { left: number; top: number }> | null>(null)
  const previousHand = useRef<string[]>([])
  const pendingDrawCards = useRef<DrawnCard[]>([])


  useLayoutEffect(() => {
    if (previousHandSignature.current === handSignature) return
    previousHandSignature.current = handSignature
    pendingHandPositions.current = null
    setHandOrder(hand.map((_, index) => index))
  }, [hand, handSignature])

  useLayoutEffect(() => {
    const previousPositions = pendingHandPositions.current
    if (!previousPositions) return
    pendingHandPositions.current = null
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    handOrder.forEach((index) => {
      const card = handElement.current?.querySelector<HTMLElement>(`[data-hand-index="${index}"]`)
      const previousPosition = previousPositions.get(index)
      if (!card || !previousPosition || typeof card.animate !== 'function') return
      const rect = card.getBoundingClientRect()
      const deltaX = previousPosition.left - rect.left
      const deltaY = previousPosition.top - rect.top
      if (Math.abs(deltaX) < 1 && Math.abs(deltaY) < 1) return
      card.animate(
        [
          { translate: `${deltaX}px ${deltaY}px` },
          { translate: '0px 0px' },
        ],
        { duration: 360, easing: 'cubic-bezier(0.2, 0.75, 0.25, 1)' },
      )
    })
  }, [handOrder])

  const reorderHandFrom = (index: number) => {
    const positions = new Map<number, { left: number; top: number }>()
    handElement.current?.querySelectorAll<HTMLElement>('[data-hand-index]').forEach((card) => {
      const rect = card.getBoundingClientRect()
      positions.set(Number(card.dataset.handIndex), { left: rect.left, top: rect.top })
    })
    pendingHandPositions.current = positions
    setHandOrder((currentOrder) => {
      if (currentOrder.length !== 2) return currentOrder
      const sourcePosition = currentOrder.indexOf(index)
      if (sourcePosition < 0) return currentOrder
      const nextOrder = [...currentOrder]
      const targetPosition = sourcePosition === 0 ? 1 : 0
      ;[nextOrder[sourcePosition], nextOrder[targetPosition]] = [nextOrder[targetPosition], nextOrder[sourcePosition]]
      return nextOrder
    })
  }

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
    if (game.turn.phase === 'START') cardsToAnimate.forEach(() => playSound('drawCard'))
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
  }, [game.turn.phase, hand, playSound, turnIntro])

  const displayHandOrder = handOrder.length === hand.length
    ? handOrder
    : hand.map((_, index) => index)

  return { handElement, displayHandOrder, reorderHandFrom }
}
