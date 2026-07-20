# CLAUDE.md

Este archivo proporciona orientación a Claude Code (claude.ai/code) cuando trabaja con código en este repositorio.

## Descripción del Proyecto

**Genten Agent** es un chatbot de WhatsApp impulsado por IA para gestionar reservas de lavado de autos (Genten Status, Arica). Construido sobre **n8n** con **OpenAI GPT-4.1-mini**, respaldado por **Notion** para almacenamiento de datos y **Telegram** para notificaciones de errores.

## Stack e Infraestructura

- **Plataforma de Workflows:** n8n (alojado en `https://n8n.jalda.xyz`)
- **Servidor MCP:** `https://n8n.jalda.xyz/mcp-server/http` (requiere OAuth al inicio de sesión)
- **Motor IA:** OpenAI GPT-4.1-mini
- **Base de Datos:** Notion (almacena reservas, clientes, catálogo de servicios)
- **Integraciones Externas:** WhatsApp, Telegram, Redis
- **Archivos de Workflow:** Archivos JSON exportados en este directorio (un workflow por archivo)

## ⚠️ REGLA OBLIGATORIA: Carpeta de trabajo en n8n

**Este proyecto trabaja exclusivamente con la carpeta `Genten WhatsApp` (ID `ZBid7zKfKogVF5aS`) dentro del proyecto personal en n8n.**

- Todos los workflows de este proyecto están dentro de esa carpeta.
- Al crear un workflow nuevo con `create_workflow_from_code`, siempre especifica `folderId: "ZBid7zKfKogVF5aS"` para que quede dentro de la carpeta correcta.
- No crear workflows en la raíz del proyecto ni en otras carpetas (ej: `camifit` pertenece a otro proyecto distinto).

## ⚠️ REGLA OBLIGATORIA: Sincronizar JSON en la carpeta del proyecto

**Cada vez que crees o actualices un workflow o nodo en n8n (vía MCP), DEBES también reflejar el cambio en el archivo JSON correspondiente de la carpeta del proyecto** (`/Users/aggroalda/Claude/Projects/n8n genten/`).

- Un archivo `.json` por workflow, nombrado igual que el workflow (ej: `Genten Agent.json`).
- Después de cualquier `create_workflow_from_code` o `update_workflow`, obtén el estado actual con `get_workflow_details` y vuelca el JSON al archivo del proyecto (crea el archivo si no existe, sobrescríbelo si ya existe).
- El JSON debe reflejar el estado real en n8n: nodos, conexiones, parámetros, settings y credenciales referenciadas.
- Esto mantiene la carpeta del proyecto como respaldo versionable y fuente de verdad local de todos los workflows.

## Trabajar con Workflows de n8n

### Configuración Requerida

Al iniciar una sesión:
1. **Autenticarse con MCP:** El servidor MCP de n8n requiere OAuth. Se te pedirá que te autentiques y pegues la URL de callback.
2. **Después de autenticarse:** Las herramientas solo están disponibles después de reiniciar la sesión (esto es una peculiaridad del servidor MCP de n8n).

### Comandos MCP Comunes

- **Buscar nodos:** `search_nodes` con consultas como "slack", "set", "if", "code"
- **Obtener tipos de nodos:** `get_node_types` con IDs de nodos de resultados de búsqueda — **no omitas esto** al configurar nodos
- **Leer referencia SDK:** `get_sdk_reference` antes de escribir código de workflow
- **Validar workflows:** `validate_workflow` con tu código completo antes de crear/actualizar
- **Publicar después de actualizar:** Siempre llama `publish_workflow` después de `update_workflow` — las actualizaciones son borradores hasta publicar
- **Probar workflows:** `test_workflow` ejecuta credenciales en vivo (crea registros reales en Notion, envía mensajes de Telegram) — limpia datos de prueba después

### Archivos de Workflow e IDs

