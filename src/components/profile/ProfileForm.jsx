import { Link, useNavigate } from 'react-router-dom'

import Alert from '../common/Alert.jsx'
import FormField from '../common/FormField.jsx'
import useForm from '../../hooks/useForm.js'
import { updateOwnProfile } from '../../services/profiles.js'
import {
  SOCIAL_PLATFORMS,
  VISIBILITY_OPTIONS,
  buildProfilePayload,
  profileToForm,
  validateProfileForm,
} from './profileForm.js'

function IdentityFields({ form, errors, onChange }) {
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

function SocialFields({ form, errors, onChange }) {
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

function PrivacyFields({ form, errors, onChange }) {
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

export default function ProfileForm({ profile, onSaved }) {
  const navigate = useNavigate()
  const { form, errors, serverError, submitting, handleChange, handleSubmit } =
    useForm({
      initial: profileToForm(profile),
      validate: validateProfileForm,
      submit: (values) => updateOwnProfile(buildProfilePayload(values)),
      onSuccess: (saved) => {
        onSaved?.(saved)
        navigate('/profile', { replace: true, state: { updated: true } })
      },
      errorMessage: 'No pudimos guardar tu perfil. Intentalo de nuevo.',
    })

  return (
    <form className="player-form" onSubmit={handleSubmit} noValidate>
      <Alert>{serverError}</Alert>

      <section className="player-panel">
        <div className="player-panel-head">
          <h2>Identidad competitiva</h2>
        </div>
        <p className="text-muted">
          El nickname competitivo es independiente del usuario con el que
          iniciás sesión.
        </p>
        <IdentityFields form={form} errors={errors} onChange={handleChange} />
      </section>

      <section className="player-panel">
        <div className="player-panel-head">
          <h2>Redes y enlaces</h2>
        </div>
        <SocialFields form={form} errors={errors} onChange={handleChange} />
      </section>

      <section className="player-panel">
        <div className="player-panel-head">
          <h2>Privacidad</h2>
        </div>
        <PrivacyFields form={form} errors={errors} onChange={handleChange} />
        <p className="text-muted">
          Un perfil privado solo puede verlo su dueño y los administradores.
        </p>
      </section>

      <div className="player-form-actions">
        <Link to="/profile" className="btn btn-ghost">
          Cancelar
        </Link>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? (
            <>
              <span className="spinner spinner-sm" aria-hidden="true" />
              Guardando…
            </>
          ) : (
            'Guardar cambios'
          )}
        </button>
      </div>
    </form>
  )
}
