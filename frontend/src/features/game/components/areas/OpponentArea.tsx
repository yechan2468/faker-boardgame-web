import type { GameState, PublicPlayer } from '../../../../types/game'
import {
  Hearts,
  OpponentCard,
  OpponentRow,
  PlayerHealth,
  PlayerName,
  SmallCards,
} from '../../gameStyles'

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
    <OpponentRow aria-label="상대 플레이어">
      {opponents.map((player) => (
        <OpponentCard
          key={player.id}
          type="button"
          $active={game.turn.activePlayerId === player.id}
          $selected={targetId === player.id}
          $alive={player.alive}
          disabled={mustDefend || !player.alive}
          onClick={() => {
            if (isMyTurn && needsTarget && player.alive) onSelectTarget(player.id)
          }}
          aria-pressed={targetId === player.id}
        >
          <PlayerName>{player.nickname}</PlayerName>
          <PlayerHealth data-player-health-id={player.id} $small>
            <span>{player.health}</span>
            <Hearts $small>{'♥'.repeat(Math.max(0, player.health))}</Hearts>
          </PlayerHealth>
          <SmallCards>남은 카드 {player.cardCount}장</SmallCards>
        </OpponentCard>
      ))}
    </OpponentRow>
  )
}
