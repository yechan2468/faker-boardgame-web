import { getCard } from '../../utils/cardCatalog'
import { getPlayerName } from '../../utils/playerNames'
import type { GameScreenProps } from '../../types'
import { ActionChoices, Choice, ChoiceTitle, Pill, Pills } from '../../gameStyles'

export function DefenseWaitingPanel({ game, mustDefend }: GameScreenProps) {
  const pending = game.pendingAction
  if (!pending || game.turn.phase !== 'DEFENSE' || mustDefend) return null

  return (
    <ActionChoices>
      <Choice $center>
        <ChoiceTitle>공격 대상의 방어 선택을 기다리는 중</ChoiceTitle>
        <Pills>
          {pending.defenses.map((defense) => (
            <Pill key={defense.index} type="button" disabled>
              {getPlayerName(game.players, defense.playerId)}: {getCard(defense.declaredCardId).ko}
            </Pill>
          ))}
          {pending.defensePasses.map((playerId) => {
            const player = game.players.find((candidate) => candidate.id === playerId)
            return (
              <Pill key={playerId} type="button" disabled>
                {getPlayerName(game.players, playerId)}: {player?.cardCount === 0 ? '손패 없음 · 자동 피격' : '방어 안 함'}
              </Pill>
            )
          })}
          {pending.targetIds.filter((playerId) => !pending.defensePasses.includes(playerId)).map((playerId) => (
            <Pill key={playerId} type="button" disabled>
              {getPlayerName(game.players, playerId)}: 선택 대기
            </Pill>
          ))}
        </Pills>
      </Choice>
    </ActionChoices>
  )
}
