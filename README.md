# Nexo — Landing (versión final)

Proyecto nuevo e independiente de `/Frontend`. Es la landing rediseñada
(la del mockup `landing-mockup.html`) convertida a React + Vite, con
routing y funcionalidad de botones ya desarrollada, pero **sin conectar
a ninguna base de datos todavía**. Todo lo que parece "guardar algo"
(login, registro, nueva iniciativa) es una simulación en memoria del
navegador, no persiste nada.

## Qué es real y qué es demo

- El catálogo de iniciativas (`src/data/initiatives.js`) es data mock —
  vive en el código, no en una base de datos.
- Los filtros por ODS y por "qué necesita" sí filtran de verdad, en el cliente.
- El menú móvil, el resaltado de sección activa al hacer scroll, y la
  navegación entre páginas están completamente funcionales.
- Login / Registro / "Sumar mi iniciativa" tienen formularios reales con
  validación de campos, pero al enviarlos solo muestran una vista previa
  o un mensaje de confirmación — no hay backend ni autenticación detrás.

## Desarrollo local

```bash
npm install
npm run dev
```

## Build de producción

```bash
npm run build
npm run preview   # sirve dist/ localmente para probarlo
```

## Desplegar a Vercel

Este proyecto no está conectado a Vercel todavía. Para conectarlo como
un proyecto nuevo:

```bash
npx vercel login          # confirma en tu navegador
npx vercel link           # elige "Link to existing project? No" -> nombre nuevo
npx vercel --prod         # despliega
```

`vercel.json` ya incluye el rewrite necesario para que las rutas de
React Router (como `/login` o `/iniciativas/:slug`) funcionen al
recargar la página o entrar por link directo.
