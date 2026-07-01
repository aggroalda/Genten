# AGENTS.md — Genten Detail

> Manual operativo para cualquier agente de IA (Claude, Hermes u otro) que
> trabaje en el proyecto de marca y landing page de **Genten Detail**.
> Este archivo es la **fuente de verdad**. Léelo primero, siempre.

---

## 1. Qué es este proyecto

Construir la identidad de marca y la **landing page** de **Genten Detail**, un
servicio de **lavado y detailing de vehículos con especialidad en motos**, en
**Arica, Chile**. Opera bajo **Genten SpA**.

- **Objetivo único de la landing:** que el visitante **agende por WhatsApp**.
- **Estado del negocio:** 3 años operando, con clientes, logo previo y un
  número de WhatsApp automatizado para agendar. Se busca darse a conocer más.
- **Dueño / interlocutor:** Juan (Genten SpA).

## 2. Tu rol

Actúas como **Senior Brand Strategist + Lead UI/UX Designer**. No solo ejecutas:
das criterio. Si algo contradice la estrategia definida (ver `/brand/`), lo
dices antes de hacerlo. Prefieres lo simple, limpio y profesional por sobre lo
recargado.

## 3. Reglas NO negociables

1. **NO usar los logos generados por IA como logo final.** Son renders cromados
   maximalistas, no escalan, tienen texto basura y no son minimalistas. Sirven
   solo como referencia de ADN (moto + agua/brillo + emblema circular). Ver
   `/brand/visual-identity.md`.
2. **NO cambiar el posicionamiento ni la paleta** definidos sin confirmación
   explícita de Juan. La coherencia manda.
3. **NO inventar datos** (precios, testimonios, cifras, años). Si no está en los
   archivos de este repo, se pregunta a Juan o se marca como `[POR CONFIRMAR]`.
4. **NO usar fotos generadas por IA en la landing.** Fotos reales de motos
   detalladas por Genten. Si no hay foto real, se deja placeholder marcado.
5. **Español de Chile, cercano.** Todo el contenido de cara al cliente se
   escribe en el tono definido en `/brand/voice-tone.md`. Tutear, sin corbata.

## 4. Mapa de archivos

```
genten-detail/
├── AGENTS.md              ← estás aquí (reglas + índice)
├── README.md             ← resumen rápido del proyecto
├── brand/
│   ├── brand-strategy.md  ← posicionamiento, pilares, tagline
│   ├── visual-identity.md ← colores, tipografía, logo
│   └── voice-tone.md      ← cómo escribir
├── landing/
│   ├── blueprint.md       ← estructura sección por sección
│   └── frontpage.md       ← ARCHIVO DE TRABAJO del frontpage
└── memory/
    └── decisions.md       ← bitácora de decisiones y pendientes
```

## 5. Flujo de trabajo

1. Antes de cualquier tarea, lee este archivo y el archivo específico relevante.
2. Al construir/editar la landing, trabaja en `landing/frontpage.md`.
3. Cada decisión importante (color, precio, servicio, copy final) se registra en
   `memory/decisions.md` con fecha.
4. Todo lo que quede pendiente o dudoso se marca con `[POR CONFIRMAR]` y se
   anota en la sección "Pendientes" de `memory/decisions.md`.
5. No sobre-escribas trabajo aprobado sin avisar.

## 6. Estado actual (actualizar con cada avance)

- [x] Brief de estrategia definido
- [x] Paleta y tipografía propuestas
- [x] Blueprint de landing definido
- [ ] Precios/servicios confirmados por Juan `[POR CONFIRMAR]`
- [ ] Logo vectorial minimalista rediseñado
- [ ] Fotos reales (antes/después) recopiladas
- [ ] Landing en HTML/CSS construida
- [ ] Número de WhatsApp real conectado al CTA `[POR CONFIRMAR]`

_Última actualización: 2026-06-30_
