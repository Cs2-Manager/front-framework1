import { formatDateTime } from '../profile/format.js'
import SteamIcon from './SteamIcon.jsx'

const VISIBILITY_LABELS = {
  PUBLIC: 'Perfil público',
  FRIENDS_ONLY: 'Solo amigos',
  PRIVATE: 'Perfil privado',
  UNKNOWN: 'Visibilidad desconocida',
}

/**
 * Identidad de la cuenta Steam: avatar, persona, enlace público, SteamID64,
 * visibilidad de la comunidad y fecha de vinculación.
 */
export default function SteamAccountIdentity({ account }) {
  return (
    <div className="steam-account">
      <div className="steam-avatar" aria-hidden="true">
        {account.avatar_url ? (
          <img src={account.avatar_url} alt="" />
        ) : (
          <SteamIcon size={28} />
        )}
      </div>
      <div className="steam-account-copy">
        <p className="steam-persona">
          {account.persona_name || 'Jugador de Steam'}
        </p>
        {account.profile_url ? (
          <a
            className="steam-profile-link"
            href={account.profile_url}
            target="_blank"
            rel="noreferrer"
          >
            Ver perfil en Steam
          </a>
        ) : null}
        <p className="steam-account-meta">
          SteamID64: <code>{account.steam_id}</code>
        </p>
        <p className="steam-account-meta">
          {VISIBILITY_LABELS[account.community_visibility] ||
            VISIBILITY_LABELS.UNKNOWN}
        </p>
        <p className="steam-account-meta">
          Vinculada el {formatDateTime(account.linked_at)}
        </p>
      </div>
    </div>
  )
}
