import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import Alert from '../components/common/Alert.jsx'
import LoadingState from '../components/common/LoadingState.jsx'
import PageHeader from '../components/common/PageHeader.jsx'
import { steamErrorMessage } from '../components/steam/steamMessages.js'
import { useAuth } from '../context/AuthContext.jsx'
import { exchangeSteamHandoff } from '../services/steam.js'
import { getErrorMessage } from '../utils/errors.js'

const MISSING_HANDOFF =
  'No recibimos una respuesta válida de Steam. Iniciá el proceso de nuevo.'

export default function SteamCallback() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { loginWithToken } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const started = useRef(false)

  const handoff = params.get('handoff')
  const errorCode = params.get('error')

  useEffect(() => {
    if (started.current) return
    started.current = true

    if (errorCode) {
      setError(steamErrorMessage(errorCode))
      setLoading(false)
      return
    }

    if (!handoff) {
      setError(MISSING_HANDOFF)
      setLoading(false)
      return
    }

    exchangeSteamHandoff(handoff)
      .then((data) => {
        loginWithToken(data.token, data.user)
        navigate('/profile', {
          replace: true,
          state: { steamIntent: data.intent, steamCreated: data.created },
        })
      })
      .catch((err) => {
        setError(
          getErrorMessage(err, steamErrorMessage('exchange_failed')),
        )
        setLoading(false)
      })
  }, [errorCode, handoff, loginWithToken, navigate])

  return (
    <div className="page container page-auth">
      {loading ? (
        <LoadingState
          label="Verificando con Steam…"
          detail="Estamos validando tu identidad antes de entrar."
        />
      ) : (
        <div className="steam-callback-error">
          <PageHeader
            eyebrow="Steam"
            title="No pudimos completar el inicio de sesión"
            subtitle="El enlace pudo haber expirado o ya haberse usado."
          />
          <Alert>{error}</Alert>
          <div className="steam-callback-actions">
            <Link to="/login" className="btn btn-primary">
              Volver a iniciar sesión
            </Link>
            <Link to="/" className="btn btn-ghost">
              Ir al inicio
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
