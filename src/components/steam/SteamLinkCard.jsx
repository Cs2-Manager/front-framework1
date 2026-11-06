import { useState } from 'react'

import { startSteamLink } from '../../services/steam.js'
import { getErrorMessage } from '../../utils/errors.js'
import Alert from '../common/Alert.jsx'
import Badge from '../common/Badge.jsx'
import SteamIcon from './SteamIcon.jsx'

const LINK_ERROR =
  'No pudimos iniciar la vinculación con Steam. Intentalo de nuevo.'

export default function SteamLinkCard({
  steam,
  redirect = (url) => window.location.assign(url),
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const configured = steam?.configured !== false

  async function handleLink() {
    setBusy(true)
    setError('')
    try {
      redirect(await startSteamLink())
    } catch (err) {
      setError(getErrorMessage(err, LINK_ERROR))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="player-panel steam-card">
      <div className="player-panel-head">
        <h2>Steam</h2>
        <Badge size="sm">Sin vincular</Badge>
      </div>

      <p className="text-muted">
        Vinculá tu cuenta de Steam para verificar tu identidad y consultar tu
        tiempo de juego de CS2 desde las APIs oficiales.
      </p>

      {!configured && (
        <Alert variant="warning">
          La integración con Steam no está configurada en este servidor. Un
          administrador debe definir <code>STEAM_API_KEY</code>.
        </Alert>
      )}

      <button
        type="button"
        className="btn btn-steam"
        onClick={handleLink}
        disabled={busy || !configured}
      >
        {busy ? (
          <>
            <span className="spinner spinner-sm" aria-hidden="true" />
            Conectando…
          </>
        ) : (
          <>
            <SteamIcon />
            Vincular cuenta de Steam
          </>
        )}
      </button>

      <p className="steam-card-note">
        Solo se guarda tu SteamID64 y datos públicos. La plataforma nunca
        recibe ni almacena tu contraseña de Steam.
      </p>

      <Alert>{error}</Alert>
    </section>
  )
}