| Nombre de archivo | ID de Workflow | Rol |
|---|---|---|
| Genten Agent.json | `cKHY2hxrU85iwpnO` | Punto de entrada principal — ingesta de WhatsApp, enrutamiento de IA, envío de respuesta |
| Consultar Servicios Genten.json | `NnY3cPtza3ys29pf` | Devuelve servicios + precios por tipo de vehículo desde Notion; tool del AI Agent |
| Consultar Disponibilidad Genten.json | `5lbhx6ZMynMgTefM` | Calcula capacidad por fecha; llamado por flujos de reserva |
| Micro Servicio Agendar.json | `r2Cq0W0RQeZyDoBW` | Validación de reserva servidor-lado; crea registros Notion |
| Consultar Cita Cliente Genten.json | `sp05sloD3bOve14R` | Búsqueda de reservas por teléfono |
| Buscar Reserva Cancelable Genten.json | `icYoMxHASDhEcBd3` | Paso 1 de cancelación — busca reserva por teléfono |
| Cancelar Reserva Genten.json | `k8RAoEZIDpMlPme8` | Paso 2 de cancelación — marca como Cancelado, notifica Telegram |
| Reagendar Cita Genten.json | `nX4oSbUCpYJCBqM2` | Reagenda una cita: lee reserva por page_id, re-valida disponibilidad server-side, actualiza Fecha+Hora en Notion, notifica Telegram; tool del AI Agent |
| Enviar Ubicacion Genten.json | `dYT7cOE8uh3jL0nr` | Envía pin de ubicación por WhatsApp |
| Manejador de Errores Genten.json | `Ln2qjCBZFr4FwM1S` | Manejador de errores — envía alertas a Telegram |
| Genten Chat Web.json | `D1j74aX7U7TV7dt5` | Punto de entrada del widget de chat embebido en la landing (`WEB/`). Chat Trigger (modo Embedded Chat, streaming, webhook con sufijo `/chat`) + AI Agent (**gpt-4.1-mini**, temp 0.3) con Buffer Window Memory (sin BD, memoria solo de la sesión activa) — reutiliza las mismas 8 tool-workflows que "Genten Agent" (WhatsApp); `registrar_cita_confirmada` toma `telefono` vía `$fromAI` en vez del sender de WhatsApp, porque el agente debe pedirlo en la conversación. Workflow reutilizado (antes "main", una demo genérica con Supabase RAG no relacionada a Genten — reemplazada por completo el 2026-07-20). Detalle y bugs corregidos: `avances/2026-07-20-chat-web-genten.md`. |

## Configuración Notion

### Bases de Datos

- **DB Agenda** (`collection://37180ded-c6cf-80f0-921e-000b02d52bb8`)
  - Propiedades: Titulo, Fecha (date, sin hora), Hora recepción (text — nota el espacio final), Vehículo (select: Auto/Camioneta/SUV/Moto), Servicio (select: 8 opciones canónicas), Estado (select: Reservado/En Progreso/Completado/Cancelado — activos: Reservado y En Progreso; Completado y Cancelado se excluyen de "próxima cita"), Precio (number), relación a Clientes Genten
  
- **DB Clientes** (`collection://37180ded-c6cf-80fb-8e3a-000b8f70d2e5`)
  - Propiedades: Nombre (title), Telefono (phone_number, opcional desde 2026-07-02), BSUID (rich_text, agregado 2026-07-02), Username (rich_text, agregado 2026-07-02), 📅 Agenda Genten (relation)

- **System Prompt** (página `37180ded-c6cf-809b-ba44-e2c1f5e6986b`) — instrucciones de IA y restricciones

- **Credencial Notion** (ID `G60H9I2wXkoUg3Dl`, nombre "Notion account", tipo `notionApi`) — token OAuth para acceso a Notion. (El ID `b2xixVdrVdJ6kMFC` documentado anteriormente aquí ya no existe en la instancia — corregido 2026-07-02.)

### Peculiaridades Clave

- **Filtrado de fechas en nodos Notion:** El filtro nativo de Notion inyecta timezone (-04), devolviendo 0 filas. **Solución:** Usa `getAll` con `simple:false` (propiedades raw) y filtra por fecha en un nodo Code: `properties['Fecha'].date.start.slice(0,10)`
- **Almacenamiento de fechas:** Notion está configurado con `includeTime:false` → almacena como `{start:"YYYY-MM-DD"}`, sin timezone

