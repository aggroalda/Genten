# Plan de Implementación: Migrar Servicios a Notion + Crear Subflujo

## Objetivo
1. Rellenar tabla de servicios en Notion con datos extraídos del system prompt
2. Crear subflujo "Consultar Servicios Genten" que filtra por tipo de vehículo
3. Agregar como tool al AI Agent

---

## Paso 1: Rellenar Tabla de Servicios en Notion

### Datos a Insertar
Archivo: `.claude/SERVICIOS_EXTRAIDOS.json` (16 registros)

**Estructura esperada en Notion:**
```
Tabla: Catálogo de Servicios (ID: TBD)
Columnas:
- Vehículo (select): Auto / Camioneta / SUV / Moto
- Servicio (text): Nombre del servicio
- Precio (number): Precio en CLP
- Descripción (text): Descripción breve
```

### Comando MCP
```javascript
// Buscar tabla existente
n8n_manage_datatable({
  action: "listTables"
})

// O consultar DB Notion directamente si está allí
// Opción: Usar Notion API para agregar registros
```

---

## Paso 2: Crear Subflujo "Consultar Servicios Genten"

### Flujo del Workflow
```
Entrada: {vehiculo: "Auto"}
    ↓
[Notion Database] → Leer tabla Catálogo de Servicios
    ↓
[Filter] → Filtrar donde Vehículo = {{$input.vehiculo}}
    ↓
[Set/Transform] → Formatear: [{ servicio, precio, descripcion }]
    ↓
Salida: JSON array
```

### Nodos Necesarios

1. **Workflow Trigger Node**
   - Entrada: `vehiculo` (string)
   - Type: `n8n-nodes-base.workflowTriggerNode`

2. **Notion Node** 
   - Operation: Get (read from database)
   - Database: ID de "Catálogo de Servicios"
   - Credential: "Notion account" (b2xixVdrVdJ6kMFC)
   - Type: `n8n-nodes-base.notion` (v2)

3. **Filter Node**
   - Condition: `properties.Vehículo = $input.vehiculo`
   - Type: `n8n-nodes-base.filter` (v2.3)

4. **Transform/Set Node**
   - Mapear campos de Notion → respuesta limpia
   - Mode: "each item"
   - Type: `n8n-nodes-base.set` (v3)

### Conexiones
```
Workflow Trigger → Notion → Filter → Set Node
```

### Comando MCP para Crear
```javascript
n8n_create_workflow({
  name: "Consultar Servicios Genten",
  nodes: [
    // Trigger Node
    {
      id: "trigger-1",
      name: "When called",
      type: "n8n-nodes-base.workflowTriggerNode",
      typeVersion: 1,
      position: [50, 300],
      parameters: {}
    },
    // Notion Node
    {
      id: "notion-1",
      name: "Get Servicios from Notion",
      type: "n8n-nodes-base.notion",
      typeVersion: 2,
      position: [250, 300],
      parameters: {
        database: "37180ded-c6cf-80f0-921e-000b02d52bb8",
        options: {
          returnAll: false,
          limit: 100
        }
      },
      credentials: {
        notionApi: {
          id: "b2xixVdrVdJ6kMFC",
          name: "Notion account"
        }
      }
    },
    // Filter Node
    {
      id: "filter-1",
      name: "Filter by Vehiculo",
      type: "n8n-nodes-base.filter",
      typeVersion: 2.3,
      position: [500, 300],
      parameters: {
        conditions: {
          conditions: [{
            leftValue: "={{ $json.Vehículo }}",
            rightValue: "={{ $('When called').item.json.vehiculo }}",
            operator: {
              type: "string",
              operation: "equals"
            }
          }],
          combinator: "and"
        }
      }
    },
    // Set Node (Transform)
    {
      id: "set-1",
      name: "Format Output",
      type: "n8n-nodes-base.set",
      typeVersion: 3,
      position: [750, 300],
      parameters: {
        mode: "each",
        expression: "={{ { 'servicio': $json.Servicio, 'precio': $json.Precio, 'descripcion': $json.Descripción || '', 'vehiculo': $json.Vehículo } }}"
      }
    }
  ],
  connections: {
    "When called": {
      main: [[{node: "Get Servicios from Notion", type: "main", index: 0}]]
    },
    "Get Servicios from Notion": {
      main: [[{node: "Filter by Vehiculo", type: "main", index: 0}]]
    },
    "Filter by Vehiculo": {
      main: [[{node: "Format Output", type: "main", index: 0}]]
    }
  }
})
```

