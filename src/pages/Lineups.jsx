import { useEffect, useMemo, useState } from 'react'

import { fetchMaps } from '../services/maps.js'
import { deleteLineup, fetchLineups } from '../services/lineups.js'
import useCollection from '../hooks/useCollection.js'
import useDelete from '../hooks/useDelete.js'
import useEditModal from '../hooks/useEditModal.js'
import LineupFilters from '../components/lineups/LineupFilters.jsx'
import LineupFormModal from '../components/lineups/LineupFormModal.jsx'
import LineupCard from '../components/lineups/LineupCard.jsx'
import LineupPlayer from '../components/lineups/LineupPlayer.jsx'
import DeleteConfirmDialog from '../components/common/DeleteConfirmDialog.jsx'
import CollectionView from '../components/common/CollectionView.jsx'
import PageHeader from '../components/common/PageHeader.jsx'
import Alert from '../components/common/Alert.jsx'

const EMPTY_FILTERS = { map_id: '', type: '', side: '' }

function buildParams(filters) {
  const params = {}
  if (filters.map_id) params.map_id = filters.map_id
  if (filters.type) params.type = filters.type
  if (filters.side) params.side = filters.side
  return params
}

export default function Lineups() {
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [selected, setSelected] = useState(null)

  const { items: maps, error: mapsError } = useCollection(fetchMaps, {
    errorMessage: 'No se pudieron cargar los mapas.',
  })

  const {
    items: lineups,
    loading,
    error: loadError,
    reload: loadLineups,
  } = useCollection(() => fetchLineups(buildParams(filters)), {
    deps: [filters],
    errorMessage: 'No se pudieron cargar los lineups. Intentalo de nuevo.',
  })

  const mapById = useMemo(
    () => new Map(maps.map((map) => [map.id, map])),
    [maps],
  )

  useEffect(() => {
    setSelected((current) => {
      if (current && lineups.some((item) => item.id === current.id)) {
        return current
      }
      return lineups[0] || null
    })
  }, [lineups])

  const modal = useEditModal()

  const deletion = useDelete((lineup) => deleteLineup(lineup.id), {
    errorMessage: 'No se pudo eliminar el lineup. Intentalo de nuevo.',
    onDeleted: loadLineups,
  })

  return (
    <div className="page container">
      <PageHeader
        title="Lineups"
        subtitle="Biblioteca de lineups y utilidades por mapa."
        actionLabel="Nuevo lineup"
        onAction={modal.openCreate}
      />

      <Alert>{deletion.error}</Alert>

      <LineupFilters maps={maps} filters={filters} onChange={setFilters} />

      {mapsError && !maps.length && <p className="text-muted">{mapsError}</p>}

      <CollectionView
        loading={loading}
        loadingText="Cargando lineups…"
        error={loadError}
        isEmpty={lineups.length === 0}
        empty={{
          message: 'No se encontraron lineups con los filtros seleccionados.',
          actionLabel: 'Crear un lineup',
          onAction: modal.openCreate,
        }}
      >
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
      </CollectionView>

      {modal.open && (
        <LineupFormModal
          open={modal.open}
          maps={maps}
          lineup={modal.editing}
          onClose={modal.close}
          onSaved={loadLineups}
        />
      )}

      <DeleteConfirmDialog deletion={deletion} title="Eliminar lineup" />
    </div>
  )
}
