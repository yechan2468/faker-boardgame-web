import type { GameScreenProps } from '../../types'
import {
  ChoiceTitle,
  Dialog,
  DialogActions,
  DialogBackdrop,
  DialogHeader,
  ErrorText,
  LeaderRow,
  MenuButton,
  SecondaryButton,
  Status,
} from '../../gameStyles'

export function GameMenuDialog({
  game,
  self,
  modalOpen,
  hostActionPending,
  modalLeaderboard,
  leaderboardLoading,
  leaderboardError,
  actions,
}: GameScreenProps) {
  if (!modalOpen) return null

  return (
    <DialogBackdrop onMouseDown={(event) => { if (event.target === event.currentTarget) actions.setModalOpen(false) }}>
      <Dialog role="dialog" aria-modal="true" aria-labelledby="menu-title">
        <DialogHeader>
          <h2 id="menu-title">게임 메뉴</h2>
          <MenuButton type="button" onClick={() => actions.setModalOpen(false)}>닫기</MenuButton>
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
            onClick={actions.restartGame}
            disabled={self?.role !== 'HOST' || hostActionPending || game.players.length < 2}
          >
            게임 재시작
          </SecondaryButton>
          <SecondaryButton
            type="button"
            $danger
            onClick={actions.endGame}
            disabled={self?.role !== 'HOST' || hostActionPending}
          >
            게임 종료
          </SecondaryButton>
        </DialogActions>
      </Dialog>
    </DialogBackdrop>
  )
}
