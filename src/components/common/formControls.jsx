function fieldClassName(error) {
  return error ? 'form-input invalid' : 'form-input'
}

export function FieldGroup({ inputId, label, error, control }) {
  return (
    <div className="form-group">
      <label htmlFor={inputId}>{label}</label>
      {control}
      {error && <p className="form-error">{error}</p>}
    </div>
  )
}

export function TextInputField({
  id,
  name,
  label,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  autoComplete,
  ...rest
}) {
  const inputId = id || name
  return (
    <FieldGroup
      inputId={inputId}
      label={label}
      error={error}
      control={
        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          className={fieldClassName(error)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          {...rest}
        />
      }
    />
  )
}

function OptionList({ options }) {
  return options.map((option) => (
    <option key={option.value} value={option.value}>
      {option.label}
    </option>
  ))
}

export function SelectField({
  id,
  name,
  label,
  value,
  onChange,
  error,
  options,
  children,
  ...rest
}) {
  const inputId = id || name
  return (
    <FieldGroup
      inputId={inputId}
      label={label}
      error={error}
      control={
        <select
          id={inputId}
          name={name}
          value={value}
          onChange={onChange}
          className={fieldClassName(error)}
          {...rest}
        >
          {options ? <OptionList options={options} /> : children}
        </select>
      }
    />
  )
}
