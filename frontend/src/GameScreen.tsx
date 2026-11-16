import type { Dispatch, SetStateAction } from 'react'
import type { GameState, LeaderboardEntry, PublicPlayer } from './types/game'
import { getCard, getPlayerName, type CardInfo, type DeclarationNotice } from './gameUi'
import {
  Page,
  TopBar,
  Brand,
  MenuButton,
  Board,
  OpponentRow,
  OpponentCard,
  PlayerName,
  PlayerHealth,
  Hearts,
  SmallCards,
  PlayField,
  CenterContent,
  TableState,
  Supply,
  SupplyValue,
  Deck,
  DeckCount,
  DeclarationPanel,
  DeclarationText,
  VerdictText,
  DeclaredCard,
  DeclaredCardName,
  DeclaredCardEnglish,
  TurnOverlay,
  ActionChoices,
  GameActionButtons,
  Choice,
  ChoiceTitle,
  Pills,
  Pill,
  ActionButton,
  BottomArea,
  OwnIdentity,
  OwnName,
  TurnOrderPreview,
  TurnOrderItem,
  TurnOrderLabel,
  TurnOrderName,
  Hand,
  GameCard,
  CardKorean,
  CardEnglish,
  DialogBackdrop,
  Dialog,
  DialogHeader,
  LeaderRow,
  DialogActions,
  SecondaryButton,
  ResultBanner,
  ErrorText,
  Status,
} from './App.styles'

type GameScreenActions = {
  setModalOpen: Dispatch<SetStateAction<boolean>>
  setTurnIntro: Dispatch<SetStateAction<boolean>>
  setSelectedDeclarationId: Dispatch<SetStateAction<string | null>>
  setTargetId: Dispatch<SetStateAction<string | null>>
  setSelectedDefenseType: Dispatch<SetStateAction<'defender' | 'wizard' | null>>
  setRedirectTargetId: Dispatch<SetStateAction<string | null>>
  setSelectedHandIndex: Dispatch<SetStateAction<number | null>>
  publish: (destination: string, body: unknown) => void
  startGame: () => void
  restartGame: () => void
  endGame: () => void
  submitTurnEnd: () => void
  submitBluff: () => void
  passSuspicion: () => void
  submitDefense: () => void
  passDefense: () => void
}

type GameScreenProps = {
  game: GameState
  self: PublicPlayer | undefined
  opponents: PublicPlayer[]
  hand: string[]
  selectedHandIndex: number | null
  selectedDeclarationId: string | null
  targetId: string | null
  selectedDefenseType: 'defender' | 'wizard' | null
  redirectTargetId: string | null
  modalOpen: boolean
  errorMessage: string | null
  statusText: string
  turnIntro: boolean
  turnOverlayText: string
  currentTurnId: string | null
  displayedDeclaration: DeclarationNotice | null
  displayedDeclarationLabel: string | null
  displayedCard: CardInfo | null
  hostActionPending: boolean
  isMyTurn: boolean
  selectedCard: CardInfo | null
  selectedDeclaration: CardInfo | null
  needsTarget: boolean
  eligibleDeclarations: readonly CardInfo[]
  canAct: boolean
  mustDefend: boolean
  suspicionPasserNames: string[]
  suspicionWaitingNames: string
  suspicionCardOwnerId: string | undefined
  hasPassedSuspicion: boolean
  hasDefenderCard: boolean
  hasWizardCard: boolean
  redirectTargets: PublicPlayer[]
  turnPreview: PublicPlayer[]
  modalLeaderboard: LeaderboardEntry[]
  leaderboardLoading: boolean
  leaderboardError: string | null
  actions: GameScreenActions
}

