import type { GameScreenProps } from '../types'
import { ActionButton, ActionChoices, Choice, ChoiceTitle, Pill, Pills } from '../gameStyles'

export function PlayCardActions({
  opponents,
  selectedHandIndex,
  selectedDeclarationId,
  targetId,
  selectedCard,
  selectedDeclaration,
  needsTarget,
  eligibleDeclarations,
  canAct,
  actions,
}: GameScreenProps) {
  if (!canAct || !selectedCard) return null

  return (
    <ActionChoices>
      <Choice>
        <ChoiceTitle>블러핑하지 않기</ChoiceTitle>
        <ActionButton
          type="button"
          onClick={() => actions.setSelectedDeclarationId(selectedCard.id)}
          disabled={!eligibleDeclarations.some((card) => card.id === selectedCard.id)}
        >
          {selectedCard.ko}로 선언
        </ActionButton>
      </Choice>
      <Choice>
        <ChoiceTitle>블러핑하기 · 선언 카드 선택</ChoiceTitle>
        <Pills>
          {eligibleDeclarations.filter((card) => card.id !== selectedCard.id).map((card) => (
            <Pill
              key={card.id}
              type="button"
              $selected={selectedDeclarationId === card.id}
              onClick={() => {
                actions.setSelectedDeclarationId(card.id)
                actions.setTargetId(null)
              }}
            >
              {card.ko}
            </Pill>
          ))}
        </Pills>
      </Choice>
      {selectedDeclaration && (
        <Choice style={{ gridColumn: '1 / -1' }}>
          <ChoiceTitle>
            {selectedDeclaration.ko} · {selectedDeclaration.en}
            {needsTarget ? ' — 대상 플레이어를 선택해 주세요.' : ''}
          </ChoiceTitle>
          {needsTarget && (
            <Pills>
              {opponents.filter((player) => player.alive).map((player) => (
                <Pill
                  key={player.id}
                  type="button"
                  $selected={targetId === player.id}
                  onClick={() => actions.setTargetId(player.id)}
                >
                  {player.nickname}
                </Pill>
              ))}
            </Pills>
          )}
          <ActionButton type="button" onClick={actions.submitBluff} disabled={needsTarget && !targetId}>
            카드 제출
          </ActionButton>
        </Choice>
      )}
    </ActionChoices>
  )
}