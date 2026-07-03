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

## Pendientes (`[POR CONFIRMAR]` con Juan)
- [ ] Precios y contenido exacto de cada paquete de servicio.
- [ ] Mensaje pre-cargado del WhatsApp por sección (revisar redacción final).
- [ ] Dirección, horarios y redes (Instagram).
- [ ] ¿Lavan autos además de motos? ¿Domicilio? (para el FAQ).
- [ ] Fotos reales: hero + antes/después.
- [ ] Testimonios reales de clientes.
- [ ] Hosting / dominio para publicar.

## Ideas guardadas (no decididas)
- Botón de WhatsApp flotante sticky en móvil.
- Sección de plan de mantención como gancho de recurrencia.
- Posible versión del emblema circular en línea fina para redes/sellos.
