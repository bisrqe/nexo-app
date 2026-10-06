import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout.jsx'
import { useProfile } from '../context/ProfileContext.jsx'
import { kindFor, PROFILE_TYPES_WITHOUT_OWN_INITIATIVE } from '../lib/initiativeKind.js'
import { SUPPORT_GROUP_SLUG } from '../data/supportGroup.js'

// Tutorial embebido: un paso a la vez, con enlaces a la sección que explica.
// El paso de "tu proyecto" cambia según el tipo de perfil (emprendimiento,
// iniciativa, institución — o cómo apoyar, para mentores y voluntarios).
function buildSteps(profile) {
  const kind = kindFor(profile.profileType, profile.subtype)
  const noOwn = PROFILE_TYPES_WITHOUT_OWN_INITIATIVE.includes(profile.profileType)

  const projectStep = noOwn
    ? {
        title: profile.profileType === 'mentor' ? 'Ofrece tu mentoría' : 'Súmate como voluntario/a',
        body: [
          profile.profileType === 'mentor'
            ? 'Como mentor/a no registras un proyecto: tu área de expertise y en qué puedes asesorar viven en tu perfil, y Nexo te recomienda a quienes lo necesitan.'
            : 'Como voluntario/a no registras un proyecto: explora el catálogo, marca "Me interesa" en lo que te mueva y escribe directo a sus responsables.',
          'Mantén tu perfil al día en Ajustes — es lo que otras personas ven para decidir si te contactan.',
        ],
        link: { to: '/app/ajustes', label: 'Ir a mi perfil' },
      }
    : {
        title: `Registra ${kind.un} ${kind.noun}`,
        body: [
          `Desde "${kind.my}" registras ${kind.un} ${kind.noun}: nombre, descripción, ODS, ${profile.profileType === 'organizacion' ? 'causa' : 'industria'}, qué necesitas ahora y dónde está.`,
          'Puede tener varias sedes (región, estado y ciudad escrita) y marcarse como remoto para aparecer en recomendaciones de otras regiones.',
          'Elige su etapa — las iniciativas pasan por Idea y Prototipo; emprendimientos e instituciones por Constituido, En crecimiento y Maduro.',
          'Agrega hasta 4 métricas destacadas (por ejemplo "Engagement en redes: 4,000 personas") y documentos o ligas. Puedes ligar a cofundadores por su @usuario, editarlo cuando quieras o borrarlo desde su dossier.',
        ],
        link: { to: '/app/iniciativas/nueva', label: `Registrar ${kind.un} ${kind.noun}` },
      }

  return [
    {
      title: 'Bienvenida a Nexo',
      body: [
        'Nexo es un mapa del ecosistema de emprendimiento en México: emprendimientos, iniciativas, instituciones, personas, mesas de trabajo, eventos y recursos en un solo lugar.',
        'La idea: que no construyas desde cero ni sin compañía. Este recorrido dura un par de minutos y puedes volver a él cuando quieras desde "Tutorial" en el menú.',
      ],
    },
    {
      title: 'Tu perfil',
      body: [
        'Todo lo que Nexo te recomienda sale de tu perfil: tipo de perfil, industria o causa, ODS, región, estado, ciudad y lo que buscas.',
        'Nombre, fecha de nacimiento, género y tipo de perfil no cambian después de registrarte; lo demás se edita en Ajustes. Ahí también puedes agregar correos adicionales de contacto y, si eres estudiante, sumar "voluntario/a" como segundo perfil.',
        'El género solo se usa para mostrarte primero apoyos dirigidos a mujeres. Con "No binario", "Prefiero no decir" u "Otro", recomendamos solo por tus demás datos.',
      ],
      link: { to: '/app/ajustes', label: 'Abrir Ajustes' },
    },
    {
      title: 'Inicio: lo recomendado para ti',
      body: [
        'Inicio junta emprendimientos, mentores, recursos, mesas de trabajo y eventos afines a ti, ordenados por industria, ODS, región y lo que buscas.',
        'Por defecto ves tu región, más proyectos remotos de otras regiones que coinciden con lo que buscas. "Ver todas las regiones" quita el filtro.',
      ],
      link: { to: '/app/dashboard', label: 'Ir a Inicio' },
    },
    {
      title: 'Explorar el catálogo',
      body: [
        'Explorar muestra todo: emprendimientos, iniciativas e instituciones (con su perfil institucional). Filtra por región, por tipo de proyecto y por industria, ODS o causa.',
        'Abre un dossier para ver descripción, métricas, etapa, sedes, documentos y contacto; el botón "Visitar sitio" lleva a su página. "Me interesa" avisa a sus responsables y el marcador lo guarda en Guardado.',
      ],
      link: { to: '/app/iniciativas', label: 'Ir a Explorar' },
    },
    projectStep,
    {
      title: 'Personas y mensajes',
      body: [
        'Personas es el directorio: filtra por región, rol, industria, causa u ODS, o busca por nombre, habilidad o ciudad. Entra a un perfil para ver qué ofrece y qué busca.',
        'Desde un perfil puedes escribirle directo; todas tus conversaciones están en Mensajes.',
      ],
      link: { to: '/app/personas', label: 'Ir a Personas' },
    },
    {
      title: 'Mesas de trabajo',
      body: [
        'Las mesas en Comunidad son espacios acotados por industria o tema, con chat y archivos adjuntos. Únete a las que te interesen o crea la tuya.',
        'La mesa "Dudas y onboarding" es la oficial: ahí el equipo de Nexo responde preguntas y te da la bienvenida.',
      ],
      link: { to: `/app/comunidad/${SUPPORT_GROUP_SLUG}`, label: 'Ir a Dudas y onboarding' },
    },
    {
      title: 'Eventos y recursos',
      body: [
        'Eventos: talleres, hackathons y pitch days, filtrables por región o en línea. Inscríbete con un clic, o crea el tuyo.',
        'Recursos: convocatorias, financiamiento, incubadoras y programas por zona y de alcance nacional. Puedes sugerir uno nuevo; el equipo lo revisa antes de publicarlo.',
      ],
      link: { to: '/app/recursos', label: 'Ir a Recursos' },
    },
    {
      title: 'El asistente y el soporte',
      body: [
        'El botón circular de abajo a la derecha abre el asistente: conoce tu perfil y puede recomendarte emprendimientos, eventos, mesas, mentores y recursos reales de la plataforma.',
        'Si necesitas a una persona, el menú del asistente tiene "Hablar con soporte (chat privado)".',
      ],
    },
  ]
}

