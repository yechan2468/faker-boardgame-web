import type { GameScreenProps } from '../../types'
import { TurnOrderItem, TurnOrderLabel, TurnOrderName, TurnOrderPreview } from '../../gameStyles'

export function TurnOrderOverlay({ turnPreview }: Pick<GameScreenProps, 'turnPreview'>) {
  return (
    <TurnOrderPreview aria-label="턴 순서" data-card-selection-ignore="true">
      {turnPreview.map((player, index) => (
        <TurnOrderItem key={player.id} $current={index === 0}>
          <TurnOrderLabel>
            {index === 0 ? '현재 순서' : index === 1 ? '다음 순서' : `${index}번째 다음`}
          </TurnOrderLabel>
          <TurnOrderName $current={index === 0}>{player.nickname}</TurnOrderName>
        </TurnOrderItem>
      ))}
    </TurnOrderPreview>
  )
}
