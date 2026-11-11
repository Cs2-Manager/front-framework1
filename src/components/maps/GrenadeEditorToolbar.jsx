import { MAX_ZOOM, MIN_ZOOM } from './grenadeEditorGeometry.js'

/** Barra de zoom del editor visual. */
export default function GrenadeEditorToolbar({
  zoom,
  readOnly,
  onZoomIn,
  onZoomOut,
  onReset,
}) {
  return (
    <div className="grenade-editor-toolbar">
      <button
        type="button"
        onClick={onZoomIn}
        disabled={readOnly || zoom >= MAX_ZOOM}
      >
        Acercar
      </button>
      <button
        type="button"
        onClick={onZoomOut}
        disabled={readOnly || zoom <= MIN_ZOOM}
      >
        Alejar
      </button>
      <button type="button" onClick={onReset} disabled={readOnly}>
        Restablecer vista
      </button>
      <span className="grenade-editor-zoom" role="status">
        {Math.round(zoom * 100)}%
      </span>
    </div>
  )
}
