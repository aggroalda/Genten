# 2026-07-20 — Chat web IA ("Genten Chat Web")

Nuevo canal de atención: asistente IA embebido en la landing (`WEB/site/`),
además del bot de WhatsApp existente. Cero cambios al canal de WhatsApp.

## Workflow nuevo: "Genten Chat Web" (`D1j74aX7U7TV7dt5`)

Se **reutilizó** un workflow existente sin relación (antes "main", una demo
genérica con Supabase RAG) y se reconstruyó por completo como el chat de la
web. Arquitectura:

- **Chat Trigger** (`@n8n/n8n-nodes-langchain.chatTrigger`, modo *Embedded
  Chat*, `responseMode: streaming`, `allowedOrigins: "*"`). Webhook de
  producción: `https://n8n.jalda.xyz/webhook/648fb314-26da-4679-b18a-7f5d0e249040/chat`
  (⚠️ **el sufijo `/chat` es obligatorio**; sin él el webhook responde 500).
- **AI Agent** con **Buffer Window Memory** (`memoryBufferWindow`,
  contextWindowLength 12) — memoria solo de la sesión activa del navegador,
  **sin persistir** en base de datos (decisión del cliente).
- **Modelo:** OpenAI **gpt-4.1-mini**, `temperature: 0.3`.
- **8 tool-workflows** reutilizadas idénticas a las del "Genten Agent" de
  WhatsApp (mismos `workflowId`, misma Notion, mismas reglas de negocio):
  `consultar_servicios`, `consultar_disponibilidad_notion`,
  `registrar_cita_confirmada`, `consultar_cita_cliente`,
  `buscar_reserva_cancelable`, `cancelar_reserva_confirmada`,
  `reagendar_cita_confirmada`, `enviar_ubicacion`.
  - Único cambio de mapeo: `registrar_cita_confirmada.telefono` pasa a
    `$fromAI(...)` (en WhatsApp venía del sender; en la web el agente lo pide
    en la conversación).

Respaldo JSON: `n8n genten/Genten Chat Web.json`. Fila agregada a la tabla de
workflows en `n8n genten/CLAUDE.md`.

## Sitio (`WEB/site/`)

- `js/chat.js`: inicializa `@n8n/chat` (CDN, sin build), branding Genten,
  auto-apertura a los 5s **una vez por sesión** (`sessionStorage`), i18n en
  español, `loadPreviousSession: false`.
- `<style>` en `index.html`: theming con la paleta de marca + indicador
  "Escribiendo".
- Los CTA de WhatsApp de la landing **no se tocaron** (canal adicional).

## Bugs encontrados y corregidos durante la integración

1. **No aparecía la caja de texto.** Causa: `loadPreviousSession: true` hacía
   un fetch al webhook al abrir que, al fallar, abortaba el montaje del input
   (`<Input v-if="currentSessionId">` nunca se creaba). Fix:
   `loadPreviousSession: false` (crea la sesión localmente).
2. **Error al enviar (preflight 500 / CORS).** Causa: la URL del webhook no
   tenía el sufijo `/chat`. Fix: agregarlo.
3. **El asistente deflectaba preguntas de servicio** ("¿limpian autos?" →
   "no manejo esa info"). Causa: system prompt sesgado a motos + sin flujo
   para preguntas de alcance + regla de deflexión demasiado sensible. Fix:
   identidad reescrita (atendemos auto/camioneta/SUV/moto, especialidad
   motos), nuevo flujo **CONSULTA DE ALCANCE / SERVICIO**, y `CONSULTA DE
   PRECIO` reforzada (llamar `consultar_servicios` y mostrar menú completo).
4. **Titubeo con autos en frases casuales** ("cuánto cuesta lavar mi auto" →
   volvía a preguntar el tipo). `gpt-4o-mini` estaba sesgado a motos y no
   seguía las instrucciones de forma consistente. Fix: **cambio de modelo a
   gpt-4.1-mini** (temp 0.3) — resolvió el titubeo.

## Verificado en producción (test_workflow, sin escribir en Notion)

- "¿limpian autos?" → confirma que sí y ofrece ayuda (ya no deflecta).
- "cuánto cuesta lavar mi auto" → llama `consultar_servicios(Auto)` y lista
  los 4 servicios de auto con precios reales de Notion.
- "cuánto cuesta un lavado para moto" → lista los servicios de moto.
- **Confirmado que Notion tiene datos de auto** (era un riesgo no verificado).

## Pendiente / a monitorear

- Revisar el widget en un **móvil real** (no se pudo automatizar): que no tape
  el botón flotante de WhatsApp ni rompa el layout.
- Actualizar el FAQ de la landing ("¿Lavan autos? POR CONFIRMAR") ahora que
  está confirmado que **sí**.
- Opcional: aplicar el mismo flujo "CONSULTA DE ALCANCE" al agente de WhatsApp
  para dejar ambos canales parejos (no se tocó WhatsApp en este avance).
