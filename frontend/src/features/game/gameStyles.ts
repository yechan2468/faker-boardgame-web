import styled, { css, keyframes } from 'styled-components'

export const Page = styled.main`
  min-height: 100vh;
  padding: 1rem clamp(1rem, 3vw, 2.5rem) 1.5rem;
  overflow: hidden;
  color: #fff;
  background: radial-gradient(ellipse at 50% 28%, #34499a 0%, #29387c 55%, #202d69 100%);
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
  text-shadow: 0 1px 0 rgb(18 25 65 / 45%);
`
export const MenuButton = styled.button`
  border: 1px solid #1ea9e0;
  border-radius: 0.75rem;
  padding: 0.55rem 0.9rem;
  color: #202124;
  background: linear-gradient(180deg, #66d1f2, #1ea9e0);
  box-shadow: 0 2px 0 #147aa3, 0 4px 8px rgb(18 25 65 / 22%);
  font-weight: 750;
  cursor: pointer;
  &:hover { background: linear-gradient(180deg, #83dcf5, #3bb9e7); }
`
export const Board = styled.section`
  display: grid;
  grid-template-rows: minmax(18rem, 2.4fr) minmax(12.5rem, 1.2fr);
  gap: clamp(0.8rem, 2vh, 1.35rem);
  width: min(100%, 90rem);
  min-height: calc(100vh - 9rem);
  margin: 0 auto;
`

export const OpponentRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(0.4rem, 1.2vw, 1rem);
  flex-wrap: wrap;
  min-width: 0;
