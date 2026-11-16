import styled from 'styled-components'
import { createPortal } from 'react-dom'
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
import { useGameAudio } from '../../audio/GameAudioProvider'

const AudioSection = styled.section`
  display: grid;
  gap: 0.45rem;
  margin: 0.75rem 0;
  padding: 0.7rem 0.8rem;
  border: 1px solid rgb(76 58 39 / 22%);
  border-radius: 0.8rem;
  background: rgb(255 255 255 / 58%);
`

const AudioRow = styled.div`
  display: grid;
  grid-template-columns: minmax(5rem, auto) 2.2rem minmax(7rem, 1fr) 2.8rem;
  align-items: center;
  gap: 0.55rem;
  @media (max-width: 440px) {
    grid-template-columns: minmax(4.5rem, auto) 2.2rem minmax(5rem, 1fr) 2.5rem;
    gap: 0.35rem;
  }
`

const AudioLabel = styled.label`
  color: #2b1c12;
  font-size: 0.82rem;
  font-weight: 750;
`

const MuteButton = styled.button`
  display: grid;
  width: 2.1rem;
  height: 2.1rem;
  place-items: center;
  border: 1px solid #3c291a;
  border-radius: 50%;
  color: #2b1c12;
  background: #fff;
  cursor: pointer;
  &:hover { background: #fffaf0; }
`

const VolumeSlider = styled.input`
  width: 100%;
  margin: 0;
  accent-color: #9b7646;
  cursor: pointer;
`

const VolumeValue = styled.output`
  color: #2b1c12;
  font-size: 0.78rem;
  font-variant-numeric: tabular-nums;
  text-align: right;
`

const MusicTransport = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.55rem;
  margin-top: 0.25rem;
`

const TransportButton = styled.button<{ $active?: boolean }>`
  display: inline-flex;
  min-height: 2.15rem;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 0.35rem 0.7rem;
  border: 1px solid ${({ $active }) => ($active ? '#2b1d14' : '#3c291a')};
  border-radius: 999px;
  color: ${({ $active }) => ($active ? '#fff' : '#2b1c12')};
  background: ${({ $active }) => ($active ? '#3c291b' : '#fffaf0')};
  font: inherit;
  font-size: 0.8rem;
  font-weight: 750;
  cursor: pointer;
  &:hover { background: ${({ $active }) => ($active ? '#5b3e28' : '#f4e9d5')}; }
`

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
  const audio = useGameAudio()
  if (!modalOpen) return null

  return createPortal(
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
        <AudioSection aria-label="음량 설정">
          <ChoiceTitle>음량 설정</ChoiceTitle>
          <AudioRow>
            <AudioLabel htmlFor="music-volume">배경음악</AudioLabel>
            <MuteButton
              type="button"
              aria-label={audio.musicMuted ? '배경음악 음소거 해제' : '배경음악 음소거'}
              title={audio.musicMuted ? '배경음악 음소거 해제' : '배경음악 음소거'}
              onClick={audio.toggleMusicMuted}
            >
              {audio.musicMuted ? '🔇' : '🔊'}
            </MuteButton>
            <VolumeSlider
              id="music-volume"
              type="range"
              min="0"
              max="100"
              value={audio.musicVolume}
              aria-label="배경음악 음량"
              onChange={(event) => audio.setMusicVolume(Number(event.currentTarget.value))}
            />
            <VolumeValue>{audio.musicVolume}%</VolumeValue>
          </AudioRow>
          <AudioRow>
            <AudioLabel htmlFor="effects-volume">효과음</AudioLabel>
            <MuteButton
              type="button"
              aria-label={audio.effectsMuted ? '효과음 음소거 해제' : '효과음 음소거'}
              title={audio.effectsMuted ? '효과음 음소거 해제' : '효과음 음소거'}
              onClick={audio.toggleEffectsMuted}
            >
              {audio.effectsMuted ? '🔇' : '🔊'}
            </MuteButton>
            <VolumeSlider
              id="effects-volume"
              type="range"
              min="0"
              max="100"
              value={audio.effectsVolume}
              aria-label="효과음 음량"
              onChange={(event) => audio.setEffectsVolume(Number(event.currentTarget.value))}
            />
            <VolumeValue>{audio.effectsVolume}%</VolumeValue>
          </AudioRow>
          <MusicTransport aria-label="배경음악 곡 제어">
            <TransportButton type="button" aria-label="이전 곡" title="이전 곡" onClick={audio.previousMusic}>
              ⏮
            </TransportButton>
            <TransportButton
              type="button"
              $active={audio.repeatOne}
              aria-label={audio.repeatOne ? '한 곡 반복 끄기' : '한 곡 반복 켜기'}
              aria-pressed={audio.repeatOne}
              title={audio.repeatOne ? '한 곡 반복 끄기' : '한 곡 반복 켜기'}
              onClick={audio.toggleRepeatOne}
            >
              🔁 <span>한 곡 반복</span>
            </TransportButton>
            <TransportButton type="button" aria-label="다음 곡" title="다음 곡" onClick={audio.nextMusic}>
              ⏭
            </TransportButton>
          </MusicTransport>
        </AudioSection>
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
    </DialogBackdrop>,
    document.body,
  )
}
