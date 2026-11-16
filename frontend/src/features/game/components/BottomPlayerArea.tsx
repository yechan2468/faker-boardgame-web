import type { GameScreenProps } from '../types'
import {
  BottomArea,
  CardEnglish,
  CardKorean,
  GameCard,
  Hand,
  Hearts,
  OwnIdentity,
  OwnName,
  PlayerHealth,
  TurnOrderItem,
  TurnOrderLabel,
  TurnOrderName,
  TurnOrderPreview,
} from '../gameStyles'
import { getCard } from '../gameUi'
import { CardMascot } from './CardMascot'

export function BottomPlayerArea({ self, hand, selectedHandIndex, turnPreview, actions }: GameScreenProps) {
  return (
    <BottomArea>
      <OwnIdentity>
        <OwnName>{self?.nickname ?? '나'}</OwnName>
        <PlayerHealth $small>
          <span>{self?.health ?? 0}</span>
          <Hearts $small>{'♥'.repeat(Math.max(0, self?.health ?? 0))}</Hearts>
        </PlayerHealth>
      </OwnIdentity>
      <Hand aria-label="내 카드 패">
        {hand.map((cardId, index) => {
          const card = getCard(cardId)
          const cardOccurrence = hand.slice(0, index).filter((id) => id === cardId).length
          return (
            <GameCard
              key={`${cardId}-${cardOccurrence}`}
              type="button"
              $selected={selectedHandIndex === index}
              onClick={() => actions.setSelectedHandIndex(selectedHandIndex === index ? null : index)}
              aria-pressed={selectedHandIndex === index}
              draggable={false}
            >
              <CardMascot cardId={card.id} large />
              <CardKorean>{card.ko}</CardKorean>
              <CardEnglish>{card.en}</CardEnglish>
            </GameCard>
          )
        })}
      </Hand>
      <TurnOrderPreview aria-label="턴 순서">
        {turnPreview.map((player, index) => (
          <TurnOrderItem key={player.id} $current={index === 0}>
            <TurnOrderLabel>
              {index === 0 ? '현재 순서' : index === 1 ? '다음 순서' : `${index}번째 다음`}
            </TurnOrderLabel>
            <TurnOrderName $current={index === 0}>{player.nickname}</TurnOrderName>
          </TurnOrderItem>
        ))}
      </TurnOrderPreview>
    </BottomArea>
  )
}
