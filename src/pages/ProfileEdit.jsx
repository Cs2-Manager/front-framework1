import { Link } from 'react-router-dom'

import ErrorState from '../components/common/ErrorState.jsx'
import LoadingState from '../components/common/LoadingState.jsx'
import PageHeader from '../components/common/PageHeader.jsx'
import ProfileForm from '../components/profile/ProfileForm.jsx'
import SteamSection from '../components/steam/SteamSection.jsx'
import { useOwnProfile } from '../hooks/useProfile.js'

export default function ProfileEdit() {
  const { data, loading, error, reload } = useOwnProfile()

  return (
    <div className="page container">
      <PageHeader
        eyebrow="Cuenta"
        title="Editar perfil"
        subtitle="Actualizá tu identidad competitiva, enlaces y privacidad."
        actions={
          <Link to="/profile" className="btn btn-ghost">
            Volver al perfil
          </Link>
        }
      />

      {loading && (
        <LoadingState
          label="Cargando tu perfil…"
          detail="Estamos preparando el formulario."
          cards={2}
        />
      )}

      {!loading && error && (
        <ErrorState
          label="Error del perfil"
          message={error}
          onRetry={reload}
        />
      )}

      {!loading && !error && data && (
        <div className="profile-edit-stack">
          <SteamSection steam={data.steam} owner onChange={reload} />
          <ProfileForm profile={data} />
        </div>
      )}
    </div>
  )
}
