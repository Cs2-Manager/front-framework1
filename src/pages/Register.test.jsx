import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import Register from './Register.jsx'

const mocks = vi.hoisted(() => ({ useRegisterForm: vi.fn() }))

vi.mock('../components/auth/useRegisterForm.js', () => ({
  default: mocks.useRegisterForm,
}))
vi.mock('../components/steam/SteamLoginButton.jsx', () => ({
  default: ({ label }) => <button type="button">{label}</button>,
}))

function formState(overrides = {}) {
  return {
    form: { name: '', email: '', password: '', confirmPassword: '' },
    errors: {},
    serverError: '',
    submitting: false,
    handleChange: vi.fn(),
    handleSubmit: vi.fn((event) => event.preventDefault()),
    ...overrides,
  }
}

function renderPage() {
  return render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>,
  )
}

describe('Register page', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renders the identity and password fields', () => {
    mocks.useRegisterForm.mockReturnValue(formState())

    renderPage()

    expect(screen.getByLabelText('Nombre')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument()
    expect(screen.getByLabelText('Confirmar contraseña')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Iniciá sesión' }),
    ).toHaveAttribute('href', '/login')
  })

  it('submits the form and forwards field changes', () => {
    const state = formState()
    mocks.useRegisterForm.mockReturnValue(state)

    renderPage()

    fireEvent.change(screen.getByLabelText('Nombre'), {
      target: { name: 'name', value: 'Frag' },
    })
    expect(state.handleChange).toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Registrarse' }))
    expect(state.handleSubmit).toHaveBeenCalled()
  })

  it('shows validation errors returned by the hook', () => {
    mocks.useRegisterForm.mockReturnValue(
      formState({ errors: { name: 'El nombre es obligatorio.' } }),
    )

    renderPage()

    expect(screen.getByText('El nombre es obligatorio.')).toBeInTheDocument()
  })

  it('shows the server error and the submitting state', () => {
    mocks.useRegisterForm.mockReturnValue(
      formState({
        serverError: 'No se pudo completar el registro.',
        submitting: true,
      }),
    )

    renderPage()

    expect(
      screen.getByText('No se pudo completar el registro.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Registrando/ })).toBeDisabled()
  })
})
