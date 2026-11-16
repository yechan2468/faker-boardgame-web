function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function centerOf(element: HTMLElement) {
  const rect = element.getBoundingClientRect()
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
}

function animateHealthToken(source: HTMLElement, target: HTMLElement, delay: number) {
  if (prefersReducedMotion() || typeof Element.prototype.animate !== 'function') return

  const sourceCenter = centerOf(source)
  const targetCenter = centerOf(target)
  const token = document.createElement('span')
  token.textContent = '♥'
  token.setAttribute('aria-hidden', 'true')
  Object.assign(token.style, {
    position: 'fixed',
    left: `${sourceCenter.x - 21}px`,
    top: `${sourceCenter.y - 21}px`,
    width: '42px',
    height: '42px',
    zIndex: '10001',
    pointerEvents: 'none',
    display: 'grid',
    placeItems: 'center',
    color: '#ff477e',
    fontSize: '42px',
    fontWeight: '900',
    lineHeight: '1',
    textShadow: '0 2px 5px rgb(18 25 65 / 55%)',
  })
  document.body.append(token)

  const deltaX = targetCenter.x - sourceCenter.x
  const deltaY = targetCenter.y - sourceCenter.y
  const animation = token.animate(
    [
      { opacity: 0, transform: 'translate3d(0, 0, 0) scale(0.55)', offset: 0 },
      {
        opacity: 1,
        transform: `translate3d(${deltaX * 0.55}px, ${deltaY * 0.55 - 32}px, 0) scale(1.3)`,
        offset: 0.58,
      },
      { opacity: 0.2, transform: `translate3d(${deltaX}px, ${deltaY}px, 0) scale(0.85)`, offset: 1 },
    ],
    { duration: 620, delay, easing: 'cubic-bezier(0.55, 0, 1, 1)' },
  )
  animation.onfinish = () => token.remove()
  animation.oncancel = () => token.remove()
}

function animateHealthPulse(element: HTMLElement) {
  if (prefersReducedMotion() || typeof element.animate !== 'function') return
  const animation = element.animate(
    [
      { transform: 'scale(1)' },
      { transform: 'scale(1.18)', offset: 0.4 },
      { transform: 'scale(1)' },
    ],
    { duration: 420, easing: 'ease-out' },
  )
  animation.onfinish = () => animation.cancel()
}

function findPlayerHealth(playerId: string) {
  return Array.from(document.querySelectorAll<HTMLElement>('[data-player-health-id]'))
    .find((element) => element.dataset.playerHealthId === playerId)
}

export function animateHealthChange(
  playerChanges: Array<{ playerId: string; delta: number }>,
  tokenMoves: Array<{ from: HTMLElement; to: HTMLElement }>,
  supplyChanged: boolean,
) {
  const changedPlayers = playerChanges
    .map(({ playerId }) => findPlayerHealth(playerId))
    .filter((element): element is HTMLElement => element !== undefined)
  changedPlayers.forEach(animateHealthPulse)

  const supply = document.querySelector<HTMLElement>('[data-health-supply]')
  if (supplyChanged && supply) animateHealthPulse(supply)

  tokenMoves.forEach(({ from, to }, index) => animateHealthToken(from, to, index * 85))
}

export { findPlayerHealth }
