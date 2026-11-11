import { useRef } from 'react'

import { isNormalizedPoint } from './grenadeForm.js'
import { keyboardMove, pointFromEvent } from './grenadeEditorGeometry.js'

/**
 * Marcador arrastrable (origen/destino) sobre el plano táctico. También
 * responde a las flechas del teclado para ajustes finos.
 */
export default function GrenadeEditorMarker({
  kind,
  point,
  label,
  readOnly,
  onMove,
}) {
  const dragging = useRef(null)

  if (!isNormalizedPoint(point)) return null

  function handlePointerDown(event) {
    if (readOnly) return
    event.stopPropagation()
    event.currentTarget.setPointerCapture?.(event.pointerId)
    dragging.current = event.pointerId
  }

  function handlePointerMove(event) {
    if (readOnly || dragging.current !== event.pointerId) return
    const stage = event.currentTarget.closest('.grenade-editor-stage')
    if (!stage) return
    const next = pointFromEvent(event, stage)
    if (next) onMove(next)
  }

  function handlePointerUp(event) {
    if (dragging.current === event.pointerId) {
      dragging.current = null
      event.currentTarget.releasePointerCapture?.(event.pointerId)
    }
  }

  function handleKeyDown(event) {
    if (readOnly) return
    const next = keyboardMove(event.key, point, event.shiftKey)
    if (!next) return
    event.preventDefault()
    onMove(next)
  }

  return (
    <button
      type="button"
      data-marker={kind}
      className={`grenade-marker grenade-marker-${kind}`}
      style={{ left: `${point[0] * 100}%`, top: `${point[1] * 100}%` }}
      aria-label={`Marcador de ${label}`}
      title={`${label}: (${point[0].toFixed(2)}, ${point[1].toFixed(2)})`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onKeyDown={handleKeyDown}
    >
      {kind === 'origin' ? 'O' : 'D'}
    </button>
  )
}
