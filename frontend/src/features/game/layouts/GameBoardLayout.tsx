import { PlayField, Board } from '../gameStyles'
import type { GameScreenProps } from '../types'
import { BottomHud } from '../components/hud/BottomHud'
import { TableCenterArea } from '../components/board/TableCenterArea'
import { GameActionArea } from '../components/actions/GameActionArea'
import { TurnIntroOverlay } from '../components/overlays/TurnIntroOverlay'
import { useGameAudio } from '../audio/GameAudioProvider'

export function GameBoardLayout(props: GameScreenProps) {
  const { actions } = props
  const { playSound } = useGameAudio()

  return (
    <>
      <Board>
        <PlayField
          data-card-dropzone="center"
          onClick={() => {
            if (props.selectedHandIndex === null) return
            playSound('deselectCard')
            actions.setSelectedHandIndex(null)
            actions.setSelectedDeclarationId(null)
            actions.setTargetId(null)
          }}
        >
          <TableCenterArea {...props} />
        </PlayField>
        <BottomHud {...props} />
      </Board>
      {props.turnIntro && (
        <TurnIntroOverlay
          currentTurnId={props.currentTurnId}
          text={props.turnOverlayText}
          onFinished={() => actions.setTurnIntro(false)}
        />
      )}
      <GameActionArea {...props} />
    </>
  )
}
