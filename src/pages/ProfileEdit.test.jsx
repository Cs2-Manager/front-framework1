import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import ProfileEdit from './ProfileEdit.jsx'
import { updateOwnProfile } from '../services/profiles.js'

const mocks = vi.hoisted(() => ({ useOwnProfile: vi.fn() }))

vi.mock('../hooks/useProfile.js', () => ({
  useOwnProfile: mocks.useOwnProfile,
}))
vi.mock('../services/profiles.js', () => ({
  updateOwnProfile: vi.fn(),
}))

const PROFILE = {
  id: 1,
  nickname: 'Frag',
  display_name: 'Frag Machine',
  country: 'AR',
  bio: 'Bio',
  avatar_url: null,
  steam_url: '',
  visibility: 'PRIVATE',
  social_links: { twitch: 'https://twitch.tv/frag' },
}

function renderEdit() {
  return render(
    <MemoryRouter initialEntries={['/profile/edit']}>
      <ProfileEdit />
    </MemoryRouter>,
  )
}

describe('ProfileEdit page', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    mocks.useOwnProfile.mockReturnValue({
      data: PROFILE,
      loading: false,
      error: '',
      reload: vi.fn(),
    })
  })

  it('shows a loading state while the profile is requested', () => {
    mocks.useOwnProfile.mockReturnValue({
      data: null,
      loading: true,
      error: '',
      reload: vi.fn(),
    })

    renderEdit()

    expect(screen.getByText('Cargando tu perfil…')).toBeInTheDocument()
  })

  it('prefills the form with the current profile', () => {
    renderEdit()

    expect(screen.getByLabelText('Nickname competitivo')).toHaveValue('Frag')
    expect(screen.getByLabelText('Nombre visible')).toHaveValue('Frag Machine')
    expect(screen.getByLabelText('País (código ISO de 2 letras)')).toHaveValue(
      'AR',
    )
    expect(screen.getByLabelText('Twitch')).toHaveValue(
      'https://twitch.tv/frag',
    )
    expect(screen.getByLabelText('Visibilidad del perfil')).toHaveValue(
      'PRIVATE',
    )
  })

  it('submits the normalized payload', async () => {
    updateOwnProfile.mockResolvedValue(PROFILE)

    renderEdit()

    fireEvent.change(screen.getByLabelText('Nickname competitivo'), {
      target: { value: '  NuevoNick  ' },
    })
    fireEvent.change(screen.getByLabelText('País (código ISO de 2 letras)'), {
      target: { value: 'es' },
    })
    fireEvent.change(screen.getByLabelText('Visibilidad del perfil'), {
      target: { value: 'PUBLIC' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    await waitFor(() => expect(updateOwnProfile).toHaveBeenCalledTimes(1))
    expect(updateOwnProfile).toHaveBeenCalledWith({
      nickname: 'NuevoNick',
      display_name: 'Frag Machine',
      country: 'ES',
      bio: 'Bio',
      avatar_url: null,
      steam_url: null,
      visibility: 'PUBLIC',
      social_links: {
        twitch: 'https://twitch.tv/frag',
        youtube: '',
        x: '',
        instagram: '',
        discord: '',
      },
    })
  })

  it('shows client validation errors without calling the API', async () => {
    renderEdit()

    fireEvent.change(screen.getByLabelText('Nickname competitivo'), {
      target: { value: '' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    expect(
      await screen.findByText('El nickname competitivo es obligatorio.'),
    ).toBeInTheDocument()
    expect(updateOwnProfile).not.toHaveBeenCalled()
  })

  it('shows the load error and retries', () => {
    const reload = vi.fn()
    mocks.useOwnProfile.mockReturnValue({
      data: null,
      loading: false,
      error: 'No pudimos cargar tu perfil.',
      reload,
    })

    renderEdit()

    expect(screen.getByRole('alert')).toHaveTextContent(
      'No pudimos cargar tu perfil.',
    )
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(reload).toHaveBeenCalledTimes(1)
  })
})
