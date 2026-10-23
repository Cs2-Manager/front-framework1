/**
 * Botones de acción reutilizables para tarjetas y listas.
 *
 * @param {object} props
 * @param {(item: any) => void} props.onEdit
 * @param {(item: any) => void} [props.onDelete]
 * @param {any} props.item - elemento sobre el que operan los botones.
 * @param {boolean} [props.stopPropagation] - detiene el click del contenedor.
 * @param {string} [props.className]
 * @param {string} [props.as] - etiqueta contenedora (div/span).
 */
export default function CardActions({
  onEdit,
  onDelete,
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
