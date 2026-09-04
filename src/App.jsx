import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes/index.jsx'
import { AuthProvider } from './context/AuthContext.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}