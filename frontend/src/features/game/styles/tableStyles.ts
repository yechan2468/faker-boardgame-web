import styled, { keyframes } from 'styled-components'
import woodImage from '../../../assets/image/wood.jpg'

const tableGlowDrift = keyframes`
  from { transform: translateX(-4%); }
  to { transform: translateX(4%); }
`

export const PlayField = styled.div`
  --table-counter-tilt: -26deg;
  position: relative;
  z-index: 2;
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
