import { Routes, Route } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout.jsx'
import Home from '../pages/Home.jsx'
import Login from '../pages/Login.jsx'
import Register from '../pages/Register.jsx'
import Maps from '../pages/Maps.jsx'
import Lineups from '../pages/Lineups.jsx'
import Workshop from '../pages/Workshop.jsx'

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/maps" element={<Maps />} />
        <Route path="/lineups" element={<Lineups />} />
        <Route path="/workshop" element={<Workshop />} />
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