import { Link, useParams } from 'react-router-dom'

import Alert from '../components/common/Alert.jsx'
import ErrorState from '../components/common/ErrorState.jsx'
import LoadingState from '../components/common/LoadingState.jsx'
import PageHeader from '../components/common/PageHeader.jsx'
import TeamForm from '../components/teams/TeamForm.jsx'
import { useTeam } from '../hooks/useTeams.js'

export default function TeamEdit() {
  const { id } = useParams()
  const { team, loading, error, reload } = useTeam(id)

  return (
    <div className="page container">
      <PageHeader
        eyebrow="Equipos"
        title="Editar equipo"
        subtitle="Actualizá los datos públicos y la visibilidad del equipo."
        actions={
          <Link to={`/teams/${id}`} className="btn btn-ghost">
            Volver al equipo
          </Link>
        }
      />

      {loading && (
        <LoadingState
          label="Cargando equipo…"
          detail="Estamos preparando los datos del equipo."
          cards={2}
        />
      )}

      {!loading && error && (
        <ErrorState
          label="Error del equipo"
          message={error}
          onRetry={reload}
        />
      )}

      {!loading && !error && team && !team.permissions?.can_edit && (
        <Alert>No tenés permiso para editar este equipo.</Alert>
      )}

      {!loading && !error && team && team.permissions?.can_edit && (
        <TeamForm team={team} />
      )}
    </div>
  )
}
