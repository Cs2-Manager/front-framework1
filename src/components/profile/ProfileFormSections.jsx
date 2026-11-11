import FormField from '../common/FormField.jsx'
import {
  SOCIAL_PLATFORMS,
  VISIBILITY_OPTIONS,
} from './profileForm.js'

/** Datos de identidad competitiva y enlaces personales. */
export function ProfileIdentityFields({ form, errors, onChange }) {
  return (
    <div className="player-form-grid">
      <FormField
        id="profile-nickname"
        name="nickname"
        label="Nickname competitivo"
        value={form.nickname}
        onChange={onChange}
        error={errors.nickname}
        maxLength={80}
        required
      />
      <FormField
        id="profile-display-name"
        name="display_name"
        label="Nombre visible"
        value={form.display_name}
        onChange={onChange}
        error={errors.display_name}
        maxLength={80}
      />
      <FormField
        id="profile-country"
        name="country"
        label="País (código ISO de 2 letras)"
        value={form.country}
        onChange={onChange}
        error={errors.country}
        placeholder="AR"
        maxLength={2}
      />
      <FormField
        id="profile-avatar"
        name="avatar_url"
        label="URL del avatar"
        type="url"
        value={form.avatar_url}
        onChange={onChange}
        error={errors.avatar_url}
        placeholder="https://…/avatar.png"
      />
      <FormField
        id="profile-steam"
        name="steam_url"
        label="Perfil de Steam"
        type="url"
        value={form.steam_url}
        onChange={onChange}
        error={errors.steam_url}
        placeholder="https://steamcommunity.com/id/usuario"
      />
      <FormField
        as="textarea"
        id="profile-bio"
        name="bio"
        label="Descripción"
        value={form.bio}
        onChange={onChange}
        error={errors.bio}
        rows={4}
        maxLength={500}
        placeholder="Contá cómo jugás, tus roles o tu experiencia competitiva."
      />
    </div>
  )
}

/** Enlaces a redes y plataformas externas. */
export function ProfileSocialFields({ form, errors, onChange }) {
  return (
    <div className="player-form-grid">
      {SOCIAL_PLATFORMS.map((platform) => (
        <FormField
          key={platform.key}
          id={`profile-${platform.key}`}
          name={platform.key}
          label={platform.label}
          type="url"
          value={form[platform.key]}
          onChange={onChange}
          error={errors[platform.key]}
          placeholder={platform.placeholder}
        />
      ))}
    </div>
  )
}

/** Visibilidad del perfil (público, solo amigos o privado). */
export function ProfilePrivacyFields({ form, errors, onChange }) {
  return (
    <FormField
      as="select"
      id="profile-visibility"
      name="visibility"
      label="Visibilidad del perfil"
      value={form.visibility}
      onChange={onChange}
      error={errors.visibility}
      options={VISIBILITY_OPTIONS}
    />
  )
}
