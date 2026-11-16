import type { GameScreenProps } from '../types'
import { DefenseSelectionPanel } from './DefenseSelectionPanel'
import { DefenseWaitingPanel } from './DefenseWaitingPanel'
import { PlayCardActions } from './PlayCardActions'
import { SuspicionPanel } from './SuspicionPanel'

export function GameActionArea(props: GameScreenProps) {
  return (
    <>
      <PlayCardActions {...props} />
      <DefenseWaitingPanel {...props} />
      <SuspicionPanel {...props} />
      <DefenseSelectionPanel {...props} />
    </>
  )
}