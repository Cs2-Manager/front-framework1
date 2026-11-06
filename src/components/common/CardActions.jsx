/**
 * Botones de acción reutilizables para tarjetas y listas.
 *
 * @param {object} props
 * @param {(item: any) => void} props.onEdit
 * @param {(item: any) => void} [props.onDelete]
 * @param {(item: any) => void} [props.onRestore]
 * @param {any} props.item - elemento sobre el que operan los botones.
 * @param {boolean} [props.stopPropagation] - detiene el click del contenedor.
 * @param {string} [props.className]
 * @param {string} [props.as] - etiqueta contenedora (div/span).
 */
export default function CardActions({
  onEdit,
  onDelete,
  onRestore,
  restoreBusy = false,
  item,
  stopPropagation = false,
  className = 'card-actions',
  as: Tag = 'div',
  children,
}) {
  const run = (fn) => (event) => {
    if (stopPropagation) event.stopPropagation()
    fn(item)
  }

  return (
    <Tag className={className}>
      {children}
      {onRestore && (
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={run(onRestore)}
          disabled={restoreBusy}
        >
          {restoreBusy ? 'Restaurando…' : 'Restaurar'}
        </button>
      )}
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={run(onEdit)}
      >
        Editar
      </button>
      {onDelete && (
        <button
          type="button"
          className="btn btn-ghost btn-sm btn-danger"
          onClick={run(onDelete)}
        >
          Eliminar
        </button>
      )}
    </Tag>
  )
}
