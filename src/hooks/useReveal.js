import { useEffect } from 'react'

// Entrada escalonada de los elementos [data-reveal]. El contenido solo se
// oculta una vez que este efecto corre (clase .reveal-on), así que sin JS o
// con movimiento reducido todo se ve desde el inicio.
export function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]')
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target) }
      })
    }, { threshold: 0.15 })
    els.forEach((el) => { el.classList.add('reveal-on'); io.observe(el) })
    return () => io.disconnect()
  }, [])
}
