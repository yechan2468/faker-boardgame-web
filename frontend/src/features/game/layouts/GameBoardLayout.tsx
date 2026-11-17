import { PlayField, Board } from '../gameStyles'
import type { GameScreenProps } from '../types'
import { BottomPlayerArea } from '../components/areas/BottomPlayerArea'
import { CenterInfoArea } from '../components/areas/CenterInfoArea'
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
          <CenterInfoArea {...props} />
        </PlayField>
        <BottomPlayerArea {...props} />
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
