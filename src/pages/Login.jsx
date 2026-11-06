import { Link } from 'react-router-dom'

import Alert from '../components/common/Alert.jsx'
import AuthForm from '../components/auth/AuthForm.jsx'
import { EmailField, PasswordField } from '../components/auth/AuthFields.jsx'
import useLoginForm from '../components/auth/useLoginForm.js'
import SteamLoginButton from '../components/steam/SteamLoginButton.jsx'

function LoginNotice({ registered, serverError }) {
  if (!registered || serverError) return null
  return (
    <Alert variant="success">
      Cuenta creada correctamente. Ya podés iniciar sesión.
    </Alert>
  )
}

function LoginFields({ form, errors, onChange }) {
  return (
    <>
      <EmailField value={form.email} onChange={onChange} error={errors.email} />
      <PasswordField
        value={form.password}
        onChange={onChange}
        error={errors.password}
      />
    </>
  )
}

export default function Login() {
  const { form, errors, serverError, submitting, handleChange, handleSubmit, registered } =
    useLoginForm()

  return (
    <AuthForm
      title="Iniciar sesión"
      subtitle="Ingresá a tu cuenta para acceder a tu espacio de entrenamiento."
      notice={<LoginNotice registered={registered} serverError={serverError} />}
      serverError={serverError}
      submitting={submitting}
      submitLabel="Iniciar sesión"
      submittingLabel="Ingresando…"
      onSubmit={handleSubmit}
      alternative={<SteamLoginButton />}
      footer={
        <>
          ¿No tenés cuenta? <Link to="/register">Registrate</Link>
        </>
      }
    >
      <LoginFields form={form} errors={errors} onChange={handleChange} />
    </AuthForm>
  )
}
