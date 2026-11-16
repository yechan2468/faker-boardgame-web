import { getCard, getPlayerName } from '../gameUi'
import type { GameScreenProps } from '../types'
import { ActionButton, ActionChoices, Choice, ChoiceTitle } from '../gameStyles'

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

  return (
    <ActionChoices>
      {game.turn.phase === 'DEFENSE_SUSPICION' && pending.defenses
        .filter((defense) => defense.index === pending.suspicionDefenseIndex)
        .map((defense) => (
          <Choice key={defense.index}>
            <ChoiceTitle>
              {getPlayerName(game.players, defense.playerId)}의 {getCard(defense.declaredCardId).ko} 방어
            </ChoiceTitle>
            {defense.truthful === null ? (
              game.viewerId !== defense.playerId && (
                <ActionButton
                  type="button"
                  onClick={() => actions.publish('/app/game/bluff/challenge', {
                    challengedPlayerId: defense.playerId,
                    defenseIndex: defense.index,
                  })}
                >
                  방어 의심하기
                </ActionButton>
              )
            ) : (
              <ChoiceTitle>
                {defense.truthful ? '진실' : '거짓'} · 실제 카드: {getCard(defense.actualCardId ?? '').ko}
              </ChoiceTitle>
            )}
          </Choice>
        ))}
      <Choice $center>
        <ChoiceTitle>
          {suspicionPasserNames.length > 0
            ? `${suspicionPasserNames.join(', ')} 님이 패스하였습니다. `
            : '아직 패스한 플레이어가 없습니다. '}
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
        {game.viewerId !== suspicionCardOwnerId && (
          <ActionButton type="button" onClick={actions.passSuspicion} disabled={hasPassedSuspicion}>
            {hasPassedSuspicion ? '패스 완료 · 다른 플레이어 대기 중' : '패스하기'}
          </ActionButton>
        )}
      </Choice>
    </ActionChoices>
  )
}