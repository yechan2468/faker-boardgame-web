import type { GameScreenProps } from '../../../types'
import { useGameAudio } from '../../../audio/GameAudioProvider'
import { useHandOrderAndDraw } from './useHandOrderAndDraw'
import { useHandDragAndSelection } from './useHandDragAndSelection'

type PlayerHandControllerOptions = Pick<GameScreenProps, 'game' | 'hand' | 'selectedHandIndex' | 'turnIntro' | 'actions'>

export function usePlayerHandController({ game, hand, selectedHandIndex, turnIntro, actions }: PlayerHandControllerOptions) {
  const { playSound } = useGameAudio()
  const layout = useHandOrderAndDraw({ game, hand, turnIntro, playSound })
  const interaction = useHandDragAndSelection({
    hand,
    selectedHandIndex,
    actions,
    ...layout,
    playSound,
  })

  return { ...layout, ...interaction }
}
