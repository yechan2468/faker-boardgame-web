import type { GameScreenProps } from '../../types'
import { ActionButton, ActionChoices, Choice, ChoiceTitle, Pill, Pills, SecondaryButton } from '../../gameStyles'

export function DefenseSelectionPanel({
  selectedHandIndex,
  selectedCard,
  selectedDefenseType,
  redirectTargetId,
  mustDefend,
  redirectTargets,
  actions,
}: GameScreenProps) {
  if (!mustDefend || selectedHandIndex === null || !selectedCard) return null

  return (
    <ActionChoices>
      <Choice $center>
        <ChoiceTitle>방어 카드 선언</ChoiceTitle>
        <Pills>
          <Pill
            type="button"
            $selected={selectedDefenseType === 'defender'}
            onClick={() => {
              actions.setSelectedDefenseType('defender')
              actions.setRedirectTargetId(null)
            }}
          >
            방패병
          </Pill>
          <Pill
            type="button"
            $selected={selectedDefenseType === 'wizard'}
            onClick={() => {
              actions.setSelectedDefenseType('wizard')
              actions.setRedirectTargetId(null)
            }}
          >
            마법사
          </Pill>
        </Pills>
        {selectedDefenseType === 'wizard' && (
          <>
            <ChoiceTitle>반사 대상을 선택하세요.</ChoiceTitle>
            <Pills>
              {redirectTargets.map((player) => (
                <Pill
                  key={player.id}
                  type="button"
                  $selected={redirectTargetId === player.id}
                  onClick={() => actions.setRedirectTargetId(player.id)}
                  aria-pressed={redirectTargetId === player.id}
                >
                  {player.nickname}
                </Pill>
              ))}
            </Pills>
          </>
        )}
        <ActionButton
          type="button"
          onClick={actions.submitDefense}
          disabled={!selectedDefenseType || (selectedDefenseType === 'wizard' && !redirectTargetId)}
        >
          {!selectedDefenseType || selectedCard.id === selectedDefenseType
            ? '선택한 카드로 방어'
            : '방어 카드인 것처럼 속이기'}
        </ActionButton>
        <SecondaryButton type="button" onClick={actions.passDefense}>
          방어하지 않기
        </SecondaryButton>
      </Choice>
    </ActionChoices>
  )
}