export default function Tutorial() {
  const { profile, updateProfile } = useProfile()
  const steps = useMemo(() => buildSteps(profile), [profile])
  const [index, setIndex] = useState(0)
  const step = steps[index]
  const isLast = index === steps.length - 1

  const finish = () => {
    if (!profile.tutorialSeen) updateProfile({ tutorialSeen: true }).catch(() => {})
  }

  return (
    <DashboardLayout eyebrow="Ayuda" title="Cómo funciona Nexo" subtitle="Un recorrido corto por todo lo que puedes hacer aquí.">
      <div className="tutorial">
        <div className="tutorial-progress" role="progressbar" aria-valuemin={1} aria-valuemax={steps.length} aria-valuenow={index + 1}>
          {steps.map((s, i) => (
            <button
              key={s.title}
              type="button"
              className={`tutorial-dot ${i === index ? 'active' : i < index ? 'done' : ''}`}
              onClick={() => setIndex(i)}
              aria-label={`Paso ${i + 1}: ${s.title}`}
            />
          ))}
        </div>

        <div className="tutorial-card">
          <span className="kicker">Paso {index + 1} de {steps.length}</span>
          <h2 className="tutorial-title">{step.title}</h2>
          {step.body.map((p) => (
            <p className="tutorial-text" key={p}>{p}</p>
          ))}
          {step.link && (
            <Link to={step.link.to} className="link-arrow">{step.link.label} →</Link>
          )}
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-ghost" disabled={index === 0} onClick={() => setIndex((i) => i - 1)}>← Anterior</button>
          {isLast ? (
            <Link to="/app/dashboard" className="btn btn-primary" onClick={finish}>Terminar y ir a Inicio</Link>
          ) : (
            <button type="button" className="btn btn-primary" onClick={() => setIndex((i) => i + 1)}>Siguiente →</button>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
