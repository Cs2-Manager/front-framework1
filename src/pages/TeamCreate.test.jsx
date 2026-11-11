import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import TeamCreate from './TeamCreate.jsx'

vi.mock('../components/teams/TeamForm.jsx', () => ({
  default: () => <div>Formulario de creación</div>,
}))

describe('TeamCreate page', () => {
  it('renders the creation form with a link back to the directory', () => {
    render(
      <MemoryRouter>
        <TeamCreate />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: 'Crear equipo' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Formulario de creación')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Volver a equipos' }),
    ).toHaveAttribute('href', '/teams')
  })
})
