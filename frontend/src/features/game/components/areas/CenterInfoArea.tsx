import { useLayoutEffect, useRef, useState, type AnimationEvent } from 'react'
import type { GameScreenProps } from '../../types'
import {
  ActionButton,
  CardCornerValue,
  CardEffectIcons,
  CenterContent,
  Deck,
  DeckBack,
  DeckCount,
  DeckStack,
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
  SupplyChest,
  SupplyValue,
  TableState,
  VerdictText,
} from '../../gameStyles'
import { CardMascot } from '../cards/CardMascot'
import { getCard, getCardEffectIcons, type DeclarationNotice } from '../../gameUi'
import { useGameAudio } from '../../audio/GameAudioProvider'
import cardBackImage from '../../../../assets/image/card-back.jpg'
import chestImage from '../../../../assets/image/chest.png'

export function CenterInfoArea({
  game,
  self,
  errorMessage,
  statusText,
  waitingForTurnEnd,
  turnIntro,
  displayedDeclaration,
  displayedDeclarationLabel,
  displayedCard,
  selectedCard,
  hostActionPending,
  isMyTurn,
  actions,
}: GameScreenProps) {
  const { playSound } = useGameAudio()
  const [visibleCardId, setVisibleCardId] = useState(displayedCard?.id ?? null)
  const [flipPhase, setFlipPhase] = useState<'hide' | 'reveal' | 'wobble' | null>(null)
  const previousDeclaration = useRef<DeclarationNotice | null>(null)

  useLayoutEffect(() => {
    const updateChestAlignment = () => {
      const supplyLabel = document.querySelector<HTMLElement>('[data-health-supply-label]')
      const chest = document.querySelector<HTMLElement>('[data-supply-chest]')
      if (!supplyLabel || !chest || chest.offsetWidth === 0) return

      const labelRect = supplyLabel.getBoundingClientRect()
      const chestRect = chest.getBoundingClientRect()
      const screenDelta = labelRect.left + labelRect.width / 2 - (chestRect.left + chestRect.width / 2)
      const horizontalScale = chestRect.width / chest.offsetWidth
      if (Math.abs(screenDelta) < 0.25 || horizontalScale === 0) return
      const currentAdjustment = Number.parseFloat(chest.style.getPropertyValue('--chest-x-adjust')) || 0
      chest.style.setProperty('--chest-x-adjust', `${currentAdjustment + screenDelta / horizontalScale}px`)
    }

    updateChestAlignment()
    const supplyLabel = document.querySelector<HTMLElement>('[data-health-supply-label]')
    const table = document.querySelector<HTMLElement>('[data-card-dropzone="center"]')
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(updateChestAlignment)
    if (supplyLabel) observer?.observe(supplyLabel)
    if (table) observer?.observe(table)
    window.addEventListener('resize', updateChestAlignment)
    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', updateChestAlignment)
    }
  }, [game.cardDeckCount])

  useLayoutEffect(() => {
    const previous = previousDeclaration.current
    previousDeclaration.current = displayedDeclaration

    if (!displayedDeclaration) {
      setVisibleCardId(null)
      setFlipPhase(null)
      return
    }

    const shouldFlipToActualCard = Boolean(
      displayedDeclaration.truthful === false
      && displayedDeclaration.actualCardId
      && displayedDeclaration.actualCardId !== displayedDeclaration.declaredCardId
      && previous?.playerId === displayedDeclaration.playerId
      && previous.declaredCardId === displayedDeclaration.declaredCardId
      && previous.truthful === null,
    )
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (shouldFlipToActualCard) playSound('cardFlip')
    if (shouldFlipToActualCard && !reduceMotion) {
      setVisibleCardId(displayedDeclaration.declaredCardId)
      setFlipPhase('hide')
      return
    }

    setVisibleCardId(
      displayedDeclaration.truthful === false && displayedDeclaration.actualCardId
        ? displayedDeclaration.actualCardId
        : displayedDeclaration.declaredCardId,
    )
    setFlipPhase(null)
  }, [
    displayedDeclaration?.playerId,
    displayedDeclaration?.declaredCardId,
    displayedDeclaration?.truthful,
    displayedDeclaration?.actualCardId,
    playSound,
  ])

  const handleFlipAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return
    if (flipPhase === 'hide' && displayedDeclaration?.actualCardId) {
      setVisibleCardId(displayedDeclaration.actualCardId)
      setFlipPhase('reveal')
    } else if (flipPhase === 'reveal') {
      playSound('revealImpact')
      setFlipPhase('wobble')
    } else if (flipPhase === 'wobble') {
      setFlipPhase(null)
    }
  }
  const visibleCard = visibleCardId ? getCard(visibleCardId) : null
  const previewCard = displayedDeclaration ? visibleCard : selectedCard
  const actualCardName = displayedDeclaration?.truthful === false
    ? displayedDeclaration.actualCardId && displayedDeclaration.actualCardId !== displayedDeclaration.declaredCardId
      ? getCard(displayedDeclaration.actualCardId).ko
      : visibleCard && visibleCard.id !== displayedDeclaration.declaredCardId
        ? visibleCard.ko
        : null
    : null

  return (
    <>
      {game.matchResult && game.status === 'LOBBY' && <ResultBanner>{game.matchResult.message}</ResultBanner>}
      <CenterContent $hidden={turnIntro} data-center-content="true">
        <TableState>
          <Supply>
            <span data-health-supply-label="true">남은 체력 토큰</span>
            <SupplyValue data-health-supply="true">{game.supplyHealth}</SupplyValue>
          </Supply>
          <DeclarationPanel>
            <DeclarationText>
              {displayedDeclarationLabel ?? '아직 카드 선언이 되지 않았습니다.'}
            </DeclarationText>
            {displayedDeclaration && displayedCard && displayedDeclaration.truthful !== null && (
              <VerdictText $truthful={displayedDeclaration.truthful}>
                {displayedDeclarationLabel}은 {displayedDeclaration.truthful ? '진실' : '거짓'}이었습니다.<br/>{actualCardName ? `(실제: ${actualCardName})` : ''}
              </VerdictText>
            )}
            <DeclaredCard
              data-declared-card="true"
              data-card-effect-id={previewCard?.id}
              $truthful={displayedDeclaration?.truthful ?? null}
              $previewing={!displayedDeclaration && Boolean(selectedCard)}
              $flipPhase={flipPhase}
              onAnimationEnd={handleFlipAnimationEnd}
            >
              {previewCard && (
                <>
                  <CardCornerValue aria-hidden="true" $corner="top-left" $value={14 - previewCard.value}>{14 - previewCard.value}</CardCornerValue>
                  <CardCornerValue aria-hidden="true" $corner="bottom-right" $value={14 - previewCard.value}>{14 - previewCard.value}</CardCornerValue>
                </>
              )}
              {previewCard && <CardMascot cardId={previewCard.id} />}
              {previewCard && <CardEffectIcons aria-hidden="true">{getCardEffectIcons(previewCard.id)}</CardEffectIcons>}
              <DeclaredCardName>{previewCard?.ko ?? '선언 대기'}</DeclaredCardName>
              <DeclaredCardEnglish>{previewCard?.en ?? 'Card Declaration'}</DeclaredCardEnglish>
            </DeclaredCard>
          </DeclarationPanel>
          <Deck>
            <span>남은 카드</span>
            <DeckCount>{game.cardDeckCount}</DeckCount>
            {game.cardDeckCount > 0 && (
              <DeckStack data-deck-source="true" aria-hidden="true">
                {[0, 1, 2].map((layer) => (
                  <DeckBack key={layer} src={cardBackImage} alt="" $layer={layer} draggable={false} />
                ))}
              </DeckStack>
            )}
          </Deck>
        </TableState>
        <Status
          data-error={Boolean(errorMessage)}
          data-has-personal-timer={!errorMessage && /\((?:\d+|\d{2}:\d{2})\)$/.test(statusText)}
          data-waiting-turn-end={waitingForTurnEnd}
        >
          {statusText}
        </Status>
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
      <SupplyChest data-supply-chest="true" src={chestImage} alt="" aria-hidden="true" draggable={false} />

    </>
  )
}
