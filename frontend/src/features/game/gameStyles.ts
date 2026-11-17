import styled, { css, keyframes } from 'styled-components'
import blackboardImage from '../../assets/image/pexels-blackboard-1846865.jpg'
import woodImage from '../../assets/image/wood.jpg'

export const Page = styled.main`
  position: relative;
  isolation: isolate;
  min-height: 100vh;
  padding: 1rem clamp(1rem, 3vw, 2.5rem) 1.5rem;
  overflow: hidden;
  color: #fff;
  background: #2b1c12;
  &::before {
    content: '';
    position: absolute;
    z-index: -1;
    inset: 0;
    pointer-events: none;
    background: url(${blackboardImage}) center / cover no-repeat;
    filter: brightness(0.4) saturate(0.06);
  }
  &::after {
    content: '';
    position: absolute;
    z-index: -1;
    inset: 0;
    pointer-events: none;
    background: radial-gradient(
      ellipse at center,
      rgb(0 0 0 / 92%) 0%,
      rgb(0 0 0 / 68%) 48%,
      rgb(0 0 0 / 0%) 84%
    );
  }
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
`
export const TopBar = styled.header`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: clamp(0.65rem, 1.5vw, 1.25rem);
  min-height: 5.5rem;
  max-width: 90rem;
  margin: 0 auto 0.75rem;
  @media (max-width: 960px) {
    grid-template-columns: minmax(0, 1fr) auto;
    grid-template-rows: auto auto;
    row-gap: 0.65rem;
    > :nth-child(1) { grid-column: 1; grid-row: 1; }
    > :nth-child(2) { grid-column: 1 / -1; grid-row: 2; }
    > :nth-child(3) { grid-column: 2; grid-row: 1; }
  }
`

export const Brand = styled.div`
  color: #fff;
  font-size: clamp(1.15rem, 2vw, 1.56rem);
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  text-shadow: 0 1px 0 rgb(24 16 10 / 45%);
`
export const MenuButton = styled.button`
  border: 1px solid #9b7646;
  border-radius: 0.75rem;
  padding: 0.55rem 0.9rem;
  color: #261e16;
  background: linear-gradient(180deg, #ede3d2, #e3d4b8);
  box-shadow: 0 2px 0 #735435, 0 4px 8px rgb(24 16 10 / 22%);
  font-weight: 750;
  cursor: pointer;
  &:hover { background: linear-gradient(180deg, #f5efe4, #e7d9c2); }
`
export const Board = styled.section`
  display: grid;
  grid-template-rows: minmax(24.3rem, 3fr) minmax(15.6rem, 1.2fr);
  gap: clamp(0.8rem, 2vh, 1.35rem);
  width: min(100%, 110.5rem);
  min-height: calc(100vh - 9rem);
  margin: 0 auto;
  @media (max-width: 760px) {
    grid-template-rows: minmax(22rem, 2.4fr) minmax(15.6rem, 1.2fr);
  }
  @media (max-height: 850px) {
    grid-template-rows: minmax(21rem, 2.8fr) minmax(15.6rem, 1.2fr);
  }
  @media (max-height: 700px) {
    grid-template-rows: minmax(17rem, 2.4fr) minmax(12rem, 1fr);
  }
`

