import { TurnOverlay } from '../../gameStyles'

export function TurnIntroOverlay({
  currentTurnId,
  text,
  onFinished,
}: {
  currentTurnId: string | null
  text: string
  onFinished: () => void
}) {
  return <TurnOverlay key={currentTurnId} onAnimationEnd={onFinished}>{text}</TurnOverlay>
}