## Patrones de Arquitectura

### Operaciones No Confiables para IA

El agente IA no es de confianza para la aplicación de restricciones de capacidad. **Todos los checks de slots/capacidad son servidor-lado:**
- `Consultar Disponibilidad` es una utilidad pública (llamada por IA y otros flujos)
- `Micro Servicio Agendar` re-verifica internamente disponibilidad antes de crear un registro — la IA no puede eludir límites de capacidad

### Precios y Catálogo de Servicios

Los precios viven en la **BD Notion `🧼 Servicios Genten`** (`37580dedc6cf80fc99cce117835d21a6`, propiedades Nombre/Tipo/Precio/Descripción) como única fuente de verdad. Tanto el AI Agent (tool `consultar_servicios`) como `Micro Servicio Agendar` los leen de ahí:
- En `Micro Servicio Agendar` el flujo es `Normalizar datos entrada` (normaliza nombres) → `Get Servicios` (Notion getAll, simple:true) → `Asigna precio` (Code: matchea `Tipo`+`Nombre` y resuelve `precio`) → resto del flujo. La referencia de precio en `Crea nueva agenda` y el Telegram apunta a `$('Asigna precio').item.json.precio`.
- Ya **no** hay matriz `PRECIOS` hardcodeada (eliminada el 2026-06-07). Cambiar un precio en Notion se refleja tanto en lo que cotiza el agente como en lo que se guarda al reservar.

### Flujo de Cancelación

Confirmación de usuario en dos pasos:
1. Agente llama `buscar_reserva_cancelable` → devuelve page_id + detalles de reserva
2. Agente presenta detalles al cliente para confirmación
3. Cliente confirma → agente llama `cancelar_reserva_confirmada`
- Sin recolección de razones; cancelación directa al confirmar

### Reglas de Negocio (Hardcodeadas en Workflows y Prompt)

- **Capacidad:** Máximo **2 vehículos por día** (cualquier tipo: auto, camioneta, SUV, moto combinados).
- **Recepción:** Rango continuo **09:00–15:00** (el cliente llega a cualquier hora dentro de la franja, NO hay slots fijos).
- **"Lavado completo exterior e interior"** (cualquier vehículo): Bloquea día completo (no admite otra reserva ese día).
- **"Abrillantado de pintura"** (solo motos): Bloquea día completo.
- **Motos:** El motor debe estar frío al lavado.

> **Histórico:** 
> - 2026-06-07: Backend migrado de slots fijos (`SLOTS = ['09:00','15:00']`) a capacidad por conteo con recepción de rango continuo 09:00–15:00.
> - 2026-06-12: 
>   - System prompt optimizado (recortado 60%, de ~2800 a ~1100 tokens).
>   - Agregado flujo **CONSULTA DE PRECIO** para distinguir consultas de intención de compra.
>   - Clarificada capacidad a "máximo 2 vehículos totales/día".
>   - Timeout HTTP aumentado a 30s (nodo "Descargar Audio").
>   - Retry activado en 12 nodos de lectura (Max Tries: 3, Wait: 1500ms).

## Tareas Comunes de Desarrollo

### Actualizar un Workflow

1. Realiza cambios en la UI de n8n o vía `update_workflow`
2. **Siempre** sigue con `publish_workflow` — los workflows borrador no afectan producción
3. Valida cambios con `validate_workflow` antes de enviar a producción

### Probar Workflows

- Usa `test_workflow` para activar una ejecución completa con credenciales en vivo
- **Nota:** Esto crea registros reales en Notion y envía mensajes reales de Telegram
- Limpia datos de prueba después de validación

### Fiabilidad: Retry Activado (2026-06-12)

**Estado:** ✅ Retry activado en **12 nodos de lectura** (Max Tries: 3, Wait: 1500ms)

