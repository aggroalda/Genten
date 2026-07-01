# AGENTS.md — Proyecto Genten (Central)

## Identidad del operador

- **Nombre:** Juan
- **Rol:** Administrador de redes/sistemas, homelab Gentoo + Docker
- **Proyecto:** Genten Status — Sistema de gestión de lavado de vehículos con IA

## Qué es Genten

Sistema completo para gestionar un negocio de lavado de vehículos. Incluye:
1. **Chatbot WhatsApp con IA** — agente conversacional que agenda, cancela, reagenda y consulta citas
2. **Web de gestión de servicios** — CRUD del catálogo de servicios conectado a Notion
3. **Dashboard homelab** — monitoreo del servidor (no es parte del producto)

**Objetivo:** Vender este sistema a pequeñas empresas de lavado de vehículos.

## Estructura del proyecto

```
/home/alucard/nfs-kiban/Developer/Genten/
├── n8n genten/                          # v1 — Workflows n8n + Notion (EN PRODUCCIÓN)
│   ├── Genten Agent.json                # Workflow principal (WhatsApp → AI → respuesta)
│   ├── Consultar Servicios Genten.json  # Tool: catálogo de servicios por vehículo
│   ├── Consultar Disponibilidad Genten.json  # Tool: capacidad por fecha
│   ├── Micro Servicio Agendar.json      # Tool: validación + creación de reservas
│   ├── Consultar Cita Clienten.json     # Tool: búsqueda de citas por teléfono
│   ├── Buscar Reserva Cancelable Genten.json  # Tool: paso 1 cancelación
│   ├── Cancelar Reserva Genten.json     # Tool: paso 2 cancelación
│   ├── Reagendar Cita Genten.json       # Tool: reagendar existente
│   ├── Enviar Ubicacion Genten.json     # Tool: enviar pin ubicación
│   ├── Manejador de Errores Genten.json # Error handler → Telegram
│   ├── CLAUDE.md                        # Documentación del stack n8n v1
│   └── .claude/                         # Auditoría, planes, skills n8n
│
├── n8n genten supabase/                 # v2 — Workflows n8n + Supabase + Chatwoot (DESARROLLO)
│   ├── main.json                        # Workflow principal (Chatwoot → AI → respuesta)
│   ├── schema.sql                       # Schema PostgreSQL + pgvector
│   └── CLAUDE.md                        # Documentación del stack n8n v2
│
└── web_ingreso_servicio/                # Web CRUD de servicios (LAN)
    ├── index.html                       # Frontend vanilla
    ├── css/style.css                    # Estilos dark/light
    ├── js/app.js                        # Lógica CRUD
    ├── api/server.py                    # Proxy Python → Notion API
    ├── productos.db                     # SQLite local (legacy, no en uso)
    ├── README.md                        # Instrucciones de uso
    ├── DOCUMENTATION.md                 # Documentación técnica
    └── AGENTS.md                        # Este archivo (copia)
```

## Arquitectura de producción (v1 — Notion)

```
WhatsApp → n8n Webhook → AI Agent (GPT-4.1-mini)
                              ├── consultar_servicios → Notion DB Servicios
                              ├── consultar_disponibilidad → Notion DB Agenda
                              ├── registrar_cita → Notion DB Agenda + Clientes
                              ├── consultar_cita → Notion DB Agenda
                              ├── cancelar_reserva → Notion DB Agenda
                              ├── reagendar_cita → Notion DB Agenda
                              └── enviar_ubicación → WhatsApp
                              
Web LAN (10.10.1.12:8080) → Python Proxy → Notion DB Servicios
```

## Arquitectura de desarrollo (v2 — Supabase + Chatwoot)

```
WhatsApp (Chatwoot) → n8n Webhook → AI Agent (GPT-4.1-mini)
                                   ├── Supabase Vector Store (servicios)
                                   ├── Postgres Chat Memory (sesiones)
                                   └── Tools SQL → Supabase PostgreSQL
```

