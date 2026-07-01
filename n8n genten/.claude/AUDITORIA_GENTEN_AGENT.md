# 🔍 Auditoría: Genten Agent Workflow

**Fecha:** 7 de junio 2026  
**Workflow ID:** `eS0UZX13wmM0hKhy`  
**Estado:** Activo (en producción)

---

## 📊 Resumen Ejecutivo

**Severidad General:** 🔴 **ALTA**  
- ✅ Funcionalidad: Completa
- ⚠️ Mantenibilidad: Pobre
- 🔴 Confiabilidad: Moderada
- ⚠️ Rendimiento: Adecuado

---

## 🔴 PROBLEMAS CRÍTICOS

### 1. System Prompt Excesivamente Grande y No Mantenible

**Severidad:** 🔴 CRÍTICA

- **Tamaño:** 4.3 KB (4,348 caracteres)
- **Ubicación:** `AI Agent` node → `options.systemMessage`
- **Problema:** 
  - Catálogo de servicios hardcodeado en el prompt
  - Lógica de negocio completa dentro del prompt
  - Requiere re-publicar workflow para cambios menores
  - Consume tokens innecesarios en cada ejecución

**Impacto:** 
- Cambio de precio = modificar workflow + publicar
- 0 control de versiones en la lógica
- Costo de tokens innecesario (~1,200 tokens/ejecución)

**Solución Recomendada:**
- Migrar catálogo a Notion como tabla `Catálogo de Servicios`
- Migrar system prompt a Notion (página `System Prompt`)
- En el workflow, fetchear dinámicamente estos datos
- Usar Code node para inyectar datos actualizados en runtime

---

### 2. Inconsistencia de Formato de Teléfono

**Severidad:** 🔴 CRÍTICA

Diferentes herramientas esperan diferentes formatos:

| Herramienta | Formato Esperado | Ejemplo |
|---|---|---|
| `consultar_disponibilidad_notion` | — | `YYYY-MM-DD` |
| `registrar_cita_confirmada` | ✅ Internacional | `+56995376063` |
| `consultar_cita_cliente` | ❌ SIN `+` | `56995376063` |
| `enviar_ubicacion` | ❌ SIN `+` | `56995376063` |
| `buscar_reserva_cancelable` | ✅ CON `+` | `+56986052530` |
| `cancelar_reserva_confirmada` | — | — |

**Impacto:** El agente debe normalizar teléfono + manear conversiones en el prompt (error-prone).

**Solución:**
- Agregar nodo **Code Normalizer** después del filtro
- Extraer y normalizar teléfono una sola vez: `+{número}`
- Proporcionar al agente solo la versión normalizada
- Agregar funciones helper en el prompt para formatos específicos

---

### 3. Sin Manejo de Errores en Cadena Principal

**Severidad:** 🔴 ALTA

**Problema:**
- ❌ Sin nodo `Try/Catch` alrededor de herramientas
- ❌ Sin fallback si `consultar_disponibilidad_notion` falla
- ❌ Si `registrar_cita_confirmada` falla silenciosamente → cliente cree está registrado
- ✅ Error Workflow configurado (`06RWoeLVgFsZ9EKI`) pero **NO conectado al flujo**

**Escenarios de Fallo:**
1. Redis cae → sesión se pierde, cliente ve mensajes duplicados
2. Notion no responde → agente queda colgado
3. OpenAI falla → cliente sin respuesta por 60s

**Solución:**
- Conectar `errorWorkflow` al nodo `AI Agent`
- Agregar timeout a llamadas de herramientas
- Implementar retry con exponential backoff en herramientas críticas
- Logging de fallos en Code node

---

### 4. Validación Insuficiente de Entrada

**Severidad:** 🔴 ALTA

**Problemas en el filtro:**

```json
"leftValue": "={{ $json.messages[0].type }}"  // ❌ Asume messages[0] existe
```

Si el webhook devuelve `messages: []` → error silencioso.

**Solución:**
- Usar expresión segura: `$json.messages?.[0]?.type`
- Validar estructura webhook completa antes del filtro

---

### 5. Lógica de Cancelación en 2 Pasos Sin Transacción

**Severidad:** 🟠 ALTA

**Flujo Actual:**
1. Agente llama `buscar_reserva_cancelable` → devuelve `page_id`
2. Agente presenta al cliente
3. Si "sí" → agente llama `cancelar_reserva_confirmada`

**Problemas:**
- Sin garantía ACID entre pasos 2 y 3
- Cliente confirma, pero red falla → reserva permanece activa
- Otro cliente puede agendar el mismo slot mientras se cancela

**Solución:**
- Agregar timeout de 5 minutos en Redis para "cancelación pendiente"
- Log de confirmación en ambos pasos
- Reintentos automáticos si falla el segundo paso

---

## 🟠 PROBLEMAS MODERADOS

### 6. Expresiones LangChain Complejas y No Testeadas

**Severidad:** 🟠 MODERADA

Cada herramienta usa:
```
$fromAI('campo', 'descripción', 'type')
```

**Problema:**
- Sin validación de tipos al retornar del agente
- El prompt debe ser lo suficientemente claro para que GPT entienda
- Si el agente devuelve `{"fecha": "6 de junio"}` → error silencioso

**Solución:**
- Agregar Code node después de cada herramienta para validar respuesta
- Schema validation con Zod o json-schema
- Logging de inputs/outputs de herramientas

---

