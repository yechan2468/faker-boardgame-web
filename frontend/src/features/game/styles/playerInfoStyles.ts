import styled, { css } from 'styled-components'
import velvetImage from '../../../assets/image/velvet.jpg'

export const OpponentRow = styled.div<{ $spread?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: ${({ $spread }) => ($spread ? 'space-evenly' : 'center')};
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
  width: 15.6rem;
`

type PlayerInfoPanelProps = { $active: boolean; $selected?: boolean }

export const playerInfoPanelSurface = css<PlayerInfoPanelProps>`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  grid-template-areas: 'name name' 'health hearts' 'health cards';
  align-items: center;
  column-gap: 0.65rem;
  row-gap: 0.18rem;
  width: 15.6rem;
  padding: 0.75rem 1rem;
  border: 1px solid ${({ $selected, $active }) => ($selected ? '#d38a9c' : $active ? '#ead3d9' : '#451523')};
  border-radius: 0.9rem;
  color: #fff;
  background: linear-gradient(155deg, rgb(38 5 18 / 32%), rgb(17 0 7 / 58%)), url(${velvetImage}) center / cover no-repeat;
  text-align: left;
  box-shadow: ${({ $active, $selected }) => ($selected
    ? '0 2px 0 #2b1d14, 0 0 0 2px rgb(201 169 110 / 30%)'
    : $active
      ? '0 2px 0 #2b1c12, 0 0 0 2px rgb(201 169 110 / 34%)'
      : '0 2px 0 #2b1d14, 0 4px 8px rgb(24 16 10 / 22%)')};
`

export const OpponentCard = styled.button<{ $active: boolean; $selected: boolean; $alive: boolean }>`
  ${playerInfoPanelSurface}
  min-width: 15.6rem;
  opacity: ${({ $alive }) => ($alive ? 1 : 0.56)};
  cursor: pointer;
`
export const PlayerName = styled.div`
  grid-area: name;
  overflow: hidden;
  color: #fff;
  font-size: 1rem;
  font-weight: 750;
  text-overflow: ellipsis;
  white-space: nowrap;
`
export const PlayerHealth = styled.div<{ $small?: boolean }>`
  display: grid;
  grid-area: health;
  justify-items: start;
  align-content: center;
  align-self: stretch;
  gap: 0.08rem;
  padding-right: 0.65rem;
  border-right: 1px solid rgb(255 255 255 / 30%);
  min-width: 0;
  margin-top: 0.05rem;
  color: #fff;
  font-size: ${({ $small }) => ($small ? '1.55rem' : '1.8rem')};
  font-weight: 900;
  line-height: 0.95;
`
export const Hearts = styled.span<{ $small?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  grid-area: hearts;
  align-self: end;
  justify-self: end;
  gap: 0.08rem;
  color: #fff;
  font-size: ${({ $small }) => ($small ? '0.68rem' : '0.82rem')};
  letter-spacing: 0.12em;
  text-shadow: 0 1px 0 rgb(255 255 255 / 35%);
  transform: translateX(0.2rem);
`
export const HeartLine = styled.span`
  display: inline-flex;
  gap: 0.1rem;
  white-space: nowrap;
`
export const SmallCards = styled.div`
  grid-area: cards;
  justify-self: end;
  margin: 0;
  color: #f4dfe5;
  font-size: 0.72rem;
  text-align: right;
  white-space: nowrap;
  transform: translateX(0.2rem);
`