**Nodos con Retry:**
- Genten Agent: `Obtener URL Audio`, `Descargar Audio`, `Transcribir Audio`
- Consultar Servicios: `Get Servicios`
- Consultar Disponibilidad: `Consulta agenda ese día`
- Consultar Cita Cliente: `Busca cliente por telefono`, `Busca cita proxima en agenda`
- Buscar Reserva Cancelable: `Busca cliente`, `Busca reservas agenda`
- Reagendar Cita: `Lee reserva actual`
- Micro Servicio Agendar: `Get Servicios`, `revisa_telefono_cliente_en_bd`

**Beneficio:** Cubre blips de SQLite/Notion 429 sin riesgo de duplicados (todas son lecturas idempotentes).

### Debuggear Parámetros de Nodos

Al configurar nodos, siempre usa `get_node_types` con el ID exacto del nodo y discriminadores de `search_nodes`. Adivinar nombres de parámetros crea workflows inválidos.

### Actualizar Prompt de IA

El system prompt está hardcodeado en el nodo **"AI Agent"** del workflow `Genten Agent` (parámetro `options.systemMessage`). 

**Cambios recientes (2026-06-12):**
- Reducido de ~2.800 a ~1.100 tokens (-60%) para bajar latencia.
- Eliminadas ambigüedades que causaban "thinking" (ej: "Detecta cuando...", "Actúa como vendedor...").
- Agregado flujo explícito **CONSULTA DE PRECIO** para distinguir consultas (sin agendar) de intención de compra.
- Clarificada capacidad: "máximo 2 vehículos por día (cualquier tipo)", no 2 autos + 1 moto.

**Para actualizar:**
- Edita el nodo "AI Agent" en n8n UI, pestaña "Settings" → parámetro `systemMessage`.
- O usa MCP: `update_workflow(eS0UZX13wmM0hKhy, operations=[{type: "setNodeParameter", nodeName: "AI Agent", path: "/options/systemMessage", value: "..."}])`
- **Luego:** `publish_workflow(eS0UZX13wmM0hKhy)` para activar.
- **Finalmente:** Sincroniza el JSON local (`Genten Agent.json`) con el estado real de n8n.

**Flujos actuales (2026-06-12):**
- **CONSULTA DE PRECIO:** Cliente pregunta ¿cuánto cuesta? → muestra menú de servicios → si quiere agendar → AGENDAMIENTO.
- **AGENDAMIENTO:** Vehículo → Servicio → Fecha (confirmada) → Hora → Nombre → Resumen → Registro (si "sí").
- **CONSULTA DE CITA:** Cliente pregunta ¿cuándo es mi cita? → consulta_cita_cliente → muestra detalles.
- **CANCELACIÓN:** Cliente quiere cancelar → buscar_reserva_cancelable → confirmación → cancelar_reserva_confirmada.
- **REAGENDAMIENTO:** Cliente quiere mover cita → buscar_reserva_cancelable → nueva fecha/hora → confirmación → reagendar_cita_confirmada.
- **UBICACIÓN:** Cliente pide mapa → enviar_ubicacion.

### Comportamiento del Reagendar (2026-06-17)

El workflow `Reagendar Cita Genten` actualiza la cita existente en Notion (cambia Fecha + Hora en la misma página) en lugar de eliminar y crear. La API de Notion no soporta eliminación real de páginas; las operaciones `archive` y `block.delete` del nodo Notion fallan en runtime o producen efectos inesperados (como cambiar Estado a Cancelado). El update es la única opción confiable.

**Bugs del AI Agent corregidos (2026-06-17):**
- `registrar_cita_confirmada` ahora dice explícitamente "NUNCA para reagendar — usa reagendar_cita_confirmada".
- `cancelar_reserva_confirmada` ahora dice "NUNCA si el cliente quiere reagendar — usa ÚNICAMENTE reagendar_cita_confirmada".
- `reagendar_cita_confirmada` ahora dice "maneja todo internamente — NO necesitas llamar cancelar antes".

**Limitación conocida del nodo Notion:** `databasePage.archive` y `block.delete` no funcionan correctamente en esta instancia. Si en el futuro se necesita eliminar páginas de Notion desde n8n, la única vía es HTTP Request con credencial `httpHeaderAuth` configurada manualmente con el token Bearer de Notion.

