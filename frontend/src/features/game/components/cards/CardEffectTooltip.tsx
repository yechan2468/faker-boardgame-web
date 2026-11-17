import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import styled, { keyframes } from 'styled-components'
import { getCard, getCardLongEffect } from '../../utils/cardCatalog'

const tooltipFadeIn = keyframes`
  from { opacity: 0; transform: translateY(0.25rem) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`

const TooltipBox = styled.div`
  position: fixed;
  z-index: 20;
  width: min(21rem, calc(100vw - 1.5rem));
  padding: 0.75rem 0.9rem;
  border: 1px solid #765535;
  border-radius: 0.8rem;
  color: #2b1c12;
  background: linear-gradient(155deg, #fffdf6, #e8d9be);
  box-shadow: 0 8px 24px rgb(24 16 10 / 34%);
  pointer-events: none;
  line-height: 1.45;
  animation: ${tooltipFadeIn} 180ms ease-out both;
  @media (prefers-reduced-motion: reduce) { animation: none; }
`

const TooltipTitle = styled.div`
  margin-bottom: 0.3rem;
  font-family: 'Noto Serif KR', 'Batang', 'Nanum Myeongjo', Georgia, serif;
  font-weight: 900;
`

const TooltipDescription = styled.div`
  color: #392719;
  font-size: 0.83rem;
  font-weight: 600;
  overflow-wrap: anywhere;
  white-space: pre-line;
`

type CursorPosition = { x: number; y: number }

function findCard(target: EventTarget | null) {
  return target instanceof Element ? target.closest<HTMLElement>('[data-card-effect-id]') : null
}

export function CardEffectTooltip() {
  const hoveredCard = useRef<HTMLElement | null>(null)
  const showTimer = useRef<number | undefined>(undefined)
  const cursor = useRef<CursorPosition>({ x: 0, y: 0 })
  const tooltip = useRef<HTMLDivElement>(null)
  const [cardId, setCardId] = useState<string | null>(null)

  const placeTooltip = useCallback(() => {
    const element = tooltip.current
    if (!element) return
    const rect = element.getBoundingClientRect()
    const margin = 12
    const left = Math.max(margin, Math.min(cursor.current.x + 18, window.innerWidth - rect.width - margin))
    const top = Math.max(margin, Math.min(cursor.current.y + 18, window.innerHeight - rect.height - margin))
    element.style.left = `${left}px`
    element.style.top = `${top}px`
  }, [])

  const beginHover = useCallback((card: HTMLElement, x: number, y: number) => {
    cursor.current = { x, y }
    if (hoveredCard.current === card) {
      placeTooltip()
      return
    }
    window.clearTimeout(showTimer.current)
    hoveredCard.current = card
    setCardId(null)
    const nextCardId = card.dataset.cardEffectId
    if (!nextCardId) return
    showTimer.current = window.setTimeout(() => setCardId(nextCardId), 100)
  }, [placeTooltip])

  useLayoutEffect(() => {
    placeTooltip()
  }, [cardId, placeTooltip])

  useEffect(() => {
    const onPointerOver = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      const card = findCard(event.target)
      if (card) beginHover(card, event.clientX, event.clientY)
    }

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || event.buttons !== 0) return
      const card = findCard(event.target)
      if (!card) return
      if (card !== hoveredCard.current) {
        beginHover(card, event.clientX, event.clientY)
        return
      }
      cursor.current = { x: event.clientX, y: event.clientY }
      placeTooltip()
    }

    const onPointerOut = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || !hoveredCard.current) return
      if (findCard(event.relatedTarget) === hoveredCard.current) return
      window.clearTimeout(showTimer.current)
      hoveredCard.current = null
      setCardId(null)
    }

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || !findCard(event.target)) return
      window.clearTimeout(showTimer.current)
      hoveredCard.current = null
      setCardId(null)
    }

    const onPointerUp = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      const card = findCard(document.elementFromPoint(event.clientX, event.clientY))
      if (card) beginHover(card, event.clientX, event.clientY)
    }

    document.addEventListener('pointerover', onPointerOver)
    document.addEventListener('pointermove', onPointerMove)
    document.addEventListener('pointerout', onPointerOut)
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('pointerup', onPointerUp)
    return () => {
      window.clearTimeout(showTimer.current)
      document.removeEventListener('pointerover', onPointerOver)
      document.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('pointerout', onPointerOut)
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('pointerup', onPointerUp)
    }
  }, [beginHover, placeTooltip])

  if (!cardId) return null
  const card = getCard(cardId)

  return createPortal(
    <TooltipBox ref={tooltip} role="tooltip">
      <TooltipTitle>{card.ko} · {card.en}</TooltipTitle>
      <TooltipDescription>{getCardLongEffect(cardId)}</TooltipDescription>
    </TooltipBox>,
    document.body,
  )
}
