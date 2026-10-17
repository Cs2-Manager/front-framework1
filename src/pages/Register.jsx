import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext.jsx'
import useForm from '../hooks/useForm.js'
import { validateEmail, validatePassword } from '../utils/validation.js'
import FormField from '../components/common/FormField.jsx'
import AuthForm from '../components/auth/AuthForm.jsx'
import { EmailField, PasswordField } from '../components/auth/AuthFields.jsx'

const MIN_PASSWORD_LENGTH = 6

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const { form, errors, serverError, submitting, handleChange, handleSubmit } =
    useForm({
      initial: { name: '', email: '', password: '', confirmPassword: '' },
      validate: (values) => {
        const next = {}
        if (!values.name.trim()) next.name = 'El nombre es obligatorio.'
        const emailError = validateEmail(values.email)
        if (emailError) next.email = emailError
        const passwordError = validatePassword(values.password, {
          minLength: MIN_PASSWORD_LENGTH,
        })
        if (passwordError) next.password = passwordError
        if (values.confirmPassword !== values.password) {
          next.confirmPassword = 'Las contraseñas no coinciden.'
        }
        return next
      },
      submit: (values) =>
        register({
          username: values.name.trim(),
          email: values.email,
          password: values.password,
        }),
      onSuccess: () =>
        navigate('/login', {
          replace: true,
          state: { registered: true, email: form.email },
        }),
      errorMessage: 'No se pudo completar el registro. Intentalo de nuevo.',
    })

  return (
    <AuthForm
      title="Crear cuenta"
      subtitle="Registrate para empezar a entrenar en CS2 Manager."
      serverError={serverError}
      submitting={submitting}
      submitLabel="Registrarse"
      submittingLabel="Registrando…"
      onSubmit={handleSubmit}
      footer={
        <>
          ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
        </>
      }
    >
      <FormField
        id="name"
        name="name"
        label="Nombre"
        autoComplete="name"
        value={form.name}
        onChange={handleChange}
        error={errors.name}
      />
      <EmailField
        value={form.email}
        onChange={handleChange}
        error={errors.email}
      />
      <PasswordField
        autoComplete="new-password"
        value={form.password}
        onChange={handleChange}
        error={errors.password}
      />
      <PasswordField
        name="confirmPassword"
        label="Confirmar contraseña"
        autoComplete="new-password"
        value={form.confirmPassword}
        onChange={handleChange}
        error={errors.confirmPassword}
      />
    </AuthForm>
  )
}
