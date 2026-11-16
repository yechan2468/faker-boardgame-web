import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { createPortal } from 'react-dom'
import styled from 'styled-components'
import ruleImage from '../../../assets/rule.jpg'

type Position = { x: number; y: number }
type DragState = { pointerId: number; offsetX: number; offsetY: number }

const RulesImageFrame = styled.div<{ $dragging: boolean }>`
  position: fixed;
  z-index: 8;
  top: clamp(6rem, 12vh, 7rem);
  left: 1rem;
  width: min(270px, 18.6vw, 36.6vh);
  max-height: 49.2vh;
  overflow: hidden;
  border: 2px solid #168dbb;
  border-radius: 0.85rem;
  background: #d9f3fb;
  box-shadow: 0 8px 24px rgb(18 25 65 / 42%);
  cursor: ${({ $dragging }) => ($dragging ? 'grabbing' : 'grab')};
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;

  img {
    display: block;
    width: 100%;
    max-height: 49.2vh;
    object-fit: contain;
    pointer-events: none;
  }

  @media (max-width: 900px) {
    width: min(228px, 31.2vw, 36.6vh);
  }

  @media (max-width: 650px) {
    width: min(204px, 43.2vw, 34.8vh);
  }
`

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), Math.max(min, max))
}

export function FloatingRulesImage() {
  const frame = useRef<HTMLDivElement>(null)
  const drag = useRef<DragState | null>(null)
  const [position, setPosition] = useState<Position | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    const keepInsideViewport = () => {
      const rect = frame.current?.getBoundingClientRect()
      if (!rect) return
      setPosition((current) => current && ({
        x: clamp(current.x, 0, window.innerWidth - rect.width),
        y: clamp(current.y, 0, window.innerHeight - rect.height),
      }))
    }
    window.addEventListener('resize', keepInsideViewport)
    return () => window.removeEventListener('resize', keepInsideViewport)
  }, [])

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return
    event.preventDefault()
    const rect = event.currentTarget.getBoundingClientRect()
    drag.current = {
      pointerId: event.pointerId,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
    }
    setIsDragging(true)
    event.currentTarget.setPointerCapture(event.pointerId)
    setPosition({ x: rect.left, y: rect.top })
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const activeDrag = drag.current
    if (!activeDrag || activeDrag.pointerId !== event.pointerId) return
    const rect = event.currentTarget.getBoundingClientRect()
    setPosition({
      x: clamp(event.clientX - activeDrag.offsetX, 0, window.innerWidth - rect.width),
      y: clamp(event.clientY - activeDrag.offsetY, 0, window.innerHeight - rect.height),
    })
  }

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (drag.current?.pointerId !== event.pointerId) return
    drag.current = null
    setIsDragging(false)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const rect = frame.current?.getBoundingClientRect()
    if (!rect) return
    const moves: Record<string, Position> = {
      ArrowUp: { x: 0, y: -24 },
      ArrowDown: { x: 0, y: 24 },
      ArrowLeft: { x: -24, y: 0 },
      ArrowRight: { x: 24, y: 0 },
    }
    const movement = moves[event.key]
    if (!movement) return
    event.preventDefault()
    setPosition({
      x: clamp(rect.left + movement.x, 0, window.innerWidth - rect.width),
      y: clamp(rect.top + movement.y, 0, window.innerHeight - rect.height),
    })
  }

  return createPortal(
    <RulesImageFrame
      ref={frame}
      $dragging={isDragging}
      style={position ? { left: position.x, top: position.y, right: 'auto' } : undefined}
      role="group"
      aria-label="드래그할 수 있는 게임 규칙 이미지"
      title="드래그해서 이동 · 방향키로 조금씩 이동"
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={onKeyDown}
      onDragStart={(event) => event.preventDefault()}
    >
      <img src={ruleImage} alt="Faker Blue 카드 규칙표" draggable={false} />
    </RulesImageFrame>,
    document.body,
  )
}
