import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import Home from './Home.jsx'
import { fetchDashboardSummary } from '../services/dashboard.js'

const mocks = vi.hoisted(() => ({ useAuth: vi.fn() }))

vi.mock('../context/AuthContext.jsx', () => ({ useAuth: mocks.useAuth }))
vi.mock('../services/dashboard.js', () => ({
  fetchDashboardSummary: vi.fn(),
}))

const DASHBOARD = {
  summary: {
    maps: { total: 4, active_pool: 2, callouts: 12 },
    lineups: {
      total: 3,
      by_type: [
        { type: 'Smoke', count: 2 },
        { type: 'Molotov', count: 0 },
        { type: 'Flash', count: 1 },
        { type: 'HE', count: 0 },
        { type: 'Decoy', count: 0 },
      ],
    },
    workshop_maps: { total: 2, categories: 2 },
  },
  active_maps: [
    { id: 1, name: 'Mirage', image_url: '', callouts_count: 5 },
  ],
  recent_lineups: [
    {
      id: 7,
      title: 'Smoke A',
      type: 'Smoke',
      side: 'CT',
      map_id: 1,
      map_name: 'Mirage',
    },
  ],
}

const EMPTY_DASHBOARD = {
  summary: {
    maps: { total: 0, active_pool: 0, callouts: 0 },
    lineups: {
      total: 0,
      by_type: [
        { type: 'Smoke', count: 0 },
        { type: 'Molotov', count: 0 },
        { type: 'Flash', count: 0 },
        { type: 'HE', count: 0 },
        { type: 'Decoy', count: 0 },
      ],
    },
    workshop_maps: { total: 0, categories: 0 },
  },
  active_maps: [],
  recent_lineups: [],
}

function renderHome() {
  return render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>,
  )
}

describe('Home dashboard', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    mocks.useAuth.mockReturnValue({ user: { username: 'ana' } })
  })

  it('renders the welcome message and the dashboard data', async () => {
    fetchDashboardSummary.mockResolvedValue(DASHBOARD)
    renderHome()

    expect(
      screen.getByRole('heading', { name: 'Hola, ana' }),
    ).toBeInTheDocument()

    expect(await screen.findByText('Resumen de la biblioteca')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.getByText('2 en pool activo')).toBeInTheDocument()
    expect(screen.getByText('2 de 5 utilidades')).toBeInTheDocument()
    expect(screen.getByText('5 zonas')).toBeInTheDocument()
    expect(screen.getByText('Smoke A')).toBeInTheDocument()

    expect(
      screen.getByRole('link', { name: /Mapas y callouts/ }),
    ).toHaveAttribute('href', '/maps')
    expect(
      screen.getByRole('link', { name: /Biblioteca de lineups/ }),
    ).toHaveAttribute('href', '/lineups')
    expect(
      screen.getByRole('link', { name: /Steam Workshop/ }),
    ).toHaveAttribute('href', '/workshop')
  })

  it('shows a loading state while the summary is requested', () => {
    fetchDashboardSummary.mockReturnValue(new Promise(() => {}))
    renderHome()

    expect(screen.getByText('Cargando tu dashboard…')).toBeInTheDocument()
  })

  it('shows an onboarding empty state when the library has no data', async () => {
    fetchDashboardSummary.mockResolvedValue(EMPTY_DASHBOARD)
    renderHome()

    expect(
      await screen.findByText('Tu espacio de entrenamiento está vacío'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Crear el primer mapa' }),
    ).toHaveAttribute('href', '/maps')
    expect(screen.queryByText('Resumen de la biblioteca')).not.toBeInTheDocument()
  })

  it('shows a safe error message and retries the request', async () => {
    fetchDashboardSummary
      .mockRejectedValueOnce(new Error('detalle interno del backend'))
      .mockResolvedValueOnce(DASHBOARD)
    renderHome()

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(
      'No pudimos cargar el resumen del dashboard. Intentalo de nuevo.',
    )
    expect(alert).not.toHaveTextContent('detalle interno del backend')

    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))

    expect(await screen.findByText('Resumen de la biblioteca')).toBeInTheDocument()
    expect(fetchDashboardSummary).toHaveBeenCalledTimes(2)
  })

  it('falls back to a generic name when the user has no username', async () => {
    mocks.useAuth.mockReturnValue({ user: null })
    fetchDashboardSummary.mockResolvedValue(DASHBOARD)
    renderHome()

    expect(
      screen.getByRole('heading', { name: 'Hola, jugador' }),
    ).toBeInTheDocument()
    expect(await screen.findByText('Resumen de la biblioteca')).toBeInTheDocument()
  })

  it('shows the empty state when the dashboard payload is incomplete', async () => {
    // Un payload malformado (respuesta intermedia, middleware de error) no
    // debe tumbar la página: cae al estado vacío en lugar de lanzar
    // "can't access property 'maps', e is undefined".
    fetchDashboardSummary.mockResolvedValue({})
    renderHome()

    expect(
      await screen.findByText('Tu espacio de entrenamiento está vacío'),
    ).toBeInTheDocument()
    expect(screen.queryByText('Resumen de la biblioteca')).not.toBeInTheDocument()
  })
})
