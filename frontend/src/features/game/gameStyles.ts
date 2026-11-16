import styled, { keyframes } from 'styled-components'

export const Page = styled.main`
  min-height: 100vh;
  padding: 1rem clamp(1rem, 3vw, 2.5rem) 1.5rem;
  overflow: hidden;
  color: #edf5ff;
  background: radial-gradient(ellipse at 50% 38%, #203f69 0%, #122844 48%, #0b172a 100%);
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
`

export const TopBar = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 3rem;
  max-width: 84rem;
  margin: 0 auto;
`

export const Brand = styled.div`
  color: #a8c9f3;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
`

export const MenuButton = styled.button`
  border: 1px solid #57769c;
  border-radius: 0.7rem;
  padding: 0.5rem 0.85rem;
  color: #eaf3ff;
  background: #193352;
  cursor: pointer;
  &:hover { background: #24466f; }
`

export const Board = styled.section`
  display: grid;
  grid-template-rows: minmax(6rem, 0.8fr) minmax(19rem, 2.7fr) minmax(11rem, auto);
  gap: clamp(0.8rem, 2vh, 1.35rem);
  width: min(100%, 84rem);
  min-height: calc(100vh - 5rem);
  margin: 0 auto;
`

export const OpponentRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: clamp(0.6rem, 2vw, 1.5rem);
  flex-wrap: wrap;
`

export const OpponentCard = styled.button<{ $active: boolean; $selected: boolean; $alive: boolean }>`
  min-width: 9rem;
  padding: 0.75rem 1rem;
  border: 1px solid ${({ $active, $selected }) => ($active || $selected ? '#80bcff' : '#385574')};
  border-radius: 0.85rem;
  color: ${({ $alive }) => ($alive ? '#eff6ff' : '#8190a2')};
  background: ${({ $active }) => ($active ? 'rgb(50 105 161 / 42%)' : 'rgb(13 31 51 / 80%)')};
  text-align: left;
  opacity: ${({ $alive }) => ($alive ? 1 : 0.5)};
  cursor: pointer;
  box-shadow: ${({ $active }) => ($active ? '0 0 1.2rem rgb(71 158 255 / 24%)' : 'none')};
`

export const PlayerName = styled.div`
  overflow: hidden;
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
  color: #62b5ff;
  font-size: ${({ $small }) => ($small ? '0.82rem' : '1.1rem')};
  font-weight: 800;
`

export const Hearts = styled.span<{ $small?: boolean }>`
  display: inline-flex;
  gap: 0.12rem;
  color: #4ea9ff;
  font-size: ${({ $small }) => ($small ? '0.72rem' : '1rem')};
  letter-spacing: -0.08em;
`

export const SmallCards = styled.div`
  margin-top: 0.25rem;
  color: #a9b9ce;
  font-size: 0.72rem;
`

export const PlayField = styled.div`
  position: relative;
  display: grid;
  place-items: center;
  min-height: 19rem;
  border: 1px solid rgb(147 184 222 / 12%);
  border-radius: 1.5rem;
  background: radial-gradient(ellipse at center, rgb(46 82 122 / 38%), rgb(11 25 42 / 10%) 70%);
`

export const CenterContent = styled.div<{ $hidden: boolean }>`
  display: grid;
  justify-items: center;
  gap: 1.25rem;
  visibility: ${({ $hidden }) => ($hidden ? 'hidden' : 'visible')};
  transition: opacity 220ms ease;
`

export const TableState = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr) minmax(0, 1fr);
  align-items: center;
  gap: clamp(0.5rem, 2vw, 1.5rem);
  width: min(100%, 52rem);
`

export const Supply = styled.div`
  display: grid;
  justify-items: center;
  gap: 0.55rem;
  color: #91a7c3;
  font-size: 0.78rem;
  text-align: center;
`

export const SupplyValue = styled.div`
  color: #62b5ff;
  font-size: 2rem;
  font-weight: 850;
  line-height: 1;
`

export const Deck = styled.div`
  display: grid;
  justify-items: center;
  gap: 0.55rem;
  color: #c3d6ed;
  font-size: 0.78rem;
  text-align: center;
