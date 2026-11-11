import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes/index.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { RealtimeProvider } from './context/RealtimeContext.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RealtimeProvider>
          <AppRoutes />
        </RealtimeProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}