export const OpponentRow = styled.div<{ $spread?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: ${({ $spread }) => ($spread ? 'space-between' : 'center')};
  gap: clamp(0.4rem, 1.2vw, 1rem);
  flex-wrap: wrap;
  width: 100%;
  min-width: 0;
`
export const OpponentSeat = styled.div`
  position: relative;
  z-index: 7;
  display: grid;
  justify-items: center;
  align-content: start;
  width: 9rem;
`

export const OpponentCard = styled.button<{ $active: boolean; $selected: boolean; $alive: boolean }>`
  width: 9rem;
  min-width: 9rem;
  padding: 0.75rem 1rem;
  border: 1px solid ${({ $selected, $active }) => ($selected ? '#9b7646' : $active ? '#d8c39e' : '#2b1d14')};
  border-radius: 0.9rem;
  color: #fff;
  background: linear-gradient(155deg, #5b3e28, #3c291b);
  text-align: left;
  opacity: ${({ $alive }) => ($alive ? 1 : 0.56)};
  cursor: pointer;
  box-shadow: ${({ $active, $selected }) => ($selected
    ? '0 2px 0 #2b1d14, 0 0 0 2px rgb(201 169 110 / 30%)'
    : $active
      ? '0 2px 0 #2b1c12, 0 0 0 2px rgb(201 169 110 / 34%)'
      : '0 2px 0 #2b1d14, 0 4px 8px rgb(24 16 10 / 22%)')};
`
export const PlayerName = styled.div`
  overflow: hidden;
  color: #fff;
  font-size: 1rem;
  font-weight: 750;
  text-overflow: ellipsis;
  white-space: nowrap;
`
export const PlayerHealth = styled.div<{ $small?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin-top: 0.4rem;
  color: #fff;
  font-size: ${({ $small }) => ($small ? '0.82rem' : '1.1rem')};
  font-weight: 800;
`
export const Hearts = styled.span<{ $small?: boolean }>`
  display: inline-flex;
  gap: 0.12rem;
  color: #fff;
  font-size: ${({ $small }) => ($small ? '0.72rem' : '1rem')};
  letter-spacing: 0.12em;
  text-shadow: 0 1px 0 rgb(255 255 255 / 35%);
`
export const SmallCards = styled.div`
  margin-top: 0.25rem;
  color: #fff;
  font-size: 0.72rem;
`
const tableGlowDrift = keyframes`
  from { transform: translateX(-4%); }
  to { transform: translateX(4%); }
`

export const PlayField = styled.div`
  --table-counter-tilt: -26deg;
  position: relative;
  display: grid;
  place-items: center;
  justify-self: center;
  width: min(110.5%, calc(100vw - clamp(2rem, 6vw, 5rem)), 110.5rem);
  min-height: 24.3rem;
  transform: perspective(900px) rotateX(26deg);
  transform-origin: center bottom;
  transform-style: preserve-3d;
  transition: transform 240ms ease;
  border: 1px solid #9b7646;
  border-radius: 1.4rem;
  background:
    radial-gradient(ellipse 48% 62% at 50% 34%, rgb(255 245 229 / 48%) 0%, rgb(255 174 129 / 24%) 38%, rgb(255 174 129 / 0%) 78%),
    radial-gradient(ellipse at center, rgb(0 0 0 / 0%) 8%, rgb(8 7 8 / 28%) 52%, rgb(4 3 5 / 76%) 100%),
    linear-gradient(rgb(0 0 0 / 58%), rgb(0 0 0 / 58%)),
    url(${woodImage}) center / cover no-repeat;
  box-shadow: inset 0 2px 0 rgb(255 255 255 / 20%), 0 3px 0 #21170f, 0 8px 18px rgb(24 16 10 / 22%);
  &::before {
    content: '';
    position: absolute;
    z-index: -1;
    inset: 0;
    border-radius: inherit;
    background: radial-gradient(ellipse 34% 48% at 50% 42%, rgb(255 226 150 / 18%) 0%, rgb(255 211 100 / 8%) 40%, rgb(255 208 110 / 0%) 78%);
    pointer-events: none;
    animation: ${tableGlowDrift} 42s ease-in-out infinite alternate;
  }
  @media (max-width: 760px) {
    --table-counter-tilt: -18deg;
    width: 100%;
    min-height: 22rem;
    transform: perspective(1100px) rotateX(18deg);
  }
  @media (max-height: 850px) {
    min-height: 21rem;
  }
  @media (max-height: 700px) {
    min-height: 17rem;
  }
  @media (prefers-reduced-motion: reduce) {
    &::before { animation: none; }
  }
`
export const CenterContent = styled.div<{ $hidden: boolean }>`
  display: grid;
  justify-items: center;
  gap: 1.25rem;
  visibility: ${({ $hidden }) => ($hidden ? 'hidden' : 'visible')};
  transform: translateY(-0.75rem) scale(1.3);
  transform-origin: center;
  transition: opacity 220ms ease;
  @media (max-width: 1360px) {
    transform: translateY(-0.75rem) scale(1.08);
  }
  @media (max-width: 1100px) {
    transform: translateY(-0.75rem) scale(1);
  }
  @media (max-width: 760px) {
    transform: translateY(-0.75rem) scale(1);
  }
`

export const TableState = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr) minmax(0, 1fr);
  align-items: center;
  gap: clamp(0.5rem, 2vw, 1.5rem);
  width: min(100%, 64rem);
`

export const Supply = styled.div`
  display: grid;
  justify-items: center;
  align-self: start;
  gap: 0.55rem;
  color: #fff;
  font-size: 0.78rem;
  font-weight: 700;
  text-align: center;
`
export const SupplyValue = styled.div`
  color: #e8d6b8;
  font-size: 2rem;
  font-weight: 850;
  line-height: 1;
  text-shadow: 0 2px 0 #2b1d14;
`
export const SupplyChest = styled.img`
  position: absolute;
  z-index: 20;
  left: calc(50% - min(27.733rem, 43.333%) + var(--chest-x-adjust, 0px));
  top: calc(50% + 1rem);
  width: clamp(12.48rem, 14.3vw, 15.6rem);
  height: clamp(16.12rem, 20.8vh, 20.28rem);
  object-fit: contain;
  filter: brightness(0.7) saturate(0.56) drop-shadow(0 5px 8px rgb(0 0 0 / 34%));
  transform: translate(-50%, -50%) rotateX(var(--table-counter-tilt)) translateZ(6rem);
  transform-origin: center;
  pointer-events: none;
  @media (max-width: 1360px) {
    left: calc(50% - min(23.04rem, 36%) + var(--chest-x-adjust, 0px));
  }
  @media (max-width: 1100px) {
    left: calc(50% - min(21.333rem, 33.333%) + var(--chest-x-adjust, 0px));
  }
`
export const Deck = styled.div`
  display: grid;
  justify-items: center;
  align-self: start;
  gap: 0.55rem;
  color: #fff;
  font-size: 0.78rem;
  font-weight: 700;
  text-align: center;
`
export const DeckCount = styled.div`
  color: #d8c39e;
  font-size: 2rem;
  font-weight: 850;
  line-height: 1;
  text-shadow: 0 2px 0 #3b291b;
`
export const DeckStack = styled.div`
  position: relative;
  width: clamp(4.8rem, 5.5vw, 6rem);
  height: clamp(6.2rem, 8vh, 7.8rem);
  margin-top: 0.05rem;
  perspective: 700px;
`
export const DeckBack = styled.img<{ $layer: number }>`
  position: absolute;
  top: ${({ $layer }) => `${$layer * 0.18}rem`};
  left: ${({ $layer }) => `${$layer * 0.18}rem`};
  z-index: ${({ $layer }) => $layer};
  width: calc(100% - 0.36rem);
  height: calc(100% - 0.36rem);
  border: 2px solid #392719;
  border-radius: 0.55rem;
  box-shadow: 0 2px 0 #21170f, 0 5px 9px rgb(0 0 0 / 34%);
  object-fit: cover;
  transform: rotateY(-5deg) rotateZ(${({ $layer }) => `${($layer - 1) * -2}deg`});
`
export const DeclarationPanel = styled.div`
  display: grid;
  justify-items: center;
  gap: 0.3rem;
  min-width: 0;
  width: 100%;
  text-align: center;
  perspective: 900px;
`

type SharedCardProps = {
  $selected?: boolean
  $truthful?: boolean | null
}

const sharedCardSurface = css<SharedCardProps>`
  position: relative;
  display: grid;
  grid-template-rows: auto auto auto auto;
  align-content: center;
  row-gap: 0.2rem;
  justify-items: center;
  align-items: center;
  width: clamp(6.3rem, 11vw, 8rem);
  height: clamp(8.3rem, 17vh, 11rem);
  padding: 0.55rem 0.45rem 0.65rem;
  border: 2px solid #392719;
  border-radius: 0.8rem;
  color: #261e16;
  isolation: isolate;
  background:
    radial-gradient(ellipse at var(--card-gloss-position, 17% 7%), rgb(255 255 255 / var(--card-gloss-opacity, 58%)) 0%, rgb(255 255 255 / var(--card-gloss-fade-opacity, 20%)) 19%, transparent 42%),
    linear-gradient(145deg, rgb(255 255 255 / 13%) 0%, transparent 38%, rgb(58 39 23 / 9%) 100%),
    linear-gradient(155deg, #fffefa 0%, #f8f4ea 100%);
  box-shadow: ${({ $selected }) => ($selected
    ? '0 3px 0 #1e140d, 0 0 0 2px rgb(201 169 110 / 24%), 0 8px 14px rgb(24 16 10 / 20%), inset var(--card-inner-shadow-x, 0px) var(--card-inner-shadow-y, 8px) var(--card-inner-shadow-blur, 14px) var(--card-inner-shadow-spread, -4px) rgb(0 0 0 / var(--card-inner-shadow-opacity, 0.12)), inset 0 1px 0 rgb(255 255 255 / 72%), inset 0 -2px 0 rgb(30 20 12 / 12%)'
    : '0 3px 0 #1e140d, 0 6px 12px rgb(24 16 10 / 16%), inset var(--card-inner-shadow-x, 0px) var(--card-inner-shadow-y, 8px) var(--card-inner-shadow-blur, 14px) var(--card-inner-shadow-spread, -4px) rgb(0 0 0 / var(--card-inner-shadow-opacity, 0.12)), inset 0 1px 0 rgb(255 255 255 / 72%), inset 0 -2px 0 rgb(30 20 12 / 12%)')};
  &::before {
    content: '';
    position: absolute;
    z-index: 2;
    inset: 0.28rem;
    border: 1px solid #3c291a;
    border-radius: 0.52rem;
    box-shadow: inset 0 0 0 1px rgb(60 42 25 / 22%);
    pointer-events: none;
  }
`

export const CardCornerValue = styled.span<{ $corner: 'top-left' | 'bottom-right'; $value: number }>`
  position: absolute;
  z-index: 3;
  ${({ $corner }) => $corner === 'top-left'
    ? css`top: 0.72rem; left: 0.72rem;`
    : css`right: 0.72rem; bottom: 0.72rem; transform: rotate(180deg);`}
  color: #2b1c12;
  font-family: 'Bodoni MT', 'Didot', Georgia, 'Times New Roman', serif;
  font-size: clamp(1.05rem, 1.6vw, 1.4rem);
  font-variant-numeric: lining-nums;
  font-weight: 900;
  line-height: 0.9;
  text-decoration: ${({ $value }) => ($value === 6 || $value === 9 ? 'underline' : 'none')};
  text-underline-offset: 0.08em;
  text-shadow: 0 1px 0 rgb(255 255 255 / 65%);
  pointer-events: none;
  user-select: none;
`

const liftSelectedCard = keyframes`
  0% { transform: translateY(0) scale(1); }
  55% { transform: translateY(-1.4rem) scale(1.09); }
  78% { transform: translateY(-0.95rem) scale(1.04); }
  100% { transform: translateY(-1.15rem) scale(1.07); }
`

export const DeclarationText = styled.div`
  color: #fff;
  font-size: clamp(0.92rem, 1.5vw, 1.2rem);
  font-weight: 750;
  line-height: 1.3;
`
export const VerdictText = styled.div<{ $truthful: boolean }>`
  color: ${({ $truthful }) => ($truthful ? '#efe2c7' : '#e8d6b8')};
  font-size: clamp(0.82rem, 1.3vw, 1.05rem);
  font-weight: 800;
  line-height: 1.3;
`
const flipCardAway = keyframes`
  from { transform: rotateY(0deg); }
  to { transform: rotateY(90deg); }
`
const flipCardBack = keyframes`
  from { transform: rotateY(90deg); }
  to { transform: rotateY(0deg); }
`
const revealCardWobble = keyframes`
  0% { transform: rotate(0deg) scale(1); }
  12% { transform: rotate(-8deg) scale(1.08); }
  25% { transform: rotate(7deg) scale(0.96); }
  40% { transform: rotate(-6deg) scale(1.06); }
  55% { transform: rotate(5deg) scale(0.98); }
  70% { transform: rotate(-3deg) scale(1.035); }
  85% { transform: rotate(2deg) scale(1.01); }
  100% { transform: rotate(0deg) scale(1); }
`

export const DeclaredCard = styled.div<{
  $truthful: boolean | null
  $previewing?: boolean
  $flipPhase?: 'hide' | 'reveal' | 'wobble' | null
}>`
  ${sharedCardSurface}
  transform-style: preserve-3d;
  backface-visibility: hidden;
  ${({ $previewing }) => $previewing && css`
    transform: translateY(-0.3rem) scale(1.035);
    opacity: 0.6;
    box-shadow: 0 5px 0 #1e140d, 0 12px 20px rgb(24 16 10 / 28%), inset 0 1px 0 rgb(255 255 255 / 72%), inset 0 -2px 0 rgb(30 20 12 / 12%);
  `}
  ${({ $flipPhase }) => $flipPhase === 'hide' && css`
    animation: ${flipCardAway} 220ms cubic-bezier(0.4, 0, 1, 1) forwards;
  `}
  ${({ $flipPhase }) => $flipPhase === 'reveal' && css`
    animation: ${flipCardBack} 220ms cubic-bezier(0, 0, 0.2, 1) forwards;
  `}
  ${({ $flipPhase }) => $flipPhase === 'wobble' && css`
    animation: ${revealCardWobble} 680ms cubic-bezier(0.3, 0, 0.5, 1) both;
  `}
  @media (prefers-reduced-motion: reduce) { animation: none; }
`
export const DeclaredCardName = styled.div`
  color: #2b1c12;
  font-family: 'Noto Serif KR', 'Batang', 'BatangChe', 'Nanum Myeongjo', Georgia, 'Times New Roman', serif;
  font-size: clamp(0.88rem, 1.5vw, 1.15rem);
  font-weight: 900;
  line-height: 1.2;
  transform: translateY(0.25rem);
`
export const DeclaredCardEnglish = styled.div`
  color: #2b1c12;
  font-family: 'Bodoni MT', 'Didot', Georgia, 'Times New Roman', serif;
  font-size: 0.64rem;
  font-weight: 800;
`
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
  0% { opacity: 0; transform: scale(0.94); }
  14% { opacity: 1; transform: scale(1); }
  76% { opacity: 1; }
  100% { opacity: 0; transform: scale(1.04); }
`

export const TurnOverlay = styled.div`
  position: absolute;
  z-index: 3;
  color: #fff;
  font-size: clamp(2rem, 6vw, 4.5rem);
  font-weight: 900;
  text-shadow: 0 0 1.5rem rgb(201 169 110 / 85%);
  animation: ${TurnGlow} 2s ease both;
`

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
export const BottomArea = styled.div`
  position: fixed;
  z-index: 6;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  width: 100vw;
  height: clamp(15.6rem, 28vh, 19rem);
  padding-bottom: 0.6rem;
  pointer-events: none;
`

export const OwnIdentity = styled.div`
  display: grid;
  justify-items: start;
  gap: 0.15rem;
  justify-self: start;
  width: min(9rem, 100%);
  min-width: 0;
  padding: 0.75rem 0.9rem;
  border: 1px solid #2b1d14;
  border-radius: 0.9rem;
  background: linear-gradient(155deg, #5b3e28, #3c291b);
  box-shadow: 0 2px 0 #2b1d14;
`
export const OwnPlayerSeat = styled.div`
  position: fixed;
  z-index: 6;
  left: clamp(1rem, 3vw, 2.5rem);
  bottom: 1rem;
  display: grid;
  justify-items: center;
  align-content: end;
  justify-self: start;
  width: min(9rem, 100%);
  min-width: 0;
`
export const OwnName = styled(PlayerName)`
  width: 100%;
  max-width: 100%;
  font-size: 1.05rem;
`
export const PlayerCardFanLayout = styled.div<{ $opponent?: boolean; $left?: number; $top?: number; $width?: number }>`
  position: ${({ $opponent }) => ($opponent ? 'fixed' : 'relative')};
  display: ${({ $opponent }) => ($opponent ? 'block' : 'flex')};
  justify-content: center;
  align-items: flex-start;
  left: ${({ $left, $opponent }) => ($opponent && $left !== undefined ? `${$left}px` : 'auto')};
  top: ${({ $top, $opponent }) => ($opponent && $top !== undefined ? `${$top}px` : 'auto')};
  width: ${({ $width, $opponent }) => ($opponent && $width !== undefined ? `${$width}px` : '100%')};
  height: ${({ $opponent }) => ($opponent ? 'clamp(5.2rem, 6.4vw, 6.2rem)' : 'clamp(2.6rem, 4vh, 3.1rem)')};
  margin-top: ${({ $opponent }) => ($opponent ? 0 : '-0.05rem')};
  ${({ $opponent }) => $opponent && css`
    z-index: 6;
    transform: translateY(-50%);
  `}
  pointer-events: none;
`
export const PlayerShadowShape = styled.div<{ $left: number; $top: number; $height: number }>`
  position: fixed;
  z-index: 5;
  left: ${({ $left }) => `${$left}px`};
  top: ${({ $top }) => `${$top}px`};
  width: clamp(5rem, 8vw, 8rem);
  height: ${({ $height }) => `${$height}px`};
  transform: translateX(-50%);
  border-radius: 50%;
  background: radial-gradient(ellipse 62% 45% at 50% 68%, rgb(0 0 0 / 50%), transparent 78%);
  filter: blur(14px);
  opacity: 0.52;
  pointer-events: none;
  &::before {
    content: '';
    position: absolute;
    left: 34%;
    top: 2%;
    width: 32%;
    height: 15%;
    border-radius: 50%;
    background: rgb(0 0 0 / 76%);
    filter: blur(9px);
  }
  &::after {
    content: '';
    position: absolute;
    left: 12%;
    top: 14%;
    width: 76%;
    height: 84%;
    border-radius: 43% 43% 50% 50% / 20% 20% 60% 60%;
    background: radial-gradient(ellipse at 50% 38%, rgb(0 0 0 / 78%), rgb(0 0 0 / 48%) 72%);
    filter: blur(12px);
  }
`
export const PlayerCardBack = styled.img<{ $index: number; $count: number; $opponent?: boolean }>`
  position: ${({ $opponent }) => ($opponent ? 'absolute' : 'relative')};
  top: ${({ $opponent, $index, $count }) => {
    if (!$opponent) return 'auto'
    const distanceFromCenter = $index - (($count - 1) / 2)
    return `${Math.abs(distanceFromCenter) * 0.14}rem`
  }};
  left: ${({ $opponent, $index, $count }) => {
    if (!$opponent) return 'auto'
    return $count === 1 ? '50%' : `${($index / ($count - 1)) * 100}%`
  }};
  flex: 0 0 auto;
  z-index: ${({ $index }) => $index};
  width: ${({ $opponent }) => ($opponent ? 'clamp(3.8rem, 4.5vw, 4.6rem)' : 'clamp(1.9rem, 2.25vw, 2.3rem)')};
  height: ${({ $opponent }) => ($opponent ? 'clamp(5.2rem, 6.4vw, 6.2rem)' : 'clamp(2.6rem, 3.2vh, 3.1rem)')};
  margin-left: ${({ $opponent, $index }) => ($opponent || $index === 0 ? 0 : '-1.1rem')};
  border: 1px solid #392719;
  border-radius: 0.28rem;
  box-shadow: 0 2px 3px rgb(0 0 0 / 38%);
  object-fit: cover;
  filter: ${({ $opponent }) => ($opponent ? 'brightness(0.7) drop-shadow(0 3px 5px rgb(0 0 0 / 42%))' : 'none')};
  transform: ${({ $index, $count, $opponent }) => {
    const distanceFromCenter = $index - (($count - 1) / 2)
    const horizontalAnchor = $count === 1 || ($index > 0 && $index < $count - 1)
      ? '-50%'
      : $index === 0 ? '0%' : '-100%'
    const positionX = $opponent ? `translateX(${horizontalAnchor}) ` : ''
    return `${positionX}translateY(${Math.abs(distanceFromCenter) * 0.14}rem) rotate(${distanceFromCenter * 9}deg)`
  }};
  transform-origin: center bottom;
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
export const Hand = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: clamp(0.45rem, 1.7vw, 1.1rem);
  width: max-content;
  max-width: calc(100vw - 2rem);
  min-width: 0;
  padding: 0.6rem 0.5rem 0;
  pointer-events: auto;
  & > button {
    transition: transform 140ms ease, box-shadow 140ms ease, border-color 140ms ease,
      top 320ms cubic-bezier(0.2, 0.75, 0.25, 1), rotate 320ms cubic-bezier(0.2, 0.75, 0.25, 1);
  }
  & > button:first-child {
    position: relative;
    top: 0.35rem;
    rotate: -5deg;
    transform-origin: right bottom;
  }
  & > button:last-child {
    position: relative;
    top: -0.45rem;
    rotate: 5deg;
    transform-origin: left bottom;
  }
  & > button:first-child:last-child {
    top: 0;
    rotate: 0deg;
  }
`

export const CardArtFrame = styled.div<{ $large?: boolean }>`
  display: grid;
  place-items: center;
  width: 100%;
  height: ${({ $large }) => ($large ? 'clamp(4.7rem, 9vh, 5.7rem)' : 'clamp(3.5rem, 6.5vh, 4.1rem)')};
  svg {
    display: block;
    width: 90%;
    height: 90%;
    overflow: visible;
    transform: translateY(-0.55rem);
  }
`
export const CardEffectIcons = styled.span`
  min-height: 1rem;
  color: #2b1c12;
  font-size: clamp(0.78rem, 1.2vw, 0.98rem);
  line-height: 1;
  letter-spacing: 0.04em;
  white-space: nowrap;
  transform: translateY(0.3rem);
`
export const GameCard = styled.button<{ $selected: boolean }>`
  ${sharedCardSurface}
  width: clamp(9rem, 15.6vw, 12rem);
  height: clamp(12rem, 25.2vh, 15.6rem);
  padding: 0.65rem 0.55rem 0.75rem;
  ${CardArtFrame} { height: clamp(5.64rem, 10.8vh, 6.84rem); }
  position: relative;
  z-index: ${({ $selected }) => ($selected ? 2 : 0)};
  transform: ${({ $selected }) => ($selected ? 'translateY(-1.15rem) scale(1.07)' : 'none')};
  ${({ $selected }) => $selected && css`
    box-shadow: 0 4px 0 #1e140d, 0 0 0 3px rgb(201 169 110 / 72%), 0 30px 48px rgb(0 0 0 / 82%), 0 14px 24px rgb(0 0 0 / 54%), inset var(--card-inner-shadow-x, 0px) var(--card-inner-shadow-y, 8px) var(--card-inner-shadow-blur, 14px) var(--card-inner-shadow-spread, -4px) rgb(0 0 0 / var(--card-inner-shadow-opacity, 0.12)), inset 0 1px 0 rgb(255 255 255 / 72%), inset 0 -2px 0 rgb(30 20 12 / 12%);
    animation: ${liftSelectedCard} 260ms cubic-bezier(0.2, 0.8, 0.25, 1) both;
  `}
  cursor: pointer;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  transition: transform 140ms ease, box-shadow 140ms ease, border-color 140ms ease;
  &:hover {
    transform: ${({ $selected }) => ($selected ? 'translateY(-1.15rem) scale(1.07)' : 'translateY(-0.35rem)')};
  }
  @media (max-width: 900px) {
    width: clamp(8rem, 13vw, 9rem);
    height: clamp(10.5rem, 22vh, 12rem);
    ${CardArtFrame} { height: clamp(4.8rem, 9vh, 5.64rem); }
  }
  @media (max-width: 760px) {
    width: clamp(7.5rem, 24vw, 9rem);
    height: clamp(10rem, 28vh, 12rem);
    ${CardArtFrame} { height: clamp(4.7rem, 10vh, 5.64rem); }
  }
  @media (max-height: 700px) {
    height: clamp(8.5rem, 20vh, 10rem);
    ${CardArtFrame} { height: clamp(3.8rem, 8vh, 4.7rem); }
  }
  @media (prefers-reduced-motion: reduce) { animation: none; }
`
export const CardKorean = styled.span`
  color: #2b1c12;
  font-family: 'Noto Serif KR', 'Batang', 'BatangChe', 'Nanum Myeongjo', Georgia, 'Times New Roman', serif;
  font-size: clamp(1rem, 1.7vw, 1.3rem);
  font-weight: 900;
  line-height: 1.2;
  transform: translateY(0.25rem);
`
export const CardEnglish = styled.span`
  color: #2b1c12;
  font-family: 'Bodoni MT', 'Didot', Georgia, 'Times New Roman', serif;
  font-size: 0.72rem;
  font-weight: 800;
`
export const DialogBackdrop = styled.div`
  position: fixed;
  z-index: 2147483647;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgb(24 16 10 / 70%);
  backdrop-filter: blur(5px);
`

export const Dialog = styled.section`
  width: min(100%, 34rem);
  max-height: min(85vh, 42rem);
  overflow: auto;
  padding: 1.4rem;
  border: 1px solid #9b7646;
  border-radius: 1.1rem;
  color: #261e16;
  background: linear-gradient(155deg, #fffaf0, #f2e7d3);
  box-shadow: 0 2px 0 #b8a17a, 0 1.5rem 5rem rgb(24 16 10 / 24%);
  & ${Status} { color: #261e16; }
`
export const DialogHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  h2 { margin: 0; font-size: 1.3rem; }
  button {
    border-color: #2b1c12;
    color: #fff;
    background: linear-gradient(180deg, #5b432e, #3c291a);
    box-shadow: 0 2px 0 #2b1c12;
  }
`

export const LeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.7rem 0.2rem;
  border-bottom: 1px solid rgb(76 58 39 / 18%);
  color: #261e16;
`
export const DialogActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  margin-top: 1.3rem;
`

export const SecondaryButton = styled.button<{ $danger?: boolean }>`
  border: 1px solid ${({ $danger }) => ($danger ? '#2b1d14' : '#765535')};
  border-radius: 0.7rem;
  padding: 0.55rem 0.8rem;
  color: ${({ $danger }) => ($danger ? '#fff' : '#261e16')};
  background: ${({ $danger }) => ($danger ? 'linear-gradient(180deg, #5b3e28, #3c291b)' : 'linear-gradient(180deg, #fffaf0, #e8d9be)')};
  box-shadow: 0 2px 0 ${({ $danger }) => ($danger ? '#2b1d14' : '#b8a17a')};
  cursor: pointer;
  &:disabled { cursor: not-allowed; opacity: 0.5; }
`
export const ResultBanner = styled.div`
  position: absolute;
  top: 1rem;
  left: 50%;
  width: min(90%, 38rem);
  padding: 0.75rem 1rem;
  border: 1px solid #9b7646;
  border-radius: 0.8rem;
  color: #261e16;
  background: linear-gradient(160deg, #fffaf0, #e8d9be);
  box-shadow: 0 2px 0 #b8a17a, 0 6px 12px rgb(24 16 10 / 14%);
  text-align: center;
  transform: translateX(-50%);
`
export const ErrorText = styled.div`
  margin-top: 0.6rem;
  color: #261e16;
  font-size: 0.85rem;
  text-align: center;
`

