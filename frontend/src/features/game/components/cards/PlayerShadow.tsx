import { useLayoutEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { PlayerShadowShape } from '../../gameStyles'

type PlayerShadowProps = {
  playerId?: string
  self?: boolean
}

type ShadowPosition = { left: number; top: number; height: number }

const SHADOW_HEIGHT_RATIO = 0.34

export function PlayerShadow({ playerId, self = false }: PlayerShadowProps) {
  const [position, setPosition] = useState<ShadowPosition | null>(null)

  useLayoutEffect(() => {
    if (!playerId) return

    const updatePosition = () => {
      const infoBox = Array.from(document.querySelectorAll<HTMLElement>('[data-player-info-id]'))
        .find((element) => element.dataset.playerInfoId === playerId)
      if (!infoBox) return

      const infoRect = infoBox.getBoundingClientRect()
      const height = Math.max(180, window.innerHeight * SHADOW_HEIGHT_RATIO)
      setPosition({
        left: infoRect.left + infoRect.width / 2,
        top: self ? infoRect.top - height + 20 : infoRect.bottom - 18,
        height,
      })
    }

    updatePosition()
    const infoBox = Array.from(document.querySelectorAll<HTMLElement>('[data-player-info-id]'))
      .find((element) => element.dataset.playerInfoId === playerId)
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(updatePosition)
    const board = document.querySelector<HTMLElement>('[data-card-dropzone="center"]')
    if (infoBox) observer?.observe(infoBox)
    if (board) observer?.observe(board)
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [playerId, self])

  if (!position) return null

  return createPortal(
    <PlayerShadowShape
      $left={position.left}
      $top={position.top}
      $height={position.height}
      aria-hidden="true"
    />,
    document.body,
  )
}
