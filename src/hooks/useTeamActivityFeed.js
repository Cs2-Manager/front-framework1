import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
  normalizeTeamActivity,
  useRealtime,
} from '../context/RealtimeContext.jsx'
import { fetchTeamActivity } from '../services/teamActivity.js'
import { getErrorMessage } from '../utils/errors.js'
import { PAGE_SIZE, mergeActivities } from '../components/teams/teamActivityModel.js'

/**
 * Actividad del equipo: carga paginada, eventos en vivo y protección contra
 * respuestas fuera de orden al cambiar de equipo o pedir más páginas.
 */
export default function useTeamActivityFeed({ teamId, isMember = false }) {
  const { activityByTeam } = useRealtime()
  const [items, setItems] = useState([])
  const [meta, setMeta] = useState({ total: 0, page: 1, per_page: PAGE_SIZE })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const requestRef = useRef(0)

  const load = useCallback(
    async ({ nextPage = 1, append = false } = {}) => {
      const requestId = requestRef.current + 1
      requestRef.current = requestId
      setLoading(true)
      setError('')
      try {
        const result = await fetchTeamActivity(teamId, {
          page: nextPage,
          perPage: PAGE_SIZE,
        })
        if (requestRef.current !== requestId) return
        const normalized = result.activities
          .map(normalizeTeamActivity)
          .filter(Boolean)
        setItems((current) =>
          append ? mergeActivities(current, normalized) : normalized,
        )
        setMeta(result.meta)
        setPage(nextPage)
      } catch (err) {
        if (requestRef.current !== requestId) return
        setError(
          getErrorMessage(err, 'No pudimos cargar la actividad del equipo.'),
        )
      } finally {
        if (requestRef.current === requestId) setLoading(false)
      }
    },
    [teamId],
  )

  useEffect(() => {
    setItems([])
    setMeta({ total: 0, page: 1, per_page: PAGE_SIZE })
    setPage(1)
    setError('')
    requestRef.current += 1
  }, [teamId])

  useEffect(() => {
    if (!isMember) return
    void load({ nextPage: 1 })
  }, [isMember, load])

  const live = activityByTeam[teamId] || []
  const activities = useMemo(
    () => mergeActivities(items, live),
    [items, live],
  )
  const hasMore = (meta.total || 0) > activities.length

  return {
    activities,
    total: meta.total || activities.length,
    loading,
    error,
    hasMore,
    page,
    load,
  }
}
