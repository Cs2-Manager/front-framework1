import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { deleteCallout, fetchMap } from '../services/maps.js'
import CalloutFormModal from '../components/maps/CalloutFormModal.jsx'
import MapFormModal from '../components/maps/MapFormModal.jsx'

export default function MapDetail() {
  const { id } = useParams()
  const [map, setMap] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [selected, setSelected] = useState(null)
  const [calloutModal, setCalloutModal] = useState(false)
  const [editingCallout, setEditingCallout] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [editOpen, setEditOpen] = useState(false)

  const loadMap = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      setMap(await fetchMap(id))
      setSelected(0)
    } catch (err) {
      setLoadError(
        err.response?.data?.error ||
          'No se pudo cargar el mapa. Intentalo de nuevo.',
      )
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadMap()
  }, [loadMap])

  function openNewCallout() {
    setEditingCallout(null)
    setCalloutModal(true)
  }

  function openEditCallout(callout) {
    setEditingCallout(callout)
    setCalloutModal(true)
  }

  function handleCalloutSaved() {
    loadMap()
  }

  async function confirmDelete() {
    if (!pendingDelete) return
    setDeleting(true)
    setDeleteError('')
    try {
      await deleteCallout(map.id, pendingDelete.id)
      setSelected(null)
      setPendingDelete(null)
      loadMap()
    } catch (err) {
      setDeleteError(
        err.response?.data?.error ||
          'No se pudo eliminar la zona. Intentalo de nuevo.',
      )
      setPendingDelete(null)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="page container">
        <p className="text-muted">Cargando mapa…</p>
      </div>
    )
  }

  if (loadError || !map) {
    return (
      <div className="page container">
        <div className="alert alert-error" role="alert">
          {loadError || 'Mapa no encontrado.'}
        </div>
        <Link to="/maps" className="btn btn-ghost">
          Volver a mapas
        </Link>
      </div>
    )
  }

  const highlighted = map.callouts[selected] ?? null

  return (
    <div className="page container">
      <div className="page-head">
        <div>
          <Link to="/maps" className="back-link">
            ← Volver a mapas
          </Link>
          <h1>
            {map.name} {map.active_pool && <span className="badge">Pool activo</span>}
          </h1>
        </div>
        <div className="map-toolbar">
          <button type="button" className="btn btn-ghost" onClick={() => setEditOpen(true)}>
            Editar mapa
          </button>
          <button type="button" className="btn btn-primary" onClick={openNewCallout}>
            Nueva zona
          </button>
        </div>
      </div>

      {deleteError && (
        <div className="alert alert-error" role="alert">
          {deleteError}
        </div>
      )}

      <div className="map-detail">
        <div className="map-detail-visual">
          {map.image_url ? (
            <div className="callout-canvas">
              <img src={map.image_url} alt={map.name} />
              {map.callouts.map((callout, index) => (
                <button
                  key={callout.id}
                  type="button"
                  className={`callout-marker${index === selected ? ' active' : ''}`}
                  style={{
                    left: `${callout.x_ratio * 100}%`,
                    top: `${callout.y_ratio * 100}%`,
                  }}
                  onClick={() => setSelected(index)}
                  title={callout.zone_name}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          ) : (
            <div className="empty-state">Este mapa no tiene imagen.</div>
          )}

          {highlighted && (
            <div className="callout-highlight">
              <strong>{highlighted.zone_name}</strong>
              <span className="text-muted">
                (x: {highlighted.x_ratio.toFixed(2)}, y: {highlighted.y_ratio.toFixed(2)})
              </span>
            </div>
          )}
        </div>

        <aside className="callout-list">
          <h3>Zonas</h3>
          {map.callouts.length === 0 && (
            <p className="text-muted">
              Todavía no hay zonas. Agregá la primera con «Nueva zona».
            </p>
          )}
          <ul>
            {map.callouts.map((callout, index) => (
              <li
                key={callout.id}
                className={index === selected ? 'active' : ''}
                onClick={() => setSelected(index)}
              >
                <span className="callout-number">{index + 1}</span>
                <span className="callout-name">{callout.zone_name}</span>
                <span className="callout-actions">
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      openEditCallout(callout)
                    }}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm btn-danger"
                    onClick={(e) => {
                      e.stopPropagation()
                      setPendingDelete(callout)
                    }}
                  >
                    Eliminar
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      {calloutModal && (
        <CalloutFormModal
          open={calloutModal}
          map={map}
          callout={editingCallout}
          onClose={() => {
            setCalloutModal(false)
            setEditingCallout(null)
          }}
          onSaved={handleCalloutSaved}
        />
      )}

      {editOpen && (
        <MapFormModal
          open={editOpen}
          map={map}
          onClose={() => setEditOpen(false)}
          onSaved={(updated) => {
            setMap(updated)
            setEditOpen(false)
          }}
        />
      )}

      {pendingDelete && (
        <div className="modal-overlay" onClick={() => setPendingDelete(null)}>
          <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h2>Eliminar zona</h2>
              <button
                type="button"
                className="modal-close"
                onClick={() => setPendingDelete(null)}
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>
            <p>¿Seguro que querés eliminar la zona «{pendingDelete.zone_name}»?</p>
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setPendingDelete(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? 'Eliminando…' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}