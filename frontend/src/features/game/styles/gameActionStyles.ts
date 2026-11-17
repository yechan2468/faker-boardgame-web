import styled, { css, keyframes } from 'styled-components'

const actionChoicesRise = keyframes`
  from { opacity: 0.76; transform: translateY(0.55rem); }
  to { opacity: 0.8; transform: translateY(0); }
`
export const GameActionLayer = styled.div`
  position: fixed;
  z-index: 7;
  inset: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 1rem 1rem calc(clamp(13rem, 24vh, 18rem) + 5vh);
  pointer-events: none;
`
export const ActionChoices = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  width: min(100%, 68rem);
  margin: 0;
  padding: 0.85rem;
  border: 1px solid transparent;
  border-radius: 1.25rem;
  background: transparent;
  box-shadow: none;
  pointer-events: auto;
  opacity: 0.8;
  max-height: min(60vh, 38rem);
  overflow-y: auto;
  overscroll-behavior: contain;
  animation: ${actionChoicesRise} 280ms cubic-bezier(0.2, 0.75, 0.25, 1) both;
  @media (prefers-reduced-motion: reduce) { animation: none; }
`

export const GameActionButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.65rem;
  flex-wrap: wrap;
`

export const Choice = styled.div<{ $center?: boolean }>`
  grid-column: ${({ $center }) => ($center ? '1 / -1' : 'auto')};
  justify-self: ${({ $center }) => ($center ? 'center' : 'stretch')};
  width: ${({ $center }) => ($center ? 'min(100%, 28rem)' : 'auto')};
  min-height: 4.3rem;
  padding: 0.7rem 0.85rem;
  border: 1px solid #9b7646;
  border-radius: 0.9rem;
  color: #261e16;
  background: linear-gradient(155deg, #ede3d2, #e3d4b8);
  box-shadow: 0 2px 0 #b8a17a, 0 5px 12px rgb(24 16 10 / 14%);
  text-align: center;
`
const actionEffectExpand = keyframes`
  from {
    max-height: 0;
    min-height: 0;
    padding-top: 0;
    padding-bottom: 0;
    border-width: 0;
    opacity: 0.95;
    transform: translateY(0.55rem);
  }
  to {
    max-height: 40rem;
    min-height: 4.3rem;
    padding-top: 0.7rem;
    padding-bottom: 0.7rem;
    border-width: 1px;
    opacity: 1;
    transform: translateY(0);
  }
`
export const ActionEffectChoice = styled(Choice)<{ $visible: boolean }>`
  grid-column: 1 / -1;
  min-height: ${({ $visible }) => ($visible ? '4.3rem' : '0')};
  max-height: ${({ $visible }) => ($visible ? '40rem' : '0')};
  padding: ${({ $visible }) => ($visible ? '0.7rem 0.85rem' : '0 0.85rem')};
  border-width: ${({ $visible }) => ($visible ? '1px' : '0')};
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transform: translateY(${({ $visible }) => ($visible ? '0' : '0.55rem')});
  visibility: ${({ $visible }) => ($visible ? 'visible' : 'hidden')};
  pointer-events: ${({ $visible }) => ($visible ? 'auto' : 'none')};
  overflow: hidden;
  ${({ $visible }) => $visible && css`
    animation: ${actionEffectExpand} 280ms cubic-bezier(0.2, 0.75, 0.25, 1) both;
  `}
  transition:
    max-height 280ms cubic-bezier(0.2, 0.75, 0.25, 1),
    min-height 280ms cubic-bezier(0.2, 0.75, 0.25, 1),
    padding 280ms cubic-bezier(0.2, 0.75, 0.25, 1),
    border-width 280ms ease,
    opacity 220ms ease,
    transform 280ms cubic-bezier(0.2, 0.75, 0.25, 1),
    visibility 0s linear ${({ $visible }) => ($visible ? '0s' : '280ms')};

  @media (prefers-reduced-motion: reduce) {
    transition: none;
    animation: none;
  }
`
export const TruthfulDeclarationChoice = styled(Choice)`
  display: grid;
  grid-template-rows: auto 1fr;
  justify-items: center;
  align-items: start;

  > button {
    align-self: center;
  }
`
export const ChoiceTitle = styled.div`
  margin-bottom: 0.45rem;
  color: #261e16;
  font-size: 0.78rem;
  font-weight: 750;
`
export const CardEffectText = styled.p`
  margin: 0.6rem auto;
  max-width: 38rem;
  padding: 0.55rem 0.7rem;
  border-radius: 0.65rem;
  color: #2b1c12;
  background: rgb(255 255 255 / 65%);
  font-size: 0.75rem;
  font-weight: 650;
  line-height: 1.45;
  white-space: pre-line;
`
export const Pills = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.35rem;
  flex-wrap: wrap;
`

export const Pill = styled.button.attrs({ 'data-game-sound': 'pill' })<{ $selected?: boolean }>`
  border: 1px solid ${({ $selected }) => ($selected ? '#2b1c12' : '#765535')};
  border-radius: 999px;
  padding: 0.3rem 0.7rem;
  color: ${({ $selected }) => ($selected ? '#fff' : '#261e16')};
  background: ${({ $selected }) => ($selected ? '#3c291a' : '#f4e9d5')};
  box-shadow: 0 1px 0 ${({ $selected }) => ($selected ? '#2b1c12' : '#b8a17a')};
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  &:disabled { cursor: not-allowed; opacity: 0.48; }
`
export const PillRank = styled.sup<{ $selected?: boolean }>`
  margin-right: 0.22rem;
  color: ${({ $selected }) => ($selected ? '#fff' : '#2b1c12')};
  font-family: 'Bodoni MT', 'Didot', Georgia, 'Times New Roman', serif;
  font-size: 0.75em;
  font-weight: 900;
  line-height: 0;
`
export const ActionButton = styled.button`
  border: 1px solid #2b1d14;
  border-radius: 999px;
  padding: 0.4rem 0.9rem;
  color: #fff;
  background: linear-gradient(180deg, #5b3e28, #3c291b);
  box-shadow: 0 2px 0 #2b1d14;
  font-weight: 750;
  cursor: pointer;
  &:hover { background: linear-gradient(180deg, #765235, #3c291b); }
  &:disabled { cursor: not-allowed; opacity: 0.48; }
`
export const TruthfulDeclarationButton = styled(ActionButton).attrs({ 'data-game-sound': 'pill' })<{ $selected?: boolean }>`
  min-height: 2.45rem;
  padding: 0.48rem 1.05rem;
  border-color: ${({ $selected }) => ($selected ? '#2b1c12' : '#765535')};
  color: ${({ $selected }) => ($selected ? '#fff' : '#2b1c12')};
  background: ${({ $selected }) => ($selected
    ? 'linear-gradient(180deg, #765535, #3c291a)'
    : 'linear-gradient(180deg, #fffdf6, #e8d9be)')};
  box-shadow: 0 2px 0 ${({ $selected }) => ($selected ? '#392719' : '#b8a17a')};
  font-size: 0.85rem;
  font-weight: 800;
  &:hover { background: ${({ $selected }) => ($selected
    ? 'linear-gradient(180deg, #8b6a42, #59412a)'
    : 'linear-gradient(180deg, #fffaf0, #f4e9d5)')}; }
`
