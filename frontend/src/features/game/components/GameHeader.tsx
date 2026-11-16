import { Brand, MenuButton, TopBar } from '../gameStyles'
import type { GameScreenProps } from '../types'
import { OpponentArea } from './OpponentArea'

export function GameHeader({
  onOpenMenu,
  game,
  opponents,
  targetId,
  mustDefend,
  isMyTurn,
  needsTarget,
  actions,
}: Pick<GameScreenProps, 'game' | 'opponents' | 'targetId' | 'mustDefend' | 'isMyTurn' | 'needsTarget' | 'actions'> & {
  onOpenMenu: () => void
}) {
  return (
    <TopBar>
      <Brand>Faker</Brand>
      <OpponentArea
        game={game}
        opponents={opponents}
        targetId={targetId}
        mustDefend={mustDefend}
        isMyTurn={isMyTurn}
        needsTarget={needsTarget}
        onSelectTarget={actions.setTargetId}
      />
      <MenuButton type="button" onClick={onOpenMenu}>메뉴 · ESC</MenuButton>
    </TopBar>
  )
}
