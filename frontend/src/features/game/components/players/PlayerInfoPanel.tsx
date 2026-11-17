import type { PublicPlayer } from '../../../../types/game'
import { OpponentCard, OwnIdentity, OwnName, PlayerHealth, PlayerName, SmallCards } from '../../gameStyles'
import { PlayerHearts } from './PlayerHearts'

type PlayerInfoPanelProps = {
  player: PublicPlayer | undefined
  active: boolean
  cardCount: number
  variant: 'own' | 'opponent'
  selected?: boolean
  alive?: boolean
  disabled?: boolean
  onClick?: () => void
}

export function PlayerInfoPanel({
  player,
  active,
  cardCount,
  variant,
  selected = false,
  alive = true,
  disabled = false,
  onClick,
}: PlayerInfoPanelProps) {
  const name = player?.nickname ?? (variant === 'own' ? '나' : '')
  const identity = (
    <>
      {variant === 'own' ? <OwnName>{name}</OwnName> : <PlayerName>{name}</PlayerName>}
      <PlayerHealth data-player-health-id={player?.id} $small>
        <span>{player?.health ?? 0}</span>
      </PlayerHealth>
      <PlayerHearts count={player?.health ?? 0} />
      <SmallCards>손에 든 카드 {cardCount}장</SmallCards>
    </>
  )

  if (variant === 'own') {
    return (
      <OwnIdentity $active={active} data-player-info-id={player?.id}>
        {identity}
      </OwnIdentity>
    )
  }

  return (
    <OpponentCard
      type="button"
      $active={active}
      $selected={selected}
      $alive={alive}
      disabled={disabled}
      onClick={onClick}
      aria-pressed={selected}
      data-player-info-id={player?.id}
    >
      {identity}
    </OpponentCard>
  )
}
