import { getCard, getPlayerName } from '../../gameUi'
import type { GameScreenProps } from '../../types'
import { ActionButton, ActionChoices, Choice, ChoiceTitle } from '../../gameStyles'

export function SuspicionPanel(props: GameScreenProps) {
  const {
    game,
    self,
    suspicionPasserNames,
    suspicionWaitingNames,
    suspicionCardOwnerId,
    hasPassedSuspicion,
    actions,
  } = props
  const pending = game.pendingAction
  if (!pending || (game.turn.phase !== 'SUSPICION' && game.turn.phase !== 'DEFENSE_SUSPICION') || !self?.alive) {
    return null
  }
  const activeDefense = game.turn.phase === 'DEFENSE_SUSPICION'
    ? pending.defenses.find((defense) => defense.index === pending.suspicionDefenseIndex)
    : undefined

  return (
    <ActionChoices>
      {activeDefense && activeDefense.truthful !== null && activeDefense.playerId !== game.viewerId && (
        <Choice>
          <ChoiceTitle>
            {getPlayerName(game.players, activeDefense.playerId)}의 {getCard(activeDefense.declaredCardId).ko} 방어
          </ChoiceTitle>
          <ChoiceTitle>
            {activeDefense.truthful ? '진실' : '거짓'} · 실제 카드: {getCard(activeDefense.actualCardId ?? '').ko}
          </ChoiceTitle>
        </Choice>
      )}
      <Choice $center>
        <ChoiceTitle>
          {suspicionPasserNames.length > 0
            ? `${suspicionPasserNames.join(', ')} 님이 신뢰하였습니다. `
            : '아직 신뢰한 플레이어가 없습니다. '}
          <br />
          {suspicionWaitingNames.length > 0
            ? `${suspicionWaitingNames} 님의 선택 대기 중...`
            : '모두 선택했습니다.'}
        </ChoiceTitle>
        {game.turn.phase === 'SUSPICION'
          && pending.attackerTruthful === null
          && game.viewerId !== pending.actorId && (
            <ActionButton
              type="button"
              onClick={() => actions.publish('/app/game/bluff/challenge', { challengedPlayerId: pending.actorId })}
            >
              의심하기
            </ActionButton>
          )}
        {activeDefense && activeDefense.truthful === null && game.viewerId !== activeDefense.playerId && (
          <ActionButton
            type="button"
            onClick={() => actions.publish('/app/game/bluff/challenge', {
              challengedPlayerId: activeDefense.playerId,
              defenseIndex: activeDefense.index,
            })}
          >
            의심하기
          </ActionButton>
        )}
        {game.viewerId !== suspicionCardOwnerId && (
          <ActionButton type="button" onClick={actions.passSuspicion} disabled={hasPassedSuspicion}>
            {hasPassedSuspicion ? '신뢰 완료' : '신뢰하기'}
          </ActionButton>
        )}
      </Choice>
    </ActionChoices>
  )
}
