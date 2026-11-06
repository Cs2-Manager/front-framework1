import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import ProtectedRoute from './ProtectedRoute.jsx'

const mocks = vi.hoisted(() => ({ useAuth: vi.fn() }))

vi.mock('../context/AuthContext.jsx', () => ({ useAuth: mocks.useAuth }))

function renderProtectedRoute() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <div>Contenido protegido</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div>Pantalla de login</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('shows the session loading state while initializing', () => {
    mocks.useAuth.mockReturnValue({ isAuthenticated: false, initializing: true })
    renderProtectedRoute()

    expect(screen.getByText('Cargando sesión…')).toBeInTheDocument()
    expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument()
  })

  it('redirects anonymous users to the login screen', () => {
    mocks.useAuth.mockReturnValue({ isAuthenticated: false, initializing: false })
    renderProtectedRoute()

    expect(screen.getByText('Pantalla de login')).toBeInTheDocument()
    expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument()
  })

  it('renders the protected content for authenticated users', () => {
    mocks.useAuth.mockReturnValue({ isAuthenticated: true, initializing: false })
    renderProtectedRoute()

    expect(screen.getByText('Contenido protegido')).toBeInTheDocument()
  })
})
