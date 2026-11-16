import type { PublicPlayer } from '../../types/game'

export type CardInfo = {
  id: string
  ko: string
  en: string
  target: boolean
}

export const CARD_INFO: readonly CardInfo[] = [
  { id: 'assassin', ko: '암살자', en: 'Assassin', target: true },
  { id: 'warlock', ko: '흑마법사', en: 'Warlock', target: true },
  { id: 'red-dragon', ko: '불용', en: 'Red Dragon', target: false },
  { id: 'archer', ko: '궁수', en: 'Archer', target: true },
  { id: 'bomber', ko: '폭탄병', en: 'Bomber', target: false },
  { id: 'vampire-king', ko: '뱀파이어킹', en: 'Vampire King', target: false },
  { id: 'vampire', ko: '뱀파이어', en: 'Vampire', target: true },
  { id: 'alchemist', ko: '연금술사', en: 'Alchemist', target: true },
  { id: 'high-priest', ko: '고위사제', en: 'High Priest', target: false },
  { id: 'priest', ko: '사제', en: 'Priest', target: false },
  { id: 'wizard', ko: '마법사', en: 'Wizard', target: false },
  { id: 'defender', ko: '방패병', en: 'Defender', target: false },
  { id: 'clown', ko: '광대', en: 'Clown', target: false },
]

export type DeclarationNotice = {
  playerId: string
  declaredCardId: string
  truthful: boolean | null
}

export function getCard(id: string): CardInfo {
  return CARD_INFO.find((card) => card.id === id) ?? { id, ko: id, en: id, target: false }
}

export function getPlayerName(players: PublicPlayer[], playerId: string) {
  return players.find((player) => player.id === playerId)?.nickname ?? '플레이어'
}
