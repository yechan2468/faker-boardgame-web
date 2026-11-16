import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { createPortal } from 'react-dom'
import styled from 'styled-components'
import ruleImage from '../../../../assets/image/rule.jpg'
import { useGameAudio } from '../../audio/GameAudioProvider'

type Position = { x: number; y: number }
type DragState = { pointerId: number; offsetX: number; offsetY: number }

const MinimizeButton = styled.button<{ $minimized: boolean }>`
  position: absolute;
  z-index: 1;
  top: 0.3rem;
  right: 0.3rem;
  display: grid;
  width: 2rem;
  height: 2rem;
  place-items: center;
  border: 1px solid #fff;
  border-radius: 50%;
  color: #fff;
  background: #29387c;
  box-shadow: 0 2px 8px rgb(18 25 65 / 38%);
  font: inherit;
  font-size: 1.2rem;
  font-weight: 900;
  line-height: 1;
  cursor: pointer;
  opacity: ${({ $minimized }) => ($minimized ? 1 : 0)};
  pointer-events: ${({ $minimized }) => ($minimized ? 'auto' : 'none')};
  transition: opacity 120ms ease;
`

const RulesImageFrame = styled.div<{ $dragging: boolean; $minimized: boolean }>`
  position: fixed;
  z-index: 8;
  top: clamp(6rem, 12vh, 7rem);
  left: 1rem;
  width: ${({ $minimized }) => ($minimized ? '2.7rem' : 'min(270px, 18.6vw, 36.6vh)')};
  max-height: ${({ $minimized }) => ($minimized ? '2.7rem' : '49.2vh')};
  min-height: 2.7rem;
  overflow: hidden;
  border: 2px solid #168dbb;
  border-radius: ${({ $minimized }) => ($minimized ? '0.75rem' : '0.85rem')};
  background: #d9f3fb;
  box-shadow: 0 8px 24px rgb(18 25 65 / 42%);
  cursor: ${({ $dragging }) => ($dragging ? 'grabbing' : 'grab')};
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  transition:
    width 240ms cubic-bezier(0.2, 0.75, 0.25, 1),
    max-height 280ms cubic-bezier(0.2, 0.75, 0.25, 1),
    border-radius 240ms ease;

  img {
    display: block;
    width: 100%;
    max-height: ${({ $minimized }) => ($minimized ? '0' : '49.2vh')};
    opacity: ${({ $minimized }) => ($minimized ? 0 : 1)};
    object-fit: contain;
    pointer-events: none;
    transform: scale(${({ $minimized }) => ($minimized ? 0.94 : 1)});
    transform-origin: top center;
    transition:
      max-height 280ms cubic-bezier(0.2, 0.75, 0.25, 1),
      opacity 160ms ease,
      transform 280ms cubic-bezier(0.2, 0.75, 0.25, 1);
  }

  &:hover ${MinimizeButton}, &:focus-within ${MinimizeButton} {
    opacity: 1;
    pointer-events: auto;
  }

  @media (max-width: 900px) {
    width: ${({ $minimized }) => ($minimized ? '2.7rem' : 'min(228px, 31.2vw, 36.6vh)')};
  }

  @media (max-width: 650px) {
    width: ${({ $minimized }) => ($minimized ? '2.7rem' : 'min(204px, 43.2vw, 34.8vh)')};
  }
`

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), Math.max(min, max))
}

export function FloatingRulesImage() {
  const { playSound } = useGameAudio()
  const frame = useRef<HTMLDivElement>(null)
  const drag = useRef<DragState | null>(null)
  const [position, setPosition] = useState<Position | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)

  useEffect(() => {
    const keepInsideViewport = () => {
      const rect = frame.current?.getBoundingClientRect()
      if (!rect) return
      setPosition((current) => current && ({
        x: clamp(current.x, 0, window.innerWidth - rect.width),
        y: clamp(current.y, 0, window.innerHeight - rect.height),
      }))
    }
    keepInsideViewport()
    window.addEventListener('resize', keepInsideViewport)
    return () => window.removeEventListener('resize', keepInsideViewport)
  }, [isMinimized])

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
      $minimized={isMinimized}
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
      <MinimizeButton
        type="button"
        $minimized={isMinimized}
        aria-label={isMinimized ? '규칙 이미지 펼치기' : '규칙 이미지 최소화'}
        title={isMinimized ? '규칙 이미지 펼치기' : '규칙 이미지 최소화'}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation()
          playSound('rulesToggle')
          setIsMinimized((minimized) => !minimized)
        }}
      >
        {isMinimized ? '↗' : '−'}
      </MinimizeButton>
      <img src={ruleImage} alt="Faker Blue 카드 규칙표" draggable={false} />
    </RulesImageFrame>,
    document.body,
  )
}
