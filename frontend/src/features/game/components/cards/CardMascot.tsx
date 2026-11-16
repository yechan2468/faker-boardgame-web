import { useId } from 'react'
import { CardArtFrame } from '../../gameStyles'

type MascotStyle = {
  coat: string
  accent: string
  backdrop: string
  hat: 'hood' | 'point' | 'horns' | 'cap' | 'fuse' | 'crown' | 'bat' | 'goggles' | 'halo' | 'helmet' | 'jester'
  face: 'smile' | 'sly' | 'surprised' | 'calm'
}

const MASCOTS: Record<string, MascotStyle> = {
  assassin: { coat: '#473628', accent: '#b8945c', backdrop: '#e8decb', hat: 'hood', face: 'sly' },
  warlock: { coat: '#544035', accent: '#9a774d', backdrop: '#eae0cf', hat: 'point', face: 'sly' },
  'red-dragon': { coat: '#5c3424', accent: '#c17d4b', backdrop: '#eadbc7', hat: 'horns', face: 'surprised' },
  archer: { coat: '#71553a', accent: '#865739', backdrop: '#ede4d4', hat: 'cap', face: 'smile' },
  bomber: { coat: '#37302a', accent: '#9d744d', backdrop: '#e7dfd1', hat: 'fuse', face: 'surprised' },
  'vampire-king': { coat: '#443026', accent: '#c29a60', backdrop: '#e6d7c1', hat: 'crown', face: 'sly' },
  vampire: { coat: '#493b32', accent: '#9c7452', backdrop: '#e7dfd2', hat: 'bat', face: 'sly' },
  alchemist: { coat: '#806341', accent: '#a77a4d', backdrop: '#eee6d8', hat: 'goggles', face: 'smile' },
  'high-priest': { coat: '#d7cab2', accent: '#aa895b', backdrop: '#f1e9dc', hat: 'halo', face: 'calm' },
  priest: { coat: '#c8b99f', accent: '#927551', backdrop: '#eee6d8', hat: 'hood', face: 'smile' },
  wizard: { coat: '#40352b', accent: '#9c7452', backdrop: '#e7dfd2', hat: 'point', face: 'smile' },
  defender: { coat: '#786144', accent: '#9d744d', backdrop: '#e8dfd0', hat: 'helmet', face: 'smile' },
  clown: { coat: '#64442e', accent: '#c29a60', backdrop: '#f0e1cc', hat: 'jester', face: 'surprised' },
}

function Headwear({ kind, accent }: { kind: MascotStyle['hat']; accent: string }) {
  const common = { fill: accent, stroke: '#392a1d', strokeWidth: 1.7, strokeLinejoin: 'round' as const }

  switch (kind) {
    case 'point':
      return <path d="M29 36 37 12 51 25 64 11 72 36Z" {...common} />
    case 'horns':
      return <><path d="M35 35Q24 27 27 16Q39 20 42 32" {...common} /><path d="M61 32Q65 20 77 16Q78 28 67 36" {...common} /></>
    case 'cap':
      return <><path d="M32 36Q35 20 51 20 66 20 69 36Z" {...common} /><path d="M31 35Q47 30 72 36L67 41H34Z" fill="#e2d1b3" stroke="#392a1d" strokeWidth="1.5" /></>
    case 'fuse':
      return <><path d="M34 39Q34 23 51 23 67 23 68 39Z" {...common} /><path d="M52 24Q49 14 57 10" fill="none" stroke="#392a1d" strokeWidth="2" strokeLinecap="round" /><circle cx="59" cy="9" r="3.5" fill="#c3a16f" stroke="#392a1d" strokeWidth="1.5" /></>
    case 'crown':
      return <path d="M32 36 30 19 42 28 51 14 61 28 73 19 70 37Z" {...common} />
    case 'bat':
      return <path d="M30 38 27 17 43 29 51 19 60 29 76 17 72 38Z" {...common} />
    case 'goggles':
      return <><path d="M32 35Q35 20 51 20 67 20 70 35Z" {...common} /><circle cx="42" cy="36" r="6" fill="#e2d1b3" stroke="#392a1d" strokeWidth="1.6" /><circle cx="60" cy="36" r="6" fill="#e2d1b3" stroke="#392a1d" strokeWidth="1.6" /><path d="M48 35h6" stroke="#392a1d" strokeWidth="1.7" /></>
    case 'halo':
      return <><ellipse cx="51" cy="17" rx="17" ry="5" fill="none" stroke={accent} strokeWidth="3" /><path d="M34 37Q36 22 51 22 66 22 68 37Z" {...common} /></>
    case 'helmet':
      return <><path d="M31 38Q32 18 51 18 70 18 71 38L64 35 61 30H42L38 36Z" {...common} /><path d="M34 37H68" fill="none" stroke="#c3a16f" strokeWidth="2" strokeLinecap="round" /></>
    case 'jester':
      return <><path d="M34 35 27 17 44 27 51 13 59 27 77 17 69 37Z" {...common} /><circle cx="27" cy="16" r="4" fill="#c3a16f" /><circle cx="51" cy="12" r="4" fill="#765235" /><circle cx="77" cy="16" r="4" fill="#c3a16f" /></>
    case 'hood':
    default:
      return <path d="M30 41Q28 19 51 17 74 19 72 41L66 37 62 30H40L36 38Z" {...common} />
  }
}