## Identidad de cliente (teléfono/BSUID) — Migración 2026-07-02

WhatsApp introdujo **usernames** y **BSUID** (business-scoped user ID). Cuando un cliente adopta username y escribe por primera vez, el webhook de Cloud API puede entregar el BSUID **sin número de teléfono**. Se implementó una identidad híbrida:

- **Si el webhook trae teléfono** → el teléfono sigue siendo la llave primaria. No se le pregunta nada al cliente.
- **Si NO trae teléfono** (username adopter nuevo) → el **BSUID es la llave primaria**, y el agente pide el teléfono conversacionalmente durante el AGENDAMIENTO (para contacto del negocio, no como llave).

**Nodo central — `Extraer identidad`** (Code, en `Genten Agent` justo después de `WhatsApp Trigger`): deriva de `messages[0].from` y `contacts[0]` los campos `telefono`, `bsuid`, `username`, `reply_id` (identificador para responder), `reply_is_phone` (bool) y `contact_key` (`telefono || bsuid`, usado en la sessionKey de memoria). El nodo hace `return [{ json: { ...entry, telefono, bsuid, ... } }]` — **debe preservar el payload original con el spread `...entry`**; una versión temprana lo omitió y eso borraba `messages`/`contacts`, rompiendo el enrutamiento de `Tipo de Mensaje`/`Filter` para el 100% de los mensajes (bug encontrado y corregido el 2026-07-02, ver `avances/2026-07-02-revision-y-tests.md`). Toda referencia a la identidad del cliente en el resto del workflow debe leer de `$('Extraer identidad').item.json.*`, no directamente de `WhatsApp Trigger`.

**⚠️ Webhooks de estado:** WhatsApp entrega, por la misma suscripción `messages`, webhooks de **estado** (`statuses[]`: sent/delivered/read) cada vez que el bot envía una respuesta — y estos NO traen array `messages`. `Extraer identidad` tiene una guarda al inicio (`const msg = (entry.messages || [])[0]; if (!msg) return [];`) que descarta esos eventos devolviendo 0 items. Sin la guarda, el nodo crashea con `Cannot read properties of undefined` en cada acuse (bug 4 del 2026-07-02).

**Nota BSUID en clientes tradicionales:** WhatsApp ya asigna un BSUID (`contacts[0].user_id`, formato `CL.xxx` en Chile) a **todos** los clientes, no solo a los que adoptaron username. Para un cliente tradicional el payload trae `wa_id` + `user_id` simultáneamente → `telefono` se llena desde `wa_id` y sigue siendo la llave (`contact_key = telefono`); el `bsuid` queda guardado de respaldo. El caso "solo BSUID sin teléfono" solo ocurre con username adopters que no comparten número.

**Tests de funcionamiento interno:** `tests/extraer-identidad.test.mjs` (local, `node tests/extraer-identidad.test.mjs`) prueba la lógica de `Extraer identidad` de forma aislada — es una copia del jsCode del nodo, hay que mantenerla sincronizada manualmente. El workflow "Tests Internos Genten" (id `OaDBGcUsz3FzjFmU`, en el proyecto personal de n8n) corre 5 tests de lectura contra los sub-workflows de consulta. Para probar lógica de ramas (IF/Switch) sin efectos secundarios en Notion/Telegram, usar `prepare_test_pin_data` + `test_workflow` inyectando datos simulados en los nodos con credenciales — así el workflow corre completo pero sin escribir en producción.

**⚠️ Limitación del MCP con nodos IF/Switch:** el parámetro `branch: "true"/"false"` en `addConnection` **no existe** en este MCP — solo `sourceIndex` (0 = primera salida, 1 = segunda). Usarlo causa que ambas ramas queden conectadas a la salida 0, dejando la salida 1 vacía (bug real encontrado dos veces el 2026-07-02). Siempre usar `sourceIndex` al conectar salidas de nodos IF/Switch, y verificar con `get_workflow_details` que cada salida tiene su propio array de conexiones.

