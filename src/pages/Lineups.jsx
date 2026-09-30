import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchMaps } from '../services/maps.js'
import {
  deleteLineup,
  fetchLineups,
  GRENADE_TYPES,
} from '../services/lineups.js'
import { youtubeEmbedUrl } from '../utils/video.js'
import LineupFilters from '../components/lineups/LineupFilters.jsx'
import LineupFormModal from '../components/lineups/LineupFormModal.jsx'

const EMPTY_FILTERS = { map_id: '', type: '', side: '' }

export default function Lineups() {
  const [maps, setMaps] = useState([])
  const [mapsError, setMapsError] = useState('')
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [lineups, setLineups] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [selected, setSelected] = useState(null)
  const [editing, setEditing] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const mapById = useMemo(
    () => new Map(maps.map((map) => [map.id, map])),
    [maps],
  )

  const loadMaps = useCallback(async () => {
    try {
      setMaps(await fetchMaps())
    } catch {
      setMapsError('No se pudieron cargar los mapas.')
    }
  }, [])

  const loadLineups = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      const params = {}
      if (filters.map_id) params.map_id = filters.map_id
      if (filters.type) params.type = filters.type
      if (filters.side) params.side = filters.side
      const data = await fetchLineups(params)
      setLineups(data)
      setSelected((current) => {
        if (current && data.some((l) => l.id === current.id)) return current
        return data[0] || null
      })
    } catch (err) {
      setLoadError(
        err.response?.data?.error ||
          'No se pudieron cargar los lineups. Intentalo de nuevo.',
      )
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    loadMaps()
  }, [loadMaps])

  useEffect(() => {
    loadLineups()
  }, [loadLineups])

  function openCreate() {
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(lineup) {
    setEditing(lineup)
    setModalOpen(true)
  }

  function handleSaved() {
    loadLineups()
  }

  async function confirmDelete() {
    if (!pendingDelete) return
    setDeleting(true)
    setDeleteError('')
    try {
      await deleteLineup(pendingDelete.id)
      setPendingDelete(null)
      loadLineups()
    } catch (err) {
      setDeleteError(
        err.response?.data?.error ||
          'No se pudo eliminar el lineup. Intentalo de nuevo.',
      )
      setPendingDelete(null)
    } finally {
      setDeleting(false)
    }
  }

  const selectedEmbedUrl = selected ? youtubeEmbedUrl(selected.video_url) : null

  return (
    <div className="page container">
      <div className="page-head">
        <div>
          <h1>Lineups</h1>
          <p>Biblioteca de lineups y utilidades por mapa.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          Nuevo lineup
        </button>
      </div>

      {deleteError && (
        <div className="alert alert-error" role="alert">
          {deleteError}
        </div>
      )}

      <LineupFilters maps={maps} filters={filters} onChange={setFilters} />

      {mapsError && !maps.length && (
        <p className="text-muted">{mapsError}</p>
      )}

      {loading && <p className="text-muted">Cargando lineups…</p>}

      {!loading && loadError && (
        <div className="alert alert-error" role="alert">
          {loadError}
        </div>
      )}

      {!loading && !loadError && lineups.length === 0 && (
        <div className="empty-state">
          <p>
            No se encontraron lineups con los filtros seleccionados.
          </p>
          <button type="button" className="btn btn-primary" onClick={openCreate}>
            Crear un lineup
          </button>
        </div>
      )}

      {!loading && lineups.length > 0 && (
        <div className="lineups-layout">
          <div className="lineups-list">
            {lineups.map((lineup) => {
              const embed = youtubeEmbedUrl(lineup.video_url)
              return (
                <div
                  key={lineup.id}
                  className={`lineup-card${selected?.id === lineup.id ? ' active' : ''}`}
                  onClick={() => setSelected(lineup)}
                >
                  <div className="lineup-thumb">
                    {embed ? (
                      <img
                        src={`https://img.youtube.com/vi/${embed.split('/').pop()}/hqdefault.jpg`}
                        alt={lineup.title}
                        loading="lazy"
                      />
                    ) : (
                      <div className="lineup-thumb-fallback">{lineup.type}</div>
                    )}
                  </div>
                  <div className="lineup-card-body">
                    <div className="lineup-tags">
                      <span className={`tag tag-type`}>{lineup.type}</span>
                      <span className={`tag tag-side tag-${lineup.side.toLowerCase()}`}>
                        {lineup.side}
                      </span>
                      <span className="tag tag-map">{mapById.get(lineup.map_id)?.name || 'Mapa'}</span>
                    </div>
                    <h3 className="lineup-title">{lineup.title}</h3>
                    {lineup.description && (
                      <p className="lineup-desc">{lineup.description}</p>
                    )}
                    <div className="lineup-actions">
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          openEdit(lineup)
                        }}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm btn-danger"
                        onClick={(e) => {
                          e.stopPropagation()
                          setPendingDelete(lineup)
                        }}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <aside className="lineup-player">
            <h3>{selected ? 'Vista previa' : 'Reproductor'}</h3>
            {selected ? (
              <>
                {selectedEmbedUrl ? (
                  <div className="video-embed">
                    <iframe
                      src={selectedEmbedUrl}
                      title={selected.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <p className="text-muted">Video no disponible.</p>
                )}
                <p className="video-caption">{selected.title}</p>
              </>
            ) : (
              <p className="text-muted">
                Seleccioná un lineup para ver el video.
              </p>
            )}
          </aside>
        </div>
      )}

      {modalOpen && (
        <LineupFormModal
          open={modalOpen}
          maps={maps}
          lineup={editing}
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
              <h2>Eliminar lineup</h2>
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