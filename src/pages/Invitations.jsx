import { useState } from 'react'

import Alert from '../components/common/Alert.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import ErrorState from '../components/common/ErrorState.jsx'
import LoadingState from '../components/common/LoadingState.jsx'
import PageHeader from '../components/common/PageHeader.jsx'
import InvitationCard from '../components/teams/InvitationCard.jsx'
import { useMyInvitations } from '../hooks/useTeams.js'
import { acceptInvitation, rejectInvitation } from '../services/teams.js'
import { getErrorMessage } from '../utils/errors.js'

const FILTERS = [
  { value: 'PENDING', label: 'Pendientes' },
  { value: 'ALL', label: 'Todas' },
]

export default function Invitations() {
  const [status, setStatus] = useState('PENDING')
  const { invitations, meta, loading, error, reload } = useMyInvitations(status)
  const [busyId, setBusyId] = useState(null)
  const [actionError, setActionError] = useState('')
  const [feedback, setFeedback] = useState('')

  async function respond(invitation, action, successMessage) {
    setBusyId(invitation.id)
    setActionError('')
    setFeedback('')
    try {
      await action(invitation.id)
      setFeedback(successMessage)
      await reload()
    } catch (err) {
      setActionError(
        getErrorMessage(err, 'No pudimos responder la invitación.'),
      )
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="page container">
      <PageHeader
        eyebrow="Equipos"
        title="Mis invitaciones"
        subtitle="Invitaciones de equipos que recibiste."
        actions={
          <div className="workshop-tabs" role="group" aria-label="Filtrar invitaciones">
            {FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                className={`workshop-tab ${status === filter.value ? 'active' : ''}`}
                onClick={() => setStatus(filter.value)}
              >
                {filter.label}
              </button>
            ))}
          </div>
        }
      />

      <Alert>{actionError}</Alert>
      <Alert variant="success">{feedback}</Alert>

      {loading && (
        <LoadingState
          label="Cargando invitaciones…"
          detail="Estamos buscando tus invitaciones."
          cards={2}
        />
      )}
      {!loading && error && <ErrorState message={error} onRetry={reload} />}
      {!loading && !error && invitations.length === 0 && (
        <EmptyState
          title={status === 'PENDING' ? 'Sin pendientes' : 'Sin invitaciones'}
          message={
            status === 'PENDING'
              ? 'No tenés invitaciones pendientes.'
              : 'Todavía no recibiste invitaciones.'
          }
        />
      )}
      {!loading && !error && invitations.length > 0 && (
        <>
          <p className="players-count">
            {meta?.total ?? invitations.length}{' '}
            {meta?.total === 1 ? 'invitación' : 'invitaciones'}
          </p>
          <div className="invitations-list">
            {invitations.map((invitation) => (
              <InvitationCard
                key={invitation.id}
                invitation={invitation}
                busy={busyId === invitation.id}
                onAccept={(item) =>
                  respond(item, acceptInvitation, 'Invitación aceptada.')
                }
                onReject={(item) =>
                  respond(item, rejectInvitation, 'Invitación rechazada.')
                }
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
