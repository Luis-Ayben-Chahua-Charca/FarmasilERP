# Plan de sprints

## Parámetros

| Parámetro | Valor |
|---|---|
| Marco de trabajo | Scrum |
| Equipo | 4 integrantes. **Los roles rotan en cada sprint**; la asignación vigente está en el [README](../../README.md#equipo-sprint-1) |
| Dedicación | 6 h/semana por integrante |
| Capacidad neta por sprint de 2 semanas | 38.4 h-h (20 % reservado para eventos Scrum y documentación) |
| Velocidad estimada | 13 puntos por sprint de 2 semanas |
| Inicio | Jueves 15 de octubre de 2026 |
| **Entrega del PMV** | **Jueves 3 de diciembre de 2026** |

## Sprints

| Sprint | Fechas | Historias | Pts. | Incremento |
|---|---|---|---|---|
| 1 | jue 15 oct – mié 28 oct (2 semanas) | HT-01, HU-06, HU-07 | 13 | Aplicación instalada en la laptop y catálogo de productos operativo |
| 2 | jue 29 oct – mié 11 nov (2 semanas) | HU-04, HU-05, HU-08 | 12 | Ingreso de lotes con validación de duplicidad y consulta de stock |
| 3 | jue 12 nov – mié 25 nov (2 semanas) | HU-01, HU-02 | 11 | Registro de ventas con descuento de stock por lote |
| 4 | jue 26 nov – jue 3 dic (6 días hábiles) | HU-03, HU-10 | 6 | Reporte diario y respaldo de datos; **entrega del PMV** |

### Sprint 4 y la fecha de entrega

El Sprint 4 dispone de 6 días hábiles (capacidad aproximada de 7–8 puntos). Por eso:

- Se comprometen **HU-03** (Must) y **HU-10** (Should), 6 puntos.
- **HU-09** (reportes gerenciales, Should, 5 pts) queda **condicional**: se incorpora solo si los sprints anteriores terminan con holgura.
- **HU-11** (precios regulados, Could) queda fuera del PMV.
- **Congelamiento de código: martes 1 de diciembre.** El 1 y 2 de diciembre se dedican a pruebas finales e instalación en la laptop; el 3 de diciembre se realiza la Sprint Review con la propietaria y se entrega el PMV.

### Orden de recorte si la velocidad real es menor

1. HU-09 (no se incorpora).
2. HU-10 (se pospone tras la entrega).
3. Las historias **Must** no se recortan.

## Eventos de cada sprint

| Evento | Momento | Duración |
|---|---|---|
| Sprint Planning | Primer día del sprint | 2 h |
| Daily Scrum | Tres veces por semana | 15 min |
| Sprint Review | Último día del sprint, con la propietaria | 45 min |
| Sprint Retrospective | Último día del sprint | 30 min |

## Definition of Ready (DoR)

Una historia entra a un sprint solo si:

- [ ] Está redactada como *Como / Quiero / Para*.
- [ ] Tiene criterios de aceptación Dado-Cuando-Entonces.
- [ ] Está estimada en puntos de historia.
- [ ] Tiene identificadas sus dependencias e interesados.
- [ ] Tiene boceto de la pantalla correspondiente (si aplica).

## Definition of Done (DoD)

Una tarea o historia está terminada cuando:

- [ ] El código está integrado en `main` mediante un PR aprobado por otra integrante.
- [ ] Los criterios de aceptación fueron verificados.
- [ ] Funciona en la laptop **sin conexión a internet**.
- [ ] No deja errores conocidos abiertos.
- [ ] El `CHANGELOG.md` está actualizado en la sección `[Unreleased]`.

## Flujo de trabajo (Kanban)

`Backlog → Por hacer → En progreso (WIP 4) → En revisión (WIP 3) → Hecho`

- Una tarea pasa a **En progreso** cuando su responsable la inicia y sus dependencias están terminadas.
- Pasa a **En revisión** cuando se abre el PR.
- Pasa a **Hecho** cuando el PR se fusiona y se cumple la DoD.

## Versiones

| Versión | Al cierre de |
|---|---|
| `v0.1.0` | Sprint 1 |
| `v0.2.0` | Sprint 2 |
| `v0.3.0` | Sprint 3 |
| `v1.0.0` | Sprint 4 — PMV (3 de diciembre de 2026) |
