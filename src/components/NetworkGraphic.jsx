import React from 'react'

// Hand-placed node diagram for the hero: the actors that make up Nexo's
// ecosystem, converging on a central NEXO point. Comunidad and Medio
// ambiente are drawn dashed to represent sectors that are not fully
// linked in yet — the rest are solid.
export default function NetworkGraphic() {
  return (
    <svg viewBox="0 0 700 620" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Diagrama de red de Nexo conectando a los actores de su ecosistema">
      <g stroke="#04448B" strokeWidth="1.4" opacity=".4">
        <line x1="349" y1="345" x2="349" y2="107" />
        <line x1="349" y1="345" x2="437" y2="202" />
        <line x1="349" y1="345" x2="484" y2="366" />
        <line x1="349" y1="345" x2="517" y2="497" />
        <line x1="349" y1="345" x2="398" y2="521" />
        <line x1="349" y1="345" x2="312" y2="476" />
        <line x1="349" y1="345" x2="190" y2="489" />
        <line x1="349" y1="345" x2="151" y2="251" />
        <line x1="349" y1="345" x2="267" y2="215" />
      </g>
      <g stroke="#8A6100" strokeWidth="1.4" strokeDasharray="3 5" opacity=".6">
        <line x1="349" y1="345" x2="193" y2="369" />
        <line x1="349" y1="345" x2="533" y2="258" />
      </g>

      <g fontFamily="'JetBrains Mono', monospace" fontSize="12" fontWeight="600" fill="#4B5563">
        <circle cx="349" cy="107" r="7" fill="#FBF9F4" stroke="#04448B" strokeWidth="1.8" />
        <text x="349" y="88" textAnchor="middle">UNIVERSIDADES</text>

        <circle cx="437" cy="202" r="7" fill="#04448B" />
        <text x="449" y="196">MENTORES</text>

        <circle cx="533" cy="258" r="7" fill="#FBF9F4" stroke="#8A6100" strokeWidth="1.8" />
        <text x="545" y="262">MEDIO AMBIENTE +</text>

        <circle cx="484" cy="366" r="7" fill="#FBF9F4" stroke="#04448B" strokeWidth="1.8" />
        <text x="496" y="370">ACELERADORAS</text>

        <circle cx="517" cy="497" r="7" fill="#04448B" />
        <text x="529" y="501">ESTUDIANTES</text>

        <circle cx="398" cy="521" r="7" fill="#FBF9F4" stroke="#04448B" strokeWidth="1.8" />
        <text x="398" y="545" textAnchor="middle">GOBIERNO</text>

        <circle cx="312" cy="476" r="7" fill="#04448B" />
        <text x="324" y="480">EMPRENDEDORES</text>

        <circle cx="190" cy="489" r="7" fill="#FBF9F4" stroke="#04448B" strokeWidth="1.8" />
        <text x="178" y="493" textAnchor="end">FREELANCERS</text>

        <circle cx="193" cy="369" r="7" fill="#FBF9F4" stroke="#8A6100" strokeWidth="1.8" />
        <text x="181" y="373" textAnchor="end">COMUNIDAD +</text>

        <circle cx="151" cy="251" r="7" fill="#04448B" />
        <text x="139" y="255" textAnchor="end">INSTITUCIONES</text>

        <circle cx="267" cy="215" r="7" fill="#FBF9F4" stroke="#04448B" strokeWidth="1.8" />
        <text x="255" y="209" textAnchor="end">EMPRESAS</text>
      </g>

      <circle cx="349" cy="345" r="31" fill="none" stroke="#FFD77F" strokeWidth="1.6" />
      <circle cx="349" cy="345" r="19" fill="#101B26" />
      <text
        x="349"
        y="349"
        textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace"
        fontSize="11.5"
        fontWeight="700"
        fill="#FBF9F4"
        letterSpacing="0.5"
      >
        NEXO
      </text>
    </svg>
  )
}
