import { useLayoutEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { PlayerShadowShape } from '../../gameStyles'

type PlayerShadowProps = {
  playerId?: string
}

type ShadowPosition = { left: number; top: number; height: number }

const SHADOW_HEIGHT_RATIO = 0.68

export function PlayerShadow({ playerId }: PlayerShadowProps) {
  const [position, setPosition] = useState<ShadowPosition | null>(null)

  useLayoutEffect(() => {
    if (!playerId) return

    const updatePosition = () => {
      const infoBox = Array.from(document.querySelectorAll<HTMLElement>('[data-player-info-id]'))
        .find((element) => element.dataset.playerInfoId === playerId)
      if (!infoBox) return

      const infoRect = infoBox.getBoundingClientRect()
      const height = Math.max(360, window.innerHeight * SHADOW_HEIGHT_RATIO)
      setPosition({
        left: infoRect.left + infoRect.width / 2,
        top: infoRect.bottom - height * 0.45,
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
  }, [playerId])

  if (!position) return null
  const shadowLayer = document.querySelector<HTMLElement>('[data-player-shadow-layer]')
  if (!shadowLayer) return null

  return createPortal(
    <PlayerShadowShape
      $left={position.left}
      $top={position.top}
      $height={position.height}
      aria-hidden="true"
    />,
    shadowLayer,
  )
}
