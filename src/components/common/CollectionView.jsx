import Alert from './Alert.jsx'
import EmptyState from './EmptyState.jsx'

/**
 * Renderiza el estado de una colección: carga, error, vacío o contenido.
 */
export default function CollectionView({
  loading,
  loadingText,
  error,
  isEmpty,
  empty,
  children,
}) {
  if (loading) return <p className="text-muted">{loadingText}</p>
  if (error) return <Alert>{error}</Alert>
  if (isEmpty) return <EmptyState {...empty} />
  return children
}