**Envío de mensajes salientes:** el campo `to` de la Cloud API solo acepta teléfonos; para BSUID se usa el campo `recipient`. Los nodos `Send message` y `Audio Error` (en `Genten Agent`) y `Enviar pin de ubicación` (en `Enviar Ubicacion Genten`) son ahora **HTTP Request** (no el nodo nativo WhatsApp, que no soporta `recipient`) con `jsonBody` construido dinámicamente: `to` si `reply_is_phone`/`es_telefono`, `recipient` si no.

**⚠️ Paso manual pendiente:** el MCP de n8n no permite asignar credenciales a nodos HTTP Request de forma programática (bloqueo del propio tool, no de n8n). Los nodos `Send message` y `Audio Error` en `Genten Agent` quedaron **sin credencial asignada** tras la migración. Hay que entrar a la UI de n8n y asignarles manualmente la credencial `httpHeaderAuth` **"Whatsapp imagenes y audio"** (la misma que usa el nodo `Descargar Audio` del mismo workflow) — sin esto el bot no puede responder por WhatsApp. Ver `avances/PENDIENTES.md`.

**Notion DB Clientes:** propiedades nuevas `BSUID` (rich_text) y `Username` (rich_text); `Telefono` (phone_number) ahora es opcional. Los nodos "Match cliente" en `Consultar Cita Cliente`, `Buscar Reserva Cancelable` y `Micro Servicio Agendar` matchean primero por `BSUID` exacto y si no hay match caen a `Telefono` (comparación por sufijo, solo dígitos) — importante: la rama BSUID compara el string crudo, sin la normalización `replace(/[^0-9]/g,'')` que sí se aplica a teléfonos (un BSUID alfanumérico quedaría vacío si se le aplicara esa regex).

**Retrocompatibilidad:** mientras WhatsApp siga mandando teléfono, `contact_key = telefono` y todo se comporta exactamente igual que antes de esta migración (misma sessionKey, mismo matching). El BSUID solo entra en juego cuando falta el teléfono.

## Seguridad y Secretos

- ⚠️ **Rota token Notion** (redactado — ver credencial en n8n) — fue expuesto en historial de git
- **OAuth MCP:** Requerido al inicio de sesión; los tokens son temporales
- **No commits** de tokens raw en workflows — usa referencias de credenciales en UI de n8n

## Skills de n8n Locales

Usa estas skills especializadas para construir, debuggear y reforzar workflows:

- **n8n-code-javascript** — Escribir/debuggear código JavaScript en nodos Code; $input/$json/$node; $helpers para HTTP; DateTime; patrones SplitInBatches; pairedItem
- **n8n-code-python** — Código Python en nodos Code (solo cuando se requiera explícitamente; JavaScript es preferible en 95% de casos)
- **n8n-expression-syntax** — Validar/arreglar sintaxis {{}}; $json/$node; mapping entre nodos; referencias a webhook data
- **n8n-mcp-tools-expert** — Guía experta para herramientas n8n-mcp; búsqueda de nodos; validación de configuraciones; gestión de workflows; auditoría de credenciales
- **n8n-node-configuration** — Configuración consciente de operaciones; fields requeridos; displayOptions; diferencia entre patchNodeField vs update completo
- **n8n-validation-expert** — Interpretar/arreglar errores de validación; false positives; estructura de operadores
- **n8n-workflow-patterns** — Patrones arquitectónicos probados; mejores prácticas

**Cuándo usar cada skill:**
- Escribiendo nodos Code → **n8n-code-javascript** (o -python)
- Configuring node fields con datos de nodos previos → **n8n-expression-syntax**
- Antes de llamar cualquier herramienta n8n-mcp → **n8n-mcp-tools-expert**
- Configurando parámetros de nodos → **n8n-node-configuration**
- Errores de validación en workflows → **n8n-validation-expert**
- Preguntando sobre arquitectura/patrones → **n8n-workflow-patterns**

## Documentación Relacionada

- **Auditoría Genten Agent** (memoria del proyecto): Revisión técnica completa, decisiones de arquitectura, TODOs pendientes
- **Skills locales:** Siete skills de n8n instaladas en `.claude/skills/` — úsalas siempre que trabajes con workflows
