import { Link } from 'react-router-dom'

import FormField from '../components/common/FormField.jsx'
import AuthForm from '../components/auth/AuthForm.jsx'
import { EmailField, PasswordField } from '../components/auth/AuthFields.jsx'
import useRegisterForm from '../components/auth/useRegisterForm.js'
import SteamLoginButton from '../components/steam/SteamLoginButton.jsx'

function RegisterIdentityFields({ form, errors, onChange }) {
  return (
    <>
      <FormField
        id="name"
        name="name"
        label="Nombre"
        autoComplete="name"
        value={form.name}
        onChange={onChange}
        error={errors.name}
      />
      <EmailField value={form.email} onChange={onChange} error={errors.email} />
    </>
  )
}

function RegisterPasswordFields({ form, errors, onChange }) {
  return (
    <>
      <PasswordField
        autoComplete="new-password"
        value={form.password}
        onChange={onChange}
        error={errors.password}
      />
      <PasswordField
        name="confirmPassword"
        label="Confirmar contraseña"
        autoComplete="new-password"
        value={form.confirmPassword}
        onChange={onChange}
        error={errors.confirmPassword}
      />
    </>
  )
}

export default function Register() {
  const { form, errors, serverError, submitting, handleChange, handleSubmit } =
    useRegisterForm()

  return (
    <AuthForm
      title="Crear cuenta"
      subtitle="Registrate para empezar a entrenar en CS2 Manager."
      serverError={serverError}
      submitting={submitting}
      submitLabel="Registrarse"
      submittingLabel="Registrando…"
      onSubmit={handleSubmit}
      alternative={<SteamLoginButton label="Registrarse con Steam" />}
      footer={
        <>
          ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
        </>
      }
    >
      <RegisterIdentityFields form={form} errors={errors} onChange={handleChange} />
      <RegisterPasswordFields form={form} errors={errors} onChange={handleChange} />
    </AuthForm>
  )
}
