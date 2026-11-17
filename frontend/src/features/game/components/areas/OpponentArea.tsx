import type { GameState, PublicPlayer } from '../../../../types/game'
import {
  OpponentCard,
  OpponentRow,
  OpponentSeat,
  PlayerHealth,
  PlayerName,
  SmallCards,
} from '../../gameStyles'
import { PlayerCardFan } from '../cards/PlayerCardFan'
import { PlayerShadow } from '../cards/PlayerShadow'
import { PlayerHearts } from './PlayerHearts'

type OpponentAreaProps = {
  game: GameState
  opponents: PublicPlayer[]
  targetId: string | null
  mustDefend: boolean
  isMyTurn: boolean
  needsTarget: boolean
  onSelectTarget: (playerId: string) => void
}

export function OpponentArea({
  game,
  opponents,
  targetId,
  mustDefend,
  isMyTurn,
  needsTarget,
  onSelectTarget,
}: OpponentAreaProps) {
  return (
    <OpponentRow aria-label="상대 플레이어" $spread={opponents.length >= 2}>
      {opponents.map((player) => (
        <OpponentSeat key={player.id}>
          <OpponentCard
            type="button"
            $active={game.turn.activePlayerId === player.id}
            $selected={targetId === player.id}
            $alive={player.alive}
            disabled={mustDefend || !player.alive}
            onClick={() => {
              if (isMyTurn && needsTarget && player.alive) onSelectTarget(player.id)
            }}
            aria-pressed={targetId === player.id}
            data-player-info-id={player.id}
          >
            <PlayerName>{player.nickname}</PlayerName>
            <PlayerHealth data-player-health-id={player.id} $small>
              <span>{player.health}</span>
            </PlayerHealth>
            <PlayerHearts count={player.health} />
            <SmallCards>손에 든 카드 {player.cardCount}장</SmallCards>
          </OpponentCard>
          <PlayerCardFan count={player.cardCount} opponent playerId={player.id} />
          <PlayerShadow playerId={player.id} />
        </OpponentSeat>
      ))}
    </OpponentRow>
  )
}
