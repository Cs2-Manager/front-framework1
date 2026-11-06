import { useCallback, useEffect, useState } from 'react'

import {
  fetchOwnProfile,
  fetchPlayer,
  fetchPlayers,
} from '../services/profiles.js'
import { getErrorMessage } from '../utils/errors.js'

const OWN_PROFILE_ERROR =
  'No pudimos cargar tu perfil. Intentalo de nuevo.'
const PLAYER_PROFILE_ERROR =
  'No pudimos cargar el perfil del jugador. Intentalo de nuevo.'
const PLAYERS_ERROR =
  'No pudimos cargar el directorio de jugadores. Intentalo de nuevo.'

function useRemoteResource(fetcher, { deps = [], errorMessage, mapError } = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const reload = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setData(await fetcher())
    } catch (err) {
      setError(mapError ? mapError(err) : getErrorMessage(err, errorMessage))
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    reload()
  }, [reload])

  return { data, setData, loading, error, reload }
}

export function useOwnProfile() {
  return useRemoteResource(fetchOwnProfile, { errorMessage: OWN_PROFILE_ERROR })
}

function playerProfileError(err) {
  if (err?.response?.status === 403) return 'Este perfil es privado.'
  if (err?.response?.status === 404) return 'No encontramos ese jugador.'
  return getErrorMessage(err, PLAYER_PROFILE_ERROR)
}

export function usePlayerProfile(userId) {
  const fetcher = useCallback(() => fetchPlayer(userId), [userId])
  return useRemoteResource(fetcher, {
    deps: [fetcher],
    errorMessage: PLAYER_PROFILE_ERROR,
    mapError: playerProfileError,
  })
}

export function usePlayers(search = '') {
  const fetcher = useCallback(() => fetchPlayers({ search }), [search])
  const resource = useRemoteResource(fetcher, {
    deps: [fetcher],
    errorMessage: PLAYERS_ERROR,
  })

  return {
    ...resource,
    players: resource.data?.players ?? [],
    meta: resource.data?.meta ?? null,
  }
}
