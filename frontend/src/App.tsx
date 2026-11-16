import GameScreen from './features/game/GameScreen'
import { Brand, Page, RefreshButton, Status, TopBar } from './features/game/gameStyles'
import { useGameController } from './features/game/useGameController'

export default function GamePage() {
  const page = useGameController()

  if (page.kind === 'loading') {
    return <Page><TopBar><Brand>Faker Blue</Brand></TopBar><Status>게임 상태를 불러오는 중...</Status></Page>
  }
  if (page.kind === 'error') {
    return (
      <Page>
        <TopBar><Brand>Faker Blue</Brand></TopBar>
        <Status data-error="true">
          {page.message}
          <RefreshButton type="button" onClick={page.refresh}>새로 고침</RefreshButton>
        </Status>
      </Page>
    )
  }
  return <GameScreen {...page.screen} />
}