import type { GameScreenProps } from '../../types'
import { OwnPlayerSeat } from '../../gameStyles'
import { PlayerShadow } from './PlayerShadow'
import { PlayerInfoPanel } from './PlayerInfoPanel'

export function OwnPlayerInfo({ game, self, hand }: Pick<GameScreenProps, 'game' | 'self' | 'hand'>) {
  return (
    <OwnPlayerSeat data-card-selection-ignore="true">
      <PlayerInfoPanel
        player={self}
        active={game.turn?.activePlayerId === self?.id}
        cardCount={hand.length}
        variant="own"
      />
      <PlayerShadow playerId={self?.id} />
    </OwnPlayerSeat>
  )
}
