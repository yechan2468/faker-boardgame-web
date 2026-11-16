import type { PublicPlayer } from '../../types/game'

export type CardInfo = {
  id: string
  ko: string
  en: string
  target: boolean
  allTargets?: boolean
  healthLoss?: number
  value: number
}

export const CARD_INFO: readonly CardInfo[] = [
  { id: 'assassin', ko: '암살자', en: 'Assassin', target: true, healthLoss: 3, value: 12 },
  { id: 'warlock', ko: '흑마법사', en: 'Warlock', target: true, healthLoss: 3, value: 9 },
  { id: 'red-dragon', ko: '불용', en: 'Red Dragon', target: false, allTargets: true, healthLoss: 2, value: 10 },
  { id: 'archer', ko: '궁수', en: 'Archer', target: true, healthLoss: 2, value: 8 },
  { id: 'bomber', ko: '폭탄병', en: 'Bomber', target: false, allTargets: true, healthLoss: 1, value: 6 },
  { id: 'vampire-king', ko: '뱀파이어킹', en: 'Vampire King', target: false, allTargets: true, healthLoss: 1, value: 13 },
  { id: 'vampire', ko: '뱀파이어', en: 'Vampire', target: true, healthLoss: 1, value: 5 },
  { id: 'alchemist', ko: '연금술사', en: 'Alchemist', target: true, value: 4 },
  { id: 'high-priest', ko: '고위사제', en: 'High Priest', target: false, value: 11 },
  { id: 'priest', ko: '사제', en: 'Priest', target: false, value: 7 },
  { id: 'wizard', ko: '마법사', en: 'Wizard', target: false, value: 3 },
  { id: 'defender', ko: '방패병', en: 'Defender', target: false, value: 2 },
  { id: 'clown', ko: '광대', en: 'Clown', target: false, value: 1 },
]

const CARD_EFFECT_ICONS: Record<string, string> = {
  assassin: '⚔️⚔️⚔️',
  warlock: '💔⚔️⚔️⚔️',
  'red-dragon': '👥⚔️⚔️',
  archer: '🎯⚔️⚔️',
  bomber: '👥⚔️',
  'vampire-king': '👥🩸',
  vampire: '🎯🩸',
  alchemist: '❤️🔄',
  'high-priest': '❤️❤️❤️',
  priest: '❤️❤️',
  wizard: '🪞',
  defender: '🛡️',
  clown: '🤡',
}

export function getCardEffectIcons(cardId: string) {
  return CARD_EFFECT_ICONS[cardId] ?? '✨'
}

export type DeclarationNotice = {
  playerId: string
  declaredCardId: string
  truthful: boolean | null
  actualCardId?: string | null
  targetIds?: string[]
}

export function getCard(id: string): CardInfo {
  return CARD_INFO.find((card) => card.id === id) ?? { id, ko: id, en: id, target: false, value: 0 }
}

export function getPlayerName(players: PublicPlayer[], playerId: string) {
  return players.find((player) => player.id === playerId)?.nickname ?? '플레이어'
}
