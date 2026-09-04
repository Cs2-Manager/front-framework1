import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const [form, setForm] = useState({ email: '', password: '' })
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
    if (!form.email.trim()) {
      next.email = 'El email es obligatorio.'
    } else if (!EMAIL_REGEX.test(form.email)) {
      next.email = 'Ingresá un email válido.'
    }
    if (!form.password) {
      next.password = 'La contraseña es obligatoria.'
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
      await login({ email: form.email, password: form.password })
      navigate(from, { replace: true })
    } catch (err) {
      setServerError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          'No se pudo iniciar sesión. Intentalo de nuevo.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page container page-auth">
      <form className="auth-card" onSubmit={handleSubmit} noValidate>
        <h1>Iniciar sesión</h1>
        <p className="auth-subtitle">
          Ingresá a tu cuenta para acceder a tu espacio de entrenamiento.
        </p>

        {serverError && (
          <div className="alert alert-error" role="alert">
            {serverError}
          </div>
        )}

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
            autoComplete="current-password"
            value={form.password}
            onChange={handleChange}
            className={errors.password ? 'form-input invalid' : 'form-input'}
          />
          {errors.password && <p className="form-error">{errors.password}</p>}
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? 'Ingresando…' : 'Iniciar sesión'}
        </button>

        <p className="auth-switch">
          ¿No tenés cuenta? <Link to="/register">Registrate</Link>
        </p>
      </form>
    </div>
  )
}