import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { doc, setDoc } from 'firebase/firestore'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import { db } from '../lib/firebase.js'
import { useAuth } from '../context/AuthContext.jsx'
import { ODS_FILTERS, INDUSTRY_FILTERS, CAUSE_FILTERS } from '../data/initiatives.js'
import { PROFILE_TYPES, GENDERS, STUDENT_SUBTYPES } from '../data/profileOptions.js'
import { CITIES } from '../data/cities.js'
import { labelFor } from '../lib/catalogLabel.js'
import { isStudentEntrepreneur } from '../lib/initiativeKind.js'

const ODS_OPTIONS = ODS_FILTERS.filter((f) => f.id !== 'todos')
const INDUSTRY_OPTIONS = INDUSTRY_FILTERS.filter((f) => f.id !== 'todos')
const CAUSE_OPTIONS = CAUSE_FILTERS.filter((f) => f.id !== 'todos')

// Tope del selector de fecha de nacimiento: hoy mismo, calculado en vez
// de quedar fijo en el código.
const TODAY = new Date().toISOString().slice(0, 10)

const EMPTY = {
  name: '',
  username: '',
  email: '',
  password: '',
  birthDate: '',
  gender: '',
  occupation: '',
  location: '',
  city: '',
  profileType: 'emprendedor',
  subtype: '',
  industry: '',
  industryOtra: '',
  industrySecondary: '',
  industrySecondaryOtra: '',
  odsInterest: '',
  expertise: '',
  advisoryOffer: '',
  cause: '',
  causeOtra: '',
  orgActivity: '',
  orgAudience: '',
  linkedin: '',
  bio: '',
  lookingFor: '',
}

function firebaseErrorMessage(err) {
  switch (err?.code) {
    case 'auth/email-already-in-use':
      return 'Ya existe una cuenta con ese correo.'
    case 'auth/invalid-email':
      return 'Ese correo no parece válido.'
    case 'auth/weak-password':
      return 'La contraseña debe tener al menos 6 caracteres.'
    default:
      return 'No pudimos crear tu cuenta. Intenta de nuevo.'
  }
}

