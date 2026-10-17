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
