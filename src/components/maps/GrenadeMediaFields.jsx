export function GrenadeMediaFields({ form, errors, updateValues, busy }) {
  const media = form.media || []
  const setMedia = (next) => updateValues({ media: next })

  return (
    <fieldset className="grenade-media" disabled={busy}>
      <legend>Medios de demostración</legend>
      {media.map((item, index) => (
        <div className="grenade-media-row" key={index}>
          <label>
            Tipo
            <select
              value={item.kind}
              onChange={(event) =>
                setMedia(
                  media.map((entry, position) =>
                    position === index
                      ? { ...entry, kind: event.target.value }
                      : entry,
                  ),
                )
              }
            >
              <option value="IMAGE">Imagen</option>
              <option value="VIDEO">Video</option>
            </select>
          </label>
          <label>
            URL HTTPS
            <input
              type="url"
              value={item.url}
              aria-label={`URL del medio ${index + 1}`}
              onChange={(event) =>
                setMedia(
                  media.map((entry, position) =>
                    position === index
                      ? { ...entry, url: event.target.value }
                      : entry,
                  ),
                )
              }
            />
          </label>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setMedia(media.filter((_, position) => position !== index))}
          >
            Quitar medio
          </button>
          {errors[`media-${index}`] && (
            <p className="form-error">{errors[`media-${index}`]}</p>
          )}
        </div>
      ))}
      <button
        type="button"
        className="btn btn-ghost"
        onClick={() => setMedia([...media, { kind: 'IMAGE', url: '', thumbnail_url: '' }])}
      >
        Agregar medio
      </button>
    </fieldset>
  )
}
