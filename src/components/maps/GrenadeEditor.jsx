import { useRef, useState } from 'react'

import GrenadeCoordinateInput from './GrenadeCoordinateInput.jsx'
import GrenadeEditorMarker from './GrenadeEditorMarker.jsx'
import GrenadeEditorToolbar from './GrenadeEditorToolbar.jsx'
import { clampZoom } from './grenadeEditorGeometry.js'

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
      <GrenadeEditorToolbar
        zoom={zoom}
        readOnly={readOnly}
        onZoomIn={() => setZoom((current) => clampZoom(current + 0.25))}
        onZoomOut={() => setZoom((current) => clampZoom(current - 0.25))}
        onReset={resetView}
      />

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
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          }}
        >
          {map?.image_url ? (
            <img
              src={map.image_url}
              alt={`Plano táctico de ${map.name || 'el mapa'}`}
              draggable={false}
            />
          ) : (
            <div className="grenade-editor-empty">
              El mapa no tiene imagen táctica.
            </div>
          )}
          <GrenadeEditorMarker
            kind="origin"
            label="origen"
            point={origin}
            readOnly={readOnly}
            onMove={(point) => setPoint('launch_position', point)}
          />
          <GrenadeEditorMarker
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
        <GrenadeCoordinateInput
          label="Origen"
          point={origin}
          readOnly={readOnly}
          onChange={(point) => setPoint('launch_position', point)}
        />
        <GrenadeCoordinateInput
          label="Destino"
          point={impact}
          readOnly={readOnly}
          onChange={(point) => setPoint('impact_position', point)}
        />
      </div>
    </section>
  )
}
