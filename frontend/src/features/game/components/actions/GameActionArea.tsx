import { createPortal } from 'react-dom'
import type { GameScreenProps } from '../../types'
import { GameActionLayer } from '../../gameStyles'
import { DefenseSelectionPanel } from './DefenseSelectionPanel'
import { DefenseWaitingPanel } from './DefenseWaitingPanel'
import { PlayCardActions } from './PlayCardActions'
import { SuspicionPanel } from './SuspicionPanel'

export function GameActionArea(props: GameScreenProps) {
  return createPortal(
    <GameActionLayer>
      <PlayCardActions {...props} />
      <DefenseWaitingPanel {...props} />
      <SuspicionPanel {...props} />
      <DefenseSelectionPanel {...props} />
    </GameActionLayer>,
    document.body,
  )
}
