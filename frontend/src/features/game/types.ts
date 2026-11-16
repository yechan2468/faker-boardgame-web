import type { Dispatch, SetStateAction } from 'react'
import type { GameState, LeaderboardEntry, PublicPlayer } from '../../types/game'
import type { CardInfo, DeclarationNotice } from './gameUi'

export type AttackResolutionNotice = {
  actorId: string
  challengerId: string
  truthful: boolean
  turnNumber: number
}

export type DefenseResolutionNotice = {
  actorId: string
  defenderId: string
  challengerId: string
  truthful: boolean
  turnNumber: number
}

export type GameScreenActions = {
  setModalOpen: Dispatch<SetStateAction<boolean>>
  setTurnIntro: Dispatch<SetStateAction<boolean>>
  setSelectedDeclarationId: Dispatch<SetStateAction<string | null>>
  setTargetId: Dispatch<SetStateAction<string | null>>
  setSelectedDefenseType: Dispatch<SetStateAction<'defender' | 'wizard' | null>>
  setRedirectTargetId: Dispatch<SetStateAction<string | null>>
  setSelectedHandIndex: Dispatch<SetStateAction<number | null>>
  publish: (destination: string, body: unknown) => void
  startGame: () => void
  restartGame: () => void
  endGame: () => void
  submitTurnEnd: () => void
  submitBluff: () => void
  passSuspicion: () => void
  submitDefense: () => void
  passDefense: () => void
}

export type GameScreenProps = {
  game: GameState
  self: PublicPlayer | undefined
  opponents: PublicPlayer[]
  hand: string[]
  selectedHandIndex: number | null
  selectedDeclarationId: string | null
  targetId: string | null
  selectedDefenseType: 'defender' | 'wizard' | null
  redirectTargetId: string | null
  modalOpen: boolean
  errorMessage: string | null
  statusText: string
  turnIntro: boolean
  turnOverlayText: string
  currentTurnId: string | null
  displayedDeclaration: DeclarationNotice | null
  displayedDeclarationLabel: string | null
  displayedCard: CardInfo | null
  hostActionPending: boolean
  isMyTurn: boolean
  selectedCard: CardInfo | null
  selectedDeclaration: CardInfo | null
  needsTarget: boolean
  eligibleDeclarations: readonly CardInfo[]
  canAct: boolean
  mustDefend: boolean
  suspicionPasserNames: string[]
  suspicionWaitingNames: string
  suspicionCardOwnerId: string | undefined
  hasPassedSuspicion: boolean
  hasDefenderCard: boolean
  hasWizardCard: boolean
  redirectTargets: PublicPlayer[]
  turnPreview: PublicPlayer[]
  modalLeaderboard: LeaderboardEntry[]
  leaderboardLoading: boolean
  leaderboardError: string | null
  actions: GameScreenActions
}
