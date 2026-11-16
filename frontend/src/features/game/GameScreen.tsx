import { Page } from './gameStyles'
import type { GameScreenProps } from './types'
import { GameHeader } from './components/GameHeader'
import { GameMenuDialog } from './components/GameMenuDialog'
import { GameBoardLayout } from './layouts/GameBoardLayout'

export default function GameScreen(props: GameScreenProps) {
  const { actions } = props

  return (
    <Page onContextMenu={(event) => event.preventDefault()} onDragStart={(event) => event.preventDefault()}>
      <GameHeader {...props} onOpenMenu={() => actions.setModalOpen(true)} />
      <GameBoardLayout {...props} />
      <GameMenuDialog {...props} />
    </Page>
  )
}
