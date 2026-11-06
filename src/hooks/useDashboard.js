import { useCallback, useEffect, useState } from 'react'

import { fetchDashboardSummary } from '../services/dashboard.js'

const LOAD_ERROR =
  'No pudimos cargar el resumen del dashboard. Intentalo de nuevo.'

/**
 * Resumen de la biblioteca del usuario.
 * `enabled` permite no consultar la API cuando no hay sesión activa.
 */
export default function useDashboard({ enabled = true } = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState('')

  const reload = useCallback(async () => {
    if (!enabled) {
      setData(null)
      setError('')
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')
    try {
      setData(await fetchDashboardSummary())
    } catch {
      setError(LOAD_ERROR)
    } finally {
      setLoading(false)
    }
  }, [enabled])

  useEffect(() => {
    reload()
  }, [reload])

  return { data, loading, error, reload }
}
