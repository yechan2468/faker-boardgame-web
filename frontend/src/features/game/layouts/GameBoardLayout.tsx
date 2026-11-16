import { PlayField, Board } from '../gameStyles'
import type { GameScreenProps } from '../types'
import { BottomPlayerArea } from '../components/BottomPlayerArea'
import { CenterInfoArea } from '../components/CenterInfoArea'
import { GameActionArea } from '../components/GameActionArea'
import { TurnIntroOverlay } from '../components/TurnIntroOverlay'

export function GameBoardLayout(props: GameScreenProps) {
  const { actions } = props

  return (
    <Board>
      <PlayField>
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
