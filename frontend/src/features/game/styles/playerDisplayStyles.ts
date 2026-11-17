import styled, { css } from 'styled-components'
import { PlayerName, playerInfoPanelSurface } from './playerInfoStyles'

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

export const OwnIdentity = styled.div<{ $active: boolean }>`
  ${playerInfoPanelSurface}
  transform: scale(1.5);
  transform-origin: left bottom;
  min-width: 0;
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
  width: min(15.6rem, 100%);
  min-width: 0;
`
export const OwnName = styled(PlayerName)`
  grid-area: name;
  width: 100%;
  max-width: 100%;
`
export const PlayerCardFanLayout = styled.div<{ $opponent?: boolean; $left?: number; $top?: number; $width?: number }>`
  position: ${({ $opponent }) => ($opponent ? 'fixed' : 'relative')};
  display: ${({ $opponent }) => ($opponent ? 'block' : 'flex')};
  justify-content: center;
  align-items: flex-start;
  left: ${({ $left, $opponent }) => ($opponent && $left !== undefined ? `${$left}px` : 'auto')};
  top: ${({ $top, $opponent }) => ($opponent && $top !== undefined ? `${$top}px` : 'auto')};
  width: ${({ $width, $opponent }) => ($opponent && $width !== undefined ? `${$width}px` : '100%')};
  height: ${({ $opponent }) => ($opponent ? 'clamp(3.64rem, 4.48vw, 4.34rem)' : 'clamp(2.6rem, 4vh, 3.1rem)')};
  margin-top: ${({ $opponent }) => ($opponent ? 0 : '-0.05rem')};
  ${({ $opponent }) => $opponent && css`
    z-index: 6;
    transform: translateY(-50%);
  `}
  pointer-events: none;
`
export const PlayerShadowShape = styled.div<{ $left: number; $top: number; $height: number }>`
  position: fixed;
  z-index: 1;
  left: ${({ $left }) => `${$left}px`};
  top: ${({ $top }) => `${$top}px`};
  width: clamp(12rem, 18vw, 18rem);
  height: ${({ $height }) => `${$height}px`};
  transform: translateX(-50%);
  border-radius: 50%;
  background: radial-gradient(ellipse 64% 48% at 50% 68%, rgb(0 0 0 / 96%), transparent 78%);
  filter: blur(4px);
  opacity: 0.94;
  pointer-events: none;
  &::before {
    content: '';
    position: absolute;
    z-index: 1;
    left: 32%;
    top: 38%;
    width: 36%;
    height: 17%;
    border-radius: 50%;
    background: rgb(0 0 0 / 100%);
    filter: blur(2px);
  }
  &::after {
    content: '';
    position: absolute;
    left: 10%;
    top: 54%;
    width: 80%;
    height: 84%;
    border-radius: 46% 46% 50% 50% / 18% 18% 58% 58%;
    background: radial-gradient(ellipse at 50% 38%, rgb(0 0 0 / 100%), rgb(0 0 0 / 90%) 72%);
    filter: blur(3px);
  }
`
export const PlayerCardBack = styled.img<{ $index: number; $count: number; $opponent?: boolean }>`
  position: ${({ $opponent }) => ($opponent ? 'absolute' : 'relative')};
  top: ${({ $opponent, $index, $count }) => {
    if (!$opponent) return 'auto'
    const distanceFromCenter = $index - (($count - 1) / 2)
    return `${Math.abs(distanceFromCenter) * 0.1}rem`
  }};
  left: ${({ $opponent, $index, $count }) => {
    if (!$opponent) return 'auto'
    if ($count === 2) return $index === 0 ? '42%' : '58%'
    return $count === 1 ? '50%' : `${($index / ($count - 1)) * 100}%`
  }};
  flex: 0 0 auto;
  z-index: ${({ $index }) => $index};
  width: ${({ $opponent }) => ($opponent ? 'clamp(2.66rem, 3.15vw, 3.22rem)' : 'clamp(1.9rem, 2.25vw, 2.3rem)')};
  height: ${({ $opponent }) => ($opponent ? 'clamp(3.64rem, 4.48vw, 4.34rem)' : 'clamp(2.6rem, 3.2vh, 3.1rem)')};
  margin-left: ${({ $opponent, $index }) => ($opponent || $index === 0 ? 0 : '-1.1rem')};
  border: 1px solid #392719;
  border-radius: 0.28rem;
  box-shadow: 0 2px 3px rgb(0 0 0 / 38%);
  object-fit: cover;
  filter: ${({ $opponent }) => ($opponent ? 'brightness(0.7) drop-shadow(0 3px 5px rgb(0 0 0 / 42%))' : 'none')};
  transform: ${({ $index, $count, $opponent }) => {
    const distanceFromCenter = $index - (($count - 1) / 2)
    const horizontalAnchor = $count === 1 || ($opponent && $count === 2) || ($index > 0 && $index < $count - 1)
      ? '-50%'
      : $index === 0 ? '0%' : '-100%'
    const positionX = $opponent ? `translateX(${horizontalAnchor}) ` : ''
    return `${positionX}translateY(${Math.abs(distanceFromCenter) * 0.14}rem) rotate(${distanceFromCenter * 9}deg)`
  }};
  transform-origin: center bottom;
`
