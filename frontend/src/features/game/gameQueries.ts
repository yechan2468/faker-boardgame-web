import type { GameState, LeaderboardEntry } from '../../types/game'

export async function fetchGameState(): Promise<GameState> {
  const response = await fetch('/api/game', { credentials: 'same-origin', headers: { Accept: 'application/json' } })
  if (response.status === 401) throw new Error('AUTHENTICATION_REQUIRED')
  if (!response.ok) throw new Error('게임 상태를 불러오지 못했습니다.')
  return response.json() as Promise<GameState>
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const response = await fetch('/api/leaderboard', { credentials: 'same-origin' })
  if (!response.ok) throw new Error('리더보드를 불러오지 못했습니다.')
  return response.json() as Promise<LeaderboardEntry[]>
}
