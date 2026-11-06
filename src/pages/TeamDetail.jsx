import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import Alert from '../components/common/Alert.jsx'
import ConfirmDialog from '../components/common/ConfirmDialog.jsx'
import ErrorState from '../components/common/ErrorState.jsx'
import LoadingState from '../components/common/LoadingState.jsx'
import TeamHeader from '../components/teams/TeamHeader.jsx'
import TeamGrenadeProposals from '../components/teams/TeamGrenadeProposals.jsx'
import TeamInvitationsPanel from '../components/teams/TeamInvitationsPanel.jsx'
import TeamRoster from '../components/teams/TeamRoster.jsx'
import { memberName } from '../components/teams/teamDisplay.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useTeam } from '../hooks/useTeams.js'
import {
  cancelTeamInvitation,
  inviteTeamMember,
  leaveTeam,
  removeTeamMember,
  transferTeamCaptain,
  updateTeamMemberRole,
} from '../services/teams.js'
import { getErrorMessage } from '../utils/errors.js'

export default function TeamDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { team, loading, error, reload } = useTeam(id)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState('')
  const [feedback, setFeedback] = useState('')
  const [confirm, setConfirm] = useState(null)
  const viewerId = user?.id

  async function runAction(action, successMessage) {
    setBusy(true)
    setActionError('')
    setFeedback('')
    try {
      await action()
      setFeedback(successMessage)
      await reload()
    } catch (err) {
      setActionError(
        getErrorMessage(
          err,
          'No pudimos completar la acción. Intentalo de nuevo.',
        ),
      )
    } finally {
      setBusy(false)
    }
  }

  async function handleInvite(username, role) {
    setBusy(true)
    setActionError('')
    setFeedback('')
    try {
      await inviteTeamMember(team.id, { username, role })
      setFeedback('Invitación enviada.')
      await reload()
    } catch (err) {
      setActionError(
        getErrorMessage(err, 'No pudimos enviar la invitación.'),
      )
      throw err
    } finally {
      setBusy(false)
    }
  }

  function askRemove(member) {
    setConfirm({
      title: 'Expulsar integrante',
      message: `¿Seguro que querés expulsar a ${memberName(member)} del equipo?`,
      confirmLabel: 'Expulsar',
      action: () => removeTeamMember(team.id, member.user.id),
      success: 'Integrante expulsado.',
    })
  }

  function askTransfer(member) {
    setConfirm({
      title: 'Transferir capitanía',
      message: `¿Transferir la capitanía a ${memberName(member)}? Dejarás de ser capitán.`,
      confirmLabel: 'Transferir',
      action: () => transferTeamCaptain(team.id, member.user.id),
      success: 'Capitanía transferida.',
    })
  }

  function askLeave() {
    setConfirm({
      title: 'Abandonar equipo',
      message:
        '¿Seguro que querés abandonar el equipo? Si sos el único integrante, el equipo se eliminará.',
      confirmLabel: 'Abandonar',
      action: () => leaveTeam(team.id),
      success: 'Abandonaste el equipo.',
      leave: true,
    })
  }

  async function handleConfirm() {
    if (!confirm) return
    const current = confirm
    setBusy(true)
    setActionError('')
    setFeedback('')
    try {
      await current.action()
      setConfirm(null)
      if (current.leave) {
        navigate('/teams')
        return
      }
      setFeedback(current.success)
      await reload()
    } catch (err) {
      setConfirm(null)
      setActionError(
        getErrorMessage(
          err,
          'No pudimos completar la acción. Intentalo de nuevo.',
        ),
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page container">
      <Link to="/teams" className="team-back-link">
        ← Volver a equipos
      </Link>

      {loading && (
        <LoadingState
          label="Cargando equipo…"
          detail="Estamos preparando el roster."
          cards={2}
        />
      )}
      {!loading && error && (
        <ErrorState message={error} onRetry={reload}>
          <Link to="/teams" className="btn btn-ghost">
            Volver a equipos
          </Link>
        </ErrorState>
      )}

      {!loading && !error && team && (
        <>
          <TeamHeader team={team} onLeave={askLeave} />

          <Alert>{actionError}</Alert>
          <Alert variant="success">{feedback}</Alert>

          <div className="team-detail-layout">
            <TeamRoster
              team={team}
              viewerId={viewerId}
              busy={busy}
              onRemove={askRemove}
              onChangeRole={(member, role) =>
                runAction(
                  () => updateTeamMemberRole(team.id, member.user.id, role),
                  'Rol actualizado.',
                )
              }
              onTransfer={askTransfer}
            />

            <TeamInvitationsPanel
              team={team}
              viewerId={viewerId}
              busy={busy}
              onInvite={handleInvite}
              onCancel={(invitation) =>
                runAction(
                  () => cancelTeamInvitation(team.id, invitation.id),
                  'Invitación cancelada.',
                )
              }
            />
          </div>

          <TeamGrenadeProposals team={team} />

          <ConfirmDialog
            open={Boolean(confirm)}
            title={confirm?.title}
            message={confirm?.message}
            confirmLabel={confirm?.confirmLabel}
            busy={busy}
            onCancel={() => setConfirm(null)}
            onConfirm={handleConfirm}
          />
        </>
      )}
    </div>
  )
}
