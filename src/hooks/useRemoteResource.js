import { useCallback, useEffect, useState } from 'react'

import { getErrorMessage } from '../utils/errors.js'

/**
 * Carga un recurso remoto gestionando estados de carga, error y recarga.
 * `mapError` permite traducir errores HTTP concretos (403, 404, etc.).
 */
export default function useRemoteResource(
  fetcher,
  { deps = [], errorMessage, mapError } = {},
) {
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
