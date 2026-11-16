import type { GameScreenProps } from '../types'
import { ActionButton, ActionChoices, Choice, ChoiceTitle, Pill, Pills, SecondaryButton } from '../gameStyles'

export function DefenseSelectionPanel({
  game,
  hand,
  selectedHandIndex,
  selectedDefenseType,
  redirectTargetId,
  mustDefend,
  hasDefenderCard,
  hasWizardCard,
  redirectTargets,
  actions,
}: GameScreenProps) {
  if (!mustDefend) return null

  return (
    <ActionChoices>
      <Choice $center>
        <ChoiceTitle>방어 카드 선언</ChoiceTitle>
        <Pills>
          <Pill
            type="button"
            $selected={selectedDefenseType === 'defender'}
            disabled={!hasDefenderCard}
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
            disabled={!hasWizardCard}
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
                  disabled={!hasWizardCard}
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
          disabled={!selectedDefenseType || !hand.includes(selectedDefenseType) || selectedHandIndex === null || (selectedDefenseType === 'wizard' && !redirectTargetId)}
        >
          선택한 카드로 방어
        </ActionButton>
        <SecondaryButton type="button" $danger={!hasDefenderCard && !hasWizardCard} onClick={actions.passDefense}>
          {!hasDefenderCard && !hasWizardCard ? '방어 불가능' : '방어하지 않기'}
        </SecondaryButton>
      </Choice>
    </ActionChoices>
  )
}