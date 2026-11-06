import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import useLoginForm from './useLoginForm.js'

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
  useForm: vi.fn(),
  useLocation: vi.fn(),
  navigate: vi.fn(),
}))

vi.mock('react-router-dom', () => ({
  useLocation: mocks.useLocation,
  useNavigate: () => mocks.navigate,
}))
vi.mock('../../context/AuthContext.jsx', () => ({ useAuth: mocks.useAuth }))
vi.mock('../../hooks/useForm.js', () => ({ default: mocks.useForm }))

function renderLoginForm() {
  return renderHook(() => useLoginForm())
}

function successHandler() {
  return mocks.useForm.mock.calls[0][0].onSuccess
}

describe('useLoginForm', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    mocks.useAuth.mockReturnValue({ login: vi.fn() })
    mocks.useLocation.mockReturnValue({ state: null })
    mocks.useForm.mockReturnValue({
      form: { email: '', password: '' },
      errors: {},
      serverError: '',
      submitting: false,
      handleChange: vi.fn(),
      handleSubmit: vi.fn(),
    })
  })

  it('redirects to the dashboard after a successful login', () => {
    renderLoginForm()

    successHandler()()

    expect(mocks.navigate).toHaveBeenCalledWith('/', { replace: true })
  })

  it('returns to the originally requested route when there is one', () => {
    mocks.useLocation.mockReturnValue({ state: { from: { pathname: '/maps' } } })
    renderLoginForm()

    successHandler()()

    expect(mocks.navigate).toHaveBeenCalledWith('/maps', { replace: true })
  })
})
