import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { memberName } from '../components/teams/teamDisplay.js'
import {
  cancelTeamInvitation,
  inviteTeamMember,
  leaveTeam,
  removeTeamMember,
  transferTeamCaptain,
  updateTeamMemberRole,
} from '../services/teams.js'
import { getErrorMessage } from '../utils/errors.js'

const ACTION_ERROR = 'No pudimos completar la acción. Intentalo de nuevo.'

/**
 * Acciones del detalle de equipo: invitar, cambiar rol, expulsar, transferir
 * capitanía, cancelar invitaciones y abandonar. Cada acción destructiva pide
 * confirmación y recarga el equipo al terminar.
 */
export default function useTeamDetailActions({ team, reload }) {
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState('')
  const [feedback, setFeedback] = useState('')
  const [confirm, setConfirm] = useState(null)

  function reset() {
    setActionError('')
    setFeedback('')
  }

  async function runAction(action, successMessage) {
    setBusy(true)
    reset()
    try {
      await action()
      setFeedback(successMessage)
      await reload()
    } catch (err) {
      setActionError(getErrorMessage(err, ACTION_ERROR))
    } finally {
      setBusy(false)
    }
  }

  async function handleInvite(username, role) {
    setBusy(true)
    reset()
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
    reset()
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
      setActionError(getErrorMessage(err, ACTION_ERROR))
    } finally {
      setBusy(false)
    }
  }

  return {
    busy,
    actionError,
    feedback,
    confirm,
    setConfirm,
    runAction,
    handleInvite,
    askRemove,
    askTransfer,
    askLeave,
    handleConfirm,
    changeRole: (member, role) =>
      runAction(
        () => updateTeamMemberRole(team.id, member.user.id, role),
        'Rol actualizado.',
      ),
    cancelInvitation: (invitation) =>
      runAction(
        () => cancelTeamInvitation(team.id, invitation.id),
        'Invitación cancelada.',
      ),
  }
}
