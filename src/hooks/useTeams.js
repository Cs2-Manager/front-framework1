import { useCallback } from 'react'

import {
  fetchMyInvitations,
  fetchMyTeam,
  fetchTeam,
  fetchTeamInvitations,
  fetchTeams,
} from '../services/teams.js'
import { getErrorMessage } from '../utils/errors.js'
import useRemoteResource from './useRemoteResource.js'

const TEAMS_ERROR = 'No pudimos cargar el directorio de equipos. Intentalo de nuevo.'
const TEAM_ERROR = 'No pudimos cargar el equipo. Intentalo de nuevo.'
const MY_TEAM_ERROR = 'No pudimos cargar tu equipo. Intentalo de nuevo.'
const INVITATIONS_ERROR =
  'No pudimos cargar las invitaciones. Intentalo de nuevo.'

function teamError(err) {
  if (err?.response?.status === 403) return 'Este equipo es privado.'
  if (err?.response?.status === 404) return 'No encontramos ese equipo.'
  return getErrorMessage(err, TEAM_ERROR)
}

export function useTeams(search = '') {
  const fetcher = useCallback(() => fetchTeams({ search }), [search])
  const resource = useRemoteResource(fetcher, {
    deps: [fetcher],
    errorMessage: TEAMS_ERROR,
  })

  return {
    ...resource,
    teams: resource.data?.teams ?? [],
    meta: resource.data?.meta ?? null,
  }
}

export function useTeam(teamId) {
  const fetcher = useCallback(() => fetchTeam(teamId), [teamId])
  const resource = useRemoteResource(fetcher, {
    deps: [fetcher],
    errorMessage: TEAM_ERROR,
    mapError: teamError,
  })

  return { ...resource, team: resource.data }
}

export function useMyTeam() {
  const resource = useRemoteResource(fetchMyTeam, {
    errorMessage: MY_TEAM_ERROR,
  })

  return { ...resource, team: resource.data }
}

export function useMyInvitations(status = 'PENDING') {
  const fetcher = useCallback(
    () => fetchMyInvitations({ status }),
    [status],
  )
  const resource = useRemoteResource(fetcher, {
    deps: [fetcher],
    errorMessage: INVITATIONS_ERROR,
  })

  return {
    ...resource,
    invitations: resource.data?.invitations ?? [],
    meta: resource.data?.meta ?? null,
  }
}

export function useTeamInvitations(teamId, status = 'PENDING') {
  const fetcher = useCallback(
    () => fetchTeamInvitations(teamId, { status }),
    [teamId, status],
  )
  const resource = useRemoteResource(fetcher, {
    deps: [fetcher],
    errorMessage: INVITATIONS_ERROR,
  })

  return {
    ...resource,
    invitations: resource.data?.invitations ?? [],
    meta: resource.data?.meta ?? null,
  }
}