`

export const DeckCount = styled.div`
  color: #f6fbff;
  font-size: 2rem;
  font-weight: 850;
  line-height: 1;
`

export const DeclarationPanel = styled.div`
  display: grid;
  justify-items: center;
  gap: 0.3rem;
  min-width: 0;
  width: 100%;
  text-align: center;
`

export const DeclarationText = styled.div`
  color: #edf6ff;
  font-size: clamp(0.92rem, 1.5vw, 1.2rem);
  font-weight: 750;
  line-height: 1.3;
`

export const VerdictText = styled.div<{ $truthful: boolean }>`
  color: ${({ $truthful }) => ($truthful ? '#8fe0a5' : '#ff9a9a')};
  font-size: clamp(0.82rem, 1.3vw, 1.05rem);
  font-weight: 800;
  line-height: 1.3;
`

export const DeclaredCard = styled.div<{ $truthful: boolean | null }>`
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 0.35rem;
  width: clamp(6.3rem, 11vw, 8rem);
  height: clamp(8.3rem, 17vh, 11rem);
  padding: 0.6rem;
  border: 2px solid ${({ $truthful }) => ($truthful === null ? '#b8d8f6' : $truthful ? '#8fe0a5' : '#ff9a9a')};
  border-radius: 0.75rem;
  color: #172b42;
  background: linear-gradient(155deg, #f7f7ee, #cedbea);
  box-shadow: 0 0.65rem 1.4rem rgb(0 0 0 / 35%);
`

export const DeclaredCardName = styled.div`
  color: #172b42;
  font-size: clamp(1.2rem, 1.8vw, 1.55rem);
  font-weight: 900;
  line-height: 1.15;
`

export const DeclaredCardEnglish = styled.div`
  color: #61768d;
  font-size: 0.72rem;
  font-weight: 700;
`

export const Status = styled.div`
  min-height: 1.8rem;
  color: #d7e8fb;
  font-size: 1rem;
  font-weight: 650;
  text-align: center;
  &[data-error='true'] { color: #ffcf9c; }
`

export const RefreshButton = styled.button`
  display: inline-block;
  margin-left: 0.65rem;
  padding: 0;
  border: 0;
  color: #8dc2ff;
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
  color: #d6edff;
  font-size: clamp(2rem, 6vw, 4.5rem);
  font-weight: 900;
  text-shadow: 0 0 2rem rgb(73 168 255 / 65%);
  animation: ${TurnGlow} 2s ease both;
`

export const ActionChoices = styled.div`
  position: absolute;
  inset: auto 0 1rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  width: min(100% - 2rem, 58rem);
  margin: auto;
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
  padding: 0.65rem 0.8rem;
  border: 1px solid #45698e;
  border-radius: 0.9rem;
  background: rgb(7 20 35 / 82%);
  text-align: center;
`

export const ChoiceTitle = styled.div`
  margin-bottom: 0.45rem;
  color: #a8c9e9;
  font-size: 0.78rem;
  font-weight: 700;
`

export const Pills = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.35rem;
  flex-wrap: wrap;
`

export const Pill = styled.button<{ $selected?: boolean }>`
  border: 1px solid ${({ $selected }) => ($selected ? '#8ec7ff' : '#4b6380')};
  border-radius: 999px;
  padding: 0.25rem 0.65rem;
  color: ${({ $selected }) => ($selected ? '#eff8ff' : '#c6d5e7')};
  background: ${({ $selected }) => ($selected ? '#285a8d' : '#172b43')};
  font-size: 0.75rem;
  cursor: pointer;
  &:disabled { cursor: not-allowed; opacity: 0.42; }
`

export const ActionButton = styled.button`
  border: 1px solid #74b7f5;
  border-radius: 999px;
  padding: 0.35rem 0.8rem;
  color: white;
  background: #24629d;
  font-weight: 700;
  cursor: pointer;
  &:disabled { cursor: not-allowed; opacity: 0.42; }
`

export const BottomArea = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: end;
  gap: clamp(0.5rem, 2vw, 1.5rem);
  width: 100%;
  min-height: 11rem;
`

export const OwnIdentity = styled.div`
  display: grid;
  justify-items: start;
  gap: 0.15rem;
`

export const OwnName = styled(PlayerName)`
  font-size: 1.05rem;
`

export const TurnOrderPreview = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  gap: clamp(0.5rem, 1.5vw, 1.2rem);
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
  color: #94b9df;
  font-size: 0.62rem;
  font-weight: 700;
  white-space: nowrap;
`

export const TurnOrderName = styled.div<{ $current: boolean }>`
  max-width: 8rem;
  overflow: hidden;
  color: ${({ $current }) => ($current ? '#ffffff' : '#c6d9ef')};
  font-size: ${({ $current }) => ($current ? '1.25rem' : '0.82rem')};
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

export const GameCard = styled.button<{ $selected: boolean }>`
  display: grid;
  align-content: space-between;
  width: clamp(6.3rem, 11vw, 8rem);
  height: clamp(8.3rem, 17vh, 11rem);
  padding: 0.8rem 0.45rem;
  border: 2px solid ${({ $selected }) => ($selected ? '#77c5ff' : '#a1bad3')};
  border-radius: 0.8rem;
  color: #172b42;
  background: linear-gradient(155deg, #f7f7ee, #cedbea);
  box-shadow: ${({ $selected }) => ($selected ? '0 0 1.2rem #59b4ff, 0 0 0 3px rgb(89 180 255 / 25%)' : '0 0.5rem 1rem rgb(0 0 0 / 28%)')};
  transform: ${({ $selected }) => ($selected ? 'translateY(-0.55rem)' : 'none')};
  cursor: pointer;
  transition: transform 140ms ease, box-shadow 140ms ease, border-color 140ms ease;
  &:hover { transform: translateY(-0.45rem); }
`

export const CardKorean = styled.span`
  font-size: clamp(0.88rem, 1.5vw, 1.15rem);
  font-weight: 850;
  line-height: 1.25;
`

export const CardEnglish = styled.span`
  color: #61768d;
  font-size: 0.66rem;
  font-weight: 650;
`

export const DialogBackdrop = styled.div`
  position: fixed;
  z-index: 10;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgb(3 9 17 / 72%);
  backdrop-filter: blur(5px);
`

export const Dialog = styled.section`
  width: min(100%, 34rem);
  max-height: min(85vh, 42rem);
  overflow: auto;
  padding: 1.4rem;
  border: 1px solid #54769a;
  border-radius: 1.1rem;
  background: #142943;
  box-shadow: 0 1.5rem 5rem rgb(0 0 0 / 45%);
`

export const DialogHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  h2 { margin: 0; font-size: 1.3rem; }
`

export const LeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.7rem 0.2rem;
  border-bottom: 1px solid rgb(183 211 241 / 12%);
  color: #dceafd;
`

export const DialogActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  margin-top: 1.3rem;
`

export const SecondaryButton = styled.button<{ $danger?: boolean }>`
  border: 1px solid ${({ $danger }) => ($danger ? '#e07982' : '#526b89')};
  border-radius: 0.7rem;
  padding: 0.55rem 0.8rem;
  color: ${({ $danger }) => ($danger ? '#fff0f0' : '#d8e6f7')};
  background: ${({ $danger }) => ($danger ? '#71303b' : '#1b3553')};
  cursor: pointer;
  &:disabled { cursor: not-allowed; opacity: 0.5; }
`

export const ResultBanner = styled.div`
  position: absolute;
  top: 1rem;
  left: 50%;
  width: min(90%, 38rem);
  padding: 0.7rem 1rem;
  border: 1px solid #9ecfff;
  border-radius: 0.8rem;
  color: #f2f8ff;
  background: rgb(23 60 96 / 94%);
  text-align: center;
  transform: translateX(-50%);
`

export const ErrorText = styled.div`
  margin-top: 0.6rem;
  color: #ffd0a0;
  font-size: 0.85rem;
  text-align: center;
`