`

export const OpponentCard = styled.button<{ $active: boolean; $selected: boolean; $alive: boolean }>`
  width: 9rem;
  min-width: 9rem;
  padding: 0.75rem 1rem;
  border: 1px solid ${({ $selected, $active }) => ($selected ? '#1ea9e0' : $active ? '#69d2f1' : '#6e214f')};
  border-radius: 0.9rem;
  color: #fff;
  background: linear-gradient(155deg, #a43d78, #972e67);
  text-align: left;
  opacity: ${({ $alive }) => ($alive ? 1 : 0.56)};
  cursor: pointer;
  box-shadow: ${({ $active, $selected }) => ($selected
    ? '0 2px 0 #6e214f, 0 0 0 2px rgb(30 169 224 / 30%)'
    : $active
      ? '0 2px 0 #202d69, 0 0 0 2px rgb(105 210 241 / 34%)'
      : '0 2px 0 #6e214f, 0 4px 8px rgb(18 25 65 / 22%)')};
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
export const PlayField = styled.div`
  position: relative;
  display: grid;
  place-items: center;
  min-height: 18rem;
  border: 1px solid #1ea9e0;
  border-radius: 1.4rem;
  background: radial-gradient(ellipse at center, #34499a 0%, #29387c 68%, #202d69 100%);
  box-shadow: inset 0 2px 0 rgb(255 255 255 / 20%), 0 3px 0 #192557, 0 8px 18px rgb(18 25 65 / 22%);
`
export const CenterContent = styled.div<{ $hidden: boolean }>`
  display: grid;
  justify-items: center;
  gap: 1.25rem;
  visibility: ${({ $hidden }) => ($hidden ? 'hidden' : 'visible')};
  transform: translateY(-0.75rem);
  transition: opacity 220ms ease;
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
  gap: 0.55rem;
  color: #fff;
  font-size: 0.78rem;
  font-weight: 700;
  text-align: center;
`
export const SupplyValue = styled.div`
  color: #ffc6df;
  font-size: 2rem;
  font-weight: 850;
  line-height: 1;
  text-shadow: 0 2px 0 #6e214f;
`
export const Deck = styled.div`
  display: grid;
  justify-items: center;
  gap: 0.55rem;
  color: #fff;
  font-size: 0.78rem;
  font-weight: 700;
  text-align: center;
`
export const DeckCount = styled.div`
  color: #69d2f1;
  font-size: 2rem;
  font-weight: 850;
  line-height: 1;
  text-shadow: 0 2px 0 #14539a;
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
  border: 2px solid #17234f;
  border-radius: 0.8rem;
  color: #202124;
  isolation: isolate;
  background:
    radial-gradient(ellipse at var(--card-gloss-position, 17% 7%), rgb(255 255 255 / 58%) 0%, rgb(255 255 255 / 20%) 19%, transparent 42%),
    linear-gradient(145deg, rgb(255 255 255 / 13%) 0%, transparent 38%, rgb(20 45 95 / 9%) 100%),
    linear-gradient(155deg, #59c9ec 0%, #1ea9e0 100%);
  box-shadow: ${({ $selected }) => ($selected
    ? '0 3px 0 #111c43, 0 0 0 2px rgb(41 56 124 / 24%), 0 8px 14px rgb(18 25 65 / 20%), inset 0 1px 0 rgb(255 255 255 / 72%), inset 0 -2px 0 rgb(17 28 67 / 12%)'
    : '0 3px 0 #111c43, 0 6px 12px rgb(18 25 65 / 16%), inset 0 1px 0 rgb(255 255 255 / 72%), inset 0 -2px 0 rgb(17 28 67 / 12%)')};
  &::before {
    content: '';
    position: absolute;
    z-index: 2;
    inset: 0.28rem;
    border: 1px solid #29387c;
    border-radius: 0.52rem;
    box-shadow: inset 0 0 0 1px rgb(23 35 79 / 22%);
    pointer-events: none;
  }
`

export const CardCornerValue = styled.span<{ $corner: 'top-left' | 'bottom-right' }>`
  position: absolute;
  z-index: 3;
  ${({ $corner }) => $corner === 'top-left'
    ? css`top: 0.72rem; left: 0.72rem;`
    : css`right: 0.72rem; bottom: 0.72rem; transform: rotate(180deg);`}
  color: #202d69;
  font-family: 'Bodoni MT', 'Didot', Georgia, 'Times New Roman', serif;
  font-size: clamp(1.05rem, 1.6vw, 1.4rem);
  font-variant-numeric: lining-nums;
  font-weight: 900;
  line-height: 0.9;
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
  color: ${({ $truthful }) => ($truthful ? '#bcefff' : '#ffc6df')};
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
    box-shadow: 0 5px 0 #111c43, 0 12px 20px rgb(18 25 65 / 28%), inset 0 1px 0 rgb(255 255 255 / 72%), inset 0 -2px 0 rgb(17 28 67 / 12%);
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
  color: #202d69;
  font-family: 'Noto Serif KR', 'Batang', 'BatangChe', 'Nanum Myeongjo', Georgia, 'Times New Roman', serif;
  font-size: clamp(0.88rem, 1.5vw, 1.15rem);
  font-weight: 900;
  line-height: 1.2;
  transform: translateY(0.25rem);
`
export const DeclaredCardEnglish = styled.div`
  color: #202d69;
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
  &[data-error='true'] { color: #bcefff; }
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
  color: #202124;
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
  text-shadow: 0 0 1.5rem rgb(30 169 224 / 85%);
  animation: ${TurnGlow} 2s ease both;
`

const actionChoicesRise = keyframes`
  from { opacity: 0.95; transform: translateY(0.55rem); }
  to { opacity: 1; transform: translateY(0); }
`
export const ActionChoices = styled.div`
  position: absolute;
  inset: auto 0 1.5rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  width: min(100% - 2rem, 68rem);
  margin: auto;
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
  border: 1px solid #1ea9e0;
  border-radius: 0.9rem;
  color: #202124;
  background: linear-gradient(155deg, #d9f3fb, #bceafa);
  box-shadow: 0 2px 0 #79c6df, 0 5px 12px rgb(18 25 65 / 14%);
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
  color: #202124;
  font-size: 0.78rem;
  font-weight: 750;
`
export const CardEffectText = styled.p`
  margin: 0.6rem auto;
  max-width: 38rem;
  padding: 0.55rem 0.7rem;
  border-radius: 0.65rem;
  color: #202d69;
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
  border: 1px solid ${({ $selected }) => ($selected ? '#202d69' : '#168dbb')};
  border-radius: 999px;
  padding: 0.3rem 0.7rem;
  color: ${({ $selected }) => ($selected ? '#fff' : '#202124')};
  background: ${({ $selected }) => ($selected ? '#29387c' : '#c8effa')};
  box-shadow: 0 1px 0 ${({ $selected }) => ($selected ? '#202d69' : '#79c6df')};
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  &:disabled { cursor: not-allowed; opacity: 0.48; }
`
export const PillRank = styled.sup<{ $selected?: boolean }>`
  margin-right: 0.22rem;
  color: ${({ $selected }) => ($selected ? '#fff' : '#202d69')};
  font-family: 'Bodoni MT', 'Didot', Georgia, 'Times New Roman', serif;
  font-size: 0.75em;
  font-weight: 900;
  line-height: 0;
`
export const ActionButton = styled.button`
  border: 1px solid #6e214f;
  border-radius: 999px;
  padding: 0.4rem 0.9rem;
  color: #fff;
  background: linear-gradient(180deg, #a43d78, #972e67);
  box-shadow: 0 2px 0 #6e214f;
  font-weight: 750;
  cursor: pointer;
  &:hover { background: linear-gradient(180deg, #b54b88, #972e67); }
  &:disabled { cursor: not-allowed; opacity: 0.48; }
`
export const TruthfulDeclarationButton = styled(ActionButton).attrs({ 'data-game-sound': 'pill' })<{ $selected?: boolean }>`
  min-height: 2.45rem;
  padding: 0.48rem 1.05rem;
  border-color: ${({ $selected }) => ($selected ? '#202d69' : '#168dbb')};
  color: ${({ $selected }) => ($selected ? '#fff' : '#202d69')};
  background: ${({ $selected }) => ($selected
    ? 'linear-gradient(180deg, #30a9e0, #29387c)'
    : 'linear-gradient(180deg, #e6f9ff, #bceafa)')};
  box-shadow: 0 2px 0 ${({ $selected }) => ($selected ? '#17234f' : '#79c6df')};
  font-size: 0.85rem;
  font-weight: 800;
  &:hover { background: ${({ $selected }) => ($selected
    ? 'linear-gradient(180deg, #55bce8, #354a9a)'
    : 'linear-gradient(180deg, #f5fcff, #c8effa)')}; }
`
export const BottomArea = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: end;
  gap: clamp(0.5rem, 2vw, 1.5rem);
  width: 100%;
  min-height: 13rem;
`

export const OwnIdentity = styled.div`
  display: grid;
  justify-items: start;
  gap: 0.15rem;
  justify-self: start;
  width: min(9rem, 100%);
  min-width: 0;
  padding: 0.75rem 0.9rem;
  border: 1px solid #6e214f;
  border-radius: 0.9rem;
  background: linear-gradient(155deg, #a43d78, #972e67);
  box-shadow: 0 2px 0 #6e214f;
`
export const OwnName = styled(PlayerName)`
  width: 100%;
  max-width: 100%;
  font-size: 1.05rem;
`

export const TurnOrderPreview = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  gap: clamp(0.7rem, 1.8vw, 1.4rem);
  min-width: 0;
  width: 100%;
  flex-wrap: wrap;
`

export const TurnOrderItem = styled.div<{ $current: boolean }>`
  display: grid;
  justify-items: end;
  gap: 0.1rem;
  min-width: 0;
`

export const TurnOrderLabel = styled.span`
  color: #69d2f1;
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
`
export const Hand = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: clamp(0.45rem, 1.7vw, 1.1rem);
  min-width: 0;
  padding: 0.6rem 0.5rem 0;
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
  color: #202d69;
  font-size: clamp(0.78rem, 1.2vw, 0.98rem);
  line-height: 1;
  letter-spacing: 0.04em;
  white-space: nowrap;
  transform: translateY(0.3rem);
`
export const GameCard = styled.button<{ $selected: boolean }>`
  ${sharedCardSurface}
  width: clamp(7.5rem, 13vw, 10rem);
  height: clamp(10rem, 21vh, 13rem);
  padding: 0.65rem 0.55rem 0.75rem;
  ${CardArtFrame} { height: clamp(4.7rem, 9vh, 5.7rem); }
  position: relative;
  z-index: ${({ $selected }) => ($selected ? 2 : 0)};
  transform: ${({ $selected }) => ($selected ? 'translateY(-1.15rem) scale(1.07)' : 'none')};
  ${({ $selected }) => $selected && css`
    box-shadow: 0 4px 0 #111c43, 0 0 0 3px rgb(105 210 241 / 72%), 0 14px 24px rgb(18 25 65 / 35%), inset 0 1px 0 rgb(255 255 255 / 72%), inset 0 -2px 0 rgb(17 28 67 / 12%);
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
  @media (prefers-reduced-motion: reduce) { animation: none; }
`
export const CardKorean = styled.span`
  color: #202d69;
  font-family: 'Noto Serif KR', 'Batang', 'BatangChe', 'Nanum Myeongjo', Georgia, 'Times New Roman', serif;
  font-size: clamp(1rem, 1.7vw, 1.3rem);
  font-weight: 900;
  line-height: 1.2;
  transform: translateY(0.25rem);
`
export const CardEnglish = styled.span`
  color: #202d69;
  font-family: 'Bodoni MT', 'Didot', Georgia, 'Times New Roman', serif;
  font-size: 0.72rem;
  font-weight: 800;
`
export const DialogBackdrop = styled.div`
  position: fixed;
  z-index: 10;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgb(18 25 65 / 70%);
  backdrop-filter: blur(5px);
`

export const Dialog = styled.section`
  width: min(100%, 34rem);
  max-height: min(85vh, 42rem);
  overflow: auto;
  padding: 1.4rem;
  border: 1px solid #1ea9e0;
  border-radius: 1.1rem;
  color: #202124;
  background: linear-gradient(155deg, #d9f3fb, #c2ebf7);
  box-shadow: 0 2px 0 #79c6df, 0 1.5rem 5rem rgb(18 25 65 / 24%);
  & ${Status} { color: #202124; }
`
export const DialogHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  h2 { margin: 0; font-size: 1.3rem; }
  button {
    border-color: #202d69;
    color: #fff;
    background: linear-gradient(180deg, #3d55a0, #29387c);
    box-shadow: 0 2px 0 #202d69;
  }
`

export const LeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.7rem 0.2rem;
  border-bottom: 1px solid rgb(81 98 120 / 18%);
  color: #202124;
`
export const DialogActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  margin-top: 1.3rem;
`

export const SecondaryButton = styled.button<{ $danger?: boolean }>`
  border: 1px solid ${({ $danger }) => ($danger ? '#6e214f' : '#168dbb')};
  border-radius: 0.7rem;
  padding: 0.55rem 0.8rem;
  color: ${({ $danger }) => ($danger ? '#fff' : '#202124')};
  background: ${({ $danger }) => ($danger ? 'linear-gradient(180deg, #a43d78, #972e67)' : 'linear-gradient(180deg, #d9f3fb, #bceafa)')};
  box-shadow: 0 2px 0 ${({ $danger }) => ($danger ? '#6e214f' : '#79c6df')};
  cursor: pointer;
  &:disabled { cursor: not-allowed; opacity: 0.5; }
`
export const ResultBanner = styled.div`
  position: absolute;
  top: 1rem;
  left: 50%;
  width: min(90%, 38rem);
  padding: 0.75rem 1rem;
  border: 1px solid #1ea9e0;
  border-radius: 0.8rem;
  color: #202124;
  background: linear-gradient(160deg, #d9f3fb, #bceafa);
  box-shadow: 0 2px 0 #79c6df, 0 6px 12px rgb(18 25 65 / 14%);
  text-align: center;
  transform: translateX(-50%);
`
export const ErrorText = styled.div`
  margin-top: 0.6rem;
  color: #202124;
  font-size: 0.85rem;
  text-align: center;
`

