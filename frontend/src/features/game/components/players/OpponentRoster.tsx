import type { GameState, PublicPlayer } from '../../../../types/game'
import { OpponentRow, OpponentSeat } from '../../gameStyles'
import { PlayerCardFan } from './PlayerCardFan'
import { PlayerShadow } from './PlayerShadow'
import { PlayerInfoPanel } from './PlayerInfoPanel'

type OpponentRosterProps = {
  game: GameState
  opponents: PublicPlayer[]
  targetId: string | null
  mustDefend: boolean
  isMyTurn: boolean
  needsTarget: boolean
  onSelectTarget: (playerId: string) => void
}

export function OpponentRoster({
  game,
  opponents,
  targetId,
  mustDefend,
  isMyTurn,
  needsTarget,
  onSelectTarget,
}: OpponentRosterProps) {
  return (
    <OpponentRow aria-label="상대 플레이어" $spread={opponents.length >= 2}>
      {opponents.map((player) => (
        <OpponentSeat key={player.id}>
          <PlayerInfoPanel
            player={player}
            active={game.turn.activePlayerId === player.id}
            cardCount={player.cardCount}
            variant="opponent"
            selected={targetId === player.id}
            alive={player.alive}
            disabled={mustDefend || !player.alive}
            onClick={() => {
              if (isMyTurn && needsTarget && player.alive) onSelectTarget(player.id)
            }}
          />
          <PlayerCardFan count={player.cardCount} opponent playerId={player.id} />
          <PlayerShadow playerId={player.id} />
        </OpponentSeat>
      ))}
    </OpponentRow>
  )
}
