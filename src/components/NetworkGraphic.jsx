import React from 'react'

// Hand-placed node diagram for the hero: a handful of sector "nodes"
// converging on a central NEXO point. Two connections are drawn dashed
// to represent sectors that are not fully linked in yet.
export default function NetworkGraphic() {
  return (
    <svg viewBox="0 0 520 480" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Diagrama de red de Nexo conectando sectores">
      <g stroke="#04448B" strokeWidth="1.4" opacity=".4">
        <line x1="262" y1="238" x2="92" y2="92" />
        <line x1="262" y1="238" x2="332" y2="46" />
        <line x1="262" y1="238" x2="466" y2="330" />
        <line x1="262" y1="238" x2="338" y2="432" />
        <line x1="262" y1="238" x2="76" y2="378" />
      </g>
      <g stroke="#8A6100" strokeWidth="1.4" strokeDasharray="3 5" opacity=".6">
        <line x1="262" y1="238" x2="462" y2="146" />
        <line x1="262" y1="238" x2="42" y2="214" />
      </g>

      <g fontFamily="'JetBrains Mono', monospace" fontSize="11.5" fontWeight="600" fill="#4B5563">
        <circle cx="92" cy="92" r="6" fill="#FBF9F4" stroke="#04448B" strokeWidth="1.8" />
        <text x="92" y="75">SALUD</text>

        <circle cx="332" cy="46" r="6" fill="#04448B" />
        <text x="332" y="29">EDUCACIÓN</text>

        <circle cx="466" cy="330" r="6" fill="#FBF9F4" stroke="#04448B" strokeWidth="1.8" />
        <text x="410" y="352">ENERGÍA</text>

        <circle cx="338" cy="432" r="6" fill="#FBF9F4" stroke="#04448B" strokeWidth="1.8" />
        <text x="300" y="456">GOBIERNO</text>

        <circle cx="76" cy="378" r="6" fill="#04448B" />
        <text x="8" y="401">EMPRESAS</text>

        <circle cx="462" cy="146" r="6" fill="#FBF9F4" stroke="#8A6100" strokeWidth="1.8" />
        <text x="410" y="131">AGUA +</text>

        <circle cx="42" cy="214" r="6" fill="#FBF9F4" stroke="#8A6100" strokeWidth="1.8" />
        <text x="0" y="199">COMUNIDAD +</text>
      </g>

      <circle cx="262" cy="238" r="27" fill="none" stroke="#FFD77F" strokeWidth="1.6" />
      <circle cx="262" cy="238" r="16" fill="#101B26" />
      <text
        x="262"
        y="242"
        textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace"
        fontSize="10.5"
        fontWeight="700"
        fill="#FBF9F4"
        letterSpacing="0.5"
      >
        NEXO
      </text>
    </svg>
  )
}
