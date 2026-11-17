import type { PublicPlayer } from '../../../types/game'

export function getPlayerName(players: PublicPlayer[], playerId: string) {
  return players.find((player) => player.id === playerId)?.nickname ?? '플레이어'
}
