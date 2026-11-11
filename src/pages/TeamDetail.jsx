import { Link, useParams } from 'react-router-dom'

import Alert from '../components/common/Alert.jsx'
import ConfirmDialog from '../components/common/ConfirmDialog.jsx'
import ErrorState from '../components/common/ErrorState.jsx'
import LoadingState from '../components/common/LoadingState.jsx'
import TeamActivityFeed from '../components/teams/TeamActivityFeed.jsx'
import TeamHeader from '../components/teams/TeamHeader.jsx'
import TeamGrenadeProposals from '../components/teams/TeamGrenadeProposals.jsx'
import TeamInvitationsPanel from '../components/teams/TeamInvitationsPanel.jsx'
import TeamRoster from '../components/teams/TeamRoster.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useRealtime } from '../context/RealtimeContext.jsx'
import { useTeam } from '../hooks/useTeams.js'
import useTeamDetailActions from '../hooks/useTeamDetailActions.js'

export default function TeamDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const { presenceByTeam } = useRealtime()
  const { team, loading, error, reload } = useTeam(id)
  const viewerId = user?.id

  const {
    busy,
    actionError,
    feedback,
    confirm,
    setConfirm,
    handleInvite,
    askRemove,
    askTransfer,
    askLeave,
    handleConfirm,
    changeRole,
    cancelInvitation,
  } = useTeamDetailActions({ team, reload })

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
              presence={team.is_member ? presenceByTeam[team.id] : null}
              busy={busy}
              onRemove={askRemove}
              onChangeRole={changeRole}
              onTransfer={askTransfer}
            />

            <TeamInvitationsPanel
              team={team}
              viewerId={viewerId}
              busy={busy}
              onInvite={handleInvite}
              onCancel={cancelInvitation}
            />
          </div>

          <TeamActivityFeed teamId={team.id} isMember={team.is_member} />

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
