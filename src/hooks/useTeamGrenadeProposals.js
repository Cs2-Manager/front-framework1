import { useCallback, useEffect, useState } from 'react'

import {
  approveGrenadeProposal,
  fetchTeamGrenadeProposals,
  rejectGrenadeProposal,
} from '../services/grenadeLineups.js'
import { getErrorMessage } from '../utils/errors.js'

const LOAD_ERROR = 'No pudimos cargar las propuestas del equipo.'
const ACTION_ERROR = 'No pudimos resolver la propuesta.'

/**
 * Propuestas de granadas del equipo: carga filtrada por estado, aprobación y
 * rechazo con motivo opcional. Solo se activa con permiso de revisión.
 */
export default function useTeamGrenadeProposals({ team, canReview }) {
  const [proposals, setProposals] = useState([])
  const [statusFilter, setStatusFilter] = useState('PENDING')
  const [loading, setLoading] = useState(canReview)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('')
  const [busy, setBusy] = useState(false)
  const [rejectTarget, setRejectTarget] = useState(null)

  const load = useCallback(async () => {
    if (!canReview) return
    setLoading(true)
    setError('')
    try {
      setProposals(
        await fetchTeamGrenadeProposals(team.id, {
          status: statusFilter === 'ALL' ? undefined : statusFilter,
        }),
      )
    } catch (err) {
      setError(getErrorMessage(err, LOAD_ERROR))
    } finally {
      setLoading(false)
    }
  }, [canReview, team?.id, statusFilter])

  useEffect(() => {
    load()
  }, [load])

  async function run(action, message) {
    setBusy(true)
    setError('')
    setFeedback('')
    try {
      await action()
      setFeedback(message)
      await load()
    } catch (err) {
      setError(getErrorMessage(err, ACTION_ERROR))
    } finally {
      setBusy(false)
    }
  }

  async function approve(proposal) {
    await run(
      () => approveGrenadeProposal(proposal.id),
      'Propuesta aprobada: se creó la granada de equipo.',
    )
  }

  async function reject(reason) {
    const target = rejectTarget
    await run(
      () => rejectGrenadeProposal(target.id, { reason }),
      'Propuesta rechazada.',
    )
    setRejectTarget(null)
  }

  const pendingCount = proposals.filter(
    (item) => item.status === 'PENDING',
  ).length

  return {
    proposals,
    statusFilter,
    setStatusFilter,
    loading,
    error,
    feedback,
    busy,
    rejectTarget,
    setRejectTarget,
    pendingCount,
    approve,
    reject,
  }
}
