import type { GameScreenProps } from '../types'
import {
  ActionButton,
  CenterContent,
  Deck,
  DeckCount,
  DeclaredCard,
  DeclaredCardEnglish,
  DeclaredCardName,
  DeclarationPanel,
  DeclarationText,
  GameActionButtons,
  ResultBanner,
  SecondaryButton,
  Status,
  Supply,
  SupplyValue,
  TableState,
  VerdictText,
} from '../gameStyles'

export function CenterInfoArea({
  game,
  self,
  errorMessage,
  statusText,
  turnIntro,
  displayedDeclaration,
  displayedDeclarationLabel,
  displayedCard,
  hostActionPending,
  isMyTurn,
  actions,
}: GameScreenProps) {
  return (
    <>
      {game.matchResult && game.status === 'LOBBY' && <ResultBanner>{game.matchResult.message}</ResultBanner>}
      <CenterContent $hidden={turnIntro}>
        <TableState>
          <Supply>
            <span>남은 체력 토큰</span>
            <SupplyValue>{game.supplyHealth}</SupplyValue>
          </Supply>
          <DeclarationPanel>
            <DeclarationText>
              {displayedDeclarationLabel ? displayedDeclarationLabel : '아직 카드 선언이 없습니다.'}
            </DeclarationText>
            {displayedDeclaration && displayedCard && displayedDeclaration.truthful !== null && (
              <VerdictText $truthful={displayedDeclaration.truthful}>
                {displayedDeclarationLabel}은 {displayedDeclaration.truthful ? '진실' : '거짓'}이었습니다.
              </VerdictText>
            )}
            <DeclaredCard $truthful={displayedDeclaration?.truthful ?? null}>
              <DeclaredCardName>{displayedCard?.ko ?? '선언 대기'}</DeclaredCardName>
              <DeclaredCardEnglish>{displayedCard?.en ?? 'Card Declaration'}</DeclaredCardEnglish>
            </DeclaredCard>
          </DeclarationPanel>
          <Deck>
            <span>남은 카드</span>
            <DeckCount>{game.cardDeckCount}</DeckCount>
          </Deck>
        </TableState>
        <Status data-error={Boolean(errorMessage)}>{statusText}</Status>
        {game.status === 'LOBBY' && self?.role === 'HOST' && (
          game.matchResult ? (
            <GameActionButtons>
              <ActionButton type="button" onClick={actions.restartGame} disabled={hostActionPending || game.players.length < 2}>
                {hostActionPending ? '재시작 중...' : '게임 재시작'}
              </ActionButton>
              <SecondaryButton type="button" $danger onClick={actions.endGame} disabled={hostActionPending}>
                게임 종료
              </SecondaryButton>
            </GameActionButtons>
          ) : (
            <ActionButton type="button" onClick={actions.startGame} disabled={hostActionPending || game.players.length < 2}>
              {hostActionPending ? '시작 중...' : '게임 시작'}
            </ActionButton>
          )
        )}
        {game.status === 'IN_GAME' && isMyTurn && game.turn.phase === 'RESOLVED' && (
          <ActionButton type="button" onClick={actions.submitTurnEnd}>턴 종료</ActionButton>
        )}
      </CenterContent>

    </>
  )
}