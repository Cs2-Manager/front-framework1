import { FieldGroup } from './formControls.jsx'

function fieldClassName(error) {
  return error ? 'form-input invalid' : 'form-input'
}

export function TextAreaField({
  id,
  name,
  label,
  value,
  onChange,
  error,
  placeholder,
  ...rest
}) {
  const inputId = id || name
  return (
    <FieldGroup
      inputId={inputId}
      label={label}
      error={error}
      control={
        <textarea
          id={inputId}
          name={name}
          value={value}
          onChange={onChange}
          className={fieldClassName(error)}
          placeholder={placeholder}
          {...rest}
        />
      }
    />
  )
}

export function CheckboxField({ id, name, label, value, onChange, ...rest }) {
  return (
    <div className="form-group form-check">
      <label className="form-check-label">
        <input
          id={id || name}
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
