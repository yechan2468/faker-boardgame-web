import styled, { css } from 'styled-components'
import { liftSelectedCard, sharedCardSurface } from './declarationStyles'

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
