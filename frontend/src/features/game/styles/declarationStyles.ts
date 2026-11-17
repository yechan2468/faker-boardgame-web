import styled, { css, keyframes } from 'styled-components'

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

export const sharedCardSurface = css<SharedCardProps>`
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

export const liftSelectedCard = keyframes`
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
