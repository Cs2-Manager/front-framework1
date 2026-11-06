import { useState } from 'react'

import { authorizeMatchmaking } from '../../services/matchmaking.js'
import { getErrorMessage } from '../../utils/errors.js'
import Alert from '../common/Alert.jsx'
import { TextInputField } from '../common/formControls.jsx'
import { AUTH_HELP_URL, MATCHMAKING_ERRORS } from './matchmakingMessages.js'

const AUTH_CODE_PATTERN = /^[A-Za-z0-9]{4}-[A-Za-z0-9]{5}-[A-Za-z0-9]{4}$/

function normalizeShareCode(value) {
  return String(value || '')
    .trim()
    .replace(/^CSGO-?/i, '')
    .replace(/-/g, '')
}

function validate(values) {
  const errors = {}
  if (!AUTH_CODE_PATTERN.test(values.authCode.trim())) {
    errors.authCode =
      'Usá el formato XXXX-XXXXX-XXXX que muestra Steam.'
  }
  if (normalizeShareCode(values.shareCode).length !== 25) {
    errors.shareCode =
      'Pegá un share code de partida completo (25 caracteres).'
  }
  return errors
}

/**
 * Autorización de matchmaking con el *game authentication code* de Steam.
 * El código se envía una sola vez, se guarda cifrado en el backend y se puede
 * revocar en cualquier momento. Nunca se pide la contraseña de Steam.
 */
export default function MatchmakingAuthForm({ onAuthorize, disabled = false }) {
  const [values, setValues] = useState({ authCode: '', shareCode: '' })
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    const nextErrors = validate(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setBusy(true)
    try {
      await onAuthorize({
        authCode: values.authCode.trim(),
        shareCode: values.shareCode.trim(),
      })
      setValues({ authCode: '', shareCode: '' })
    } catch (err) {
      setError(getErrorMessage(err, MATCHMAKING_ERRORS.authorize))
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="mm-auth-form" onSubmit={handleSubmit} noValidate>
      <div className="mm-auth-copy">
        <h3>Habilitar sincronización</h3>
        <p>
          Pegá el código de autenticación de partidas de Steam y un share code
          reciente. Guardamos el código cifrado y podés revocarlo cuando
          quieras.
        </p>
      </div>

      <TextInputField
        name="authCode"
        label="Código de autenticación de Steam"
        value={values.authCode}
        onChange={handleChange}
        error={errors.authCode}
        placeholder="XXXX-XXXXX-XXXX"
        autoComplete="off"
        spellCheck="false"
        disabled={busy || disabled}
      />
      <TextInputField
        name="shareCode"
        label="Share code de una partida reciente"
        value={values.shareCode}
        onChange={handleChange}
        error={errors.shareCode}
        placeholder="CSGO-XXXXX-XXXXX-XXXXX-XXXXX-XXXXX"
        autoComplete="off"
        spellCheck="false"
        disabled={busy || disabled}
      />

      <Alert>{error}</Alert>

      <ul className="mm-auth-notes">
        <li>Nunca pedimos tu contraseña ni tus credenciales de sesión.</li>
        <li>
          Solo se leen partidas a las que tu cuenta ya tiene acceso; no se
          accede a partidas privadas de otros jugadores.
        </li>
        <li>Podés revocar la autorización y conservar el historial ya procesado.</li>
      </ul>

      <div className="mm-auth-actions">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={busy || disabled}
        >
          {busy ? 'Guardando…' : 'Guardar autorización'}
        </button>
        <a
          className="btn btn-ghost"
          href={AUTH_HELP_URL}
          target="_blank"
          rel="noreferrer"
        >
          Cómo obtener el código
        </a>
      </div>
    </form>
  )
}
