import FormField from '../common/FormField.jsx'

export function EmailField({ value, onChange, error }) {
  return (
    <FormField
      id="email"
      name="email"
      label="Email"
      type="email"
      autoComplete="email"
      value={value}
      onChange={onChange}
      error={error}
    />
  )
}

export function PasswordField({
  name = 'password',
  label = 'Contraseña',
  autoComplete = 'current-password',
  value,
  onChange,
  error,
}) {
  return (
    <FormField
      id={name}
      name={name}
      label={label}
      type="password"
      autoComplete={autoComplete}
      value={value}
      onChange={onChange}
      error={error}
    />
  )
}