export default function GameScreen(props: GameScreenProps) {
  const {
    game, self, opponents, hand, selectedHandIndex, selectedDeclarationId, targetId,
    selectedDefenseType, redirectTargetId, modalOpen, errorMessage, statusText, turnIntro,
    turnOverlayText, currentTurnId, displayedDeclaration, displayedDeclarationLabel, displayedCard,
    hostActionPending, isMyTurn, selectedCard, selectedDeclaration, needsTarget,
    eligibleDeclarations, canAct, mustDefend, suspicionPasserNames, suspicionWaitingNames,
    suspicionCardOwnerId, hasPassedSuspicion, hasDefenderCard, hasWizardCard, redirectTargets,
    turnPreview, modalLeaderboard, leaderboardLoading, leaderboardError, actions,
  } = props
  const {
    setModalOpen, setTurnIntro, setSelectedDeclarationId, setTargetId, setSelectedDefenseType,
    setRedirectTargetId, setSelectedHandIndex, publish, startGame, restartGame, endGame,
    submitTurnEnd, submitBluff, passSuspicion, submitDefense, passDefense,
  } = actions
  const pending = game.pendingAction
  return (
    <Page onContextMenu={(event) => event.preventDefault()} onDragStart={(event) => event.preventDefault()}>
      <TopBar>
        <Brand>Faker Blue</Brand>
        <MenuButton type="button" onClick={() => setModalOpen(true)}>메뉴 · ESC</MenuButton>
      </TopBar>

      <Board>
        <OpponentRow aria-label="상대 플레이어">
          {opponents.map((player) => (
            <OpponentCard
              key={player.id}
              type="button"
              $active={game.turn.activePlayerId === player.id}
              $selected={targetId === player.id}
              $alive={player.alive}
              disabled={mustDefend || !player.alive}
              onClick={() => {
                if (isMyTurn && needsTarget && player.alive) setTargetId(player.id)
              }}
              aria-pressed={targetId === player.id}
            >
              <PlayerName>{player.nickname}</PlayerName>
              <PlayerHealth $small>
                <span>{player.health}</span>
                <Hearts $small>{'♥'.repeat(Math.max(0, player.health))}</Hearts>
              </PlayerHealth>
              <SmallCards>남은 카드 {player.cardCount}장</SmallCards>
            </OpponentCard>
          ))}
        </OpponentRow>

        <PlayField>
          {game.matchResult && game.status === 'LOBBY' && <ResultBanner>{game.matchResult.message}</ResultBanner>}
          <CenterContent $hidden={turnIntro}>
            <TableState>
              <Supply>
                <span>남은 체력 토큰</span>
                <SupplyValue>{game.supplyHealth}</SupplyValue>
              </Supply>
              <DeclarationPanel>
                <DeclarationText>
                  {displayedDeclarationLabel
                    ? displayedDeclarationLabel
                    : '아직 카드 선언이 없습니다.'}
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
                  <ActionButton type="button" onClick={restartGame} disabled={hostActionPending || game.players.length < 2}>
                    {hostActionPending ? '재시작 중...' : '게임 재시작'}
                  </ActionButton>
                  <SecondaryButton type="button" $danger onClick={endGame} disabled={hostActionPending}>
                    게임 종료
                  </SecondaryButton>
                </GameActionButtons>
              ) : (
                <ActionButton type="button" onClick={startGame} disabled={hostActionPending || game.players.length < 2}>
                  {hostActionPending ? '시작 중...' : '게임 시작'}
                </ActionButton>
              )
            )}
            {game.status === 'IN_GAME' && isMyTurn && game.turn.phase === 'RESOLVED' && (
              <ActionButton type="button" onClick={submitTurnEnd}>턴 종료</ActionButton>
            )}
          </CenterContent>
          {turnIntro && (
            <TurnOverlay key={currentTurnId} onAnimationEnd={() => setTurnIntro(false)}>
              {turnOverlayText}
            </TurnOverlay>
          )}

          {canAct && selectedCard && (
            <ActionChoices>
              <Choice>
                <ChoiceTitle>블러핑하지 않기</ChoiceTitle>
                <ActionButton
                  type="button"
                  onClick={() => setSelectedDeclarationId(selectedCard.id)}
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
                      onClick={() => { setSelectedDeclarationId(card.id); setTargetId(null) }}
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
                        <Pill key={player.id} type="button" $selected={targetId === player.id}
                          onClick={() => setTargetId(player.id)}>{player.nickname}</Pill>
                      ))}
                    </Pills>
                  )}
                  <ActionButton type="button" onClick={submitBluff} disabled={needsTarget && !targetId}>
                    카드 제출
                  </ActionButton>
                </Choice>
              )}
            </ActionChoices>
          )}

          {pending && game.turn.phase === 'DEFENSE' && !mustDefend && (
            <ActionChoices>
              <Choice>
                <ChoiceTitle>공격 대상의 방어 선택을 기다리는 중</ChoiceTitle>
                <Pills>
                  {pending.defenses.map((defense) => (
                    <Pill key={defense.index} type="button" disabled>
                      {getPlayerName(game.players, defense.playerId)}: {getCard(defense.declaredCardId).ko}
                    </Pill>
                  ))}
                  {pending.defensePasses.map((playerId) => (
                    <Pill key={playerId} type="button" disabled>
                      {getPlayerName(game.players, playerId)}: 방어 안 함
                    </Pill>
                  ))}
                  {pending.targetIds.filter((playerId) => !pending.defensePasses.includes(playerId)).map((playerId) => (
                    <Pill key={playerId} type="button" disabled>
                      {getPlayerName(game.players, playerId)}: 선택 대기
                    </Pill>
                  ))}
                </Pills>
              </Choice>
            </ActionChoices>
          )}

          {pending && (game.turn.phase === 'SUSPICION' || game.turn.phase === 'DEFENSE_SUSPICION') && self?.alive && (
            <ActionChoices>
              {game.turn.phase === 'DEFENSE_SUSPICION' && pending.defenses.filter((defense) => defense.index === pending.suspicionDefenseIndex).map((defense) => (
                <Choice key={defense.index}>
                  <ChoiceTitle>
                    {getPlayerName(game.players, defense.playerId)}의 {getCard(defense.declaredCardId).ko} 방어
                  </ChoiceTitle>
                  {defense.truthful === null ? (
                    game.viewerId !== defense.playerId && (
                      <ActionButton
                        type="button"
                        onClick={() => publish('/app/game/bluff/challenge', {
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
                      onClick={() => publish('/app/game/bluff/challenge', { challengedPlayerId: pending.actorId })}
                    >
                      의심하기
                    </ActionButton>
                  )}
                {game.viewerId !== suspicionCardOwnerId && (
                  <ActionButton type="button" onClick={passSuspicion} disabled={hasPassedSuspicion}>
                    {hasPassedSuspicion ? '패스 완료 · 다른 플레이어 대기 중' : '패스하기'}
                  </ActionButton>
                )}
              </Choice>
            </ActionChoices>
          )}

          {mustDefend && (
            <ActionChoices>
              <Choice $center>
                <ChoiceTitle>방어 카드 선언</ChoiceTitle>
                <Pills>
                  <Pill
                    type="button"
                    $selected={selectedDefenseType === 'defender'}
                    disabled={!hasDefenderCard}
                    onClick={() => {
                      setSelectedDefenseType('defender')
                      setRedirectTargetId(null)
                    }}
                  >
                    방패병
                  </Pill>
                  <Pill
                    type="button"
                    $selected={selectedDefenseType === 'wizard'}
                    disabled={!hasWizardCard}
                    onClick={() => {
                      setSelectedDefenseType('wizard')
                      setRedirectTargetId(null)
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
                          onClick={() => setRedirectTargetId(player.id)}
                          aria-pressed={redirectTargetId === player.id}
                        >
                          {player.nickname}
                        </Pill>
                      ))}
                    </Pills>
                  </>
                )}
                <ActionButton type="button" onClick={submitDefense} disabled={!selectedDefenseType || !hand.includes(selectedDefenseType) || selectedHandIndex === null || (selectedDefenseType === 'wizard' && !redirectTargetId)}>
                  선택한 카드로 방어
                </ActionButton>
                <SecondaryButton type="button" $danger={!hasDefenderCard && !hasWizardCard} onClick={passDefense}>
                  {!hasDefenderCard && !hasWizardCard ? '방어 불가능' : '방어하지 않기'}
                </SecondaryButton>
              </Choice>
            </ActionChoices>
          )}
        </PlayField>

        <BottomArea>
          <OwnIdentity>
            <OwnName>{self?.nickname ?? '나'}</OwnName>
            <PlayerHealth>
              <span>{self?.health ?? 0}</span>
              <Hearts>{'♥'.repeat(Math.max(0, self?.health ?? 0))}</Hearts>
            </PlayerHealth>
          </OwnIdentity>
          <Hand aria-label="내 카드 패">
            {hand.map((cardId, index) => {
              const card = getCard(cardId)
              const cardOccurrence = hand.slice(0, index).filter((id) => id === cardId).length
              return (
                <GameCard key={`${cardId}-${cardOccurrence}`} type="button" $selected={selectedHandIndex === index}
                  onClick={() => setSelectedHandIndex(selectedHandIndex === index ? null : index)}
                  aria-pressed={selectedHandIndex === index} draggable={false}>
                  <CardKorean>{card.ko}</CardKorean>
                  <CardEnglish>{card.en}</CardEnglish>
                </GameCard>
              )
            })}
          </Hand>
          <TurnOrderPreview aria-label="턴 순서">
            {turnPreview.map((player, index) => (
              <TurnOrderItem key={player.id} $current={index === 0}>
                <TurnOrderLabel>
                  {index === 0 ? '현재 순서' : index === 1 ? '다음 순서' : `${index}번째 다음`}
                </TurnOrderLabel>
                <TurnOrderName $current={index === 0}>{player.nickname}</TurnOrderName>
              </TurnOrderItem>
            ))}
          </TurnOrderPreview>
        </BottomArea>
      </Board>

      {modalOpen && (
        <DialogBackdrop onMouseDown={(event) => { if (event.target === event.currentTarget) setModalOpen(false) }}>
          <Dialog role="dialog" aria-modal="true" aria-labelledby="menu-title">
            <DialogHeader>
              <h2 id="menu-title">게임 메뉴</h2>
              <MenuButton type="button" onClick={() => setModalOpen(false)}>닫기</MenuButton>
            </DialogHeader>
            <ChoiceTitle>접속 플레이어 승리 횟수</ChoiceTitle>
            {leaderboardLoading ? <Status>리더보드를 불러오는 중...</Status> : null}
            {leaderboardError ? <ErrorText>{leaderboardError}</ErrorText> : null}
            {modalLeaderboard.map((entry, index) => (
              <LeaderRow key={entry.id}>
                <span>{index + 1}. {entry.nickname}</span>
                <strong>{entry.wins}승</strong>
              </LeaderRow>
            ))}
            <DialogActions>
              <SecondaryButton
                type="button"
                onClick={restartGame}
                disabled={self?.role !== 'HOST' || hostActionPending || game.players.length < 2}
              >
                게임 재시작
              </SecondaryButton>
              <SecondaryButton
                type="button"
                $danger
                onClick={endGame}
                disabled={self?.role !== 'HOST' || hostActionPending}
              >
                게임 종료
              </SecondaryButton>
            </DialogActions>
          </Dialog>
        </DialogBackdrop>
      )}
    </Page>
  )
}