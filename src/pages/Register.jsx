import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 6

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  function validate() {
    const next = {}
    if (!form.name.trim()) {
      next.name = 'El nombre es obligatorio.'
    }
    if (!form.email.trim()) {
      next.email = 'El email es obligatorio.'
    } else if (!EMAIL_REGEX.test(form.email)) {
      next.email = 'Ingresá un email válido.'
    }
    if (!form.password) {
      next.password = 'La contraseña es obligatoria.'
    } else if (form.password.length < MIN_PASSWORD_LENGTH) {
      next.password = `Debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`
    }
    if (form.confirmPassword !== form.password) {
      next.confirmPassword = 'Las contraseñas no coinciden.'
    }
    return next
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validate()
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setSubmitting(true)
    setServerError('')
    try {
      await register({
        username: form.name.trim(),
        email: form.email,
        password: form.password,
      })
      navigate('/', { replace: true })
    } catch (err) {
      setServerError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          'No se pudo completar el registro. Intentalo de nuevo.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page container page-auth">
      <form className="auth-card" onSubmit={handleSubmit} noValidate>
        <h1>Crear cuenta</h1>
        <p className="auth-subtitle">
          Registrate para empezar a entrenar en CS2 Manager.
        </p>

        {serverError && (
          <div className="alert alert-error" role="alert">
            {serverError}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="name">Nombre</label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            value={form.name}
            onChange={handleChange}
            className={errors.name ? 'form-input invalid' : 'form-input'}
          />
          {errors.name && <p className="form-error">{errors.name}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            className={errors.email ? 'form-input invalid' : 'form-input'}
          />
          {errors.email && <p className="form-error">{errors.email}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={handleChange}
            className={errors.password ? 'form-input invalid' : 'form-input'}
          />
          {errors.password && <p className="form-error">{errors.password}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirmar contraseña</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={handleChange}
            className={
              errors.confirmPassword ? 'form-input invalid' : 'form-input'
            }
          />
          {errors.confirmPassword && (
            <p className="form-error">{errors.confirmPassword}</p>
          )}
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? 'Registrando…' : 'Registrarse'}
        </button>

        <p className="auth-switch">
          ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
        </p>
      </form>
    </div>
  )
}