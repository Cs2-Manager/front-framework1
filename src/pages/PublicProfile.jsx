import { Link, useParams } from 'react-router-dom'

import ErrorState from '../components/common/ErrorState.jsx'
import LoadingState from '../components/common/LoadingState.jsx'
import ProfileView from '../components/profile/ProfileView.jsx'
import { usePlayerProfile } from '../hooks/useProfile.js'

export default function PublicProfile() {
  const { id } = useParams()
  const { data, loading, error, reload } = usePlayerProfile(id)

  return (
    <div className="page container">
      {loading && (
        <LoadingState
          label="Cargando perfil del jugador…"
          detail="Estamos consultando el perfil público."
          cards={2}
        />
      )}

      {!loading && error && (
        <ErrorState
          label="Error del perfil"
          message={error}
          onRetry={reload}
        >
          <Link to="/players" className="btn btn-ghost">
            Volver a jugadores
          </Link>
        </ErrorState>
      )}

      {!loading && !error && data && (
        <ProfileView profile={data} owner={Boolean(data.is_owner)} />
      )}
    </div>
  )
}
