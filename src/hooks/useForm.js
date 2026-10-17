import { useEffect, useState } from 'react'

import { getErrorMessage } from '../utils/errors.js'

/**
 * Estado y flujo de envío para formularios (modales y páginas de auth).
 *
 * @param {object} options
 * @param {object} [options.initial] - valores iniciales fijos.
 * @param {() => object} [options.buildInitial] - inicial derivado de props.
 * @param {boolean} [options.open] - si se define, reinicia cada vez que cambia.
 * @param {any[]} [options.deps] - dependencias adicionales que reinician el form.
 * @param {(values: object) => object} [options.validate] - errores por campo.
 * @param {(values: object) => Promise<any>} options.submit - petición de guardado.
 * @param {(result: any) => void} [options.onSuccess]
 * @param {string} [options.errorMessage] - mensaje por defecto si falla.
 */
export default function useForm({
  initial,
  buildInitial,
  open,
  deps = [],
  validate,
  submit,
  onSuccess,
  errorMessage,
}) {
  const makeInitial = () => (buildInitial ? buildInitial() : initial)

  const [form, setForm] = useState(makeInitial)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open !== undefined && !open) return
    setForm(makeInitial())
    setErrors({})
    setServerError('')
    setSubmitting(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, ...deps])

  function updateValues(values) {
    setForm((prev) => ({ ...prev, ...values }))
    setErrors((prev) => {
      const next = { ...prev }
      for (const key of Object.keys(values)) next[key] = undefined
      return next
    })
  }

  function handleChange(event) {
    const { name, type, value, checked } = event.target
    let next = value
    if (type === 'checkbox') next = checked
    else if (type === 'number') next = value === '' ? '' : Number(value)
    updateValues({ [name]: next })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (submitting) return

    const nextErrors = validate ? validate(form) : {}
    if (nextErrors && Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setSubmitting(true)
    setServerError('')
    try {
      const result = await submit(form)
      onSuccess?.(result)
    } catch (err) {
      const fields = err.response?.data?.fields
      if (fields) {
        setErrors(fields)
      } else {
        setServerError(getErrorMessage(err, errorMessage))
      }
    } finally {
      setSubmitting(false)
    }
  }

  return {
    form,
    errors,
    serverError,
    submitting,
    updateValues,
    handleChange,
    handleSubmit,
    modalProps: { open, serverError, submitting, onSubmit: handleSubmit },
  }
}
