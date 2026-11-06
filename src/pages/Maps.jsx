import { deleteMap, fetchMaps, restoreMap } from '../services/maps.js'
import useCrudPage from '../hooks/useCrudPage.js'
import MapCard from '../components/maps/MapCard.jsx'
import MapFormModal from '../components/maps/MapFormModal.jsx'
import DeleteConfirmDialog from '../components/common/DeleteConfirmDialog.jsx'
import CollectionView from '../components/common/CollectionView.jsx'
import PageHeader from '../components/common/PageHeader.jsx'
import Alert from '../components/common/Alert.jsx'
import { useState, useEffect } from 'react'
import { fetchMyTeam } from '../services/teams.js'
import api from '../services/api.js'
import { useAuth } from '../context/AuthContext.jsx'
import { getErrorMessage } from '../utils/errors.js'
import MapLibraryFilters, { filterMaps } from '../components/maps/MapLibraryFilters.jsx'
import '../components/maps/mapLibrary.css'

function MapGrid({ maps, onEdit, onDelete, onRestore, restoringId }) {
  return (
    <div className="map-grid">
      {maps.map((map) => (
        <MapCard
          key={map.id}
          map={map}
          onEdit={onEdit}
          onDelete={onDelete}
          onRestore={onRestore}
          restoring={restoringId === map.id}
        />
      ))}
    </div>
  )
}

function MapsHeader({ onCreate }) {
  return (
    <PageHeader
      title="Mapas"
      subtitle="Catálogo de mapas de Counter-Strike 2."
      actionLabel={onCreate ? 'Nuevo mapa' : undefined}
      onAction={onCreate}
    />
  )
}

function MapsCollection({ page, maps, canManage, onRestore, restoringId }) {
  return (
    <CollectionView
      loading={page.loading}
      loadingText="Cargando mapas…"
      error={page.error}
      isEmpty={maps.length === 0}
      empty={{
        message: page.items.length ? 'No hay mapas que coincidan con los filtros.' : 'Todavía no hay mapas cargados.',
        actionLabel: canManage ? 'Crear mapa' : undefined,
        onAction: canManage ? page.modal.openCreate : undefined,
      }}
    >
      <MapGrid
        maps={maps}
        onEdit={canManage ? page.modal.openEdit : undefined}
        onDelete={canManage ? page.deletion.ask : undefined}
        onRestore={canManage ? onRestore : undefined}
        restoringId={restoringId}
      />
    </CollectionView>
  )
}

function MapModals({ modal, deletion, reload }) {
  return (
    <>
      {modal.open && (
        <MapFormModal
          open={modal.open}
          map={modal.editing}
          onClose={modal.close}
          onSaved={reload}
        />
      )}
      <DeleteConfirmDialog
        deletion={deletion}
        title="Eliminar mapa"
        nameKey="name"
        suffix=" Si el mapa tiene información asociada, se archivará en lugar de eliminarse."
      />
    </>
  )
}

export default function Maps() {
  const { user } = useAuth()
  const canManage = Boolean(user?.is_admin)
  const [filters, setFilters] = useState({ q: '', pool: 'all', category: 'all', status: 'active', sort: 'name' })
  const [resources, setResources] = useState({})
  const [resourceError, setResourceError] = useState('')
  const [notice, setNotice] = useState('')
  const [restoreError, setRestoreError] = useState('')
  const [restoringId, setRestoringId] = useState(null)
  useEffect(() => {
    fetchMyTeam().then(async team => {
      if (!team) return
      const { data } = await api.get(`/teams/${team.id}/map-resources`)
      setResources(Object.fromEntries(data.resources.map(r => [r.map_id, r])))
    }).catch(() => setResourceError('No se pudieron cargar los recursos del equipo.'))
  }, [])

  async function removeMap(map) {
    setNotice('')
    setRestoreError('')
    const result = await deleteMap(map.id)
    setNotice(
      result?.archived
        ? 'Este mapa contiene información asociada. Se archivó en lugar de eliminarse.'
        : `Mapa «${map.name}» eliminado.`,
    )
    return result
  }

  const page = useCrudPage({
    fetchItems: () => fetchMaps({
      q: filters.q || undefined,
      pool: filters.pool,
      category: filters.category === 'all' ? undefined : filters.category,
      status: filters.status === 'all' ? 'ALL' : filters.status,
      sort: filters.sort,
    }),
    deps: [filters.q, filters.pool, filters.category, filters.status, filters.sort],
    errorMessage: 'No se pudieron cargar los mapas. Intentalo de nuevo.',
    deleteItem: removeMap,
    deleteErrorMessage: 'No se pudo eliminar el mapa. Intentalo de nuevo.',
  })

  async function restore(map) {
    setNotice('')
    setRestoreError('')
    setRestoringId(map.id)
    try {
      await restoreMap(map.id)
      setNotice(`Mapa «${map.name}» restaurado.`)
      await page.reload()
    } catch (err) {
      setRestoreError(getErrorMessage(err, 'No se pudo restaurar el mapa. Intentalo de nuevo.'))
    } finally {
      setRestoringId(null)
    }
  }

  return (
    <div className="page container">
      <MapsHeader onCreate={canManage ? page.modal.openCreate : undefined} />
      <MapLibraryFilters filters={filters} onChange={setFilters} />
      <Alert variant="success">{notice}</Alert>
      <Alert>{page.deletion.error}</Alert>
      <Alert>{restoreError}</Alert>
      <Alert>{resourceError}</Alert>
      <MapsCollection
        page={page}
        maps={filterMaps(page.items.map(m => ({ ...m, resources: resources[m.id] })), filters)}
        canManage={canManage}
        onRestore={restore}
        restoringId={restoringId}
      />
      <MapModals
        modal={page.modal}
        deletion={page.deletion}
        reload={page.reload}
      />
    </div>
  )
}
