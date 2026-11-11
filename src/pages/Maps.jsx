import { useState } from 'react'

import Alert from '../components/common/Alert.jsx'
import MapLibraryFilters, {
  filterMaps,
} from '../components/maps/MapLibraryFilters.jsx'
import {
  MapModals,
  MapsCollection,
  MapsHeader,
} from '../components/maps/MapsCollection.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import useCrudPage from '../hooks/useCrudPage.js'
import useMapsResources from '../hooks/useMapsResources.js'
import { deleteMap, fetchMaps, restoreMap } from '../services/maps.js'
import { getErrorMessage } from '../utils/errors.js'
import '../components/maps/mapLibrary.css'

const INITIAL_FILTERS = {
  q: '',
  pool: 'all',
  category: 'all',
  status: 'active',
  sort: 'name',
}

export default function Maps() {
  const { user } = useAuth()
  const canManage = Boolean(user?.is_admin)
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [notice, setNotice] = useState('')
  const [restoreError, setRestoreError] = useState('')
  const [restoringId, setRestoringId] = useState(null)
  const { resources, resourceError } = useMapsResources()

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
    fetchItems: () =>
      fetchMaps({
        q: filters.q || undefined,
        pool: filters.pool,
        category: filters.category === 'all' ? undefined : filters.category,
        status: filters.status === 'all' ? 'ALL' : filters.status,
        sort: filters.sort,
      }),
    deps: [
      filters.q,
      filters.pool,
      filters.category,
      filters.status,
      filters.sort,
    ],
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
      setRestoreError(
        getErrorMessage(
          err,
          'No se pudo restaurar el mapa. Intentalo de nuevo.',
        ),
      )
    } finally {
      setRestoringId(null)
    }
  }

  const maps = filterMaps(
    page.items.map((map) => ({ ...map, resources: resources[map.id] })),
    filters,
  )

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
        maps={maps}
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
