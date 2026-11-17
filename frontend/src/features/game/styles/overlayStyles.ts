import styled, { keyframes } from 'styled-components'

const delayedWaitingStatusFade = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`
const personalTimerStatusPulse = keyframes`
  0%, 100% { opacity: 1; filter: blur(0); }
  50% { opacity: 0.62; filter: blur(0.45px); }
`
export const Status = styled.div`
  min-height: 1.8rem;
  color: #fff;
  font-size: 1rem;
  font-weight: 650;
  text-align: center;
  white-space: pre-line;
  &[data-error='true'] { color: #efe2c7; }
  &[data-has-personal-timer='true'] {
    animation: ${personalTimerStatusPulse} 2.4s ease-in-out infinite;
  }
  &[data-waiting-turn-end='true'] {
    opacity: 0;
    animation: ${delayedWaitingStatusFade} 1s ease 2s both,
      ${personalTimerStatusPulse} 2.4s ease-in-out 3s infinite;
  }
  @media (prefers-reduced-motion: reduce) {
    &[data-waiting-turn-end='true'], &[data-has-personal-timer='true'] {
      opacity: 1;
      filter: none;
      animation: none;
    }
  }
`
export const RefreshButton = styled.button`
  display: inline-block;
  margin-left: 0.65rem;
  padding: 0;
  border: 0;
  color: #261e16;
  background: transparent;
  font: inherit;
  font-size: 0.92em;
  font-weight: 800;
  text-decoration: underline;
  cursor: pointer;
  &:disabled { cursor: wait; opacity: 0.55; }
`
export const TurnGlow = keyframes`
  0% { opacity: 0; transform: translate(-50%, -50%) scale(0.94); }
  14% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  76% { opacity: 1; }
  100% { opacity: 0; transform: translate(-50%, -50%) scale(1.04); }
`

export const TurnOverlay = styled.div`
  position: fixed;
  z-index: 9;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #fff;
  font-size: clamp(2rem, 6vw, 4.5rem);
  font-weight: 900;
  text-align: center;
  white-space: nowrap;
  text-shadow: 0 0 1.5rem rgb(201 169 110 / 85%);
  animation: ${TurnGlow} 2s ease both;
  pointer-events: none;
`

export const TurnOrderPreview = styled.div`
  position: fixed;
  z-index: 6;
  right: clamp(1rem, 3vw, 2.5rem);
  bottom: 1rem;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  gap: clamp(0.7rem, 1.8vw, 1.4rem);
  min-width: 0;
  width: max-content;
  max-width: min(65vw, 48rem);
  flex-wrap: wrap;
  @media (max-width: 900px) {
    gap: 0.35rem;
  }
`

export const TurnOrderItem = styled.div<{ $current: boolean }>`
  display: grid;
  justify-items: end;
  gap: 0.1rem;
  min-width: 0;
`

export const TurnOrderLabel = styled.span`
  color: #d8c39e;
  font-size: clamp(0.9rem, 1.3vw, 1.15rem);
  font-weight: 750;
  white-space: nowrap;
`
export const TurnOrderName = styled.div<{ $current: boolean }>`
  max-width: ${({ $current }) => ($current ? '14rem' : '8rem')};
  overflow: hidden;
  color: #fff;
  font-size: ${({ $current }) => ($current ? 'clamp(2rem, 3vw, 2.5rem)' : 'clamp(1.35rem, 2vw, 1.65rem)')};
  font-weight: ${({ $current }) => ($current ? 900 : 700)};
  text-overflow: ellipsis;
  white-space: nowrap;
  @media (max-width: 900px) {
    max-width: ${({ $current }) => ($current ? '9rem' : '6rem')};
    font-size: ${({ $current }) => ($current ? 'clamp(1.35rem, 2.8vw, 1.8rem)' : 'clamp(1rem, 2vw, 1.3rem)')};
  }
`
