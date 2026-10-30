import { SelectField, TextInputField } from './formControls.jsx'
import { CheckboxField, TextAreaField } from './formFields.jsx'

const CONTROLS = {
  checkbox: CheckboxField,
  select: SelectField,
  textarea: TextAreaField,
}

/**
 * Campo de formulario con etiqueta y mensaje de error.
 * Soporta `input`, `select`, `textarea` y `checkbox`.
 */
export default function FormField({ as = 'input', ...props }) {
  const Control = CONTROLS[as] || TextInputField
  return <Control {...props} />
}
