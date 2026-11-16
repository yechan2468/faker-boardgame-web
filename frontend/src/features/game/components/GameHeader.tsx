import { Brand, MenuButton, TopBar } from '../gameStyles'

export function GameHeader({ onOpenMenu }: { onOpenMenu: () => void }) {
  return (
    <TopBar>
      <Brand>Faker Blue</Brand>
      <MenuButton type="button" onClick={onOpenMenu}>메뉴 · ESC</MenuButton>
    </TopBar>
  )
}