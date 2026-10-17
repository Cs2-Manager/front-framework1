import { deleteMap, fetchMaps } from '../services/maps.js'
import useCollection from '../hooks/useCollection.js'
import useDelete from '../hooks/useDelete.js'
import useEditModal from '../hooks/useEditModal.js'
import MapCard from '../components/maps/MapCard.jsx'
import MapFormModal from '../components/maps/MapFormModal.jsx'
import DeleteConfirmDialog from '../components/common/DeleteConfirmDialog.jsx'
import CollectionView from '../components/common/CollectionView.jsx'
import PageHeader from '../components/common/PageHeader.jsx'
import Alert from '../components/common/Alert.jsx'

export default function Maps() {
  const {
    items: maps,
    setItems: setMaps,
    loading,
    error: loadError,
    reload,
  } = useCollection(fetchMaps, {
    errorMessage: 'No se pudieron cargar los mapas. Intentalo de nuevo.',
  })

  const modal = useEditModal()

  const deletion = useDelete(deleteMap, {
    errorMessage: 'No se pudo eliminar el mapa. Intentalo de nuevo.',
    onDeleted: (map) => setMaps((prev) => prev.filter((m) => m.id !== map.id)),
  })

  return (
    <div className="page container">
      <PageHeader
        title="Mapas"
        subtitle="Catálogo de mapas de Counter-Strike 2."
        actionLabel="Nuevo mapa"
        onAction={modal.openCreate}
      />

      <Alert>{deletion.error}</Alert>

      <CollectionView
        loading={loading}
        loadingText="Cargando mapas…"
        error={loadError}
        isEmpty={maps.length === 0}
        empty={{
          message: 'Todavía no hay mapas cargados.',
          actionLabel: 'Crear el primer mapa',
          onAction: modal.openCreate,
        }}
      >
        <div className="map-grid">
          {maps.map((map) => (
            <MapCard
              key={map.id}
              map={map}
              onEdit={modal.openEdit}
              onDelete={deletion.ask}
            />
          ))}
        </div>
      </CollectionView>

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
        suffix=" También se eliminarán sus zonas."
      />
    </div>
  )
}
