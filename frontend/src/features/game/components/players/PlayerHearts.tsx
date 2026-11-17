import { HeartLine, Hearts } from '../../gameStyles'

export function PlayerHearts({ count, small = true }: { count: number; small?: boolean }) {
  const safeCount = Math.max(0, Math.floor(count))
  const rowCount = Math.ceil(safeCount / 10)

  return (
    <Hearts $small={small}>
      {Array.from({ length: rowCount }, (_, row) => {
        const heartsInRow = Math.min(10, safeCount - row * 10)
        return (
          <HeartLine key={row}>
            {Array.from({ length: heartsInRow }, (_, index) => <span key={index}>♥</span>)}
          </HeartLine>
        )
      })}
    </Hearts>
  )
}
