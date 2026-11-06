import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import SteamCs2Panel from './SteamCs2Panel.jsx'

function buildSteam(cs2 = {}) {
  return {
    linked: true,
    cs2: {
      source: 'UNAVAILABLE',
      playtime_available: false,
      stats_available: false,
      unavailable_reason:
        'Steam no expone estadísticas por jugador ni historial de partidas de Counter-Strike 2.',
      ...cs2,
    },
  }
}

describe('SteamCs2Panel', () => {
  it('renders nothing when Steam is not linked', () => {
    const { container } = render(<SteamCs2Panel steam={{ linked: false }} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('shows verified playtime when Steam returns it', () => {
    render(
      <SteamCs2Panel
        steam={buildSteam({
          source: 'VERIFIED_STEAM',
          playtime_available: true,
          ownership: 'OWNED',
          playtime_forever_minutes: 4200,
          playtime_two_weeks_minutes: 120,
          last_played_at: '2026-10-20T18:00:00Z',
          fetched_at: '2026-10-30T12:00:00Z',
        })}
      />,
    )

    expect(screen.getByText('70.0 h')).toBeInTheDocument()
    expect(screen.getByText('2.0 h')).toBeInTheDocument()
    expect(screen.getByText('En biblioteca')).toBeInTheDocument()
    expect(screen.getByText('Verificado en Steam')).toBeInTheDocument()
    expect(screen.getByText('No disponible')).toBeInTheDocument()
  })

  it('explains why CS2 stats are unavailable instead of inventing numbers', () => {
    render(<SteamCs2Panel steam={buildSteam()} />)

    expect(
      screen.getByText(/no expone kills, deaths, ADR, rangos ni historial/),
    ).toBeInTheDocument()
    expect(screen.getAllByText('No disponible').length).toBeGreaterThan(0)
    expect(screen.queryByText('Kills')).not.toBeInTheDocument()
  })
})
