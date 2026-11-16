import { useEffect, useRef } from 'react'
import { Page } from './gameStyles'
import type { GameScreenProps } from './types'
import { GameHeader } from './components/areas/GameHeader'
import { FloatingRulesImage } from './components/overlays/FloatingRulesImage'
import { CardEffectTooltip } from './components/cards/CardEffectTooltip'
import { HealthChangeAnimator } from './components/animations/HealthChangeAnimator'
import { GameMenuDialog } from './components/overlays/GameMenuDialog'
import { GameBoardLayout } from './layouts/GameBoardLayout'
import { useGameAudio } from './audio/GameAudioProvider'

export default function GameScreen(props: GameScreenProps) {
  const { actions } = props
  const { playSound } = useGameAudio()
  const previousMatchResult = useRef(props.game.matchResult)

  useEffect(() => {
    if (!previousMatchResult.current && props.game.matchResult) playSound('victory')
    previousMatchResult.current = props.game.matchResult
  }, [props.game.matchResult, playSound])

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
