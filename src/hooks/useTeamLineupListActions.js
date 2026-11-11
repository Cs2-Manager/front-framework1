import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  activateTeamLineup,
  deactivateTeamLineup,
  deleteTeamLineup,
  setPrimaryTeamLineup,
} from '../services/teamLineups.js'
import { getErrorMessage } from '../utils/errors.js'

const ACTION_ERROR = 'No pudimos completar la acción. Intentalo de nuevo.'
const DELETE_ERROR = 'No pudimos eliminar la alineación. Intentalo de nuevo.'

/**
 * Estado y acciones de la lista de alineaciones: creación, activación,
 * desactivación, principal y borrado confirmado, con recarga tras cada cambio.
 */
export default function useTeamLineupListActions({ teamId, reload }) {
  const navigate = useNavigate()
  const [creating, setCreating] = useState(false)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState('')
  const [feedback, setFeedback] = useState('')
  const [pendingDelete, setPendingDelete] = useState(null)

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

  async function handleDelete() {
    if (!pendingDelete) return
    setBusy(true)
    reset()
    try {
      await deleteTeamLineup(teamId, pendingDelete.id)
      setPendingDelete(null)
      setFeedback('Alineación eliminada.')
      await reload()
    } catch (err) {
      setPendingDelete(null)
      setActionError(getErrorMessage(err, DELETE_ERROR))
    } finally {
      setBusy(false)
    }
  }

  function handleCreated(lineup) {
    setCreating(false)
    if (lineup?.id) {
      navigate(`/teams/${teamId}/lineups/${lineup.id}`)
      return
    }
    reload()
  }

  return {
    creating,
    setCreating,
    busy,
    actionError,
    feedback,
    pendingDelete,
    setPendingDelete,
    runAction,
    handleDelete,
    handleCreated,
    activate: (item) =>
      runAction(
        () => activateTeamLineup(teamId, item.id),
        'Alineación activada.',
      ),
    deactivate: (item) =>
      runAction(
        () => deactivateTeamLineup(teamId, item.id),
        'Alineación desactivada.',
      ),
    makePrimary: (item) =>
      runAction(
        () => setPrimaryTeamLineup(teamId, item.id),
        'Alineación marcada como principal.',
      ),
  }
}