export function CardMascot({ cardId, large = false }: { cardId: string; large?: boolean }) {
  const mascot = MASCOTS[cardId] ?? MASCOTS.clown
  const gradientId = useId().replace(/:/g, '')
  const mouth = mascot.face === 'surprised'
    ? <ellipse cx="51" cy="59" rx="3.8" ry="4.7" fill="#805544" />
    : mascot.face === 'calm'
      ? <path d="M45 59Q51 62 57 59" fill="none" stroke="#805544" strokeWidth="1.8" strokeLinecap="round" />
      : mascot.face === 'sly'
        ? <path d="M44 59Q52 56 58 53" fill="none" stroke="#805544" strokeWidth="2" strokeLinecap="round" />
        : <path d="M44 56Q51 64 59 56" fill="none" stroke="#805544" strokeWidth="2" strokeLinecap="round" />

  return (
    <CardArtFrame $large={large} aria-hidden="true">
      <svg viewBox="0 0 102 94">
        <defs>
          <linearGradient id={`coat-${gradientId}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={mascot.coat} />
            <stop offset="1" stopColor="#6b5034" />
          </linearGradient>
          <linearGradient id={`face-${gradientId}`} x1="0" y1="0" x2="0.8" y2="1">
            <stop offset="0" stopColor="#fff0d7" />
            <stop offset="1" stopColor="#efbd91" />
          </linearGradient>
        </defs>
        <path d="M13 51Q14 24 39 18Q63 8 84 29Q98 46 84 72Q67 91 39 82Q15 78 13 51Z" fill={mascot.backdrop} />
        <ellipse cx="52" cy="83" rx="27" ry="5" fill="#4a3928" opacity=".15" />
        <path d="M24 84Q26 65 39 62H64Q78 66 80 84Z" fill={`url(#coat-${gradientId})`} stroke="#392a1d" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M43 64 51 73 60 64" fill="#fff0d7" stroke="#392a1d" strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M35 46Q35 27 51 27 68 27 68 47L65 58Q60 69 51 69 41 69 36 58Z" fill={`url(#face-${gradientId})`} stroke="#392a1d" strokeWidth="1.8" />
        <Headwear kind={mascot.hat} accent={mascot.accent} />
        <path d="M42 47Q46 44 49 47M56 47Q60 44 63 47" fill="none" stroke="#392a1d" strokeWidth="1.7" strokeLinecap="round" />
        <ellipse cx="45" cy="51" rx="1.8" ry="2.4" fill="#392a1d" />
        <ellipse cx="60" cy="51" rx="1.8" ry="2.4" fill="#392a1d" />
        <circle cx="39" cy="57" r="3" fill="#c28e70" opacity=".48" />
        <circle cx="66" cy="57" r="3" fill="#c28e70" opacity=".48" />
        {mouth}
        <path d="M49 77 52 79 55 77" fill="none" stroke={mascot.accent} strokeWidth="1.8" strokeLinecap="round" />
        <path d="M18 42 20 46 24 47 20 49 18 53 16 49 12 47 16 46Z" fill="#fff" opacity=".9" />
        <path d="M82 54 84 58 88 59 84 61 82 65 80 61 76 59 80 58Z" fill="#fff" opacity=".8" />
      </svg>
    </CardArtFrame>
  )
}
