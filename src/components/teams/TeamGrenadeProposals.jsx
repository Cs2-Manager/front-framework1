import Alert from '../common/Alert.jsx'
import Badge from '../common/Badge.jsx'
import GrenadeProposalItem from './GrenadeProposalItem.jsx'
import GrenadeRejectModal from './GrenadeRejectModal.jsx'
import useTeamGrenadeProposals from '../../hooks/useTeamGrenadeProposals.js'
import '../maps/grenadeLibrary.css'

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
  const {
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
  } = useTeamGrenadeProposals({ team, canReview })

  if (!canReview) return null

  return (
    <section className="team-panel grenade-proposals">
      <div className="team-panel-head">
        <h2>Propuestas de granadas</h2>
        <Badge variant="warning">{pendingCount} pendientes</Badge>
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
          <GrenadeProposalItem
            key={proposal.id}
            proposal={proposal}
            busy={busy}
            onApprove={approve}
            onReject={setRejectTarget}
          />
        ))}
      </ul>

      <GrenadeRejectModal
        target={rejectTarget}
        busy={busy}
        onCancel={() => setRejectTarget(null)}
        onConfirm={reject}
      />
    </section>
  )
}
