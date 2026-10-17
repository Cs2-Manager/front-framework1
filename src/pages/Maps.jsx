import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteMap, fetchMaps } from '../services/maps.js'
import MapFormModal from '../components/maps/MapFormModal.jsx'

export default function Maps() {
  const [maps, setMaps] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const loadMaps = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      setMaps(await fetchMaps())
    } catch (err) {
      setLoadError(
        err.response?.data?.error || 'No se pudieron cargar los mapas. Intentalo de nuevo.',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMaps()
  }, [loadMaps])

  function openCreate() {
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(map) {
    setEditing(map)
    setModalOpen(true)
  }

  function handleSaved() {
    loadMaps()
  }

  function handleCloseModal() {
    setModalOpen(false)
    setEditing(null)
  }

  async function confirmDelete() {
    if (!pendingDelete) return
    setDeleting(true)
    setDeleteError('')
    try {
      await deleteMap(pendingDelete.id)
      setPendingDelete(null)
      setMaps((prev) => prev.filter((m) => m.id !== pendingDelete.id))
    } catch (err) {
      setDeleteError(
        err.response?.data?.error || 'No se pudo eliminar el mapa. Intentalo de nuevo.',
      )
      setPendingDelete(null)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="page container">
      <div className="page-head">
        <div>
          <h1>Mapas</h1>
          <p>Catálogo de mapas de Counter-Strike 2.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          Nuevo mapa
        </button>
      </div>

      {deleteError && (
        <div className="alert alert-error" role="alert">
          {deleteError}
        </div>
      )}

      {loading && <p className="text-muted">Cargando mapas…</p>}

      {!loading && loadError && (
        <div className="alert alert-error" role="alert">
          {loadError}
        </div>
      )}

      {!loading && !loadError && maps.length === 0 && (
        <div className="empty-state">
          <p>Todavía no hay mapas cargados.</p>
          <button type="button" className="btn btn-primary" onClick={openCreate}>
            Crear el primer mapa
          </button>
        </div>
      )}

      {!loading && maps.length > 0 && (
        <div className="map-grid">
          {maps.map((map) => (
            <div key={map.id} className="map-card">
              <Link to={`/maps/${map.id}`} className="map-card-img">
                {map.image_url ? (
                  <img src={map.image_url} alt={map.name} loading="lazy" />
                ) : (
                  <div className="map-card-fallback">{map.name}</div>
                )}
              </Link>
              <div className="map-card-body">
                <div className="map-card-title">
                  <Link to={`/maps/${map.id}`}>{map.name}</Link>
                  {map.active_pool && (
                    <span className="badge">Pool activo</span>
                  )}
                </div>
                <p className="map-card-meta">
                  {map.callouts.length} zona{map.callouts.length === 1 ? '' : 's'}
                </p>
                <div className="map-card-actions">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => openEdit(map)}>
                    Editar
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm btn-danger"
                    onClick={() => setPendingDelete(map)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <MapFormModal
          open={modalOpen}
          map={editing}
          onClose={handleCloseModal}
          onSaved={handleSaved}
        />
      )}

      {pendingDelete && (
        <div className="modal-overlay" onClick={() => setPendingDelete(null)}>
          <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h2>Eliminar mapa</h2>
              <button
                type="button"
                className="modal-close"
                onClick={() => setPendingDelete(null)}
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>
            <p>
              ¿Seguro que querés eliminar «{pendingDelete.name}»? También se
              eliminarán sus zonas.
            </p>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setPendingDelete(null)}>
                Cancelar
              </button>
              <button type="button" className="btn btn-danger" onClick={confirmDelete} disabled={deleting}>
                {deleting ? 'Eliminando…' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}