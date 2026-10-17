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

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/maps"
          element={
            <ProtectedRoute>
              <Maps />
            </ProtectedRoute>
          }
        />
        <Route
          path="/maps/:id"
          element={
            <ProtectedRoute>
              <MapDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lineups"
          element={
            <ProtectedRoute>
              <Lineups />
            </ProtectedRoute>
          }
        />
        <Route
          path="/workshop"
          element={
            <ProtectedRoute>
              <Workshop />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

function NotFound() {
  return (
    <div className="page-not-found">
      <h1>404</h1>
      <p>No se encontró la página que buscas.</p>
    </div>
  )
}