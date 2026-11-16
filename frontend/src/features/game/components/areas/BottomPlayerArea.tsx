import { useEffect, useLayoutEffect, useRef } from 'react'
import type { GameScreenProps } from '../../types'
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
} from '../../gameStyles'
import { getCard, getCardEffectIcons } from '../../gameUi'
import { CardMascot } from '../cards/CardMascot'
import { animateCardDraw, hideCardUntilDraw } from '../animations/cardAnimations'
import { useGameAudio } from '../../audio/GameAudioProvider'

type DrawnCard = { cardId: string; occurrence: number }
type CardPointer = {
  pointerId: number
  startX: number
  startY: number
  startLeft: number
  startTop: number
  moved: boolean
}
const DRAW_ANIMATION_DELAY_MS = 1000

export function BottomPlayerArea({ game, self, hand, selectedHandIndex, turnPreview, turnIntro, actions }: GameScreenProps) {
  const { playSound } = useGameAudio()
  const handElement = useRef<HTMLDivElement>(null)
  const previousHand = useRef<string[]>([])
  const pendingDrawCards = useRef<DrawnCard[]>([])
  const cardPointer = useRef<CardPointer | null>(null)
  const dragPreview = useRef<HTMLElement | null>(null)
  const dragSource = useRef<HTMLElement | null>(null)
  const suppressClick = useRef(false)

  const resetCardActions = () => {
    actions.setSelectedDeclarationId(null)
    actions.setTargetId(null)
  }

  const selectDraggedCard = (index: number) => {
    if (selectedHandIndex !== index) playSound('selectCard')
    actions.setSelectedHandIndex(index)
    resetCardActions()
  }

  const clearDragPreview = () => {
    dragPreview.current?.remove()
    dragPreview.current = null
    if (dragSource.current) {
      dragSource.current.style.opacity = ''
      dragSource.current.style.pointerEvents = ''
    }
    dragSource.current = null
  }

  const animateDragPreviewReturn = () => {
    const preview = dragPreview.current
    const source = dragSource.current
    if (!preview || !source || window.matchMedia('(prefers-reduced-motion: reduce)').matches
      || typeof preview.animate !== 'function') {
      clearDragPreview()
      return
    }

    source.style.pointerEvents = 'none'
    window.requestAnimationFrame(() => {
      if (dragPreview.current !== preview || !source.isConnected) {
        clearDragPreview()
        return
      }
      const sourceRect = source.getBoundingClientRect()
      const animation = preview.animate(
        [
          {
            left: preview.style.left,
            top: preview.style.top,
            width: preview.style.width,
            height: preview.style.height,
            transform: preview.style.transform,
            filter: preview.style.filter,
            opacity: 1,
          },
          {
            left: `${sourceRect.left}px`,
            top: `${sourceRect.top}px`,
            width: `${sourceRect.width}px`,
            height: `${sourceRect.height}px`,
            transform: 'perspective(780px) translateY(0px) rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(1)',
            filter: 'none',
            opacity: 1,
          },
        ],
        { duration: 800, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'forwards' },
      )
      animation.onfinish = clearDragPreview
      animation.oncancel = clearDragPreview
    })
  }

  useEffect(() => () => {
    dragPreview.current?.remove()
    if (dragSource.current) {
      dragSource.current.style.opacity = ''
      dragSource.current.style.pointerEvents = ''
    }
  }, [])

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

  return (
    <BottomArea
      data-card-dropzone="hand"
      onClick={(event) => {
        if (!(event.target instanceof Element)) return
        if (event.target.closest('[data-hand-index], [data-card-selection-ignore]')) return
        if (selectedHandIndex === null) return
        playSound('deselectCard')
        actions.setSelectedHandIndex(null)
        resetCardActions()
      }}
    >
      <OwnIdentity data-card-selection-ignore="true">
        <OwnName>{self?.nickname ?? '나'}</OwnName>
        <PlayerHealth data-player-health-id={self?.id} $small>
          <span>{self?.health ?? 0}</span>
          <Hearts $small>{'♥'.repeat(Math.max(0, self?.health ?? 0))}</Hearts>
        </PlayerHealth>
      </OwnIdentity>
      <Hand
        ref={handElement}
        aria-label="내 카드 패"
      >
        {hand.map((cardId, index) => {
          const card = getCard(cardId)
          const cardOccurrence = hand.slice(0, index).filter((id) => id === cardId).length
          return (
            <GameCard
              key={`${cardId}-${cardOccurrence}`}
              data-hand-index={index}
              data-card-effect-id={card.id}
              type="button"
              $selected={selectedHandIndex === index}
              onPointerDown={(event) => {
                if (event.button !== 0) return
                const rect = event.currentTarget.getBoundingClientRect()
                cardPointer.current = {
                  pointerId: event.pointerId,
                  startX: event.clientX,
                  startY: event.clientY,
                  startLeft: rect.left,
                  startTop: rect.top,
                  moved: false,
                }
                event.currentTarget.setPointerCapture(event.pointerId)
              }}
              onPointerMove={(event) => {
                const activePointer = cardPointer.current
                if (!activePointer || activePointer.pointerId !== event.pointerId) return
                if (Math.hypot(event.clientX - activePointer.startX, event.clientY - activePointer.startY) > 6) {
                  activePointer.moved = true
                }
                if (!activePointer.moved) return

                if (!dragPreview.current) {
                  const source = event.currentTarget
                  const rect = source.getBoundingClientRect()
                  const preview = source.cloneNode(true) as HTMLElement
                  preview.removeAttribute('data-hand-index')
                  preview.setAttribute('aria-hidden', 'true')
                  preview.tabIndex = -1
                  Object.assign(preview.style, {
                    position: 'fixed',
                    left: `${rect.left}px`,
                    top: `${rect.top}px`,
                    width: `${rect.width}px`,
                    height: `${rect.height}px`,
                    margin: '0',
                    zIndex: '10020',
                    pointerEvents: 'none',
                    transformOrigin: 'center center',
                    animation: 'none',
                    transition: 'filter 120ms ease-out',
                    filter: 'brightness(0.88) drop-shadow(0 30px 36px rgb(0 0 0 / 82%)) drop-shadow(0 46px 32px rgb(0 0 0 / 58%))',
                  })
                  preview.style.setProperty('--card-gloss-opacity', '38%')
                  preview.style.setProperty('--card-gloss-fade-opacity', '14%')
                  document.body.append(preview)
                  dragPreview.current = preview
                  dragSource.current = source
                  source.style.opacity = '0'
                }

                const preview = dragPreview.current
                if (preview) {
                  const deltaX = event.clientX - activePointer.startX
                  const deltaY = event.clientY - activePointer.startY
                  const cardCenterX = activePointer.startLeft + deltaX + preview.offsetWidth / 2
                  const horizontalPosition = Math.max(-1, Math.min(1,
                    (cardCenterX - window.innerWidth / 2) / (window.innerWidth / 2),
                  ))
                  const handRect = handElement.current?.getBoundingClientRect()
                  const handCenterX = handRect ? handRect.left + handRect.width / 2 : window.innerWidth / 2
                  const handCenterY = handRect ? handRect.top + handRect.height / 2 : window.innerHeight
                  const cardCenterY = activePointer.startTop + deltaY + preview.offsetHeight / 2
                  const distanceFromHandCenter = Math.hypot(cardCenterX - handCenterX, cardCenterY - handCenterY)
                  const distanceRatio = Math.min(1, distanceFromHandCenter / Math.hypot(window.innerWidth, window.innerHeight))
                  const scale = Math.min(1.7, 1.08 + Math.pow(distanceRatio, 0.8) * 0.62)
                  const verticalPosition = Math.max(-1, Math.min(1,
                    (cardCenterY - handCenterY) / (window.innerHeight / 2),
                  ))
                  const tiltX = verticalPosition * 18
                  const tiltY = -horizontalPosition * 24
                  const tiltZ = -horizontalPosition * 18
                  const innerShadowStrength = Math.min(1, Math.hypot(tiltX / 18, tiltY / 24))
                  const cardLeft = activePointer.startLeft + deltaX
                  const cardTop = activePointer.startTop + deltaY
                  const glossX = Math.max(8, Math.min(92, ((event.clientX - cardLeft) / preview.offsetWidth) * 100))
                  const glossY = Math.max(8, Math.min(92, ((event.clientY - cardTop) / preview.offsetHeight) * 100))
                  const shadowX = -horizontalPosition * 16
                  const shadowY = 16 + Math.abs(verticalPosition) * 12
                  preview.style.setProperty('--card-gloss-position', `${glossX}% ${glossY}%`)
                  preview.style.setProperty('--card-inner-shadow-x', `${-horizontalPosition * 22}px`)
                  preview.style.setProperty('--card-inner-shadow-y', `${12 - verticalPosition * 16}px`)
                  preview.style.setProperty('--card-inner-shadow-blur', `${28 + innerShadowStrength * 44}px`)
                  preview.style.setProperty('--card-inner-shadow-spread', `${-1 + innerShadowStrength * 9}px`)
                  preview.style.setProperty('--card-inner-shadow-opacity', `${0.28 + innerShadowStrength * 0.52}`)
                  preview.style.filter = `brightness(0.88) drop-shadow(${shadowX}px ${shadowY + 10}px 36px rgb(0 0 0 / 82%)) drop-shadow(0 28px 32px rgb(0 0 0 / 58%))`
                  preview.style.left = `${cardLeft}px`
                  preview.style.top = `${cardTop}px`
                  preview.style.transform = `perspective(780px) translateY(3px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) rotateZ(${tiltZ}deg) scale(${scale})`
                }
              }}
              onPointerUp={(event) => {
                const activePointer = cardPointer.current
                if (!activePointer || activePointer.pointerId !== event.pointerId) return
                cardPointer.current = null
                if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                  event.currentTarget.releasePointerCapture(event.pointerId)
                }
                if (activePointer.moved) {
                  const centerDropZone = document.querySelector<HTMLElement>('[data-card-dropzone="center"]')
                  const centerRect = centerDropZone?.getBoundingClientRect()
                  const droppedInCenter = Boolean(centerRect
                    && event.clientX >= centerRect.left
                    && event.clientX <= centerRect.right
                    && event.clientY >= centerRect.top
                    && event.clientY <= centerRect.bottom)
                  const handDropZone = document.querySelector<HTMLElement>('[data-card-dropzone="hand"]')
                  const handRect = handDropZone?.getBoundingClientRect()
                  const droppedInHand = Boolean(handRect
                    && event.clientX >= handRect.left
                    && event.clientX <= handRect.right
                    && event.clientY >= handRect.top
                    && event.clientY <= handRect.bottom)
                  if (droppedInCenter) {
                    selectDraggedCard(index)
                  } else if (droppedInHand && selectedHandIndex === index) {
                    playSound('deselectCard')
                    actions.setSelectedHandIndex(null)
                    resetCardActions()
                  }
                  if (droppedInCenter) clearDragPreview()
                  else animateDragPreviewReturn()
                  suppressClick.current = true
                  window.setTimeout(() => { suppressClick.current = false }, 0)
                }
              }}
              onPointerCancel={() => {
                cardPointer.current = null
                clearDragPreview()
              }}
              onClick={() => {
                if (suppressClick.current) {
                  suppressClick.current = false
                  return
                }
                if (selectedHandIndex === index) {
                  playSound('deselectCard')
                  actions.setSelectedHandIndex(null)
                } else {
                  playSound('selectCard')
                  actions.setSelectedHandIndex(index)
                }
                resetCardActions()
              }}
              aria-pressed={selectedHandIndex === index}
              draggable={false}
            >
              <CardCornerValue aria-hidden="true" $corner="top-left" $value={14 - card.value}>{14 - card.value}</CardCornerValue>
              <CardCornerValue aria-hidden="true" $corner="bottom-right" $value={14 - card.value}>{14 - card.value}</CardCornerValue>
              <CardMascot cardId={card.id} large />
              <CardEffectIcons aria-hidden="true">{getCardEffectIcons(card.id)}</CardEffectIcons>
              <CardKorean>{card.ko}</CardKorean>
              <CardEnglish>{card.en}</CardEnglish>
            </GameCard>
          )
        })}
      </Hand>
      <TurnOrderPreview aria-label="턴 순서" data-card-selection-ignore="true">
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
