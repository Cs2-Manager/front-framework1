/**
 * Campo de formulario con etiqueta y mensaje de error.
 * Soporta `input`, `select`, `textarea` y `checkbox`.
 */
export default function FormField({
  id,
  name,
  label,
  type = 'text',
  as = 'input',
  value,
  onChange,
  error,
  placeholder,
  autoComplete,
  options,
  children,
  ...rest
}) {
  const inputId = id || name
  const className = error ? 'form-input invalid' : 'form-input'

  if (as === 'checkbox') {
    return (
      <div className="form-group form-check">
        <label className="form-check-label">
          <input
            id={inputId}
            name={name}
            type="checkbox"
            checked={Boolean(value)}
            onChange={onChange}
            {...rest}
          />
          {label}
        </label>
      </div>
    )
  }

  let control
  if (as === 'select') {
    control = (
      <select
        id={inputId}
        name={name}
        value={value}
        onChange={onChange}
        className={className}
        {...rest}
      >
        {options
          ? options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))
          : children}
      </select>
    )
  } else if (as === 'textarea') {
    control = (
      <textarea
        id={inputId}
        name={name}
        value={value}
        onChange={onChange}
        className={className}
        placeholder={placeholder}
        {...rest}
      />
    )
  } else {
    control = (
      <input
        id={inputId}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className={className}
        placeholder={placeholder}
        autoComplete={autoComplete}
        {...rest}
      />
    )
  }

  return (
    <div className="form-group">
      <label htmlFor={inputId}>{label}</label>
      {control}
      {error && <p className="form-error">{error}</p>}
    </div>
  )
}
