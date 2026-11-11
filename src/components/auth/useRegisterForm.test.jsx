import { act, renderHook, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import useRegisterForm from './useRegisterForm.js'

const mocks = vi.hoisted(() => ({ useAuth: vi.fn() }))

vi.mock('../../context/AuthContext.jsx', () => ({ useAuth: mocks.useAuth }))

function wrapper({ children }) {
  return <MemoryRouter>{children}</MemoryRouter>
}

describe('useRegisterForm', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('maps the display name to the username and calls register', async () => {
    const register = vi.fn().mockResolvedValue({})
    mocks.useAuth.mockReturnValue({ register })

    const { result } = renderHook(() => useRegisterForm(), { wrapper })

    act(() => {
      result.current.updateValues({
        name: '  Frag  ',
        email: 'frag@example.test',
        password: 'secret123',
        confirmPassword: 'secret123',
      })
    })
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() })
    })

    expect(register).toHaveBeenCalledWith({
      username: 'Frag',
      email: 'frag@example.test',
      password: 'secret123',
    })
  })

  it('does not submit when validation fails', async () => {
    const register = vi.fn()
    mocks.useAuth.mockReturnValue({ register })

    const { result } = renderHook(() => useRegisterForm(), { wrapper })

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() })
    })

    expect(register).not.toHaveBeenCalled()
    expect(result.current.errors.name).toBe('El nombre es obligatorio.')
  })

  it('exposes the backend error message when registration fails', async () => {
    mocks.useAuth.mockReturnValue({
      register: vi.fn().mockRejectedValue(new Error('boom')),
    })

    const { result } = renderHook(() => useRegisterForm(), { wrapper })

    act(() => {
      result.current.updateValues({
        name: 'Frag',
        email: 'frag@example.test',
        password: 'secret123',
        confirmPassword: 'secret123',
      })
    })
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() })
    })

    await waitFor(() =>
      expect(result.current.serverError).toBe(
        'No se pudo completar el registro. Intentalo de nuevo.',
      ),
    )
  })
})
