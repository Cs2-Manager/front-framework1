import useCollection from './useCollection.js'
import useDelete from './useDelete.js'
import useEditModal from './useEditModal.js'

/**
 * Une la carga de una colección, el modal de edición y el borrado confirmado.
 *
 * @param {object} options
 * @param {() => Promise<any[]>} options.fetchItems
 * @param {string} [options.errorMessage]
 * @param {any[]} [options.deps]
 * @param {(item: any) => Promise<any>} options.deleteItem
 * @param {string} [options.deleteErrorMessage]
 * @param {boolean} [options.removeLocally] - quita el ítem sin recargar.
 * @param {(item: any) => void} [options.onDeleted]
 */
export default function useCrudPage({
  fetchItems,
  errorMessage,
  deps,
  deleteItem,
  deleteErrorMessage,
  removeLocally = false,
  onDeleted,
}) {
  const collection = useCollection(fetchItems, { errorMessage, deps })
  const modal = useEditModal()

  const removeLocal = (item) =>
    collection.setItems((prev) => prev.filter((entry) => entry.id !== item.id))
  const afterDelete = onDeleted ?? (removeLocally ? removeLocal : collection.reload)

  const deletion = useDelete(deleteItem, {
    errorMessage: deleteErrorMessage,
    onDeleted: afterDelete,
  })

  return { ...collection, modal, deletion }
}
