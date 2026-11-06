import { beforeEach, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import GrenadeLibrary from './GrenadeLibrary.jsx'

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  useAuth: vi.fn(),
}))

vi.mock('../../services/api.js', () => ({ default: mocks }))
vi.mock('../../context/AuthContext.jsx', () => ({ useAuth: mocks.useAuth }))

const personal = {
  id: 7,
  map_id: 2,
  scope: 'PERSONAL',
  title: 'Mi smoke privada',
  type: 'Smoke',
  grenade_type: 'SMOKE',
  side: 'T',
  difficulty: 'EASY',
  status: 'PUBLISHED',
  visibility: 'PRIVATE',
  can_edit: true,
  can_propose: true,
  tags: [],
  media: [],
}

function routeGet(url) {
  if (url.endsWith('favorites')) return Promise.resolve({ data: { favorites: [] } })
  if (url === '/grenade-lineups/personal') {
    return Promise.resolve({ data: { lineups: [personal] } })
  }
  if (url === '/teams/1/grenade-lineups') {
    return Promise.resolve({ data: { lineups: [] } })
  }
  return Promise.resolve({ data: { lineups: [] } })
}

beforeEach(() => {
  vi.resetAllMocks()
  mocks.useAuth.mockReturnValue({ user: { id: 1, is_admin: false } })
  mocks.get.mockImplementation(routeGet)
  mocks.post.mockResolvedValue({ data: { proposal: { id: 1 } } })
  mocks.put.mockResolvedValue({})
  mocks.delete.mockResolvedValue({})
})

it('lets members favorite visible grenades while hiding editing controls', async () => {
  mocks.get.mockImplementation((url) => {
    if (url.endsWith('favorites')) {
      return Promise.resolve({ data: { favorites: [] } })
    }
    return Promise.resolve({
      data: {
        lineups: [
          {
            id: 4,
            title: 'Mid smoke',
            type: 'Smoke',
            side: 'T',
            difficulty: 'EASY',
            visibility: 'TEAM',
            team_id: 1,
            video_url: 'https://youtu.be/dQw4w9WgXcQ',
          },
        ],
      },
    })
  })

  render(<GrenadeLibrary map={{ id: 2 }} team={{ id: 1, permissions: {} }} />)

  expect(await screen.findByText('Mid smoke')).toBeInTheDocument()
  expect(
    screen.queryByRole('button', { name: 'Nueva granada oficial' }),
  ).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Editar' })).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Favorito' }))
  await waitFor(() =>
    expect(mocks.put).toHaveBeenCalledWith('/lineups/4/favorite'),
  )
})

it('shows scope tabs for the authenticated member and their team', async () => {
  render(<GrenadeLibrary map={{ id: 2 }} team={{ id: 1, permissions: {} }} />)

  expect(
    await screen.findByRole('button', { name: 'Oficiales' }),
  ).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Mis granadas' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Equipo' })).toBeInTheDocument()
})

it('loads personal lineups and sends a proposal to the team', async () => {
  render(<GrenadeLibrary map={{ id: 2 }} team={{ id: 1, permissions: {} }} />)

  fireEvent.click(screen.getByRole('button', { name: 'Mis granadas' }))

  expect(await screen.findByText('Mi smoke privada')).toBeInTheDocument()
  expect(
    screen.getByRole('button', { name: 'Nueva granada personal' }),
  ).toBeInTheDocument()
  expect(mocks.get).toHaveBeenCalledWith('/grenade-lineups/personal', {
    params: { map_id: 2 },
  })

  fireEvent.click(screen.getByRole('button', { name: 'Proponer al equipo' }))
  fireEvent.change(screen.getByLabelText('Nota para el equipo (opcional)'), {
    target: { value: 'Para ejecutar en oficial' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Enviar propuesta' }))

  await waitFor(() =>
    expect(mocks.post).toHaveBeenCalledWith('/grenade-lineups/7/propose', {
      note: 'Para ejecutar en oficial',
    }),
  )
  expect(
    await screen.findByText('Propuesta enviada al equipo.'),
  ).toBeInTheDocument()
})

it('hides private scopes from anonymous visitors', async () => {
  mocks.useAuth.mockReturnValue({ user: null })

  render(<GrenadeLibrary map={{ id: 2 }} team={null} />)

  expect(
    await screen.findByRole('button', { name: 'Oficiales' }),
  ).toBeInTheDocument()
  expect(
    screen.queryByRole('button', { name: 'Mis granadas' }),
  ).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Equipo' })).not.toBeInTheDocument()
})