---

## Paso 3: Validar Workflow

```javascript
n8n_validate_workflow({
  id: "<workflow-id-retornado>",
  profile: "runtime"
})
```

---

## Paso 4: Agregar Como Tool al AI Agent

### Comando MCP para Actualizar AI Agent

```javascript
n8n_update_partial_workflow({
  id: "eS0UZX13wmM0hKhy",  // AI Agent workflow ID
  intent: "Add Consultar Servicios as AI tool",
  operations: [
    {
      type: "addNode",
      node: {
        id: "f4a1e2d3-c5b6-47e8-9f1a-2b3c4d5e6f7a",
        name: "consultar_servicios",
        type: "@n8n/n8n-nodes-langchain.toolWorkflow",
        typeVersion: 2.2,
        position: [11900, 6240],
        parameters: {
          description: "Obtén la lista de servicios disponibles para un tipo de vehículo. Pasa el tipo de vehículo (Auto, Camioneta, SUV o Moto) y devuelve servicios con precios.",
          workflowId: {
            __rl: true,
            value: "<WORKFLOW_ID_CONSULTAR_SERVICIOS>",
            mode: "id"
          },
          workflowInputs: {
            mappingMode: "defineBelow",
            value: {
              vehiculo: "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('vehiculo', 'Tipo de vehículo: Auto, Camioneta, SUV o Moto', 'string') }}"
            },
            schema: [{
              id: "vehiculo",
              displayName: "vehiculo",
              required: true,
              type: "string"
            }]
          }
        }
      }
    },
    {
      type: "addConnection",
      source: "consultar_servicios",
      target: "AI Agent",
      sourceIndex: 0,
      connectionType: "ai_tool"
    }
  ]
})
```

---

## Paso 5: Activar Workflow

```javascript
n8n_update_partial_workflow({
  id: "eS0UZX13wmM0hKhy",
  intent: "Activate updated AI Agent workflow",
  operations: [{
    type: "activateWorkflow"
  }]
})
```

---

## Checklist de Ejecución

- [ ] Paso 1: Rellenar tabla Servicios en Notion
- [ ] Paso 2: Crear workflow "Consultar Servicios Genten"
- [ ] Paso 3: Validar workflow creado
- [ ] Paso 4: Agregar como tool al AI Agent
- [ ] Paso 5: Activar AI Agent workflow
- [ ] Test: Agente consulta servicios por vehículo

---

## Consideraciones

### IDs Conocidos (de memoria y auditoría)
- **Notion Agenda DB:** `37180ded-c6cf-80f0-921e-000b02d52bb8`
- **Notion Credential:** `b2xixVdrVdJ6kMFC` ("Notion account")
- **AI Agent Workflow:** `eS0UZX13wmM0hKhy`
- **Manejador de Errores:** `06RWoeLVgFsZ9EKI`

### IDs a Obtener
- **ID de tabla Catálogo de Servicios** en Notion (puede no existir aún)
- **ID del workflow recién creado** (retornado por `n8n_create_workflow`)

### Beneficios de Esta Arquitectura
- ✅ Servicios dinámicos: cambiar precios no requiere re-publicar AI Agent
- ✅ Reutilizable: cualquier otro workflow puede consultar servicios
- ✅ Mantenible: tabla Notion es la source of truth
- ✅ Escalable: agregar servicios nuevos sin tocar código

---

## Próximos Pasos

1. Conectarse al MCP de n8n (`https://n8n.jalda.xyz/mcp-server/http`)
2. Ejecutar los comandos en orden (Paso 1 → Paso 5)
3. Testear: enviar mensaje al agente pidiendo servicios para "Auto"
