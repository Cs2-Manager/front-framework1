import { Link, useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext.jsx'
import useForm from '../hooks/useForm.js'
import { validateEmail, validatePassword } from '../utils/validation.js'
import Alert from '../components/common/Alert.jsx'
import AuthForm from '../components/auth/AuthForm.jsx'
import { EmailField, PasswordField } from '../components/auth/AuthFields.jsx'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname
  const justRegistered = location.state?.registered
  const registeredEmail = location.state?.email || ''

  const { form, errors, serverError, submitting, handleChange, handleSubmit } =
    useForm({
      initial: { email: registeredEmail, password: '' },
      validate: (values) => {
        const next = {}
        const emailError = validateEmail(values.email)
        if (emailError) next.email = emailError
        const passwordError = validatePassword(values.password)
        if (passwordError) next.password = passwordError
        return next
      },
      submit: (values) => login({ email: values.email, password: values.password }),
      onSuccess: () => navigate(from || '/profile', { replace: true }),
      errorMessage: 'No se pudo iniciar sesión. Intentalo de nuevo.',
    })

  return (
    <AuthForm
      title="Iniciar sesión"
      subtitle="Ingresá a tu cuenta para acceder a tu espacio de entrenamiento."
      notice={
        justRegistered && !serverError ? (
          <Alert variant="success">
            Cuenta creada correctamente. Ya podés iniciar sesión.
          </Alert>
        ) : null
      }
      serverError={serverError}
      submitting={submitting}
      submitLabel="Iniciar sesión"
      submittingLabel="Ingresando…"
      onSubmit={handleSubmit}
      footer={
        <>

  const [form, setForm] = useState({ email: registeredEmail, password: '' })
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
    if (submitting) return

    const nextErrors = validate()
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setSubmitting(true)
    setServerError('')
    try {
      await login({ email: form.email, password: form.password })
      navigate(from || '/profile', { replace: true })
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

        {justRegistered && !serverError && (
          <div className="alert alert-success" role="status">
            Cuenta creada correctamente. Ya podés iniciar sesión.
          </div>
        )}

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

        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <span className="spinner spinner-sm" aria-hidden="true" />
              Ingresando…
            </>
          ) : (
            'Iniciar sesión'
          )}
        </button>

        <p className="auth-switch">
          ¿No tenés cuenta? <Link to="/register">Registrate</Link>
        </>
      }
    >
      <EmailField
        value={form.email}
        onChange={handleChange}
        error={errors.email}
      />
      <PasswordField
        value={form.password}
        onChange={handleChange}
        error={errors.password}
      />
    </AuthForm>
  )
}
