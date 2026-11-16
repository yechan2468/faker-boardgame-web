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
  archer: '⚔️⚔️',
  bomber: '👥⚔️',
  'vampire-king': '👥🩸',
  vampire: '🩸',
  alchemist: '❤️⇄',
  'high-priest': '❤️❤️❤️',
  priest: '❤️❤️',
  wizard: '⮎',
  defender: '🛡️',
  clown: '🤡',
}

export function getCardEffectIcons(cardId: string) {
  return CARD_EFFECT_ICONS[cardId] ?? '✨'
}

const CARD_LONG_EFFECTS: Record<string, string> = {
  assassin: '선택한 한 명에게 피해 3 ⚔️⚔️⚔️을 줍니다.\n¹¹마법사로 반사⮎하거나 ¹²방패병으로 무효화🛡️할 수 있습니다.',
  warlock: '자신의 체력 1을 잃고 💔, 선택한 한 명에게 피해 3 ⚔️⚔️⚔️을 줍니다.',
  'red-dragon': '자신을 제외한 👥모든 생존 플레이어에게 피해 2 ⚔️⚔️를 줍니다.\n각 대상은 개별적으로 방어🛡️⮎할 수 있습니다.',
  archer: '선택한 한 명에게 피해 2 ⚔️⚔️를 줍니다.\n¹¹마법사로 반사⮎하거나 ¹²방패병으로 무효화🛡️할 수 있습니다.',
  bomber: '자신을 제외한 👥모든 생존 플레이어에게 피해 1 ⚔️을 줍니다.\n각 대상은 개별적으로 방어🛡️⮎할 수 있습니다.',
  'vampire-king': '자신을 제외한 👥모든 생존 플레이어의 체력을 1씩 흡혈🩸하여 체력을 빼앗아 얻습니다.',
  vampire: '선택한 한 명의 체력을 1 흡혈🩸하여 체력을 빼앗아 얻습니다.',
  alchemist: '필드에 남은 체력 토큰이 있다면 1개를 회복❤️하고, 선택한 대상과 남은 손패를 서로 교환⇄합니다.\n이 교환은 방어🛡️⮎ 카드로 막을 수 없습니다.',
  'high-priest': '체력을 최대 3 회복❤️❤️❤️합니다. 필드에 남은 토큰만 가져올 수 있습니다.',
  priest: '체력을 최대 2 회복❤️❤️합니다. 필드에 남은 토큰만 가져올 수 있습니다.',
  wizard: '받은 공격을 공격자나 다른 플레이어에게 반사⮎합니다.\n반사된 공격의 새 대상도 방어🛡️⮎할 수 있습니다.',
  defender: '받은 공격의 효과를 무효화🛡️합니다.',
  clown: '능력이 없습니다.\n광대는 무조건 다른 능력 카드를 선언해 블러핑🤡해야 합니다.',
}

export function getCardLongEffect(cardId: string) {
  return CARD_LONG_EFFECTS[cardId] ?? '이 카드의 효과 정보가 없습니다.'
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
