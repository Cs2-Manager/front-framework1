const VARIANTS = new Set([
  'neutral',
  'primary',
  'success',
  'warning',
  'danger',
  'info',
])

/**
 * Etiqueta compacta reutilizable para estados, roles y metadatos.
 */
export default function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
  as: Tag = 'span',
  ...rest
}) {
  const resolved = VARIANTS.has(variant) ? variant : 'neutral'
  const classes = [
    'badge-ui',
    `badge-ui-${resolved}`,
    size === 'sm' ? 'badge-ui-sm' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Tag className={classes} {...rest}>
      {children}
    </Tag>
  )
}
