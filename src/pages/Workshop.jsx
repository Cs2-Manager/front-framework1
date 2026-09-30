import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  deleteWorkshopMap,
  fetchWorkshopMaps,
  WORKSHOP_CATEGORIES,
} from '../services/workshopMaps.js'
import WorkshopFormModal from '../components/workshop/WorkshopFormModal.jsx'

const ALL_TAB = 'Todas'

export default function Workshop() {
  const [maps, setMaps] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [activeTab, setActiveTab] = useState(ALL_TAB)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const loadMaps = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      setMaps(await fetchWorkshopMaps())
    } catch (err) {
      setLoadError(
        err.response?.data?.error ||
          'No se pudieron cargar los mapas de la Workshop. Intentalo de nuevo.',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMaps()
  }, [loadMaps])

  const countByCategory = useMemo(() => {
    const counts = { [ALL_TAB]: maps.length }
    for (const category of WORKSHOP_CATEGORIES) {
      counts[category] = maps.filter((m) => m.category === category).length
    }
    return counts
  }, [maps])

  const visibleMaps = useMemo(() => {
    if (activeTab === ALL_TAB) return maps
    return maps.filter((m) => m.category === activeTab)
  }, [maps, activeTab])

  function openCreate() {
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(workshopMap) {
    setEditing(workshopMap)
    setModalOpen(true)
  }

  function handleSaved() {
    loadMaps()
  }

  async function confirmDelete() {
    if (!pendingDelete) return
    setDeleting(true)
    setDeleteError('')
    try {
      await deleteWorkshopMap(pendingDelete.id)
      setPendingDelete(null)
      loadMaps()
    } catch (err) {
      setDeleteError(
        err.response?.data?.error ||
          'No se pudo eliminar el mapa de la Workshop. Intentalo de nuevo.',
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
          <h1>Workshop</h1>
          <p>
            Mapas de entrenamiento recomendados de la Steam Workshop, organizados
            por categoría.
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          Nuevo mapa de Workshop
        </button>
      </div>

      {deleteError && (
        <div className="alert alert-error" role="alert">
          {deleteError}
        </div>
      )}

      <div className="workshop-tabs" role="tablist" aria-label="Categorías de entrenamiento">
        {[ALL_TAB, ...WORKSHOP_CATEGORIES].map((category) => (
          <button
            key={category}
            type="button"
            role="tab"
            aria-selected={activeTab === category}
            className={`workshop-tab${activeTab === category ? ' active' : ''}`}
            onClick={() => setActiveTab(category)}
          >
            {category}
            <span className="workshop-tab-count">{countByCategory[category] ?? 0}</span>
          </button>
        ))}
      </div>

      {loading && <p className="text-muted">Cargando mapas de la Workshop…</p>}

      {!loading && loadError && (
        <div className="alert alert-error" role="alert">
          {loadError}
        </div>
      )}

      {!loading && !loadError && visibleMaps.length === 0 && (
        <div className="empty-state">
          <p>
            {activeTab === ALL_TAB
              ? 'Todavía no hay mapas de la Workshop cargados.'
              : `No hay mapas en la categoría «${activeTab}» todavía.`}
          </p>
          <button type="button" className="btn btn-primary" onClick={openCreate}>
            Agregar el primero
          </button>
        </div>
      )}

      {!loading && visibleMaps.length > 0 && (
        <div className="workshop-grid">
          {visibleMaps.map((workshopMap) => (
            <article key={workshopMap.id} className="workshop-card">
              <div className="workshop-card-img">
                {workshopMap.image_url ? (
                  <img
                    src={workshopMap.image_url}
                    alt={workshopMap.title}
                    loading="lazy"
                  />
                ) : (
                  <div className="map-card-fallback">{workshopMap.title}</div>
                )}
                <span className="workshop-card-category">{workshopMap.category}</span>
              </div>
              <div className="workshop-card-body">
                <h3 className="workshop-card-title">{workshopMap.title}</h3>
                {workshopMap.description && (
                  <p className="workshop-card-desc">{workshopMap.description}</p>
                )}
                <div className="workshop-card-actions">
                  <a
                    className="btn btn-primary btn-sm"
                    href={workshopMap.workshop_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Ver en Workshop ↗
                  </a>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => openEdit(workshopMap)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm btn-danger"
                    onClick={() => setPendingDelete(workshopMap)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {modalOpen && (
        <WorkshopFormModal
          open={modalOpen}
          workshopMap={editing}
          onClose={() => {
            setModalOpen(false)
            setEditing(null)
          }}
          onSaved={handleSaved}
        />
      )}

      {pendingDelete && (
        <div className="modal-overlay" onClick={() => setPendingDelete(null)}>
          <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h2>Eliminar mapa de la Workshop</h2>
              <button
                type="button"
                className="modal-close"
                onClick={() => setPendingDelete(null)}
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>
            <p>¿Seguro que querés eliminar «{pendingDelete.title}»?</p>
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
