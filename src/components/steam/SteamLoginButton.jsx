import { getSteamLoginUrl } from '../../services/steam.js'
import SteamIcon from './SteamIcon.jsx'

export default function SteamLoginButton({
  label = 'Continuar con Steam',
  disabled = false,
}) {
  return (
    <div className="steam-login-block">
      <div className="steam-divider" aria-hidden="true">
        <span>o</span>
      </div>
      {disabled ? (
        <button type="button" className="btn btn-steam btn-block" disabled>
          <SteamIcon />
          {label}
        </button>
      ) : (
        <a className="btn btn-steam btn-block" href={getSteamLoginUrl()}>
          <SteamIcon />
          {label}
        </a>
      )}
      <p className="steam-login-note">
        Steam verifica tu identidad. Nunca compartimos tu contraseña con la
        plataforma.
      </p>
    </div>
  )
}
