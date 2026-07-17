import React from 'react'

// The little two-node-and-a-line glyph used as the brand mark. It's a
// literal illustration of what "nexo" means, reused in the header, the
// footer and the section dividers.
export default function NodeMark({ size = 24, color = '#04448B' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="6" cy="18" r="3" stroke={color} strokeWidth="1.6" />
      <circle cx="18" cy="6" r="3" stroke={color} strokeWidth="1.6" />
      <line x1="8.2" y1="15.8" x2="15.8" y2="8.2" stroke={color} strokeWidth="1.6" />
    </svg>
  )
}
