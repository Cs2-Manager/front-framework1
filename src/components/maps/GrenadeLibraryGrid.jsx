import GrenadeCard from './GrenadeCard.jsx'

/**
 * Rejilla de tarjetas. Cada tarjeta recibe solo las acciones que su alcance y
 * los permisos del usuario habilitan.
 */
export default function GrenadeLibraryGrid({
  items,
  favorites,
  busy,
  user,
  team,
  onToggleFavorite,
  onEdit,
  onDelete,
  onPropose,
  onPublish,
  onArchive,
  onHistory,
}) {
  return (
    <div className="grenade-grid">
      {items.map((item) => (
        <GrenadeCard
          key={item.id}
          item={item}
          favorite={favorites.includes(item.id)}
          busy={busy}
          onFavorite={user ? onToggleFavorite : undefined}
          onEdit={item.can_edit ? onEdit : undefined}
          onDelete={item.can_edit ? onDelete : undefined}
          onPropose={
            item.scope === 'PERSONAL' && item.can_propose && team
              ? onPropose
              : undefined
          }
          onPublish={
            item.scope === 'OFFICIAL' && user?.is_admin
              ? onPublish
              : undefined
          }
          onArchive={
            item.scope === 'OFFICIAL' && user?.is_admin
              ? onArchive
              : undefined
          }
          onHistory={item.scope === 'TEAM' ? onHistory : undefined}
        />
      ))}
    </div>
  )
}
