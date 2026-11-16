import type { GameScreenProps } from '../../types'
import type { CardInfo } from '../../gameUi'
import { ActionButton, ActionChoices, CardEffectText, Choice, ChoiceTitle, Pill, PillRank, Pills, TruthfulDeclarationChoice } from '../../gameStyles'

function getDeclaredEffect(card: CardInfo) {
  switch (card.id) {
    case 'assassin': return '단일 피해 3 ⚔⚔⚔'
    case 'warlock': return '자해 1 💔, 단일 피해 3 ⚔⚔⚔'
    case 'red-dragon': return '광역 피해 2 ⚔⚔'
    case 'archer': return '단일 피해 2 ⚔⚔'
    case 'bomber': return '광역 피해 1 ⚔'
    case 'vampire-king': return '광역 흡혈 1 🌢'
    case 'vampire': return '단일 흡혈 2 🌢🌢'
    case 'alchemist': return '회복 1 ♥, 대상과 교환 ⇄'
    case 'high-priest': return '회복 3 ♥♥♥'
    case 'priest': return '회복 2 ♥♥'
    case 'clown': return '효과 없음 (광대)'
    default: return '카드의 능력을 적용합니다.'
  }
}

function getEffectHint(card: CardInfo, truthful: boolean) {
  const passEffect = getDeclaredEffect(card)
  const challengeEffect = truthful
    ? `상대방이 의심 시: 의심한 플레이어가 피해 2 💔💔, ${passEffect}`
    : '상대방이 의심 시: 선언 무효화, 의심한 플레이어가 나의 체력 2 강탈 💔💔'

  return `상대방이 패스 시: ${passEffect}\n${challengeEffect}`
}

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

  const truthfulDeclarationLabel = selectedCard.id === 'clown'
    ? '광대로 선언 불가: 광대는 거짓말 불가'
    : selectedCard.id === 'wizard'
      ? '마법사로 선언 불가 (마법사는 방어 용도)'
      : selectedCard.id === 'defender'
        ? '방패병으로 선언 불가 (방패병은 방어 용도)'
        : ['vampire-king', 'red-dragon', 'bomber'].includes(selectedCard.id)
          ? `${selectedCard.ko}으로 선언`
          : `${selectedCard.ko}로 선언`

  return (
    <ActionChoices>
      <TruthfulDeclarationChoice>
        <ChoiceTitle>블러핑하지 않기</ChoiceTitle>
        <ActionButton
          type="button"
          onClick={() => actions.setSelectedDeclarationId(selectedCard.id)}
          disabled={selectedCard.id === 'clown' || !eligibleDeclarations.some((card) => card.id === selectedCard.id)}
        >
          {truthfulDeclarationLabel}
        </ActionButton>
      </TruthfulDeclarationChoice>
      <Choice>
        <ChoiceTitle>블러핑하기 · 선언 카드 선택</ChoiceTitle>
        <Pills>
          {eligibleDeclarations.map((card) => {
            const isSameAsHandCard = card.id === selectedCard.id
            return (
              <Pill
                key={card.id}
                type="button"
                $selected={!isSameAsHandCard && selectedDeclarationId === card.id}
                disabled={isSameAsHandCard}
                onClick={() => {
                  actions.setSelectedDeclarationId(card.id)
                  actions.setTargetId(null)
                }}
              >
                <PillRank aria-hidden="true" $selected={selectedDeclarationId === card.id && !isSameAsHandCard}>
                  {14 - card.value}
                </PillRank>
                {card.ko}
              </Pill>
            )
          })}
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
          <CardEffectText role="status">
            {getEffectHint(selectedDeclaration, selectedCard.id === selectedDeclaration.id && selectedCard.id !== 'clown')}
          </CardEffectText>
          <ActionButton type="button" onClick={actions.submitBluff} disabled={needsTarget && !targetId}>
            카드 제출
          </ActionButton>
        </Choice>
      )}
    </ActionChoices>
  )
}
