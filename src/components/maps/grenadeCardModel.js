import { LINEUP_STATUS_LABELS } from '../../services/grenadeLineups.js'

export const TYPE_LABELS = {
  SMOKE: 'Smoke',
  FLASH: 'Flash',
  MOLOTOV: 'Molotov',
  INCENDIARY: 'Incendiaria',
  HE: 'HE',
  DECOY: 'Decoy',
}

export const DIFFICULTY_LABELS = {
  EASY: 'Fácil',
  MEDIUM: 'Media',
  HARD: 'Difícil',
}

const SCOPE_BADGES = {
  OFFICIAL: { variant: 'info', label: 'Oficial' },
  TEAM: { variant: 'neutral', label: 'Equipo' },
  PERSONAL: { variant: 'neutral', label: 'Personal' },
}

const STATUS_VARIANTS = {
  PUBLISHED: 'success',
  ARCHIVED: 'warning',
}

export function scopeBadge(scope) {
  return SCOPE_BADGES[scope] || SCOPE_BADGES.PERSONAL
}

export function statusVariant(status) {
  return STATUS_VARIANTS[status] || 'neutral'
}

export function statusLabel(status) {
  return LINEUP_STATUS_LABELS[status] || status
}

export function pointLabel(point) {
  if (!Array.isArray(point) || point.length !== 2) return null
  return `(${point[0].toFixed(2)}, ${point[1].toFixed(2)})`
}

/** Ubicación ya normalizada: evita ramas repetidas en el render. */
export function locationModel(item) {
  const zones = item.launch_zone || item.impact_zone
    ? { launch: item.launch_zone || 'Origen', impact: item.impact_zone || 'Destino' }
    : null
  return {
    zones,
    launch: pointLabel(item.launch_position),
    impact: pointLabel(item.impact_position || item.position),
  }
}

const ACTIONS = [
  {
    key: 'favorite',
    show: (ctx) => Boolean(ctx.onFavorite),
    label: (ctx) => (ctx.favorite ? 'Quitar favorito' : 'Favorito'),
    disabled: (ctx) => ctx.busy,
    onClick: (ctx) => ctx.onFavorite(ctx.item, !ctx.favorite),
  },
  {
    key: 'edit',
    show: (ctx) => Boolean(ctx.item.can_edit && ctx.onEdit),
    label: () => 'Editar',
    onClick: (ctx) => ctx.onEdit(ctx.item),
  },
  {
    key: 'delete',
    show: (ctx) => Boolean(ctx.item.can_edit && ctx.onDelete),
    label: () => 'Eliminar',
    disabled: (ctx) => ctx.busy,
    onClick: (ctx) => ctx.onDelete(ctx.item),
  },
  {
    key: 'propose',
    show: (ctx) => Boolean(ctx.item.can_propose && ctx.onPropose),
    label: () => 'Proponer al equipo',
    disabled: (ctx) => ctx.busy,
    onClick: (ctx) => ctx.onPropose(ctx.item),
  },
  {
    key: 'publish',
    show: (ctx) => Boolean(
      ctx.item.scope === 'OFFICIAL'
        && ctx.item.can_edit
        && ctx.item.status === 'DRAFT'
        && ctx.onPublish
    ),
    label: () => 'Publicar',
    disabled: (ctx) => ctx.busy,
    onClick: (ctx) => ctx.onPublish(ctx.item),
  },
  {
    key: 'archive',
    show: (ctx) => Boolean(
      ctx.item.scope === 'OFFICIAL'
        && ctx.item.can_edit
        && ctx.item.status === 'PUBLISHED'
        && ctx.onArchive
    ),
    label: () => 'Archivar',
    disabled: (ctx) => ctx.busy,
    onClick: (ctx) => ctx.onArchive(ctx.item),
  },
  {
    key: 'history',
    show: (ctx) => Boolean(ctx.item.scope === 'TEAM' && ctx.onHistory),
    label: () => 'Historial',
    onClick: (ctx) => ctx.onHistory(ctx.item),
  },
]

/** Acciones visibles según el estado del item; cada predicado es independiente. */
export function visibleActions(context) {
  return ACTIONS.filter((action) => action.show(context))
}
