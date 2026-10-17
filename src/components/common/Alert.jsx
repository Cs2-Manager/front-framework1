export default function Alert({ variant = 'error', role, children }) {
  if (!children) return null

  return (
    <div
      className={`alert alert-${variant}`}
      role={role || (variant === 'success' ? 'status' : 'alert')}
    >
      {children}
    </div>
  )
}
