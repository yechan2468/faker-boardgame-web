import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

const bgmModules = import.meta.glob('../../../assets/music/bgm/*.mp3', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

const effectModules = import.meta.glob('../../../assets/music/effect/*.mp3', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

const bgmTracks = Object.values(bgmModules)

const effectFiles = {
  cardFlip: 'Flipcard.mp3',
  rulesToggle: 'Paper slide - Short.mp3',
  revealImpact: 'Sudden Scary Impact.mp3',
  drawCard: 'Taking Playing Card 3.mp3',
  selectCard: 'Taking Playing Card.mp3',
  deselectCard: 'Taking Playing Card 3.mp3',
  submitCard: 'Taking Playing Card.mp3',
  bluffSubmit: 'Awesome Kick Drum.mp3',
  pillClick: 'ImmersiveControl Button Click Sound.mp3',
  victory: 'Shine 7.mp3',
  turnStart: 'New Notification 040.mp3',
  healthChange: 'Hurt sound.mp3',
  healthGain: 'Potion Drink (3).mp3',
} as const

export type GameEffect = keyof typeof effectFiles
type AudioPreferences = {
  musicVolume: number
  effectsVolume: number
  musicMuted: boolean
  effectsMuted: boolean
  repeatOne: boolean
}

type GameAudioContextValue = AudioPreferences & {
  setMusicVolume: (volume: number) => void
  setEffectsVolume: (volume: number) => void
  toggleMusicMuted: () => void
  toggleEffectsMuted: () => void
  previousMusic: () => void
  nextMusic: () => void
  toggleRepeatOne: () => void
  playSound: (effect: GameEffect) => void
}

const STORAGE_KEY = 'faker-blue-audio-preferences'
const PREFERENCES_VERSION = 3
const DEFAULT_PREFERENCES: AudioPreferences = {
  musicVolume: 30,
  effectsVolume: 50,
  musicMuted: false,
  effectsMuted: false,
  repeatOne: false,
}

function loadPreferences(): AudioPreferences {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return DEFAULT_PREFERENCES
    const parsed = JSON.parse(saved) as Partial<AudioPreferences> & { version?: number }
    const savedMusicVolume = parsed.version === undefined && parsed.musicVolume === 50
      ? DEFAULT_PREFERENCES.musicVolume
      : parsed.musicVolume ?? DEFAULT_PREFERENCES.musicVolume
    return {
      musicVolume: normalizeVolume(savedMusicVolume),
      effectsVolume: normalizeVolume(parsed.effectsVolume ?? DEFAULT_PREFERENCES.effectsVolume),
      musicMuted: parsed.musicMuted ?? DEFAULT_PREFERENCES.musicMuted,
      effectsMuted: parsed.effectsMuted ?? DEFAULT_PREFERENCES.effectsMuted,
      repeatOne: parsed.repeatOne ?? DEFAULT_PREFERENCES.repeatOne,
    }
  } catch {
    return DEFAULT_PREFERENCES
  }
}

function normalizeVolume(volume: number) {
  return Math.min(100, Math.max(0, Math.round(volume)))
}

function getEffectUrl(effect: GameEffect) {
  const fileName = effectFiles[effect]
  return Object.entries(effectModules).find(([path]) => path.endsWith(`/${fileName}`))?.[1]
}

const GameAudioContext = createContext<GameAudioContextValue | null>(null)

export function GameAudioProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState(loadPreferences)
  const preferencesRef = useRef(preferences)
  const currentBgm = useRef<HTMLAudioElement | null>(null)
  const nextTrackTimer = useRef<number | undefined>(undefined)
  const effectPlayers = useRef(new Set<HTMLAudioElement>())
  const playSoundRef = useRef<(effect: GameEffect) => void>(() => {})
  const previousMusicRef = useRef<() => void>(() => {})
  const nextMusicRef = useRef<() => void>(() => {})

  preferencesRef.current = preferences

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...preferences, version: PREFERENCES_VERSION }))
    } catch {
      // Audio controls still work when browser storage is unavailable.
    }
  }, [preferences])

  useEffect(() => {
    const player = currentBgm.current
    if (player) player.volume = preferences.musicMuted ? 0 : preferences.musicVolume / 100
    effectPlayers.current.forEach((effect) => {
      effect.volume = preferences.effectsMuted ? 0 : preferences.effectsVolume / 100
    })
  }, [preferences.musicMuted, preferences.musicVolume, preferences.effectsMuted, preferences.effectsVolume])

  useEffect(() => {
    if (bgmTracks.length === 0) return
    let disposed = false
    const history: number[] = []
    let historyPosition = -1

    const playTrack = (trackIndex: number) => {
      if (disposed) return
      window.clearTimeout(nextTrackTimer.current)
      nextTrackTimer.current = undefined
      currentBgm.current?.pause()

      const player = new Audio(bgmTracks[trackIndex])
      player.volume = preferencesRef.current.musicMuted ? 0 : preferencesRef.current.musicVolume / 100
      currentBgm.current = player
      player.addEventListener('ended', () => {
        if (disposed || currentBgm.current !== player) return
        if (preferencesRef.current.repeatOne) {
          player.currentTime = 0
          void player.play().catch(() => {})
          return
        }
        nextTrackTimer.current = window.setTimeout(() => {
          nextTrackTimer.current = undefined
          nextMusicRef.current()
        }, 1000)
      })
      void player.play().catch(() => {})
    }

    const appendRandomTrack = () => {
      const currentIndex = history[historyPosition]
      const candidates = bgmTracks.map((_, index) => index).filter((index) => index !== currentIndex)
      const nextIndex = candidates[Math.floor(Math.random() * candidates.length)] ?? currentIndex ?? 0
      history.splice(historyPosition + 1)
      history.push(nextIndex)
      historyPosition = history.length - 1
      playTrack(nextIndex)
    }

    const nextTrack = () => {
      if (disposed) return
      if (historyPosition < history.length - 1) {
        historyPosition += 1
        playTrack(history[historyPosition])
      } else {
        appendRandomTrack()
      }
    }

    const previousTrack = () => {
      if (disposed) return
      const player = currentBgm.current
      if (player && player.currentTime > 3) {
        player.currentTime = 0
        void player.play().catch(() => {})
      } else if (historyPosition > 0) {
        historyPosition -= 1
        playTrack(history[historyPosition])
      } else if (player) {
        player.currentTime = 0
        void player.play().catch(() => {})
      }
    }

    history.push(Math.floor(Math.random() * bgmTracks.length))
    historyPosition = 0
    previousMusicRef.current = previousTrack
    nextMusicRef.current = nextTrack
    playTrack(history[historyPosition])

    const onUserGesture = () => {
      if (currentBgm.current?.paused) void currentBgm.current.play().catch(() => {})
    }
    document.addEventListener('pointerdown', onUserGesture)
    document.addEventListener('keydown', onUserGesture)
    return () => {
      disposed = true
      document.removeEventListener('pointerdown', onUserGesture)
      document.removeEventListener('keydown', onUserGesture)
      previousMusicRef.current = () => {}
      nextMusicRef.current = () => {}
      window.clearTimeout(nextTrackTimer.current)
      nextTrackTimer.current = undefined
      currentBgm.current?.pause()
      currentBgm.current = null
      effectPlayers.current.forEach((player) => player.pause())
      effectPlayers.current.clear()
    }
  }, [])

  useEffect(() => {
    const onPillClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return
      const button = event.target.closest<HTMLButtonElement>('[data-game-sound="pill"]')
      if (button && !button.disabled) playSoundRef.current('pillClick')
    }
    document.addEventListener('click', onPillClick)
    return () => document.removeEventListener('click', onPillClick)
  }, [])

  const playSound = useCallback((effect: GameEffect) => {
    const source = getEffectUrl(effect)
    if (!source || preferencesRef.current.effectsMuted || preferencesRef.current.effectsVolume === 0) return
    const player = new Audio(source)
    player.volume = preferencesRef.current.effectsVolume / 100
    effectPlayers.current.add(player)
    const releasePlayer = () => effectPlayers.current.delete(player)
    player.addEventListener('ended', releasePlayer, { once: true })
    player.addEventListener('error', releasePlayer, { once: true })
    void player.play().catch(releasePlayer)
  }, [])
  playSoundRef.current = playSound

  const value = useMemo<GameAudioContextValue>(() => ({
    ...preferences,
    setMusicVolume: (volume) => setPreferences((current) => ({ ...current, musicVolume: normalizeVolume(volume) })),
    setEffectsVolume: (volume) => setPreferences((current) => ({ ...current, effectsVolume: normalizeVolume(volume) })),
    toggleMusicMuted: () => setPreferences((current) => ({ ...current, musicMuted: !current.musicMuted })),
    toggleEffectsMuted: () => setPreferences((current) => ({ ...current, effectsMuted: !current.effectsMuted })),
    previousMusic: () => previousMusicRef.current(),
    nextMusic: () => nextMusicRef.current(),
    toggleRepeatOne: () => setPreferences((current) => ({ ...current, repeatOne: !current.repeatOne })),
    playSound,
  }), [preferences, playSound])

  return <GameAudioContext.Provider value={value}>{children}</GameAudioContext.Provider>
}

export function useGameAudio() {
  const audio = useContext(GameAudioContext)
  if (!audio) throw new Error('useGameAudio must be used inside GameAudioProvider')
  return audio
}
