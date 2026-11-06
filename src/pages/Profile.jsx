import { useLocation } from 'react-router-dom'

import Alert from '../components/common/Alert.jsx'
import ErrorState from '../components/common/ErrorState.jsx'
import LoadingState from '../components/common/LoadingState.jsx'
import ProfileView from '../components/profile/ProfileView.jsx'
import {
  FACEIT_CALLBACK_MESSAGES,
  FACEIT_ERROR_REASONS,
} from '../components/faceit/faceitMessages.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useOwnProfile } from '../hooks/useProfile.js'

export default function Profile() {
  const { logout } = useAuth()
  const location = useLocation()
  const { data, loading, error, reload } = useOwnProfile()
  const updated = Boolean(location.state?.updated)
  const steamIntent = location.state?.steamIntent
  const steamCreated = Boolean(location.state?.steamCreated)
  const faceitParams = new URLSearchParams(location.search)
  const faceitResult = faceitParams.get('faceit')
  const faceitReason = faceitParams.get('reason')
  const faceitMessage = FACEIT_CALLBACK_MESSAGES[faceitResult]

  return (
    <div className="page container">
      {updated && (
        <Alert variant="success">Perfil actualizado correctamente.</Alert>
      )}

      {faceitResult && faceitMessage && (
        <Alert variant={faceitMessage.variant}>
          {faceitMessage.text}
          {faceitReason
            ? ` ${FACEIT_ERROR_REASONS[faceitReason] || ''}`.trimEnd()
            : ''}
        </Alert>
      )}

      {steamIntent && (
        <Alert variant="success">
          {steamIntent === 'LINK'
            ? 'Cuenta de Steam vinculada correctamente. Ya podés sincronizar tus datos verificados.'
            : steamCreated
              ? 'Creamos tu cuenta a partir de Steam. Completá tu perfil competitivo cuando quieras.'
              : 'Iniciaste sesión con Steam correctamente.'}
        </Alert>
      )}

      {loading && (
        <LoadingState
          label="Cargando tu perfil…"
          detail="Estamos preparando tu identidad competitiva."
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
        <ProfileView
          profile={data}
          owner
          onLogout={logout}
          onProfileChange={reload}
        />
      )}
    </div>
  )
}
