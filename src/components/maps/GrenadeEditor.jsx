import { useRef, useState } from 'react'

import { isNormalizedPoint } from './grenadeForm.js'

const MIN_ZOOM = 1
const MAX_ZOOM = 4
const clamp = (value) => Math.min(1, Math.max(0, value))
const clampZoom = (value) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value))

function pointFromEvent(event, stage) {
  const rect = stage.getBoundingClientRect()
  if (!rect.width || !rect.height) return null
  return [
    clamp((event.clientX - rect.left) / rect.width),
    clamp((event.clientY - rect.top) / rect.height),
  ]
}

function Marker({ kind, point, label, readOnly, onMove }) {
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
    const step = event.shiftKey ? 0.05 : 0.01
    const moves = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    }
    const move = moves[event.key]
    if (!move) return
    event.preventDefault()
    onMove([clamp(point[0] + move[0]), clamp(point[1] + move[1])])
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

function CoordinateInput({ label, point, readOnly, onChange }) {
  const value = isNormalizedPoint(point) ? point : null
  const update = (index, raw) => {
    if (raw === '') {
      onChange(null)
      return
    }
    const parsed = Number(raw)
    if (!Number.isFinite(parsed)) return
    const next = value ? [...value] : [0.5, 0.5]
    next[index] = clamp(parsed)
    onChange(next)
  }

  return (
    <fieldset className="grenade-coordinate-group">
      <legend>{label}</legend>
      {['X', 'Y'].map((axis, index) => (
        <label key={axis}>
          {axis}
          <input
            type="number"
            min="0"
            max="1"
            step="0.01"
            inputMode="decimal"
            aria-label={`${label} ${axis}`}
            value={value ? Number(value[index].toFixed(3)) : ''}
            disabled={readOnly}
            onChange={(event) => update(index, event.target.value)}
          />
        </label>
      ))}
    </fieldset>
  )
}

/**
 * Editor visual de lanzamientos: zoom, paneo y marcadores de origen/destino
 * con coordenadas normalizadas 0..1 sobre la imagen táctica del mapa.
 */
export default function GrenadeEditor({ map, value, onChange, readOnly = false }) {
  const viewport = useRef(null)
  const panStart = useRef(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })

  const origin = value?.launch_position ?? null
  const impact = value?.impact_position ?? value?.position ?? null

  function setPoint(field, point) {
    onChange({ ...value, [field]: point })
  }

  function handleViewportPointerDown(event) {
    if (event.target.closest('[data-marker]')) return
    viewport.current?.setPointerCapture?.(event.pointerId)
    panStart.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      panX: pan.x,
      panY: pan.y,
    }
  }

  function handleViewportPointerMove(event) {
    const start = panStart.current
    if (!start || start.pointerId !== event.pointerId) return
    setPan({
      x: start.panX + (event.clientX - start.x),
      y: start.panY + (event.clientY - start.y),
    })
  }

  function handleViewportPointerUp(event) {
    if (panStart.current?.pointerId === event.pointerId) {
      panStart.current = null
      viewport.current?.releasePointerCapture?.(event.pointerId)
    }
  }

  function handleWheel(event) {
    if (readOnly) return
    setZoom((current) =>
      clampZoom(current + (event.deltaY < 0 ? 0.25 : -0.25)),
    )
  }

  function resetView() {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  return (
    <section className="grenade-editor" aria-label="Editor visual de granada">
      <div className="grenade-editor-toolbar">
        <button
          type="button"
          onClick={() => setZoom((current) => clampZoom(current + 0.25))}
          disabled={readOnly || zoom >= MAX_ZOOM}
        >
          Acercar
        </button>
        <button
          type="button"
          onClick={() => setZoom((current) => clampZoom(current - 0.25))}
          disabled={readOnly || zoom <= MIN_ZOOM}
        >
          Alejar
        </button>
        <button type="button" onClick={resetView} disabled={readOnly}>
          Restablecer vista
        </button>
        <span className="grenade-editor-zoom" role="status">
          {Math.round(zoom * 100)}%
        </span>
      </div>

      <div
        ref={viewport}
        className="grenade-editor-viewport"
        onPointerDown={handleViewportPointerDown}
        onPointerMove={handleViewportPointerMove}
        onPointerUp={handleViewportPointerUp}
        onPointerCancel={handleViewportPointerUp}
        onWheel={handleWheel}
      >
        <div
          className="grenade-editor-stage"
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
        >
          {map?.image_url ? (
            <img
              src={map.image_url}
              alt={`Plano táctico de ${map.name || 'el mapa'}`}
              draggable={false}
            />
          ) : (
            <div className="grenade-editor-empty">El mapa no tiene imagen táctica.</div>
          )}
          <Marker
            kind="origin"
            label="origen"
            point={origin}
            readOnly={readOnly}
            onMove={(point) => setPoint('launch_position', point)}
          />
          <Marker
            kind="impact"
            label="destino"
            point={impact}
            readOnly={readOnly}
            onMove={(point) => setPoint('impact_position', point)}
          />
        </div>
      </div>

      <p className="text-muted grenade-editor-help">
        Arrastrá los marcadores (o usá las flechas del teclado) para ubicar el
        origen y el destino. Los valores se guardan normalizados entre 0 y 1.
      </p>

      <div className="grenade-editor-coordinates">
        <CoordinateInput
          label="Origen"
          point={origin}
          readOnly={readOnly}
          onChange={(point) => setPoint('launch_position', point)}
        />
        <CoordinateInput
          label="Destino"
          point={impact}
          readOnly={readOnly}
          onChange={(point) => setPoint('impact_position', point)}
        />
      </div>
    </section>
  )
}
