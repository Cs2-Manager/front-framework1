import { useCallback, useEffect, useState } from 'react'

import Alert from '../common/Alert.jsx'
import Badge from '../common/Badge.jsx'
import Modal from '../common/Modal.jsx'
import {
  PROPOSAL_STATUS_LABELS,
  approveGrenadeProposal,
  fetchTeamGrenadeProposals,
  rejectGrenadeProposal,
} from '../../services/grenadeLineups.js'
import { formatDateTime } from '../profile/format.js'
import { getErrorMessage } from '../../utils/errors.js'
import '../maps/grenadeLibrary.css'

const STATUS_VARIANT = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
  CANCELLED: 'neutral',
}

function RejectModal({ target, busy, onCancel, onConfirm }) {
  const [reason, setReason] = useState('')

  useEffect(() => {
    setReason('')
  }, [target])

  if (!target) return null

  return (
    <Modal
      open={Boolean(target)}
      title={`Rechazar “${target.snapshot?.title || 'propuesta'}”`}
      onClose={onCancel}
    >
      <label className="form-group" htmlFor="grenade-reject-reason">
        Motivo del rechazo (opcional)
        <textarea
          id="grenade-reject-reason"
          value={reason}
          maxLength={2000}
          onChange={(event) => setReason(event.target.value)}
        />
      </label>
      <div className="modal-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancelar
        </button>
        <button
          type="button"
          className="btn btn-danger"
          disabled={busy}
          onClick={() => onConfirm(reason)}
        >
          {busy ? 'Rechazando…' : 'Rechazar propuesta'}
        </button>
      </div>
    </Modal>
  )
}

/**
 * Bandeja de propuestas de granadas del equipo.
 *
 * Solo se muestra a capitanes y entrenadores actuales. La autorización real se
 * vuelve a verificar en el backend.
 */
export default function TeamGrenadeProposals({ team }) {
  const canReview = Boolean(
    team?.is_member && team?.permissions?.can_manage_lineups,
  )
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
      setError(
        getErrorMessage(err, 'No pudimos cargar las propuestas del equipo.'),
      )
    } finally {
      setLoading(false)
    }
  }, [canReview, team?.id, statusFilter])

  useEffect(() => {
    load()
  }, [load])

  if (!canReview) return null

  async function run(action, message) {
    setBusy(true)
    setError('')
    setFeedback('')
    try {
      await action()
      setFeedback(message)
      await load()
    } catch (err) {
      setError(getErrorMessage(err, 'No pudimos resolver la propuesta.'))
    } finally {
      setBusy(false)
    }
  }

  async function reject(reason) {
    const target = rejectTarget
    await run(
      () => rejectGrenadeProposal(target.id, { reason }),
      'Propuesta rechazada.',
    )
    setRejectTarget(null)
  }

  return (
    <section className="team-panel grenade-proposals">
      <div className="team-panel-head">
        <h2>Propuestas de granadas</h2>
        <Badge variant="warning">
          {proposals.filter((item) => item.status === 'PENDING').length} pendientes
        </Badge>
      </div>
      <p className="text-muted">
        Revisá las granadas que enviaron los integrantes. Al aprobar una
        propuesta se crea una copia de equipo independiente y versionada.
      </p>

      <label className="grenade-proposal-filter">
        Estado
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="PENDING">Pendientes</option>
          <option value="APPROVED">Aprobadas</option>
          <option value="REJECTED">Rechazadas</option>
          <option value="CANCELLED">Canceladas</option>
          <option value="ALL">Todas</option>
        </select>
      </label>

      <Alert>{error}</Alert>
      <Alert variant="success">{feedback}</Alert>

      {loading && <p role="status">Cargando propuestas…</p>}
      {!loading && proposals.length === 0 && (
        <p className="text-muted">No hay propuestas en este estado.</p>
      )}

      <ul className="grenade-proposal-list">
        {proposals.map((proposal) => (
          <li key={proposal.id} className="grenade-proposal-item">
            <div className="grenade-proposal-head">
              <div>
                <strong>{proposal.snapshot?.title || 'Granada sin título'}</strong>
                <p className="text-muted">
                  {proposal.author_username || 'Integrante'} ·{' '}
                  {formatDateTime(proposal.created_at)} · Mapa #{proposal.map_id}
                </p>
              </div>
              <Badge variant={STATUS_VARIANT[proposal.status] || 'neutral'}>
                {PROPOSAL_STATUS_LABELS[proposal.status] || proposal.status}
              </Badge>
            </div>
            {proposal.note && <p>{proposal.note}</p>}
            {proposal.rejection_reason && (
              <p className="text-muted">Motivo: {proposal.rejection_reason}</p>
            )}
            {proposal.status === 'PENDING' && (
              <div className="grenade-proposal-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={busy}
                  onClick={() =>
                    run(
                      () => approveGrenadeProposal(proposal.id),
                      'Propuesta aprobada: se creó la granada de equipo.',
                    )
                  }
                >
                  Aprobar
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  disabled={busy}
                  onClick={() => setRejectTarget(proposal)}
                >
                  Rechazar
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      <RejectModal
        target={rejectTarget}
        busy={busy}
        onCancel={() => setRejectTarget(null)}
        onConfirm={reject}
      />
    </section>
  )
}
