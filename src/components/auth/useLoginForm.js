import { useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext.jsx'
import useForm from '../../hooks/useForm.js'
import { validateLogin } from './authValidation.js'

/**
 * Estado y envío del formulario de inicio de sesión.
 */
export default function useLoginForm() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname
  const registered = location.state?.registered
  const email = location.state?.email || ''

  const fields = useForm({
    initial: { email, password: '' },
    validate: validateLogin,
    submit: (values) =>
      login({ email: values.email, password: values.password }),
    onSuccess: () => navigate(from || '/profile', { replace: true }),
    errorMessage: 'No se pudo iniciar sesión. Intentalo de nuevo.',
  })

  return { ...fields, registered }
}
