# CLAUDE.md — Genten Agent (Supabase + Chatwoot)

Guía para Claude Code al trabajar con este proyecto en n8n.

## Descripción

**Genten Agent v2** — chatbot WhatsApp para Genten Status (lavado de autos, Arica).
Stack: n8n + OpenAI GPT-4.1-mini + Supabase (datos + vector) + Chatwoot (mensajería + handoff humano).

## Stack

| Componente | Detalle |
|---|---|
| Plataforma | n8n en `https://n8n.jalda.xyz` |
| MCP Server | `https://n8n.jalda.xyz/mcp-server/http` (requiere OAuth) |
| IA | OpenAI GPT-4.1-mini |
| Base de datos | Supabase (PostgreSQL + pgvector) |
| Mensajería | Chatwoot (webhook entrada + API salida) |
| Errores | Telegram |

## ⚠️ Carpeta n8n

Todos los workflows de este proyecto están en la carpeta **`Genten WhatsApp v2`** (ID: _pendiente de crear_).
Al crear workflows: siempre usa `folderId` de esa carpeta.

## ⚠️ Sincronizar JSON local

Después de crear o actualizar un workflow en n8n:
1. `get_workflow_details` → obtén estado actual
2. Vuelca el JSON al archivo correspondiente en este directorio

## Workflows

| Archivo | ID n8n | Rol |
|---|---|---|
| Genten Agent.json | _pendiente_ | Flujo principal: Chatwoot → AI Agent → respuesta |
| Manejador de Errores.json | _pendiente_ | Alertas Telegram en errores |

## Arquitectura del AI Agent

```
Chatwoot Webhook (POST)
  ↓
Filter: solo mensajes entrantes + conversación no asignada a humano
  ↓
Set: extrae teléfono, mensaje, conversation_id
  ↓
AI Agent
  ├── Retriever: Supabase Vector Store  (catálogo servicios → match_servicios())
  ├── Memory:   Postgres Chat Memory    (tabla chat_sessions, session_key = teléfono)
  │
  ├── Tool: registrar_cita
  │     Inputs: nombre, telefono, tipo_vehiculo, servicio, fecha, hora
  │     Lógica: disponibilidad_dia() → si cupo → UPSERT clientes + INSERT agenda
  │
  ├── Tool: cancelar_reserva
  │     Inputs: telefono
  │     Lógica: SELECT reserva activa futura → UPDATE estado='Cancelado'
  │
  ├── Tool: reagendar_cita
  │     Inputs: telefono, nueva_fecha, nueva_hora
  │     Lógica: SELECT reserva activa → disponibilidad_dia() → UPDATE fecha+hora
  │
  ├── Tool: consultar_cita
  │     Inputs: telefono
  │     Lógica: SELECT próxima reserva activa (fecha >= hoy)
  │
  ├── Tool: transferir_a_humano
  │     Inputs: motivo
  │     Lógica: Chatwoot API → asigna agente + label 'human_assigned'
  │
  └── Tool: enviar_ubicacion
        Inputs: (ninguno)
        Lógica: Chatwoot API → mensaje con link maps
  ↓
HTTP Request → Chatwoot API (envía respuesta del AI)
```

## Supabase

### Tablas
- `clientes` — id, nombre, telefono, created_at
- `servicios` — id, nombre, tipo_vehiculo, precio, descripcion, embedding(1536)
- `agenda` — id, titulo, fecha, hora_recepcion, vehiculo, tipo_vehiculo, servicio, estado, precio, pagado, cliente_id
- `chat_sessions` — id, session_id, message (jsonb), created_at

### Funciones SQL
- `match_servicios(query_embedding, filter)` — vector search con filtro por tipo_vehiculo
- `disponibilidad_dia(fecha)` — retorna total_citas + dia_bloqueado

### Vector Store (n8n)
- Tabla: `servicios`
- Función RPC: `match_servicios`
- Embedding model: `text-embedding-3-small` (1536 dims)
- Columna embedding: `embedding`

## Chatwoot

### Webhook entrada
- Event: `message_created`
- Filtrar: `message_type == 0` (incoming) y sin label `human_assigned`
- Payload clave: `contact.phone_number`, `content`, `conversation.id`, `account.id`

### API salida (enviar mensaje)
```
POST https://<chatwoot-url>/api/v1/accounts/{account_id}/conversations/{conv_id}/messages
Headers: api_access_token: <token>
Body: { "content": "<texto>", "message_type": "outgoing", "private": false }
```

### Human Handoff
```
POST .../conversations/{conv_id}/labels
Body: { "labels": ["human_assigned"] }
```

## Reglas de Negocio (en System Prompt)

- Capacidad: **máximo 2 vehículos por día** (cualquier tipo)
- Recepción: **09:00–15:00** (rango continuo, no slots fijos)
- "Lavado completo exterior e interior" (cualquier vehículo) → bloquea día completo
- "Abrillantado de pintura" (solo motos) → bloquea día completo
- Motos: motor debe estar frío

## Flujos del AI Agent

- **CONSULTA PRECIO:** pregunta tipo vehículo → vector search servicios → muestra menú
- **AGENDAMIENTO:** vehículo → servicio → fecha → disponibilidad → hora → nombre → resumen → confirma → registrar_cita
- **CONSULTA CITA:** consultar_cita → muestra detalles
- **CANCELACIÓN:** cancelar_reserva → confirmación → ejecuta
- **REAGENDAMIENTO:** reagendar_cita → nueva fecha/hora → confirmación → ejecuta
- **HANDOFF:** transferir_a_humano → avisa al cliente
- **UBICACIÓN:** enviar_ubicacion

## Credenciales n8n (a configurar)

| Nombre sugerido | Tipo | Uso |
|---|---|---|
| Supabase account | supabaseApi | Supabase node (tools) |
| Supabase Vector | supabaseApi | Vector Store node |
| Postgres (Supabase) | postgres | LangChain Postgres Memory |
| Chatwoot account | httpHeaderAuth | HTTP Request nodes |
| OpenAI account | openAiApi | AI Agent + embeddings |
| Telegram account | telegramApi | Error handler |

## Tareas comunes

### Poblar catálogo de servicios (vectores)
Después de ejecutar `schema.sql`, correr el workflow de seed (o script) que:
1. Lee servicios base
2. Genera embeddings con `text-embedding-3-small`
3. Inserta en tabla `servicios` con embedding

### Actualizar system prompt
Editar directamente el parámetro `options.systemMessage` del nodo "AI Agent" en n8n UI
o vía MCP: `update_workflow(id, [{type:"setNodeParameter", nodeName:"AI Agent", path:"/options/systemMessage", value:"..."}])`

### Publicar cambios
Siempre seguir `update_workflow` con `publish_workflow` — los cambios son borrador hasta publicar.
