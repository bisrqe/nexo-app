import React from 'react'

// Hand-placed node diagram for the hero: the actors that make up Nexo's
// ecosystem, converging on a central NEXO point. Comunidad and Medio
// ambiente are drawn dashed to represent sectors that are not fully
// linked in yet — the rest are solid.
export default function NetworkGraphic() {
  return (
    <svg viewBox="-40 -10 600 500" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Diagrama de red de Nexo conectando a los actores de su ecosistema">
      <g stroke="#04448B" strokeWidth="1.4" opacity=".4">
        <line x1="262" y1="238" x2="262" y2="43" />
        <line x1="262" y1="238" x2="400" y2="100" />
        <line x1="262" y1="238" x2="457" y2="238" />
        <line x1="262" y1="238" x2="400" y2="376" />
        <line x1="262" y1="238" x2="262" y2="433" />
        <line x1="262" y1="238" x2="124" y2="376" />
      </g>
      <g stroke="#8A6100" strokeWidth="1.4" strokeDasharray="3 5" opacity=".6">
        <line x1="262" y1="238" x2="67" y2="238" />
        <line x1="262" y1="238" x2="124" y2="100" />
      </g>

      <g fontFamily="'JetBrains Mono', monospace" fontSize="11.5" fontWeight="600" fill="#4B5563">
        <circle cx="262" cy="43" r="6" fill="#04448B" />
        <text x="262" y="26" textAnchor="middle">UNIVERSIDADES</text>

        <circle cx="400" cy="100" r="6" fill="#FBF9F4" stroke="#04448B" strokeWidth="1.8" />
        <text x="412" y="94">ACELERADORAS</text>

        <circle cx="457" cy="238" r="6" fill="#04448B" />
        <text x="469" y="242">MENTORES</text>

        <circle cx="400" cy="376" r="6" fill="#FBF9F4" stroke="#04448B" strokeWidth="1.8" />
        <text x="412" y="394">GOBIERNO</text>

        <circle cx="262" cy="433" r="6" fill="#04448B" />
        <text x="262" y="457" textAnchor="middle">EMPRESAS</text>

        <circle cx="124" cy="376" r="6" fill="#FBF9F4" stroke="#04448B" strokeWidth="1.8" />
        <text x="112" y="394" textAnchor="end">EMPRENDEDORES</text>

        <circle cx="67" cy="238" r="6" fill="#FBF9F4" stroke="#8A6100" strokeWidth="1.8" />
        <text x="55" y="242" textAnchor="end">COMUNIDAD +</text>

        <circle cx="124" cy="100" r="6" fill="#FBF9F4" stroke="#8A6100" strokeWidth="1.8" />
        <text x="112" y="94" textAnchor="end">MEDIO AMBIENTE +</text>
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
