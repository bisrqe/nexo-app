// Plantilla compartida para los correos transaccionales que se mandan vía
// Resend (ver index.js) — mismo look para todos en vez de HTML suelto por
// trigger. Estilos inline en todas partes porque la mayoría de los
// clientes de correo ignoran <style>. Colores y tipografía tomados del
// sistema de diseño del sitio (src/index.css: --navy, --gold, --ink,
// --paper, --paper-alt, --line, --text-faint).

const APP_URL = 'https://nexo-app-mauve.vercel.app'

const DEFAULT_FOOTER = `Puedes ajustar qué correos te mandamos desde <a href="${APP_URL}/app/ajustes" style="color:#636A7C;">tu perfil</a>.`

// heading/bodyHtml ya deben venir con las partes dinámicas escapadas
// (ver escapeHtml en index.js) — esta función solo arma el shell.
function renderEmail({ preheader = '', heading, bodyHtml, cta, footerNote = DEFAULT_FOOTER }) {
  return `<!DOCTYPE html>
<html lang="es">
  <body style="margin:0; padding:0; background:#F1ECE1; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
    <span style="display:none; max-height:0; overflow:hidden; opacity:0;">${preheader}</span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F1ECE1;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px; width:100%; background:#FBF9F4; border:1px solid rgba(16,27,38,.14); border-radius:10px; overflow:hidden;">
            <tr>
              <td style="background:#04448B; padding:20px 28px;">
                <span style="font-family:Georgia,'Times New Roman',serif; font-weight:600; font-size:18px; letter-spacing:.02em; color:#FBF9F4;">NEXO.</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 28px 8px;">
                <h1 style="margin:0 0 16px; font-family:Georgia,'Times New Roman',serif; font-weight:500; font-size:20px; line-height:1.3; color:#101B26;">${heading}</h1>
                <div style="font-size:14.5px; line-height:1.6; color:#101B26;">${bodyHtml}</div>
              </td>
            </tr>
            ${cta ? `
            <tr>
              <td style="padding:4px 28px 32px;">
                <a href="${cta.href}" style="display:inline-block; background:#04448B; color:#FBF9F4; text-decoration:none; font-size:13.5px; font-weight:600; padding:11px 22px; border-radius:6px;">${cta.label}</a>
              </td>
            </tr>` : '<tr><td style="padding-bottom:20px;"></td></tr>'}
            <tr>
              <td style="padding:18px 28px; border-top:1px solid rgba(16,27,38,.14); font-size:11.5px; line-height:1.6; color:#636A7C;">
                Nexo — red de emprendimiento e iniciativas sociales · <a href="${APP_URL}" style="color:#636A7C;">nexohub.mx</a><br/>
                ${footerNote}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

module.exports = { renderEmail, APP_URL }
