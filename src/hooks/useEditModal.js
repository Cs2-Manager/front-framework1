import { useState } from 'react'

/**
 * Gestiona la apertura de un modal de creación/edición de un recurso.
 */
export default function useEditModal() {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  function openCreate() {
    setEditing(null)
    setOpen(true)
  }

  function openEdit(item) {
    setEditing(item)
    setOpen(true)
  }

  function close() {
    setOpen(false)
    setEditing(null)
  }

  return { open, editing, openCreate, openEdit, close }
}
