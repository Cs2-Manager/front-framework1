import Badge from '../common/Badge.jsx'
import {
  PROPOSAL_STATUS_LABELS,
} from '../../services/grenadeLineups.js'
import { formatDateTime } from '../profile/format.js'

const STATUS_VARIANT = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
  CANCELLED: 'neutral',
}

/** Fila de propuesta con su estado y acciones de revisión. */
export default function GrenadeProposalItem({
  proposal,
  busy,
  onApprove,
  onReject,
}) {
  return (
    <li className="grenade-proposal-item">
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
            onClick={() => onApprove(proposal)}
          >
            Aprobar
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            disabled={busy}
            onClick={() => onReject(proposal)}
          >
            Rechazar
          </button>
        </div>
      )}
    </li>
  )
}
