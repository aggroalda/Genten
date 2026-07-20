# Bitácora de Decisiones — Genten Detail

> Registro de decisiones tomadas y pendientes. Anota fecha en cada entrada.
> Este archivo es la memoria del proyecto: si algo se decidió, está aquí.

## Decisiones tomadas

**2026-06-30**
- Marca: **Genten Detail** (bajo Genten SpA).
- Esencia: "El detalle que hace la diferencia".
- Tagline principal: **El detalle que tu moto merece**.
- Modelo de venta: **confianza / calidad**, no precio.
- Objetivo landing: **agendar por WhatsApp** (acción única).
- Paleta: azul acero `#1F3A5F` + rojo óxido `#B4463C`, mate.
- Tipografía: Space Grotesk (títulos) + Inter (cuerpo).
- Personalidad: "el amigo que de verdad sabe de motos".
- **Descartados los 5 logos IA cromados** como logo final (no escalan, texto
  basura, maximalistas). Se conserva solo el ADN: moto + gota + emblema circular
  en versión plana.
- Estructura de landing definida en `landing/blueprint.md` (11 secciones).

**2026-07-03**
- **Nueva paleta aprobada**, reemplaza la del 2026-06-30: Dark Spruce `#30442F`,
  Black Cherry `#6C1717`, Ash Grey `#C2CCBD`, Space Indigo `#1B264F`, French
  Blue `#274690`. Fuente: `logos/palet de colores.jpg`.
- **Nueva tipografía aprobada**, reemplaza Space Grotesk + Inter: **Rye**
  (titulares/logotipo, estilo vintage/western) + **Varela Round** (subtítulos)
  + **Inter** se mantiene para cuerpo/UI. Fuente: `logos/tipografia.jpg`.
- **Logo definido y aprobado**: emblema ilustrado de moto de perfil (no
  wordmark minimalista como se había definido antes). Assets finales:
  `logos/logo .svg` y `logos/header.svg`.
- Se abandona el principio rector "minimalista/mate" del 2026-06-30 en favor de
  una dirección vintage-artesanal / taller clásico.
- `visual-identity.md` y `AGENTS.md` actualizados para reflejar esta dirección
  como oficial.

**2026-07-03 (build)**
- **Landing construida** en `WEB/site/` — HTML + CSS + JS puro, estático, mobile-first,
  sin build. Estructura: `index.html`, `css/styles.css`, `js/main.js`, `assets/`.
- Las 11 secciones del blueprint implementadas con el copy de `frontpage.md`.
- **Paleta respetada al pie de la letra** (verificada contra `logos/palet de colores.jpg`):
  solo los 5 colores oficiales como CSS custom properties en `:root`.
- Tipografía Rye + Varela Round + Inter vía Google Fonts, con fallbacks.
- **WhatsApp centralizado** en la constante `WHATSAPP` de `js/main.js` (`phone` + `text`),
  un solo lugar para reemplazar. Todos los CTAs (9) usan `[data-wa]`.
- Datos faltantes visibles con badge `[POR CONFIRMAR]` / `[FALTA FOTO REAL]`; nada inventado.
- Verificado en navegador (Playwright): sin overflow horizontal en desktop/móvil,
  sin errores de consola, slider antes/después funcional.

**2026-07-03 (whatsapp)**
- **Número de WhatsApp real conectado**: +56 9 5511 1948, en `WEB/site/js/main.js`
  (constante `WHATSAPP.phone`). Todos los CTAs de la landing ya apuntan a este número.

**2026-07-20 (chat IA + producción)**
- **Landing publicada en producción.**
- **Asistente virtual IA (chat) embebido en la landing.** Widget oficial
  `@n8n/chat` (vía CDN, sin backend propio en el sitio), con branding Genten,
  auto-apertura a los 5s (una vez por sesión de navegador) e indicador
  "Escribiendo". El "cerebro" vive en el workflow n8n **"Genten Chat Web"**
  (`D1j74aX7U7TV7dt5`), que reutiliza las mismas herramientas de Notion que el
  agente de WhatsApp (precios, disponibilidad, agendar, cancelar, reagendar,
  ubicación) con memoria de sesión (sin base de datos). Archivos:
  `WEB/site/js/chat.js` + `<style>` en `WEB/site/index.html`.
- **Decisión de alcance:** el chat es un canal **adicional**; los CTA de texto
  de la landing se mantienen apuntando a WhatsApp (sin cambios).
- **CONFIRMADO: Genten sí atiende autos** (además de motos, camionetas y SUV).
  Verificado contra la BD Notion "Servicios Genten", que tiene 4 servicios de
  auto: Lavado completo ext+int $45.000, Limpieza interior $20.000, Lavado
  completo exterior $20.000, Lavado básico exterior $15.000. Esto resuelve el
  pendiente del FAQ "¿lavan autos?" → **sí**.
- Detalle técnico del backend y las correcciones del prompt en
  `n8n genten/avances/2026-07-20-chat-web-genten.md`.

## Pendientes (`[POR CONFIRMAR]` con Juan)
- [ ] Mensaje pre-cargado del WhatsApp por sección (revisar redacción final).
- [ ] Redes (Instagram).
- [ ] Fotos reales: hero + antes/después.
- [ ] Testimonios reales de clientes.
- [ ] Actualizar el FAQ de la landing ("¿Lavan autos también? POR CONFIRMAR")
      ahora que está confirmado que **sí** atienden autos.

## Resueltos
- [x] Precios y servicios (motos y autos) — confirmados y viviendo en Notion
      ("Servicios Genten"), consumidos por el chat IA.
- [x] Dirección y horario — Oscar Quina #1477, Arica; atención solo con previa
      agenda.
- [x] ¿Lavan autos además de motos? → **Sí** (confirmado 2026-07-20).
- [x] Hosting / dominio — landing publicada en producción (2026-07-20).

## Ideas guardadas (no decididas)
- Botón de WhatsApp flotante sticky en móvil.
- Sección de plan de mantención como gancho de recurrencia.
- Posible versión del emblema circular en línea fina para redes/sellos.
