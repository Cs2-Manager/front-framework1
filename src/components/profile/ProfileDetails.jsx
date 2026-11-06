import Badge from '../common/Badge.jsx'
import SteamSection from '../steam/SteamSection.jsx'
import { SOCIAL_PLATFORMS } from './profileForm.js'
import { formatDate, formatDateTime } from './format.js'
import { LinkIcon } from './icons.jsx'

function InfoRow({ label, children }) {
  return (
    <div className="player-info-row">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}

function SocialLinks({ profile }) {
  const links = SOCIAL_PLATFORMS.filter(
    (platform) => profile.social_links?.[platform.key],
  )

  if (!profile.steam_url && links.length === 0) {
    return <p className="text-muted">Sin redes ni enlaces vinculados.</p>
  }

  return (
    <ul className="player-links">
      {profile.steam_url && (
        <li>
          <a href={profile.steam_url} target="_blank" rel="noreferrer">
            <LinkIcon />
            Steam
          </a>
        </li>
      )}
      {links.map((platform) => (
        <li key={platform.key}>
          <a
            href={profile.social_links[platform.key]}
            target="_blank"
            rel="noreferrer"
          >
            <LinkIcon />
            {platform.label}
          </a>
        </li>
      ))}
    </ul>
  )
}

export default function ProfileDetails({ profile, owner = false, onChange }) {
  return (
    <aside className="player-side">
      <section className="player-panel">
        <div className="player-panel-head">
          <h2>Información</h2>
        </div>
        <dl className="player-info-list">
          <InfoRow label="Nickname">@{profile.nickname}</InfoRow>
          <InfoRow label="País">
            {profile.country || 'Sin especificar'}
          </InfoRow>
          <InfoRow label="Miembro desde">
            {formatDate(profile.member_since)}
          </InfoRow>
          <InfoRow label="Última actividad">
            {formatDateTime(profile.last_active_at)}
          </InfoRow>
          {owner && <InfoRow label="Email">{profile.email}</InfoRow>}
          {owner && (
            <InfoRow label="Visibilidad">
              <Badge
                size="sm"
                variant={profile.visibility === 'PUBLIC' ? 'success' : 'neutral'}
              >
                {profile.visibility === 'PUBLIC' ? 'Público' : 'Privado'}
              </Badge>
            </InfoRow>
          )}
        </dl>
      </section>

      <section className="player-panel">
        <div className="player-panel-head">
          <h2>Redes y enlaces</h2>
        </div>
        <SocialLinks profile={profile} />
      </section>

      <SteamSection
        steam={profile.steam}
        owner={owner}
        onChange={onChange}
      />
    </aside>
  )
}
