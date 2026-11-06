import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchMyTeam } from '../services/teams.js'

import { fetchMaps } from '../services/maps.js'
import { deleteLineup, fetchLineups } from '../services/lineups.js'
import useCollection from '../hooks/useCollection.js'
import useCrudPage from '../hooks/useCrudPage.js'
import {
  buildLineupParams,
  useMapIndex,
  useSelectedLineup,
} from '../hooks/useLineupSelection.js'
import {
  LineupModals,
  LineupsCollection,
  LineupsHeader,
} from '../components/lineups/LineupsView.jsx'
import Alert from '../components/common/Alert.jsx'

const EMPTY_FILTERS = { map_id: '', type: '', side: '' }

export default function Lineups() {
  const [team, setTeam] = useState(null)
  useEffect(() => { fetchMyTeam().then(setTeam).catch(() => setTeam(null)) }, [])
  const [filters, setFilters] = useState(EMPTY_FILTERS)

  const { items: maps, error: mapsError } = useCollection(fetchMaps, {
    errorMessage: 'No se pudieron cargar los mapas.',
  })

  const page = useCrudPage({
    fetchItems: () => fetchLineups(buildLineupParams(filters)),
    deps: [filters],
    errorMessage: 'No se pudieron cargar los lineups. Intentalo de nuevo.',
    deleteItem: (lineup) => deleteLineup(lineup.id),
    deleteErrorMessage: 'No se pudo eliminar el lineup. Intentalo de nuevo.',
  })

  const mapById = useMapIndex(maps)
  const [selected, setSelected] = useSelectedLineup(page.items)
  const view = { page, maps, mapsError, filters, setFilters, mapById, selected, setSelected }

  return (
    <div className="page container">
      <section className="team-panel"><h2>Centro de alineaciones y utilidad</h2><p>Administrá titulares, suplentes, roles y configuraciones por mapa desde las alineaciones de tu equipo.</p><Link className="btn btn-primary" to={team ? `/teams/${team.id}/lineups` : '/teams'}>Alineaciones competitivas</Link> <Link className="btn btn-ghost" to="/maps">Granadas y estrategias por mapa</Link></section>
      <LineupsHeader onCreate={page.modal.openCreate} />
      <Alert>{page.deletion.error}</Alert>
      <LineupsCollection view={view} />
      <LineupModals
        modal={page.modal}
        deletion={page.deletion}
        maps={maps}
        reload={page.reload}
      />
    </div>
  )
}
