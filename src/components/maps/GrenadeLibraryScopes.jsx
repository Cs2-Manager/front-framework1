/** Pestañas de alcance: oficial, personal y equipo. */
export default function GrenadeLibraryScopes({
  scopes,
  scope,
  labels,
  onChange,
}) {
  return (
    <nav className="map-tabs" aria-label="Alcance de las granadas">
      {scopes.map((value) => (
        <button
          key={value}
          type="button"
          className="btn btn-ghost"
          aria-pressed={scope === value}
          onClick={() => onChange(value)}
        >
          {labels[value]}
        </button>
      ))}
    </nav>
  )
}
