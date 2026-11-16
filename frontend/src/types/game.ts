export type GameStatus = 'LOBBY' | 'IN_GAME'

export type PlayerRole = 'HOST' | 'PLAYER'

export type MatchEndReason =
  | 'LAST_PLAYER_STANDING'
  | 'CARD_DECK_EMPTY_HEALTH'
  | 'CARD_DECK_EMPTY_CARD_VALUE'
  | 'CARD_DECK_EMPTY_TIE'

export interface MatchResult {
  winnerIds: string[]
  reason: MatchEndReason
  message: string
}

export interface GamePlayer {
  id: string
  nickname: string
  role: PlayerRole
  connected: boolean
  health: number
  cards: string[]
}

export interface PublicPlayer {
  id: string
  nickname: string
  role: PlayerRole
  connected: boolean
  health: number
  alive: boolean
  cardCount: number
}

export interface LeaderboardEntry {
  playerId: string
  nickname: string
  wins: number
  totalScore: number
}

export interface GameState {
  status: GameStatus
  viewerId: string | null
  players: PublicPlayer[]
  turnOrder: string[]
  leaderboard: LeaderboardEntry[]
  supplyHealth: number
  cardDeckCount: number
  discardPileCount: number
  turn: { number: number; activePlayerId: string | null; phase: string }
  matchResult: MatchResult | null
  pendingAction: PendingAction | null
}

export interface PendingAction {
  actorId: string
  declaredCardId: string
  attackerActualCardId: string | null
  targetIds: string[]
  attackerTruthful: boolean | null
  defensePasses: string[]
  suspicionPasses: string[]
  suspicionDefenseIndex: number | null
  defenses: Array<{
    index: number
    playerId: string
    declaredCardId: string
    actualCardId: string | null
    redirectTargetId: string | null
    truthful: boolean | null
  }>
}

export interface GameEvent {
  type: string
  players: PublicPlayer[]
  turnOrder: string[]
  supplyHealth: number
  turn: { number: number; activePlayerId: string | null; phase: string }
  deckCount: number
  status: GameStatus
  matchResult: MatchResult | null
  pendingAction: PendingAction | null
}
