function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function canAnimateCardDraw() {
  return !prefersReducedMotion() && typeof Element.prototype.animate === 'function'
}

function getCenter(rect: DOMRect) {
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
}

export function animateCardDraw(card: HTMLElement, deck: HTMLElement, delay = 0) {
  if (!canAnimateCardDraw() || typeof card.animate !== 'function') {
    card.style.opacity = ''
    card.style.pointerEvents = ''
    return
  }

  const cardRect = card.getBoundingClientRect()
  const deckRect = deck.getBoundingClientRect()
  const cardCenter = getCenter(cardRect)
  const deckCenter = getCenter(deckRect)
  card.style.opacity = '0'
  card.style.pointerEvents = 'none'
  const animation = card.animate(
    [
      {
        opacity: 0.25,
        transform: `translate3d(${deckCenter.x - cardCenter.x}px, ${deckCenter.y - cardCenter.y}px, 0) scale(${deckRect.width / cardRect.width}, ${deckRect.height / cardRect.height}) rotate(8deg)`,
        filter: 'drop-shadow(0 20px 26px rgb(0 0 0 / 32%))',
      },
      {
        opacity: 1,
        transform: 'translate3d(0, 0, 0) scale(1, 1) rotate(0deg)',
        filter: 'none',
      },
    ],
    {
      duration: 620,
      delay,
      easing: 'cubic-bezier(0.2, 0.75, 0.25, 1)',
      fill: 'backwards',
    },
  )
  animation.onfinish = () => {
    animation.cancel()
    card.style.opacity = ''
    card.style.pointerEvents = ''
  }
  animation.oncancel = () => {
    card.style.opacity = ''
    card.style.pointerEvents = ''
  }
}

export function hideCardUntilDraw(card: HTMLElement) {
  if (!canAnimateCardDraw()) return
  card.style.opacity = '0'
  card.style.pointerEvents = 'none'
}

export function animatePlayedCard(handIndex: number) {
  if (prefersReducedMotion() || typeof Element.prototype.animate !== 'function') return

  const source = document.querySelector<HTMLElement>(`[data-hand-index="${handIndex}"]`)
  const target = document.querySelector<HTMLElement>('[data-declared-card]')
  if (!source || !target) return

  const sourceRect = source.getBoundingClientRect()
  const targetRect = target.getBoundingClientRect()
  const sourceCenter = getCenter(sourceRect)
  const targetCenter = getCenter(targetRect)
  const ghost = source.cloneNode(true) as HTMLElement
  ghost.removeAttribute('data-hand-index')
  ghost.setAttribute('aria-hidden', 'true')
  ghost.tabIndex = -1
  Object.assign(ghost.style, {
    position: 'fixed',
    left: `${sourceRect.left}px`,
    top: `${sourceRect.top}px`,
    width: `${sourceRect.width}px`,
    height: `${sourceRect.height}px`,
    margin: '0',
    zIndex: '10000',
    pointerEvents: 'none',
    transformOrigin: 'center center',
    transition: 'none',
  })
  document.body.append(ghost)

  const animation = ghost.animate(
    [
      { opacity: 1, transform: 'translate3d(0, 0, 0) scale(1) rotate(0deg)' },
      {
        opacity: 0.15,
        transform: `translate3d(${targetCenter.x - sourceCenter.x}px, ${targetCenter.y - sourceCenter.y}px, 0) scale(${targetRect.width / sourceRect.width}, ${targetRect.height / sourceRect.height}) rotate(-8deg)`,
      },
    ],
    { duration: 560, easing: 'cubic-bezier(0.3, 0, 0.7, 1)', fill: 'forwards' },
  )
  animation.onfinish = () => ghost.remove()
  animation.oncancel = () => ghost.remove()
}
