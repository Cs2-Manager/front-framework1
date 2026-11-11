export const MIN_ZOOM = 1
export const MAX_ZOOM = 4

export const clamp = (value) => Math.min(1, Math.max(0, value))

export const clampZoom = (value) =>
  Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value))

/** Convierte un evento de puntero en coordenadas normalizadas 0..1 del stage. */
export function pointFromEvent(event, stage) {
  const rect = stage.getBoundingClientRect()
  if (!rect.width || !rect.height) return null
  return [
    clamp((event.clientX - rect.left) / rect.width),
    clamp((event.clientY - rect.top) / rect.height),
  ]
}

const KEYBOARD_MOVES = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
}

/** Desplazamiento de teclado de un marcador (0,01 normal; 0,05 con Shift). */
export function keyboardMove(key, point, shiftKey = false) {
  const direction = KEYBOARD_MOVES[key]
  if (!direction) return null
  const step = shiftKey ? 0.05 : 0.01
  return [
    clamp(point[0] + direction[0] * step),
    clamp(point[1] + direction[1] * step),
  ]
}
