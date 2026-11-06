import { useState } from 'react'

import Badge from '../common/Badge.jsx'
import FormField from '../common/FormField.jsx'
import PlayerAvatar from '../profile/PlayerAvatar.jsx'
import { formatDate } from '../profile/format.js'
import { TEAM_INVITE_ROLE_OPTIONS } from './teamForm.js'
import {
  canCancelTeamInvitation,
  memberName,
  roleLabel,
  statusLabel,
} from './teamDisplay.js'

function InviteForm({ onInvite }) {
  const [username, setUsername] = useState('')
  const [role, setRole] = useState('PLAYER')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    const target = username.trim()
    if (!target) {
      setError('Ingresá el nombre de usuario a invitar.')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      await onInvite(target, role)
      setUsername('')
      setRole('PLAYER')
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          err?.response?.data?.fields?.user_id ||
          'No pudimos enviar la invitación.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="team-invite-form" onSubmit={handleSubmit} noValidate>
      <div className="team-invite-fields">
        <FormField
          id="team-invite-username"
          name="username"
          label="Nombre de usuario"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          error={error}
          placeholder="usuario"
        />
        <FormField
          as="select"
          id="team-invite-role"
          name="role"
          label="Rol"
          value={role}
          onChange={(event) => setRole(event.target.value)}
          options={TEAM_INVITE_ROLE_OPTIONS}
        />
      </div>
      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? 'Enviando…' : 'Invitar'}
      </button>
    </form>
  )
}

function PendingInvitation({ invitation, canCancel, busy, onCancel }) {
  return (
    <li className="team-invitation-row">
      <PlayerAvatar profile={invitation.user} size="sm" />
      <div className="team-invitation-info">
        <strong>{memberName(invitation.user)}</strong>
        <span className="team-invitation-meta">
          @{invitation.user?.username} · {roleLabel(invitation.role)}
        </span>
        <span className="team-invitation-meta">
          Invitó {memberName(invitation.invited_by)} el{' '}
          {formatDate(invitation.created_at)}
        </span>
      </div>
      <Badge size="sm" variant="warning">
        {statusLabel(invitation.status)}
      </Badge>
      {canCancel && (
        <button
          type="button"
          className="btn btn-sm btn-ghost"
          disabled={busy}
          onClick={() => onCancel(invitation)}
        >
          Cancelar
        </button>
      )}
    </li>
  )
}

export default function TeamInvitationsPanel({
  team,
  viewerId,
  busy = false,
  onInvite,
  onCancel,
}) {
  if (!team.permissions?.can_manage_invitations) return null

  const pending = team.pending_invitations || []

  return (
    <section className="team-panel" aria-labelledby="team-invitations-title">
      <div className="team-panel-head">
        <h2 id="team-invitations-title">Invitaciones</h2>
        <span className="team-panel-count">{pending.length}</span>
      </div>

      <InviteForm onInvite={onInvite} />

      {pending.length === 0 ? (
        <p className="text-muted">No hay invitaciones pendientes.</p>
      ) : (
        <ul className="team-invitation-list">
          {pending.map((invitation) => (
            <PendingInvitation
              key={invitation.id}
              invitation={invitation}
              canCancel={canCancelTeamInvitation(team, invitation, viewerId)}
              busy={busy}
              onCancel={onCancel}
            />
          ))}
        </ul>
      )}
    </section>
  )
}
