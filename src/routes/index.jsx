import { Routes, Route } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'
import Home from '../pages/Home.jsx'
import Login from '../pages/Login.jsx'
import Register from '../pages/Register.jsx'
import Maps from '../pages/Maps.jsx'
import MapDetail from '../pages/MapDetail.jsx'
import Lineups from '../pages/Lineups.jsx'
import Workshop from '../pages/Workshop.jsx'
import Profile from '../pages/Profile.jsx'
import ProfileEdit from '../pages/ProfileEdit.jsx'
import PublicProfile from '../pages/PublicProfile.jsx'
import SteamCallback from '../pages/SteamCallback.jsx'
import Players from '../pages/Players.jsx'
import Teams from '../pages/Teams.jsx'
import TeamDetail from '../pages/TeamDetail.jsx'
import TeamCreate from '../pages/TeamCreate.jsx'
import TeamEdit from '../pages/TeamEdit.jsx'
import TeamLineups from '../pages/TeamLineups.jsx'
import TeamLineupDetail from '../pages/TeamLineupDetail.jsx'
import MyTeam from '../pages/MyTeam.jsx'
import Invitations from '../pages/Invitations.jsx'

const PROTECTED_ROUTES = [
  { path: '/maps', element: <Maps /> },
  { path: '/maps/:id', element: <MapDetail /> },
  { path: '/lineups', element: <Lineups /> },
  { path: '/workshop', element: <Workshop /> },
  { path: '/profile', element: <Profile /> },
  { path: '/profile/edit', element: <ProfileEdit /> },
  { path: '/teams/new', element: <TeamCreate /> },
  { path: '/teams/mine', element: <MyTeam /> },
  { path: '/teams/:id/edit', element: <TeamEdit /> },
  { path: '/invitations', element: <Invitations /> },
]

const PUBLIC_ROUTES = [
  { path: '/', element: <Home /> },
  { path: '/players', element: <Players /> },
  { path: '/players/:id', element: <PublicProfile /> },
  { path: '/steam/callback', element: <SteamCallback /> },
  { path: '/teams', element: <Teams /> },
  { path: '/teams/:id', element: <TeamDetail /> },
  { path: '/teams/:id/lineups', element: <TeamLineups /> },
  { path: '/teams/:id/lineups/:lineupId', element: <TeamLineupDetail /> },
]

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {PUBLIC_ROUTES.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}
        {PROTECTED_ROUTES.map(({ path, element }) => (
          <Route
            key={path}
            path={path}
            element={<ProtectedRoute>{element}</ProtectedRoute>}
          />
        ))}
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

function NotFound() {
  return (
    <div className="page-not-found">
      <h1>404</h1>
      <p>No encontramos la página que buscas.</p>
    </div>
  )
}
