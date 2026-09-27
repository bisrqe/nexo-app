// jsPDF y jspdf-autotable se cargan aquí adentro (import dinámico), no
// arriba del módulo — así el bundle normal de la app (el que descarga
// cualquier miembro) no carga nunca estas librerías; solo pesan cuando
// la cuenta admin de verdad da clic en "Descargar PDF".

function addSectionTable(doc, autoTable, { title, head, body, startY, note }) {
  const y = startY
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(16, 27, 38)
  doc.text(title, 14, y)

  let bodyY = y + 4
  if (note) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(94, 102, 114)
    doc.text(note, 14, bodyY + 4)
    bodyY += 6
  }

  if (!body.length) {
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(10)
    doc.setTextColor(138, 144, 155)
    doc.text('Sin datos todavía.', 14, bodyY + 6)
    return bodyY + 14
  }

  autoTable(doc, {
    head: [head],
    body,
    startY: bodyY + 2,
    margin: { left: 14, right: 14 },
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [4, 68, 139], textColor: 255 },
    theme: 'striped',
  })
  return doc.lastAutoTable.finalY + 12
}

export async function downloadKpiPdf(kpis) {
  const [{ default: JsPDF }, autoTableModule] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ])
  const autoTable = autoTableModule.default
  const doc = new JsPDF()
  const dateStr = kpis.generatedAt.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(16, 27, 38)
  doc.text('NEXO — Reporte de KPIs', 14, 20)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(94, 102, 114)
  doc.text(`Generado el ${dateStr} — datos reales de la plataforma (no incluye contenido de ejemplo).`, 14, 27)

  let y = 38
  const t = kpis.totals
  y = addSectionTable(doc, autoTable, {
    title: 'Resumen general',
    head: ['Métrica', 'Valor'],
    startY: y,
    body: [
      ['Miembros registrados', t.profiles],
      ['Emprendimientos activos', t.initiatives],
      ['Eventos creados', t.events],
      ['Total de "Me interesa"', t.interest],
      ['Conexiones realizadas (interesado ↔ dueño)', t.connections],
      ['Personas que interactuaron entre sí', t.connectedPeople],
      ['Ciudades con actividad', t.cities],
      ['Chats directos iniciados', t.directConversations],
      ['Mensajes directos enviados', t.directMessages],
      ['Mesas de trabajo creadas', t.groups],
      ['Mensajes en mesas de trabajo', t.groupMessages],
    ],
  })

  y = addSectionTable(doc, autoTable, {
    title: 'Emprendimientos por industria',
    head: ['Industria', 'Emprendimientos'],
    startY: y,
    body: kpis.initiativesByIndustry.map((d) => [d.label, d.value]),
  })

  y = addSectionTable(doc, autoTable, {
    title: 'Emprendimientos por ODS',
    head: ['ODS', 'Emprendimientos'],
    startY: y,
    body: kpis.initiativesByOds.map((d) => [d.label, d.value]),
  })

  if (y > 240) { doc.addPage(); y = 20 }
  y = addSectionTable(doc, autoTable, {
    title: 'Emprendimientos por etapa',
    head: ['Etapa', 'Emprendimientos'],
    startY: y,
    body: kpis.initiativesByStage.map((d) => [d.label, d.value]),
  })

  y = addSectionTable(doc, autoTable, {
    title: 'Miembros por ciudad',
    head: ['Ciudad', 'Miembros'],
    startY: y,
    body: kpis.profilesByCity.map((d) => [d.label, d.value]),
  })

  if (y > 240) { doc.addPage(); y = 20 }
  y = addSectionTable(doc, autoTable, {
    title: 'Miembros por tipo de perfil',
    head: ['Tipo de perfil', 'Miembros'],
    startY: y,
    body: kpis.profilesByType.map((d) => [d.label, d.value]),
  })

  y = addSectionTable(doc, autoTable, {
    title: 'Mesas de trabajo — membresías reales',
    head: ['Mesa de trabajo', 'Miembros'],
    startY: y,
    body: kpis.groupMembership.map((d) => [d.label, d.value]),
  })

  if (y > 220) { doc.addPage(); y = 20 }
  y = addSectionTable(doc, autoTable, {
    title: 'Emprendimientos con más interés',
    head: ['Emprendimiento', 'Organización', 'Industria', 'Interesados'],
    startY: y,
    body: kpis.topInitiatives.map((d) => [d.title, d.org, d.industryLabel, d.interest]),
  })

  y = addSectionTable(doc, autoTable, {
    title: 'Actividad por usuario (top 10)',
    head: ['Nombre', 'Ciudad', 'Emprendimientos creados', 'Interés mostrado', 'Eventos creados', 'Mesas unidas'],
    startY: y,
    note: 'Actividad registrada en la plataforma — no incluye tiempo de sesión, que todavía no se rastrea.',
    body: kpis.activityRanking.map((d) => [d.name, d.city || '—', d.initiatives, d.interestShown, d.events, d.groupsJoined]),
  })

  doc.save(`nexo-kpis-${kpis.generatedAt.toISOString().slice(0, 10)}.pdf`)
}
