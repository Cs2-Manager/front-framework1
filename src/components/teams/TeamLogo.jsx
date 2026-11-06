import { teamInitials } from './teamDisplay.js'

export default function TeamLogo({ team, size = 'md' }) {
  const className = `team-logo team-logo-${size}`

  if (team?.logo_url) {
    return (
      <img
        src={team.logo_url}
        alt={`Logo de ${team.name}`}
        className={className}
      />
    )
  }

  return (
    <span className={`${className} team-logo-placeholder`} aria-hidden="true">
      {teamInitials(team?.name)}
    </span>
  )
}
