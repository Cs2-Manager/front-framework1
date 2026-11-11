import { Link, useNavigate } from 'react-router-dom'

import Alert from '../common/Alert.jsx'
import useForm from '../../hooks/useForm.js'
import { updateOwnProfile } from '../../services/profiles.js'
import {
  buildProfilePayload,
  profileToForm,
  validateProfileForm,
} from './profileForm.js'
import {
  ProfileIdentityFields,
  ProfilePrivacyFields,
  ProfileSocialFields,
} from './ProfileFormSections.jsx'

/** Envoltorio con encabezado para cada bloque del formulario de perfil. */
function FormSection({ title, description, children }) {
  return (
    <section className="player-panel">
      <div className="player-panel-head">
        <h2>{title}</h2>
      </div>
      {description ? <p className="text-muted">{description}</p> : null}
      {children}
    </section>
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

      <FormSection
        title="Identidad competitiva"
        description="El nickname competitivo es independiente del usuario con el que iniciás sesión."
      >
        <ProfileIdentityFields
          form={form}
          errors={errors}
          onChange={handleChange}
        />
      </FormSection>

      <FormSection title="Redes y enlaces">
        <ProfileSocialFields
          form={form}
          errors={errors}
          onChange={handleChange}
        />
      </FormSection>

      <FormSection
        title="Privacidad"
        description="Un perfil privado solo puede verlo su dueño y los administradores."
      >
        <ProfilePrivacyFields
          form={form}
          errors={errors}
          onChange={handleChange}
        />
      </FormSection>

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
