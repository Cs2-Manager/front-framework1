import { useCallback } from 'react'

import {
  fetchTeamLineup,
  fetchTeamLineups,
} from '../services/teamLineups.js'
import { getErrorMessage } from '../utils/errors.js'
import useRemoteResource from './useRemoteResource.js'

const LINEUPS_ERROR =
  'No pudimos cargar las alineaciones. Intentalo de nuevo.'
const LINEUP_ERROR =
  'No pudimos cargar la alineación. Intentalo de nuevo.'

function lineupError(err) {
  if (err?.response?.status === 403) return 'Este equipo es privado.'
  if (err?.response?.status === 404) {
    return 'No encontramos esa alineación.'
  }
  return getErrorMessage(err, LINEUP_ERROR)
}

export function useTeamLineups(teamId) {
  const fetcher = useCallback(() => fetchTeamLineups(teamId), [teamId])
  const resource = useRemoteResource(fetcher, {
    deps: [fetcher],
    errorMessage: LINEUPS_ERROR,
    mapError: lineupError,
  })

  return {
    ...resource,
    lineups: resource.data?.lineups ?? [],
    limits: resource.data?.limits ?? null,
    meta: resource.data?.meta ?? null,
  }
}

export function useTeamLineup(teamId, lineupId) {
  const fetcher = useCallback(
    () => fetchTeamLineup(teamId, lineupId),
    [teamId, lineupId],
  )
  const resource = useRemoteResource(fetcher, {
    deps: [fetcher],
    errorMessage: LINEUP_ERROR,
    mapError: lineupError,
  })

  return {
    ...resource,
    lineup: resource.data?.lineup ?? null,
    limits: resource.data?.limits ?? null,
  }
}
