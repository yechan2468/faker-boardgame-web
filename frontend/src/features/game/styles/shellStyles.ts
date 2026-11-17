import styled from 'styled-components'
import blackboardImage from '../../../assets/image/pexels-blackboard-1846865.jpg'


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
    filter: brightness(0.42) saturate(0.06);
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
  position: relative;
  z-index: 3;
  color: #fff;
  font-size: clamp(1.15rem, 2vw, 1.56rem);
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  text-shadow: 0 1px 0 rgb(24 16 10 / 45%);
`
export const MenuButton = styled.button`
  position: relative;
  z-index: 3;
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
