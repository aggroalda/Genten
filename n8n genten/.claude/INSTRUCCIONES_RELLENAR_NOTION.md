# Instrucciones para Rellenar Tabla de Servicios en Notion

## ✅ Estado Actual
- ✅ Workflow "Consultar Servicios Genten" creado (ID: `palrP82m8GdUidIh`)
- ✅ Agregado como tool al AI Agent
- ✅ Sistema prompt actualizado (dinámico)
- ⏳ **Falta:** Rellenar tabla de servicios en Notion

---

## Opción 1: Agregar Manualmente en Notion (5 minutos)

1. Abre el link de Notion: https://app.notion.com/p/37580dedc6cf80fc99cce117835d21a6
2. Haz clic en "Add a database item" o "New"
3. Para cada servicio, rellena:
   - **Vehículo** (select): Auto / Camioneta / SUV / Moto
   - **Servicio** (text): Nombre del servicio
   - **Precio** (number): Cantidad
   - **Descripción** (text): Descripción

### Datos a Agregar (16 servicios)

```json
[
  {"vehiculo": "Auto", "servicio": "Lavado básico exterior", "precio": 15000, "descripcion": "Lavado exterior básico"},
  {"vehiculo": "Auto", "servicio": "Lavado completo exterior", "precio": 20000, "descripcion": "Lavado exterior completo"},
  {"vehiculo": "Auto", "servicio": "Lavado completo exterior e interior", "precio": 45000, "descripcion": "Lavado exterior e interior completo"},
  {"vehiculo": "Auto", "servicio": "Limpieza interior", "precio": 20000, "descripcion": "Limpieza interior únicamente"},
  {"vehiculo": "Camioneta", "servicio": "Lavado básico exterior", "precio": 18000, "descripcion": "Lavado exterior básico"},
  {"vehiculo": "Camioneta", "servicio": "Lavado completo exterior", "precio": 23000, "descripcion": "Lavado exterior completo"},
  {"vehiculo": "Camioneta", "servicio": "Lavado completo exterior e interior", "precio": 48000, "descripcion": "Lavado exterior e interior completo"},
  {"vehiculo": "Camioneta", "servicio": "Limpieza interior", "precio": 23000, "descripcion": "Limpieza interior únicamente"},
  {"vehiculo": "SUV", "servicio": "Lavado básico exterior", "precio": 18000, "descripcion": "Lavado exterior básico"},
  {"vehiculo": "SUV", "servicio": "Lavado completo exterior", "precio": 23000, "descripcion": "Lavado exterior completo"},
  {"vehiculo": "SUV", "servicio": "Lavado completo exterior e interior", "precio": 48000, "descripcion": "Lavado exterior e interior completo"},
  {"vehiculo": "SUV", "servicio": "Limpieza interior", "precio": 23000, "descripcion": "Limpieza interior únicamente"},
  {"vehiculo": "Moto", "servicio": "Lavado básico", "precio": 15000, "descripcion": "Lavado básico"},
  {"vehiculo": "Moto", "servicio": "Lavado + descontaminado full", "precio": 20000, "descripcion": "Lavado con descontaminado completo"},
  {"vehiculo": "Moto", "servicio": "Abrillantado de pintura", "precio": 60000, "descripcion": "Abrillantado de pintura - motor frío"},
  {"vehiculo": "Moto", "servicio": "Abrillantado de cromados", "precio": 30000, "descripcion": "Abrillantado de cromados"}
]
```

---

## Opción 2: Usar cURL (1 minuto, pero requiere token)

Necesitas un **Personal Integration Token** de Notion:

```bash
# Obtén el token desde: https://www.notion.so/my-integrations

# Ejemplo: Crear un servicio
curl -X POST https://api.notion.com/v1/pages \
  -H "Authorization: Bearer YOUR_NOTION_TOKEN" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "parent": {
      "database_id": "37580dedc6cf80fc99cce117835d21a6"
    },
    "properties": {
      "Servicio": {
        "title": [{"text": {"content": "Lavado básico exterior"}}]
      },
      "Vehículo": {
        "select": {"name": "Auto"}
      },
      "Precio": {
        "number": 15000
      },
      "Descripción": {
        "rich_text": [{"text": {"content": "Lavado exterior básico"}}]
      }
    }
  }'
```

---

## Opción 3: Workflow n8n (Pendiente)

Hay un workflow preparado en n8n (ID: `m7vSP1Rzf8dgc97y`) pero tiene problemas técnicos en la configuración de Notion. Si necesitas que lo aregles, avísame.

---

## ✅ Una vez rellenado, verifica:

1. Abre el workflow "Consultar Servicios Genten" en n8n
2. Haz test manual: input `{"vehiculo": "Auto"}`
3. Verifica que devuelve los 4 servicios de Auto con precios
4. Si funciona, el AI Agent ya puede usarlo

---

## 🎯 Una vez completado:

- El AI Agent consultará servicios dinámicamente
- Cambios en Notion = cambios inmediatos en el agente
- No requiere re-publicar el workflow
- Los precios siempre estarán actualizados
