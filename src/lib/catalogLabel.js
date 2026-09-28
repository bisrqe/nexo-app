// Resuelve la etiqueta visible de un valor de catálogo (ODS/industria):
// si es 'otra', usa el texto libre que haya escrito la persona.
export function labelFor(list, id, otraLabel) {
  if (id === 'otra') return otraLabel?.trim() || 'Otra'
  return list.find((o) => o.id === id)?.label ?? ''
}
