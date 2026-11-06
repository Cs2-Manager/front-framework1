import {
  deleteWorkshopMap,
  fetchWorkshopMaps,
} from '../services/workshopMaps.js'
import useCrudPage from '../hooks/useCrudPage.js'
import useWorkshopTabs, { TABS } from '../hooks/useWorkshopTabs.js'
import WorkshopTabs from '../components/workshop/WorkshopTabs.jsx'
import WorkshopCard from '../components/workshop/WorkshopCard.jsx'
import WorkshopFormModal from '../components/workshop/WorkshopFormModal.jsx'
import DeleteConfirmDialog from '../components/common/DeleteConfirmDialog.jsx'
import CollectionView from '../components/common/CollectionView.jsx'
import PageHeader from '../components/common/PageHeader.jsx'
import Alert from '../components/common/Alert.jsx'

function WorkshopGrid({ maps, onEdit, onDelete }) {
  return (
    <div className="workshop-grid">
      {maps.map((workshopMap) => (
        <WorkshopCard
          key={workshopMap.id}
          workshopMap={workshopMap}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}

function WorkshopHeader({ onCreate }) {
  return (
    <PageHeader
      title="Workshop"
      subtitle="Mapas de entrenamiento recomendados de la Steam Workshop, organizados por categoría."
      actionLabel="Nuevo mapa de Workshop"
      onAction={onCreate}
    />
  )
}

function WorkshopCollection({ page, tabs }) {
  return (
    <CollectionView
      loading={page.loading}
      loadingText="Cargando mapas de la Workshop…"
      error={page.error}
      isEmpty={tabs.visibleMaps.length === 0}
      empty={{
        message: tabs.emptyMessage,
        actionLabel: 'Agregar el primero',
        onAction: page.modal.openCreate,
      }}
    >
      <WorkshopGrid
        maps={tabs.visibleMaps}
        onEdit={page.modal.openEdit}
        onDelete={page.deletion.ask}
      />
    </CollectionView>
  )
}

function WorkshopModals({ modal, deletion, reload }) {
  return (
    <>
      {modal.open && (
        <WorkshopFormModal
          open={modal.open}
          workshopMap={modal.editing}
          onClose={modal.close}
          onSaved={reload}
        />
      )}
      <DeleteConfirmDialog
        deletion={deletion}
        title="Eliminar mapa de la Workshop"
      />
    </>
  )
}

export default function Workshop() {
  const page = useCrudPage({
    fetchItems: fetchWorkshopMaps,
    errorMessage:
      'No se pudieron cargar los mapas de la Workshop. Intentalo de nuevo.',
    deleteItem: (workshopMap) => deleteWorkshopMap(workshopMap.id),
    deleteErrorMessage:
      'No se pudo eliminar el mapa de la Workshop. Intentalo de nuevo.',
  })
  const tabs = useWorkshopTabs(page.items)

  return (
    <div className="page container">
      <WorkshopHeader onCreate={page.modal.openCreate} />
      <Alert>{page.deletion.error}</Alert>
      <WorkshopTabs
        tabs={TABS}
        activeTab={tabs.activeTab}
        counts={tabs.counts}
        onChange={tabs.setActiveTab}
      />
      <WorkshopCollection page={page} tabs={tabs} />
      <WorkshopModals
        modal={page.modal}
        deletion={page.deletion}
        reload={page.reload}
      />
    </div>
  )
}