export default function Register() {
  const { signUp, resendVerificationEmail } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const cred = await signUp(form.email, form.password)
      const isEmprendedor = form.profileType === 'emprendedor' || isStudentEntrepreneur(form.profileType, form.subtype)
      const industryLabel = isEmprendedor ? labelFor(INDUSTRY_OPTIONS, form.industry, form.industryOtra) : ''
      const industrySecondaryLabel = isEmprendedor && form.industrySecondary
        ? labelFor(INDUSTRY_OPTIONS, form.industrySecondary, form.industrySecondaryOtra)
        : ''
      const isOrganizacion = form.profileType === 'organizacion'
      const causeLabel = isOrganizacion ? labelFor(CAUSE_OPTIONS, form.cause, form.causeOtra) : ''
      await setDoc(doc(db, 'profiles', cred.user.uid), {
        name: form.name,
        username: form.username,
        email: form.email,
        birthDate: form.birthDate,
        gender: form.gender,
        occupation: form.occupation,
        location: form.location,
        city: form.city,
        profileType: form.profileType,
        subtype: form.profileType === 'estudiante' ? form.subtype : '',
        industry: isEmprendedor ? form.industry : '',
        industryLabel,
        industrySecondary: isEmprendedor ? form.industrySecondary : '',
        industrySecondaryLabel,
        interests: form.odsInterest ? [form.odsInterest] : [],
        expertise: form.profileType === 'mentor' ? form.expertise : '',
        advisoryOffer: form.profileType === 'mentor' ? form.advisoryOffer : '',
        cause: isOrganizacion ? form.cause : '',
        causeLabel,
        orgActivity: isOrganizacion ? form.orgActivity : '',
        orgAudience: isOrganizacion ? form.orgAudience : '',
        linkedin: form.linkedin,
        bio: form.bio,
        lookingFor: form.lookingFor,
        photo: null,
      })
      resendVerificationEmail()?.catch(() => {})
      navigate('/app/dashboard', { replace: true })
    } catch (err) {
      setError(firebaseErrorMessage(err))
      setLoading(false)
    }
  }

  return (
    <>
      <Header />
      <section className="auth-section">
        <div className="auth-card auth-card-wide">
          <span className="kicker">Registrarse</span>
          <h1 className="auth-title">Súmate al mapa</h1>
          <p className="auth-sub">Crea tu cuenta real de Nexo — tu perfil queda guardado en la nube.</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-row">
              <label className="form-field">
                <span>Nombre completo</span>
                <input type="text" name="name" required value={form.name} onChange={handleChange} placeholder="Tu nombre" />
              </label>
              <label className="form-field">
                <span>Nombre de usuario</span>
                <div className="input-prefix">
                  <span>@</span>
                  <input
                    type="text"
                    name="username"
                    required
                    value={form.username}
                    onChange={handleChange}
                    placeholder="tu.usuario"
                    pattern="[a-zA-Z0-9_.]{3,20}"
                    title="3 a 20 caracteres: letras, números, punto o guión bajo"
                  />
                </div>
              </label>
            </div>

            <label className="form-field">
              <span>Correo electrónico</span>
              <input type="email" name="email" required value={form.email} onChange={handleChange} placeholder="tu@correo.com" />
            </label>

            <label className="form-field">
              <span>Contraseña</span>
              <input type="password" name="password" required minLength={6} value={form.password} onChange={handleChange} placeholder="••••••••" />
            </label>

            <div className="form-row">
              <label className="form-field">
                <span>Fecha de nacimiento</span>
                <input type="date" name="birthDate" required max={TODAY} value={form.birthDate} onChange={handleChange} />
              </label>
              <label className="form-field">
                <span>Género</span>
                <select name="gender" value={form.gender} onChange={handleChange}>
                  <option value="">Selecciona una opción</option>
                  {GENDERS.map((g) => (
                    <option key={g.id} value={g.id}>{g.label}</option>
                  ))}
                </select>
              </label>
            </div>
            <p className="settings-card-desc" style={{ margin: '-10px 0 0' }}>
              Nombre, fecha de nacimiento, género y tipo de perfil no se podrán cambiar después de registrarte.
            </p>

            <div className="form-row">
              <label className="form-field">
                <span>Ocupación</span>
                <input type="text" name="occupation" value={form.occupation} onChange={handleChange} placeholder="Ej. Ingeniera agrónoma" />
              </label>
              <label className="form-field">
                <span>Ubicación (texto libre)</span>
                <input type="text" name="location" value={form.location} onChange={handleChange} placeholder="Ciudad, estado" />
              </label>
            </div>

            <div className="form-row">
              <label className="form-field">
                <span>Ciudad / región</span>
                <select name="city" required value={form.city} onChange={handleChange}>
                  <option value="">Selecciona tu ciudad</option>
                  {CITIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </label>
              <label className="form-field">
                <span>Tipo de perfil</span>
                <select name="profileType" value={form.profileType} onChange={handleChange}>
                  {PROFILE_TYPES.map((p) => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </select>
              </label>
            </div>

            <p className="settings-card-desc" style={{ margin: '-10px 0 0' }}>
              {{
                emprendedor: 'Como emprendedor/a vas a poder registrar tu emprendimiento.',
                estudiante: 'Como estudiante vas a poder registrar tu iniciativa.',
                mentor: 'Como mentor/a no registras un emprendimiento — compartes tu área de expertise para que otros te encuentren.',
                voluntario: 'Como voluntario/a puedes explorar y contactar emprendimientos e iniciativas, sin registrar uno propio.',
                organizacion: 'Como institución/organización vas a poder registrar tu institución y lo que ofrece.',
              }[form.profileType]}
            </p>

            {form.profileType === 'estudiante' && (
              <label className="form-field">
                <span>Subcategoría (opcional)</span>
                <select name="subtype" value={form.subtype} onChange={handleChange}>
                  {STUDENT_SUBTYPES.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
                {form.subtype === 'emprendedor' && (
                  <span className="settings-card-desc" style={{ marginTop: 6 }}>
                    Si además de estudiar ya tienes un emprendimiento propio, esto hace que lo registres como emprendimiento (con industria) en vez de como iniciativa, y que el resto del sitio te recomiende como a cualquier otro emprendedor/a.
                  </span>
                )}
              </label>
            )}

            {(form.profileType === 'emprendedor' || isStudentEntrepreneur(form.profileType, form.subtype)) && (
              <>
                <div className="form-row">
                  <label className="form-field">
                    <span>Industria a la que perteneces</span>
                    <select name="industry" value={form.industry} onChange={handleChange}>
                      <option value="">Selecciona una industria</option>
                      {INDUSTRY_OPTIONS.map((i) => (
                        <option key={i.id} value={i.id}>{i.label}</option>
                      ))}
                    </select>
                  </label>
                  {form.industry === 'otra' ? (
                    <label className="form-field">
                      <span>Especifica la industria</span>
                      <input type="text" name="industryOtra" value={form.industryOtra} onChange={handleChange} placeholder="Ej. Turismo comunitario" />
                    </label>
                  ) : (
                    <label className="form-field">
                      <span>Segunda industria (opcional)</span>
                      <select name="industrySecondary" value={form.industrySecondary} onChange={handleChange}>
                        <option value="">Ninguna</option>
                        {INDUSTRY_OPTIONS.filter((i) => i.id !== form.industry).map((i) => (
                          <option key={i.id} value={i.id}>{i.label}</option>
                        ))}
                      </select>
                    </label>
                  )}
                </div>
                {form.industrySecondary === 'otra' && (
                  <label className="form-field">
                    <span>Especifica la segunda industria</span>
                    <input type="text" name="industrySecondaryOtra" value={form.industrySecondaryOtra} onChange={handleChange} placeholder="Ej. Turismo comunitario" />
                  </label>
                )}
              </>
            )}

            {(form.profileType === 'estudiante' || form.profileType === 'voluntario') && (
              <label className="form-field">
                <span>{form.profileType === 'estudiante' ? 'ODS que ataca tu iniciativa' : 'ODS de tu interés'}</span>
                <select name="odsInterest" value={form.odsInterest} onChange={handleChange}>
                  <option value="">Selecciona un ODS</option>
                  {ODS_OPTIONS.filter((o) => o.id !== 'otra').map((o) => (
                    <option key={o.id} value={o.id}>{o.label}</option>
                  ))}
                </select>
              </label>
            )}

            {form.profileType === 'mentor' && (
              <>
                <label className="form-field">
                  <span>Área de expertise</span>
                  <input type="text" name="expertise" value={form.expertise} onChange={handleChange} placeholder="Ej. Finanzas para startups, marketing digital" />
                </label>
                <label className="form-field">
                  <span>¿En qué puedes brindar asesoría?</span>
                  <textarea name="advisoryOffer" rows={3} value={form.advisoryOffer} onChange={handleChange} placeholder="Ej. Mentoría en estrategia de precios y levantamiento de capital semilla" />
                </label>
              </>
            )}

            {form.profileType === 'organizacion' && (
              <>
                <label className="form-field">
                  <span>Causa que atiende tu institución/organización</span>
                  <select name="cause" value={form.cause} onChange={handleChange}>
                    <option value="">Selecciona una causa</option>
                    {CAUSE_OPTIONS.map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </label>
                {form.cause === 'otra' && (
                  <label className="form-field">
                    <span>Especifica la causa</span>
                    <input type="text" name="causeOtra" value={form.causeOtra} onChange={handleChange} placeholder="Ej. Educación financiera para jóvenes" />
                  </label>
                )}
                <label className="form-field">
                  <span>¿Qué hace tu institución/organización?</span>
                  <textarea name="orgActivity" rows={3} value={form.orgActivity} onChange={handleChange} placeholder="Describe brevemente a qué se dedica" />
                </label>
                <label className="form-field">
                  <span>¿A qué público atienden?</span>
                  <input type="text" name="orgAudience" value={form.orgAudience} onChange={handleChange} placeholder="Ej. Estudiantes universitarios de últimos semestres" />
                </label>
              </>
            )}

            <label className="form-field">
              <span>LinkedIn u otra red (opcional)</span>
              <input type="url" name="linkedin" value={form.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/tu-usuario" />
            </label>

            <label className="form-field">
              <span>Cuéntanos brevemente sobre ti</span>
              <textarea name="bio" rows={3} value={form.bio} onChange={handleChange} placeholder="Ej. Estudio Economía y lidero un colectivo de reciclaje en mi universidad." />
            </label>

            <label className="form-field">
              <span>¿Qué buscas en Nexo?</span>
              <input type="text" name="lookingFor" value={form.lookingFor} onChange={handleChange} placeholder="Ej. Mentoría legal para constituir mi asociación civil" />
            </label>

            {error && <p style={{ color: '#c0392b', fontSize: 13.5 }}>{error}</p>}

            <button type="submit" className="btn btn-gold btn-lg" style={{ justifyContent: 'center' }} disabled={loading}>
              {loading ? 'Creando cuenta…' : 'Crear cuenta →'}
            </button>
          </form>

          <p className="auth-switch">¿Ya tienes cuenta? <Link to="/login">Ingresa</Link></p>
        </div>
      </section>
      <Footer />
    </>
  )
}
