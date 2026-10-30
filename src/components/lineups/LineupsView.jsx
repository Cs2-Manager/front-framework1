import LineupFilters from './LineupFilters.jsx'
import LineupFormModal from './LineupFormModal.jsx'
import LineupCard from './LineupCard.jsx'
import LineupPlayer from './LineupPlayer.jsx'
import DeleteConfirmDialog from '../common/DeleteConfirmDialog.jsx'
import CollectionView from '../common/CollectionView.jsx'
import PageHeader from '../common/PageHeader.jsx'

export function LineupsHeader({ onCreate }) {
  return (
    <PageHeader
      title="Lineups"
      subtitle="Biblioteca de lineups y utilidades por mapa."
      actionLabel="Nuevo lineup"
      onAction={onCreate}
    />
  )
}

export function LineupBoard({ lineups, mapById, selected, setSelected, modal, deletion }) {
  return (
    <div className="lineups-layout">
      <div className="lineups-list">
        {lineups.map((lineup) => (
          <LineupCard
            key={lineup.id}
            lineup={lineup}
            mapName={mapById.get(lineup.map_id)?.name}
            active={selected?.id === lineup.id}
            onSelect={setSelected}
            onEdit={modal.openEdit}
            onDelete={deletion.ask}
          />
        ))}
      </div>
      <LineupPlayer lineup={selected} />
    </div>
  )
}

export function LineupsCollection({ view }) {
  const { page, maps, mapsError, mapById, selected, setSelected } = view

  return (
    <>
      <LineupFilters maps={maps} filters={view.filters} onChange={view.setFilters} />
      {mapsError && !maps.length && <p className="text-muted">{mapsError}</p>}
      <CollectionView
        loading={page.loading}
        loadingText="Cargando lineups…"
        error={page.error}
        isEmpty={page.items.length === 0}
        empty={{
          message: 'No se encontraron lineups con los filtros seleccionados.',
          actionLabel: 'Crear un lineup',
          onAction: page.modal.openCreate,
        }}
      >
        <LineupBoard
          lineups={page.items}
          mapById={mapById}
          selected={selected}
          setSelected={setSelected}
          modal={page.modal}
          deletion={page.deletion}
        />
      </CollectionView>
    </>
  )
}

export function LineupModals({ modal, deletion, maps, reload }) {
  return (
    <>
      {modal.open && (
        <LineupFormModal
          open={modal.open}
          maps={maps}
          lineup={modal.editing}
          onClose={modal.close}
          onSaved={reload}
        />
      )}
      <DeleteConfirmDialog deletion={deletion} title="Eliminar lineup" />
    </>
  )
}
