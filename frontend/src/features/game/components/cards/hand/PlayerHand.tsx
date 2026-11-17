import type { GameScreenProps } from '../../../types'
import { CardCornerValue, CardEffectIcons, CardEnglish, CardKorean, GameCard, Hand } from '../../../gameStyles'
import { getCard, getCardEffectIcons } from '../../../utils/cardCatalog'
import { CardMascot } from '../CardMascot'
import { usePlayerHandController } from './usePlayerHandController'

type PlayerHandProps = Pick<GameScreenProps, 'game' | 'hand' | 'selectedHandIndex' | 'turnIntro' | 'actions'>

export function PlayerHand({ game, hand, selectedHandIndex, turnIntro, actions }: PlayerHandProps) {
  const { handElement, displayHandOrder, getCardEventHandlers } = usePlayerHandController({ game, hand, selectedHandIndex, turnIntro, actions })

  return (
    <Hand
      ref={handElement}
      aria-label="내 카드 패"
    >
      {displayHandOrder.map((index) => {
        const cardId = hand[index]
        const card = getCard(cardId)
        const cardOccurrence = hand.slice(0, index).filter((id) => id === cardId).length
        return (
          <GameCard
            key={`${cardId}-${cardOccurrence}`}
            data-hand-index={index}
            data-card-effect-id={card.id}
            type="button"
            $selected={selectedHandIndex === index}
            {...getCardEventHandlers(index)}
            aria-pressed={selectedHandIndex === index}
            draggable={false}
          >
            <CardCornerValue aria-hidden="true" $corner="top-left" $value={14 - card.value}>{14 - card.value}</CardCornerValue>
            <CardCornerValue aria-hidden="true" $corner="bottom-right" $value={14 - card.value}>{14 - card.value}</CardCornerValue>
            <CardMascot cardId={card.id} large />
            <CardEffectIcons aria-hidden="true">{getCardEffectIcons(card.id)}</CardEffectIcons>
            <CardKorean>{card.ko}</CardKorean>
            <CardEnglish>{card.en}</CardEnglish>
          </GameCard>
        )
      })}
    </Hand>
  )
}
