import type { GameScreenProps } from '../../types'
import { BottomArea } from '../../gameStyles'
import { OwnPlayerInfo } from '../players/OwnPlayerInfo'
import { PlayerHand } from '../cards/hand/PlayerHand'
import { TurnOrderOverlay } from '../overlays/TurnOrderOverlay'
import { useGameAudio } from '../../audio/GameAudioProvider'

export function BottomHud({ game, self, hand, selectedHandIndex, turnPreview, turnIntro, actions }: GameScreenProps) {
  const { playSound } = useGameAudio()
  const resetCardActions = () => {
    actions.setSelectedDeclarationId(null)
    actions.setTargetId(null)
  }

  return (
    <BottomArea
      data-card-dropzone="hand"
      onClick={(event) => {
        if (!(event.target instanceof Element)) return
        if (event.target.closest('[data-hand-index], [data-card-selection-ignore]')) return
        if (selectedHandIndex === null) return
        playSound('deselectCard')
        actions.setSelectedHandIndex(null)
        resetCardActions()
      }}
    >
      <OwnPlayerInfo game={game} self={self} hand={hand} />
      <PlayerHand game={game} hand={hand} selectedHandIndex={selectedHandIndex} turnIntro={turnIntro} actions={actions} />
      <TurnOrderOverlay turnPreview={turnPreview} />
    </BottomArea>
  )
}
