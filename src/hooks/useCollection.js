import { useCallback, useEffect, useState } from 'react'

import { getErrorMessage } from '../utils/errors.js'

/**
 * Carga una colección remota gestionando estados de carga y error.
 *
 * @param {() => Promise<any[]>} fetcher
 * @param {object} [options]
 * @param {string} [options.errorMessage] - mensaje por defecto si falla.
 * @param {any[]} [options.deps] - dependencias que disparan una recarga.
 */
export default function useCollection(
  fetcher,
  { errorMessage, deps = [] } = {},
) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const reload = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setItems(await fetcher())
    } catch (err) {
      setError(getErrorMessage(err, errorMessage))
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    reload()
  }, [reload])

  return { items, setItems, loading, error, reload }
}
