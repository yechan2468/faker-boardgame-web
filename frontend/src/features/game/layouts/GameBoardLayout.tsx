import { PlayField, Board } from '../gameStyles'
import type { GameScreenProps } from '../types'
import { BottomPlayerArea } from '../components/areas/BottomPlayerArea'
import { CenterInfoArea } from '../components/areas/CenterInfoArea'
import { GameActionArea } from '../components/actions/GameActionArea'
import { TurnIntroOverlay } from '../components/overlays/TurnIntroOverlay'

export function GameBoardLayout(props: GameScreenProps) {
  const { actions } = props

  return (
    <Board>
      <PlayField data-card-dropzone="center">
        <CenterInfoArea {...props} />
        {props.turnIntro && (
          <TurnIntroOverlay
            currentTurnId={props.currentTurnId}
            text={props.turnOverlayText}
            onFinished={() => actions.setTurnIntro(false)}
          />
        )}
        <GameActionArea {...props} />
      </PlayField>
      <BottomPlayerArea {...props} />
    </Board>
  )
}
