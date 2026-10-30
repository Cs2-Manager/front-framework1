import { useEffect, useState } from 'react'

import { getErrorMessage } from '../utils/errors.js'

/** Valor siguiente de un evento de cambio (checkbox -> checked, number -> Number). */
export function readFieldValue({ type, value, checked }) {
  if (type === 'checkbox') return checked
  if (type === 'number') return value === '' ? '' : Number(value)
  return value
}

/** Copia de `errors` con las claves indicadas puestas en `undefined`. */
export function clearFieldErrors(previous, keys) {
  const next = { ...previous }
  for (const key of keys) next[key] = undefined
  return next
}

/** Errores de validación del formulario (o {} si no hay validador). */
export function runValidation(validate, form) {
  return validate ? validate(form) : {}
}

/** Enruta el error de un envío fallido: prioriza campos de servidor. */
export function applySubmitError(err, { setErrors, setServerError, errorMessage }) {
  const fields = err.response?.data?.fields
  if (fields) {
    setErrors(fields)
    return
  }
  setServerError(getErrorMessage(err, errorMessage))
}

/** Reinicia el formulario al abrirse o al cambiar sus dependencias. */
function useFormReset(open, deps, reset) {
  useEffect(() => {
    if (open !== undefined && !open) return
    reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, ...deps])
}

/** Estado base (valores, errores y flags) con reinicio automático. */
export function useFormFields({ makeInitial, open, deps }) {
  const [form, setForm] = useState(makeInitial)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useFormReset(open, deps, () => {
    setForm(makeInitial())
    setErrors({})
    setServerError('')
    setSubmitting(false)
  })

  return {
    form,
    setForm,
    errors,
    setErrors,
    serverError,
    setServerError,
    submitting,
    setSubmitting,
  }
}
