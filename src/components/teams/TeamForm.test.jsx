import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import TeamForm from './TeamForm.jsx'

const mocks = vi.hoisted(() => ({
  createTeam: vi.fn(),
  updateTeam: vi.fn(),
}))

vi.mock('../../services/teams.js', () => ({
  createTeam: mocks.createTeam,
  updateTeam: mocks.updateTeam,
}))

function LocationProbe() {
  const location = useLocation()
  return <span data-testid="location">{location.pathname}</span>
}

function renderForm(team = null) {
  return render(
    <MemoryRouter initialEntries={['/teams/new']}>
      <TeamForm team={team} />
      <LocationProbe />
    </MemoryRouter>,
  )
}

describe('TeamForm', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('creates a team with normalized values', async () => {
    mocks.createTeam.mockResolvedValue({ id: 9 })
    renderForm()

    fireEvent.change(screen.getByLabelText('Nombre del equipo'), {
      target: { value: ' Alpha Wolves ' },
    })
    fireEvent.change(screen.getByLabelText('Tag (opcional)'), {
      target: { value: ' aw ' },
    })
    fireEvent.change(screen.getByLabelText(/País/), {
      target: { value: ' ar ' },
    })
    fireEvent.change(screen.getByLabelText('Visibilidad'), {
      target: { value: 'PUBLIC' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Crear equipo' }))

    await waitFor(() =>
      expect(mocks.createTeam).toHaveBeenCalledWith({
        name: 'Alpha Wolves',
        tag: 'AW',
        logo_url: null,
        description: null,
        country: 'AR',
        visibility: 'PUBLIC',
      }),
    )
    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent('/teams/9'),
    )
  })

  it('blocks invalid submissions', async () => {
    renderForm()

    fireEvent.change(screen.getByLabelText('Tag (opcional)'), {
      target: { value: '!' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Crear equipo' }))

    expect(
      await screen.findByText('El nombre del equipo es obligatorio.'),
    ).toBeInTheDocument()
    expect(screen.getByText(/El tag debe tener/)).toBeInTheDocument()
    expect(mocks.createTeam).not.toHaveBeenCalled()
  })

  it('edits an existing team', async () => {
    mocks.updateTeam.mockResolvedValue({ id: 5 })
    renderForm({
      id: 5,
      name: 'Alpha Wolves',
      tag: 'AW',
      country: 'AR',
      logo_url: '',
      description: 'Vieja',
      visibility: 'PRIVATE',
    })

    expect(screen.getByLabelText('Nombre del equipo')).toHaveValue('Alpha Wolves')

    fireEvent.change(screen.getByLabelText('Descripción'), {
      target: { value: 'Nueva' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    await waitFor(() =>
      expect(mocks.updateTeam).toHaveBeenCalledWith(
        5,
        expect.objectContaining({ name: 'Alpha Wolves', description: 'Nueva' }),
      ),
    )
    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent('/teams/5'),
    )
  })

  it('shows a server error when the API rejects the team', async () => {
    mocks.createTeam.mockRejectedValue({
      response: { data: { error: 'tag is already in use', fields: { tag: 'tag is already in use' } } },
    })
    renderForm()

    fireEvent.change(screen.getByLabelText('Nombre del equipo'), {
      target: { value: 'Alpha' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Crear equipo' }))

    expect(await screen.findByText('tag is already in use')).toBeInTheDocument()
  })
})
