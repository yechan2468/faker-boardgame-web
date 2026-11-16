import { PlayField, Board } from '../gameStyles'
import type { GameScreenProps } from '../types'
import { BottomPlayerArea } from '../components/BottomPlayerArea'
import { CenterInfoArea } from '../components/CenterInfoArea'
import { GameActionArea } from '../components/GameActionArea'
import { OpponentArea } from '../components/OpponentArea'
import { TurnIntroOverlay } from '../components/TurnIntroOverlay'

export function GameBoardLayout(props: GameScreenProps) {
  const { actions } = props

  return (
    <Board>
      <OpponentArea
        game={props.game}
        opponents={props.opponents}
        targetId={props.targetId}
        mustDefend={props.mustDefend}
        isMyTurn={props.isMyTurn}
        needsTarget={props.needsTarget}
        onSelectTarget={actions.setTargetId}
      />
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