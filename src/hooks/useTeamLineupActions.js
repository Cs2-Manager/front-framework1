import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  deleteTeamLineup,
  replaceTeamLineupPlayers,
} from '../services/teamLineups.js'
import { getErrorMessage } from '../utils/errors.js'

const ACTION_ERROR = 'No pudimos completar la acción. Intentalo de nuevo.'
const SAVE_ERROR = 'No pudimos guardar la alineación. Intentalo de nuevo.'
const DELETE_ERROR = 'No pudimos eliminar la alineación. Intentalo de nuevo.'

/**
 * Acciones de una alineación competitiva: recarga, operaciones con feedback y
 * edición del roster. Centraliza el estado `busy`, el error y el mensaje de
 * éxito para que la página solo componga la vista.
 */
export default function useTeamLineupActions({
  teamId,
  lineupId,
  reload,
}) {
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState('')
  const [feedback, setFeedback] = useState('')
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

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

  async function handleSaveRoster(payload) {
    setBusy(true)
    reset()
    try {
      await replaceTeamLineupPlayers(teamId, lineupId, payload)
      setFeedback('Alineación actualizada.')
      await reload()
    } catch (err) {
      setActionError(getErrorMessage(err, SAVE_ERROR))
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete() {
    setBusy(true)
    reset()
    try {
      await deleteTeamLineup(teamId, lineupId)
      setConfirmDelete(false)
      navigate(`/teams/${teamId}/lineups`)
    } catch (err) {
      setConfirmDelete(false)
      setActionError(getErrorMessage(err, DELETE_ERROR))
      setBusy(false)
    }
  }

  return {
    busy,
    actionError,
    feedback,
    editing,
    setEditing,
    confirmDelete,
    setConfirmDelete,
    runAction,
    handleSaveRoster,
    handleDelete,
  }
}
