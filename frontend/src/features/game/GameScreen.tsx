import { Page } from './gameStyles'
import type { GameScreenProps } from './types'
import { GameHeader } from './components/GameHeader'
import { FloatingRulesImage } from './components/FloatingRulesImage'
import { CardEffectTooltip } from './components/CardEffectTooltip'
import { HealthChangeAnimator } from './components/HealthChangeAnimator'
import { GameMenuDialog } from './components/GameMenuDialog'
import { GameBoardLayout } from './layouts/GameBoardLayout'

export default function GameScreen(props: GameScreenProps) {
  const { actions } = props

  return (
    <Page onContextMenu={(event) => event.preventDefault()} onDragStart={(event) => event.preventDefault()}>
      <HealthChangeAnimator game={props.game} />
      <GameHeader {...props} onOpenMenu={() => actions.setModalOpen(true)} />
      <GameBoardLayout {...props} />
      <FloatingRulesImage />
      <CardEffectTooltip />
      <GameMenuDialog {...props} />
    </Page>
  )
}
