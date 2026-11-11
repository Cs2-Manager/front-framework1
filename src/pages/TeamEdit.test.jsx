import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import TeamEdit from './TeamEdit.jsx'

const mocks = vi.hoisted(() => ({ useTeam: vi.fn() }))

vi.mock('../hooks/useTeams.js', () => ({ useTeam: mocks.useTeam }))
vi.mock('../components/teams/TeamForm.jsx', () => ({
  default: ({ team }) => <div>Formulario de {team.name}</div>,
}))

function state(overrides = {}) {
  return {
    team: null,
    loading: false,
    error: '',
    reload: vi.fn(),
    ...overrides,
  }
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/teams/5/edit']}>
      <Routes>
        <Route path="/teams/:id/edit" element={<TeamEdit />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('TeamEdit page', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('shows a loading state while the team loads', () => {
    mocks.useTeam.mockReturnValue(state({ loading: true }))

    renderPage()

    expect(mocks.useTeam).toHaveBeenCalledWith('5')
    expect(screen.getByRole('status')).toHaveTextContent('Cargando equipo')
  })

  it('renders the form when the user can edit', () => {
    mocks.useTeam.mockReturnValue(
      state({
        team: { id: 5, name: 'Alpha', permissions: { can_edit: true } },
      }),
    )

    renderPage()

    expect(screen.getByText('Formulario de Alpha')).toBeInTheDocument()
  })

  it('blocks editing when the user lacks permission', () => {
    mocks.useTeam.mockReturnValue(
      state({
        team: { id: 5, name: 'Alpha', permissions: { can_edit: false } },
      }),
    )

    renderPage()

    expect(
      screen.getByText('No tenés permiso para editar este equipo.'),
    ).toBeInTheDocument()
    expect(screen.queryByText('Formulario de Alpha')).not.toBeInTheDocument()
  })

  it('shows the error state when the team cannot be loaded', () => {
    mocks.useTeam.mockReturnValue(
      state({ error: 'No encontramos ese equipo.' }),
    )

    renderPage()

    expect(
      screen.getByText('No encontramos ese equipo.'),
    ).toBeInTheDocument()
  })
})
