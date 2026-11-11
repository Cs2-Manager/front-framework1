import CollectionView from '../common/CollectionView.jsx'
import DeleteConfirmDialog from '../common/DeleteConfirmDialog.jsx'
import PageHeader from '../common/PageHeader.jsx'
import MapCard from './MapCard.jsx'
import MapFormModal from './MapFormModal.jsx'

/** Cabecera de la página de mapas con la acción de creación. */
export function MapsHeader({ onCreate }) {
  return (
    <PageHeader
      title="Mapas"
      subtitle="Catálogo de mapas de Counter-Strike 2."
      actionLabel={onCreate ? 'Nuevo mapa' : undefined}
      onAction={onCreate}
    />
  )
}

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

/** Listado con estados de carga, error y vacío; delega las acciones al CRUD. */
export function MapsCollection({
  page,
  maps,
  canManage,
  onRestore,
  restoringId,
}) {
  return (
    <CollectionView
      loading={page.loading}
      loadingText="Cargando mapas…"
      error={page.error}
      isEmpty={maps.length === 0}
      empty={{
        message: page.items.length
          ? 'No hay mapas que coincidan con los filtros.'
          : 'Todavía no hay mapas cargados.',
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

/** Modal de alta/edición y diálogo de borrado del CRUD. */
export function MapModals({ modal, deletion, reload }) {
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
