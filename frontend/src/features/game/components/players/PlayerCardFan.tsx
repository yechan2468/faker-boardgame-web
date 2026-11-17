import { useLayoutEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import cardBackImage from '../../../../assets/image/card-back.jpg'
import { PlayerCardBack, PlayerCardFanLayout } from '../../gameStyles'

type PlayerCardFanProps = {
  count: number
  opponent?: boolean
  playerId?: string
}

type OpponentFanPosition = { left: number; top: number; width: number }

export function PlayerCardFan({ count, opponent = false, playerId }: PlayerCardFanProps) {
  const [opponentPosition, setOpponentPosition] = useState<OpponentFanPosition | null>(null)
  const cardCount = Math.max(0, Math.floor(count))

  useLayoutEffect(() => {
    if (!opponent || !playerId || cardCount === 0) return

    const updatePosition = () => {
      const infoBox = Array.from(document.querySelectorAll<HTMLElement>('[data-player-info-id]'))
        .find((element) => element.dataset.playerInfoId === playerId)
      const table = document.querySelector<HTMLElement>('[data-card-dropzone="center"]')
      if (!infoBox || !table) return

      const infoRect = infoBox.getBoundingClientRect()
      const tableTop = table.getBoundingClientRect().top
      const infoCenterY = infoRect.top + infoRect.height / 2
      const fanCenterY = infoCenterY + ((tableTop - infoCenterY) * 2) / 3
      setOpponentPosition({ left: infoRect.left, top: fanCenterY, width: infoRect.width })
    }

    updatePosition()
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(updatePosition)
    const infoBox = Array.from(document.querySelectorAll<HTMLElement>('[data-player-info-id]'))
      .find((element) => element.dataset.playerInfoId === playerId)
    const table = document.querySelector<HTMLElement>('[data-card-dropzone="center"]')
    const header = infoBox?.closest('header')
    if (infoBox) observer?.observe(infoBox)
    if (table) observer?.observe(table)
    if (header) observer?.observe(header)
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [cardCount, opponent, playerId])

  if (cardCount === 0) return null

  const cardImages = Array.from({ length: cardCount }, (_, index) => (
    <PlayerCardBack
      key={index}
      src={cardBackImage}
      alt=""
      draggable={false}
      $index={index}
      $count={cardCount}
      $opponent={opponent}
    />
  ))

  if (opponent) {
    if (!opponentPosition) return null
    return createPortal(
      <PlayerCardFanLayout
        $opponent
        $left={opponentPosition.left}
        $top={opponentPosition.top}
        $width={opponentPosition.width}
        aria-hidden="true"
      >
        {cardImages}
      </PlayerCardFanLayout>,
      document.body,
    )
  }

  return (
    <PlayerCardFanLayout aria-hidden="true" data-card-selection-ignore="true">
      {cardImages}
    </PlayerCardFanLayout>
  )
}
