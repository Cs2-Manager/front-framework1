import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { deleteCallout, fetchMap } from '../services/maps.js'
import { getErrorMessage } from '../utils/errors.js'
import useDelete from '../hooks/useDelete.js'
import useEditModal from '../hooks/useEditModal.js'
import CalloutFormModal from '../components/maps/CalloutFormModal.jsx'
import MapFormModal from '../components/maps/MapFormModal.jsx'
import CalloutCanvas from '../components/maps/CalloutCanvas.jsx'
import CalloutList from '../components/maps/CalloutList.jsx'
import DeleteConfirmDialog from '../components/common/DeleteConfirmDialog.jsx'
import Alert from '../components/common/Alert.jsx'

export default function MapDetail() {
  const { id } = useParams()
  const [map, setMap] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [selected, setSelected] = useState(0)
  const [editOpen, setEditOpen] = useState(false)

  const calloutModal = useEditModal()

  const loadMap = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      setMap(await fetchMap(id))
      setSelected(0)
    } catch (err) {
      setLoadError(
        getErrorMessage(
          err,
          'No se pudo cargar el mapa. Intentalo de nuevo.',
        ),
      )
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadMap()
  }, [loadMap])

  const deletion = useDelete(
    (callout) => deleteCallout(map.id, callout.id),
    {
      errorMessage: 'No se pudo eliminar la zona. Intentalo de nuevo.',
      onDeleted: () => {
        setSelected(null)
        loadMap()
      },
    },
  )

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
        <Alert>{loadError || 'Mapa no encontrado.'}</Alert>
        <Link to="/maps" className="btn btn-ghost">
          Volver a mapas
        </Link>
      </div>
    )
  }

  return (
    <div className="page container">
      <div className="page-head">
        <div>
          <Link to="/maps" className="back-link">
            ← Volver a mapas
          </Link>
          <h1>
            {map.name}{' '}
            {map.active_pool && <span className="badge">Pool activo</span>}
          </h1>
        </div>
        <div className="map-toolbar">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setEditOpen(true)}
          >
            Editar mapa
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={calloutModal.openCreate}
          >
            Nueva zona
          </button>
        </div>
      </div>

      <Alert>{deletion.error}</Alert>

      <div className="map-detail">
        <CalloutCanvas
          map={map}
          selectedIndex={selected}
          onSelect={setSelected}
        />
        <CalloutList
          callouts={map.callouts}
          selectedIndex={selected}
          onSelect={setSelected}
          onEdit={calloutModal.openEdit}
          onDelete={deletion.ask}
        />
      </div>

      {calloutModal.open && (
        <CalloutFormModal
          open={calloutModal.open}
          map={map}
          callout={calloutModal.editing}
          onClose={calloutModal.close}
          onSaved={loadMap}
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

      <DeleteConfirmDialog
        deletion={deletion}
        title="Eliminar zona"
        nameKey="zone_name"
      />
    </div>
  )
}
