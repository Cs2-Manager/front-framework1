import { useEffect, useState } from 'react'
import api from '../../services/api.js'
import Alert from '../common/Alert.jsx'
export default function MapStatistics({ team, map, playerIds }) {
  const [data, setData] = useState(null), [error, setError] = useState('')
  useEffect(() => {
    if (!team) return
    let active = true
    api.get(`/teams/${team.id}/maps/${map.id}/statistics`).then(r => { if (active) setData(r.data) }).catch(() => { if (active) setError('No se pudieron cargar las estadísticas autorizadas.') })
    return () => { active = false }
  }, [team?.id, map.id])
  const visiblePlayers = data?.players.filter(p => !playerIds || playerIds.includes(p.user_id))
  return <section className="team-panel"><h2>Estadísticas por fuente</h2><Alert>{error}</Alert><h3>FACEIT</h3><p>No disponible: no hay partidas FACEIT verificadas vinculadas al equipo.</p><h3>Matchmaking oficial · demos verificadas</h3>
    {!team ? <p>Seleccioná un equipo para consultar estadísticas de sus miembros.</p> : !data && !error ? <p>Cargando estadísticas…</p> : visiblePlayers?.length === 0 ? <p>Sin demos verificadas disponibles para este mapa y estos perfiles.</p> : <div className="team-lineups-grid">{visiblePlayers?.map(p => <article key={p.user_id}><h4>{p.nickname}</h4><p>{p.matches_played} partidas individuales · {p.wins} victorias · {p.losses} derrotas</p><p>Win rate: {p.win_rate ?? 'No disponible'}% · K/D: {p.kd ?? 'No disponible'} · ADR: {p.adr ?? 'No disponible'} · HS: {p.hs_percentage ?? 'No disponible'}%</p></article>)}</div>}
    <p>Estas métricas son individuales y respetan la privacidad de los perfiles. Resultados colectivos y rendimiento CT/T: no disponibles.</p>
  </section>
}
