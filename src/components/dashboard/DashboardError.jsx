import Alert from '../common/Alert.jsx'

export default function DashboardError({ message, onRetry }) {
  return (
    <div className="dashboard-error" role="group" aria-label="Error del dashboard">
      <Alert>{message}</Alert>
      <button type="button" className="btn btn-ghost" onClick={onRetry}>
        Reintentar
      </button>
    </div>
  )
}
