import { useCallback, useEffect, useState } from 'react'

import { deleteCallout, fetchMap } from '../services/maps.js'
import { getErrorMessage } from '../utils/errors.js'
import useDelete from './useDelete.js'
import useEditModal from './useEditModal.js'

const LOAD_ERROR = 'No se pudo cargar el mapa. Intentalo de nuevo.'

/**
 * Carga un mapa por id gestionando estados de carga y error.
 */
export function useMapLoader(id, onLoaded) {
  const [map, setMap] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setMap(await fetchMap(id))
      onLoaded()
    } catch (err) {
      setError(getErrorMessage(err, LOAD_ERROR))
    } finally {
      setLoading(false)
    }
  }, [id, onLoaded])

  useEffect(() => {
    load()
  }, [load])

  return { map, setMap, loading, error, load }
}

/**
 * Apertura y cierre del modal de edición del mapa.
 */
export function useMapEditing(setMap) {
  const [editOpen, setEditOpen] = useState(false)

  const openEdit = useCallback(() => setEditOpen(true), [])
  const closeEdit = useCallback(() => setEditOpen(false), [])
  const handleMapSaved = useCallback(
    (updated) => {
      setMap(updated)
      setEditOpen(false)
    },
    [setMap],
  )

  return { editOpen, openEdit, closeEdit, handleMapSaved }
}

/**
 * Carga un mapa por id gestionando selección, edición y borrado de zonas.
 */
export default function useMapDetail(id) {
  const [selected, setSelected] = useState(0)
  const resetSelection = useCallback(() => setSelected(0), [])

  const loader = useMapLoader(id, resetSelection)
  const calloutModal = useEditModal()
  const editing = useMapEditing(loader.setMap)

  const deletion = useDelete((callout) => deleteCallout(loader.map.id, callout.id), {
    errorMessage: 'No se pudo eliminar la zona. Intentalo de nuevo.',
    onDeleted: () => {
      setSelected(null)
      loader.load()
    },
  })

  return {
    ...loader,
    selected,
    setSelected,
    calloutModal,
    deletion,
    ...editing,
  }
}
