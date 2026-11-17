import styled from 'styled-components'
import { Status } from './overlayStyles'

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