### 7. Redis Memory sin Sincronización

**Severidad:** 🟠 MODERADA

**Problema:**
- Redis solo almacena el historial de conversación
- NO sincronizado con Notion (source of truth)
- Si Redis cae → cliente pierde contexto pero reserva aún existe en Notion
- TTL de 24h muy agresivo (cliente puede reabrir chat al día siguiente y no ver nada)

**Solución:**
- Aumentar TTL a 72h (3 días)
- Agregar fallback para cargar contexto desde Notion si Redis no responde
- Sincronizar sesión completada a Notion para auditoría

---

### 8. WhatsApp Trigger sin Webhook Validation

**Severidad:** 🟠 MODERADA

**Problema:**
- Sin verificación de webhook signature
- Sin validación de payload antes del filtro
- Webhook puede ser invocado desde cualquier lugar

**Solución:**
- Activar webhook signature verification en WhatsApp node
- Validar `X-Hub-Signature` header
- Logging de payloads sospechosos

---

## 🟡 PROBLEMAS MENORES

### 9. Timestamps sin Timezone Explícito

**Severidad:** 🟡 MENOR

El prompt calcula fechas con:
```js
new Date().toLocaleDateString('es-CL', {timeZone:'America/Santiago'})
```

Pero `registrar_cita_confirmada` puede estar en servidor diferente con zona horaria distinta.

**Solución:** Pasar timezone explícitamente a todas las herramientas (UTC+0 o America/Santiago)

---

### 10. Documentación Dentro del Prompt

**Severidad:** 🟡 MENOR

- Instrucciones para el agente ocupan 4 KB
- Debería estar en doc separada o Notion
- Difícil versionar y mantener en el JSON

---

## ✅ FORTALEZAS

- ✅ Flujo lógico claro (Trigger → Filter → Agent → Send)
- ✅ 6 herramientas bien definidas y documentadas
- ✅ Sesiones aisladas por cliente (Redis key con teléfono)
- ✅ Error Workflow configurado (aunque no conectado)
- ✅ `availableInMCP: true` permite invocación desde otros workflows

---

## 📋 PLAN DE CORRECCIONES

### Prioritarias (Semana 1)

1. **Conectar Error Workflow** (5 min)
   - Agregar conexión desde `AI Agent` → `Manejador de Errores Genten`
   
2. **Crear Normalizer de Teléfono** (30 min)
   - Code node después del Filter
   - Extrae y normaliza a `+56...`
   - Inyecta al agente
   
3. **Validar Estructura Webhook** (15 min)
   - Mejorar expresión en Filter
   - Usar `messages?.[0]?.type`

### Importantes (Semana 2)

4. **Migrar System Prompt a Notion** (2h)
   - Crear página "System Prompt Dinámico"
   - HTTP request para fetchear en runtime
   
5. **Migrar Catálogo de Servicios** (1h)
   - Crear tabla Notion `Catálogo Servicios`
   - Code node para inyectar en prompt dinámicamente
   
6. **Agregar Logging de Herramientas** (1h)
   - Code node después de cada tool call
   - Log a Notion o stdout

### Mejoras (Semana 3)

7. **Retry Logic** (1.5h)
   - Exponential backoff en herramientas críticas
   - Max 3 intentos antes de fallback
   
8. **Aumentar TTL Redis** de 24h → 72h
   
9. **Webhook Signature Validation** (30 min)

---

## 🧪 Testing Recomendado

```bash
# Test 1: Cliente normal (Happy path)
- Enviar: "Hola, quiero agendar"
- Validar: Pregunta tipo vehículo → servicio → fecha → hora → nombre → resumen

# Test 2: Cliente intenta by-pass capacidad
- Agendar en día completo
- Validar: Rechaza correctamente con "no hay cupo"

# Test 3: Cancelación exitosa
- Agendar cita
- Pedir cancelación
- Validar: Muestra reserva → confirma → cancela

# Test 4: Fallo de herramienta
- Mock Redis down
- Validar: Error workflow dispara → notifica por Telegram

# Test 5: Formato teléfono incorrecto
- Agente devuelve teléfono sin normalizar
- Validar: Código handler arregla antes de pasar a herramientas
```

---

## 📞 Dependencias Críticas

| Servicio | Status | TTL | Fallback |
|---|---|---|---|
| Redis (Chat Memory) | Crítico | 24h | ❌ Ninguno |
| Notion (Datos) | Crítico | — | ❌ Ninguno |
| OpenAI GPT-4.1-mini | Crítico | — | ❌ Ninguno |
| WhatsApp Business API | Crítico | — | ❌ Ninguno |
| Telegram (Errores) | Importante | — | ✅ Log local |

---

## 🔐 Consideraciones de Seguridad

- ✅ Credenciales en n8n (no en JSON)
- ⚠️ Teléfono cliente visible en prompt (datos sensibles)
- ⚠️ Sin rate limiting por cliente
- ⚠️ Sin validación de teléfono válido

**Recomendación:** Implementar rate limiting (máx 5 mensajes/min por cliente)

---

## 📝 Conclusión

El workflow es **funcional pero frágil**. Prioritariamente:
1. Conectar error handling
2. Normalizar teléfono
3. Migrar lógica a Notion
4. Agregar validación robusta

**Fecha propuesta de refactor:** 2 semanas  
**Riesgo actual:** 🔴 Moderado-Alto (fallos silenciosos en herramientas)
