import type { GameState } from '../../types/game'
import { getPlayerName } from './gameUi'
import type { AlchemistResolutionNotice, AttackResolutionNotice, DefenseOutcomeNotice, DefenseResolutionNotice } from './types'

type GameStatusTextOptions = {
  game: GameState | undefined
  isMyTurn: boolean
  mustDefend: boolean
  errorMessage: string | null
  elapsedTurn: string
  elapsedPhase: string
  attackResolutionNotice: AttackResolutionNotice | null
  defenseResolutionNotice: DefenseResolutionNotice | null
  defenseOutcomeNotice: DefenseOutcomeNotice | null
  alchemistResolutionNotice: AlchemistResolutionNotice | null
}

export function getGameStatusText({
  game,
  isMyTurn,
  mustDefend,
  errorMessage,
  elapsedTurn,
  elapsedPhase,
  attackResolutionNotice,
  defenseResolutionNotice,
  defenseOutcomeNotice,
  alchemistResolutionNotice,
}: GameStatusTextOptions) {
  const attackResolutionStatus = attackResolutionNotice
    && game?.status === 'IN_GAME'
    && game.turn.phase === 'RESOLVED'
    && game.turn.activePlayerId === attackResolutionNotice.actorId
    && game.turn.number === attackResolutionNotice.turnNumber
    ? attackResolutionNotice.truthful
      ? `잘못 의심한 ${getPlayerName(game.players, attackResolutionNotice.challengerId)} 님이 체력을 2 💔💔 잃고, 선언한 카드의 능력이 그대로 적용됩니다.`
      : `거짓이 발각되어 ${getPlayerName(game.players, attackResolutionNotice.actorId)} 님이 체력을 2 💔💔 잃고 ${getPlayerName(game.players, attackResolutionNotice.challengerId)} 님이 체력을 2 ❤️❤️ 얻습니다.\n선언한 카드의 능력은 무효화됩니다.`
    : null
  const defenseOutcomeStatus = defenseOutcomeNotice
    && game
    && (game.status === 'IN_GAME' || game.matchResult)
    && game.turn.phase === 'RESOLVED'
    && game.turn.number === defenseOutcomeNotice.turnNumber
    ? [
        defenseOutcomeNotice.handlessPassers.length > 0
          ? `${defenseOutcomeNotice.handlessPassers.map((playerId) => getPlayerName(game.players, playerId)).join(', ')} 님은 손패가 없어 방어하지 못해 체력이 ${defenseOutcomeNotice.damageAmount} 감소합니다.`
          : null,
        defenseOutcomeNotice.passers.filter((playerId) => !defenseOutcomeNotice.handlessPassers.includes(playerId)).length > 0
          ? `${defenseOutcomeNotice.passers.filter((playerId) => !defenseOutcomeNotice.handlessPassers.includes(playerId)).map((playerId) => getPlayerName(game.players, playerId)).join(', ')} 님이 방어를 포기하여 체력이 ${defenseOutcomeNotice.damageAmount} 감소합니다.`
          : null,
        defenseOutcomeNotice.failedDefenders.length > 0
          ? `${defenseOutcomeNotice.failedDefenders.map((playerId) => getPlayerName(game.players, playerId)).join(', ')} 님의 방어가 거짓으로 밝혀져 체력이 ${defenseOutcomeNotice.damageAmount} 감소합니다.`
          : null,
        defenseOutcomeNotice.successfulDefenders.length > 0
          ? `${defenseOutcomeNotice.successfulDefenders.map((playerId) => getPlayerName(game.players, playerId)).join(', ')} 님이 방어에 성공했습니다.`
          : null,
      ].filter((message): message is string => message !== null).join(' ')
    : null
  const alchemistResolutionStatus = alchemistResolutionNotice
    && game?.status === 'IN_GAME'
    && game.turn.phase === 'RESOLVED'
    && game.turn.activePlayerId === alchemistResolutionNotice.actorId
    && game.turn.number === alchemistResolutionNotice.turnNumber
    ? `${getPlayerName(game.players, alchemistResolutionNotice.actorId)} 님이 체력을 1 ❤️ 얻고, ${getPlayerName(game.players, alchemistResolutionNotice.actorId)} 님과 ${getPlayerName(game.players, alchemistResolutionNotice.targetId)} 님의 패가 교환되었습니다.`
    : null
  const defenseResolutionStatus = defenseResolutionNotice
    && game?.status === 'IN_GAME'
    && (game.turn.phase === 'DEFENSE_SUSPICION' || game.turn.phase === 'RESOLVED')
    && game.turn.activePlayerId === defenseResolutionNotice.actorId
    && game.turn.number === defenseResolutionNotice.turnNumber
    ? defenseResolutionNotice.truthful
      ? `잘못 의심한 ${getPlayerName(game.players, defenseResolutionNotice.challengerId)} 님이 체력을 2 💔💔 잃고, ${getPlayerName(game.players, defenseResolutionNotice.defenderId)} 님의 방어 카드 능력이 그대로 적용됩니다.`
      : `거짓이 발각되어 ${getPlayerName(game.players, defenseResolutionNotice.defenderId)} 님이 체력을 2 💔💔 잃고 ${getPlayerName(game.players, defenseResolutionNotice.challengerId)} 님이 체력을 2 ❤️❤️ 얻습니다. 방어 카드의 능력은 무효화됩니다.`
    : null

  return defenseOutcomeStatus
    ?? defenseResolutionStatus
    ?? alchemistResolutionStatus
    ?? attackResolutionStatus
    ?? (errorMessage
      ? errorMessage
      : game?.status !== 'IN_GAME'
        ? game?.matchResult?.message ?? '호스트가 게임을 시작하기를 기다리는 중입니다.'
        : game.turn.phase === 'DEFENSE'
          ? mustDefend && game.pendingAction
            ? `${getPlayerName(game.players, game.pendingAction.actorId)} 님의 공격을 받았습니다. 방어🛡️⮎를 선택하세요. (${elapsedPhase})`
            : `공격 대상들이 방어🛡️⮎를 선택하는 중입니다. (${elapsedPhase})`
          : game.turn.phase === 'SUSPICION'
            ? `의심을 진행 중입니다. (${elapsedPhase})`
            : game.turn.phase === 'DEFENSE_SUSPICION'
              ? `방어 선언을 의심하는 중입니다. (${elapsedPhase})`
              : isMyTurn
                ? '나의 턴입니다'
                : `${game.players.find((player) => player.id === game.turn.activePlayerId)?.nickname ?? '상대'} 님이 턴 진행 중... (${elapsedTurn})`)
}
