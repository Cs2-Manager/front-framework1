import Badge from '../common/Badge.jsx'
import { FACEIT_LINK_LABELS } from './faceitMessages.js'

/**
 * Identidad de la cuenta FACEIT: avatar, nickname, ELO, nivel, región,
 * estado de vinculación, SteamID64 y enlace al perfil público.
 */
export default function FaceitAccountIdentity({ account }) {
  return (
    <div className="faceit-identity">
      <div className="faceit-avatar" aria-hidden="true">
        {account.avatar_url ? <img src={account.avatar_url} alt="" /> : null}
      </div>
      <div className="faceit-identity-copy">
        <p className="faceit-nickname">
          {account.nickname || 'Jugador FACEIT'}
        </p>
        <p className="faceit-meta">
          {account.elo != null ? `ELO ${account.elo}` : 'ELO no disponible'}
          {account.skill_level != null
            ? ` · Nivel ${account.skill_level}`
            : ''}
          {account.region ? ` · ${account.region}` : ''}
        </p>
        <p className="faceit-meta">
          <Badge
            size="sm"
            variant={account.verified ? 'success' : 'warning'}
          >
            {FACEIT_LINK_LABELS[account.link_status] || account.link_status}
          </Badge>
        </p>
        {account.steam_id ? (
          <p className="faceit-meta">
            SteamID64: <code>{account.steam_id}</code>
          </p>
        ) : null}
        {account.faceit_url ? (
          <a
            className="faceit-link"
            href={account.faceit_url}
            target="_blank"
            rel="noreferrer"
          >
            Ver perfil en FACEIT
          </a>
        ) : null}
      </div>
    </div>
  )
}