## Bases de datos Notion (v1)

| DB | ID | Uso |
|---|---|---|
| 🧼 Servicios Genten | `37580ded-c6cf-80fc-99cc-e117835d21a6` | Catálogo de servicios (web + agente) |
| Agenda | `37180ded-c6cf-80f0-921e-000b02d52bb8` | Reservas activas |
| Clientes | `37180ded-c6cf-80fb-8e3a-000b8f70d2e5` | Datos de clientes |
| System Prompt | `37180ded-c6cf-809b-ba44-e2c1f5e6986b` | Instrucciones del agente |

## Bases de datos Supabase (v2 — pendiente deploy)

Tablas: `clientes`, `servicios` (con pgvector), `agenda`, `chat_sessions`
Funciones SQL: `match_servicios()`, `disponibilidad_dia()`

## Reglas de negocio

- **Capacidad:** Máximo 2 vehículos/día (cualquier tipo combinado)
- **Recepción:** Rango continuo 09:00–15:00 (sin slots fijos)
- **Bloqueo por servicio:** "Lavado completo exterior e interior" bloquea día completo
- **Bloqueo por moto:** "Abrillantado de pintura" bloquea día completo
- **Motos:** Motor debe estar frío

## Entornos

| Componente | Host | Acceso |
|---|---|---|
| n8n | Docker (10.10.1.12) | https://n8n.jalda.xyz |
| Web servicios | Docker (10.10.1.12) | http://10.10.1.12:8080 |
| Notion API | Cloud | api.notion.com |
| Supabase | Cloud (pendiente) | — |
| Chatwoot | Cloud (pendiente) | — |

## Perfiles Hermes involucrados

- **Denver** (default): orquestador, backend, integraciones, auditoría
- **Apolo**: diseño frontend, CSS, UX
- **Dedalo**: código, debugging, TDD, workflows n8n

## Estado de componentes

| Componente | Estado | Notas |
|---|---|---|
| n8n v1 (Notion) | ✅ En producción | Workflows activos, agente funcionando |
| Web servicios | ✅ Funcional | CRUD completo, dark/light, responsive |
| n8n v2 (Supabase) | 🔄 En desarrollo | Schema listo, workflows parciales |
| Chatwoot | ⏳ Pendiente | Integración no iniciada |
| Dashboard homelab | ✅ Funcional | No es parte del producto |

## Convenciones de código

- **Frontend:** Vanilla JS/CSS/HTML, sin frameworks, mobile-first
- **Backend Python:** Solo stdlib (sin Flask/Django)
- **n8n:** JSON exportado por workflow, un archivo por workflow
- **CSS:** Custom properties para temas, BEM-like naming
- **JS:** IIFE wrapper, funciones nombradas

## Reglas de desarrollo

1. No agregar frameworks ni dependencias externas al frontend
2. El proxy Python debe seguir usando solo stdlib
3. No exponer tokens de Notion/Supabase en el frontend
4. Mantener dark/light mode en todos los cambios UI
5. Mantener responsive (mobile-first)
6. Cada cambio en n8n debe sincronizarse al JSON local
7. Siempre publicar workflows después de actualizar

## Seguridad

- Tokens en credenciales de n8n, nunca en JSON
- Token Notion en `~/.hermes/.env`, nunca en código
- DELETE archiva (no borra) — comportamiento Notion API
- CORS habilitado para desarrollo en proxy Python

## Pendientes conocidos (de auditoría)

1. 🔴 Error Workflow no conectado al flujo principal
2. 🔴 Formato de teléfono inconsistente entre herramientas
3. 🔴 Sin manejo de errores en cadena principal
4. 🟠 Redis TTL 24h muy agresivo (recomendado 72h)
5. 🟠 Sin rate limiting por cliente
6. 🟡 System prompt podría migrarse a Notion para dinamismo
7. ⏳ Migración a Supabase + Chatwoot (v2) pendiente de deploy
