# Identidad Visual — Genten Detail

## Principio rector
**Vintage-artesanal, con oficio.** Se dejó atrás la línea minimalista mate
inicial: la dirección definitiva es un emblema tipo taller/motero clásico
(estilo western/vintage), con ilustración detallada de moto en vez de un ícono
plano. Debe funcionar igual de bien a 32px (favicon, foto de WhatsApp) que en
grande.

## Paleta `[ACTUALIZADA 2026-07-03]`

Fuente: `logos/palet de colores.jpg`.

| Rol | Nombre | HEX | Uso |
|---|---|---|---|
| Primario oscuro | Dark Spruce | `#30442F` | Verde musgo, fondos oscuros, detalles de oficio |
| Acento cálido | Black Cherry | `#6C1717` | Vino/rojo oscuro, CTA y detalles puntuales |
| Neutro claro | Ash Grey | `#C2CCBD` | Fondos claros, emblema, contraste |
| Oscuro azulado | Space Indigo | `#1B264F` | Fondos oscuros, texto fuerte |
| Primario | French Blue | `#274690` | Azul principal, títulos, confianza |

> Reemplaza la paleta anterior (Azul Acero `#1F3A5F` + Rojo Óxido `#B4463C` +
> Grafito `#22272B` + Gris Niebla `#C9CDD1` + Blanco Hueso `#F5F4F0`), descartada
> por decisión de Juan el 2026-07-03. Ver `decisions.md`.

## Tipografía `[ACTUALIZADA 2026-07-03]`

Fuente: `logos/tipografia.jpg`.

| Uso | Fuente | Alternativa web-safe |
|---|---|---|
| Titulares / logotipo | **Rye** (serif vintage/western) | Georgia / serif |
| Subtítulos / texto curvo del logo | **Varela Round** | Arial Rounded / sans-serif |
| Cuerpo de texto y UI | **Inter** | system-ui, sans-serif |

> Reemplaza la combinación anterior (Space Grotesk + Inter). Rye aporta el
> carácter "taller clásico / motero" del nuevo emblema; Varela Round suaviza
> subtítulos y texto curvo; Inter se mantiene para cuerpo y UI por legibilidad
> en móvil.

## Logo — definido `[APROBADO 2026-07-03]`

Assets finales en `/logos`:
- `logo .svg` — logotipo/emblema principal (ilustración detallada de moto de
  perfil, multicolor plano según la paleta nueva).
- `header.svg` — variante para uso en header/banner.

Este logo **reemplaza** la dirección de wordmark plano + ícono minimalista
descrita anteriormente en este archivo, y también reemplaza el objetivo de
"logo vectorial minimalista" de `AGENTS.md`. Aprobado explícitamente por Juan.

### ADN conservado de las referencias iniciales
- Moto de perfil, ahora renderizada con más detalle (no reducida a silueta).
- Emblema/contención circular presente en la tipografía (ver `tipografia.jpg`).

## Estado
- [x] Logo vectorial — **definido y aprobado** (`logos/logo .svg`, `logos/header.svg`)
- [x] Paleta definida (actualizada 2026-07-03)
- [x] Tipografía definida (actualizada 2026-07-03)
