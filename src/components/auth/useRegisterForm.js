import { useNavigate } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext.jsx'
import useForm from '../../hooks/useForm.js'
import { validateRegister } from './authValidation.js'

/**
 * Estado y envío del formulario de registro.
 */
export default function useRegisterForm() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const result = useForm({
    initial: { name: '', email: '', password: '', confirmPassword: '' },
    validate: validateRegister,
    submit: (values) =>
      register({
        username: values.name.trim(),
        email: values.email,
        password: values.password,
      }),
    onSuccess: () =>
      navigate('/login', {
        replace: true,
        state: { registered: true, email: result.form.email },
      }),
    errorMessage: 'No se pudo completar el registro. Intentalo de nuevo.',
  })

  return result
}
