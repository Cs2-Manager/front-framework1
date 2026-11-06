import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import SteamAccountCard from './SteamAccountCard.jsx'
import { syncSteam, unlinkSteam } from '../../services/steam.js'

vi.mock('../../services/steam.js', () => ({
  syncSteam: vi.fn(),
  unlinkSteam: vi.fn(),
}))

const STEAM = {
  linked: true,
  configured: true,
  account: {
    steam_id: '76561198000000001',
    persona_name: 'FragMaster',
    profile_url: 'https://steamcommunity.com/profiles/76561198000000001',
    avatar_url: null,
    community_visibility: 'PUBLIC',
    linked_at: '2026-10-01T10:00:00Z',
    last_sync_at: null,
  },
  sync: {
    status: 'NEVER',
    last_sync_at: null,
    can_sync: true,
    next_sync_at: null,
  },
}

describe('SteamAccountCard', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('shows verified identity, SteamID64 and the sync summary', () => {
    render(<SteamAccountCard steam={STEAM} owner />)

    expect(screen.getByText('FragMaster')).toBeInTheDocument()
    expect(screen.getByText('76561198000000001')).toBeInTheDocument()
    expect(screen.getByText('Verificado en Steam')).toBeInTheDocument()
    expect(screen.getByText('Sin sincronizar')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Ver perfil en Steam' }),
    ).toHaveAttribute(
      'href',
      'https://steamcommunity.com/profiles/76561198000000001',
    )
  })

  it('synchronizes data and reports the result', async () => {
    const onChange = vi.fn()
    syncSteam.mockResolvedValue({
      sync: { status: 'OK', message: 'Datos de Steam actualizados.' },
      steam: STEAM,
    })

    render(<SteamAccountCard steam={STEAM} owner onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Sincronizar datos' }))

    expect(await screen.findByText('Datos de Steam actualizados.')).toBeInTheDocument()
    expect(syncSteam).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('keeps the sync action disabled until the interval allows it', () => {
    render(
      <SteamAccountCard
        steam={{ ...STEAM, sync: { ...STEAM.sync, can_sync: false } }}
        owner
      />,
    )

    expect(
      screen.getByRole('button', { name: 'Sincronizar datos' }),
    ).toBeDisabled()
  })

  it('unlinks only after confirmation', async () => {
    const onChange = vi.fn()
    unlinkSteam.mockResolvedValue({ linked: false })

    render(<SteamAccountCard steam={STEAM} owner onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Desvincular' }))

    const dialog = screen.getByRole('dialog')
    expect(
      within(dialog).getByText(/tu cuenta local no se elimina/),
    ).toBeInTheDocument()

    fireEvent.click(within(dialog).getByRole('button', { name: 'Desvincular' }))

    await waitFor(() => expect(unlinkSteam).toHaveBeenCalledTimes(1))
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('hides management actions from visitors', () => {
    render(<SteamAccountCard steam={STEAM} />)

    expect(
      screen.queryByRole('button', { name: 'Sincronizar datos' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Desvincular' }),
    ).not.toBeInTheDocument()
  })
})
