import { useMemo, useState } from 'react'

import {
  deleteWorkshopMap,
  fetchWorkshopMaps,
  WORKSHOP_CATEGORIES,
} from '../services/workshopMaps.js'
import useCollection from '../hooks/useCollection.js'
import useDelete from '../hooks/useDelete.js'
import useEditModal from '../hooks/useEditModal.js'
import WorkshopTabs from '../components/workshop/WorkshopTabs.jsx'
import WorkshopCard from '../components/workshop/WorkshopCard.jsx'
import WorkshopFormModal from '../components/workshop/WorkshopFormModal.jsx'
import DeleteConfirmDialog from '../components/common/DeleteConfirmDialog.jsx'
import CollectionView from '../components/common/CollectionView.jsx'
import PageHeader from '../components/common/PageHeader.jsx'
import Alert from '../components/common/Alert.jsx'

const ALL_TAB = 'Todas'
const TABS = [ALL_TAB, ...WORKSHOP_CATEGORIES]

export default function Workshop() {
  const [activeTab, setActiveTab] = useState(ALL_TAB)

  const {
    items: maps,
    loading,
    error: loadError,
    reload: loadMaps,
  } = useCollection(fetchWorkshopMaps, {
    errorMessage: 'No se pudieron cargar los mapas de la Workshop. Intentalo de nuevo.',
  })

  const modal = useEditModal()

  const countByCategory = useMemo(() => {
    const counts = { [ALL_TAB]: maps.length }
    for (const category of WORKSHOP_CATEGORIES) {
      counts[category] = maps.filter((map) => map.category === category).length
    }
    return counts
  }, [maps])

  const visibleMaps = useMemo(() => {
    if (activeTab === ALL_TAB) return maps
    return maps.filter((map) => map.category === activeTab)
  }, [maps, activeTab])

  const deletion = useDelete((workshopMap) => deleteWorkshopMap(workshopMap.id), {
    errorMessage: 'No se pudo eliminar el mapa de la Workshop. Intentalo de nuevo.',
    onDeleted: loadMaps,
  })

  return (
    <div className="page container">
      <PageHeader
        title="Workshop"
        subtitle="Mapas de entrenamiento recomendados de la Steam Workshop, organizados por categoría."
        actionLabel="Nuevo mapa de Workshop"
        onAction={modal.openCreate}
      />

      <Alert>{deletion.error}</Alert>

      <WorkshopTabs
        tabs={TABS}
        activeTab={activeTab}
        counts={countByCategory}
        onChange={setActiveTab}
      />

      <CollectionView
        loading={loading}
        loadingText="Cargando mapas de la Workshop…"
        error={loadError}
        isEmpty={visibleMaps.length === 0}
        empty={{
          message:
            activeTab === ALL_TAB
              ? 'Todavía no hay mapas de la Workshop cargados.'
              : `No hay mapas en la categoría «${activeTab}» todavía.`,
          actionLabel: 'Agregar el primero',
          onAction: modal.openCreate,
        }}
      >
        <div className="workshop-grid">
          {visibleMaps.map((workshopMap) => (
            <WorkshopCard
              key={workshopMap.id}
              workshopMap={workshopMap}
              onEdit={modal.openEdit}
              onDelete={deletion.ask}
            />
          ))}
        </div>
      </CollectionView>

      {modal.open && (
        <WorkshopFormModal
          open={modal.open}
          workshopMap={modal.editing}
          onClose={modal.close}
          onSaved={loadMaps}
        />
      )}

      <DeleteConfirmDialog
        deletion={deletion}
        title="Eliminar mapa de la Workshop"
      />
    </div>
  )
}
